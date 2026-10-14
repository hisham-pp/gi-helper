-- Live scan counter: every change to the scan totals is broadcast on the
-- public Realtime channel "scan-stats" (event "update"), so the home page's
-- footer counter updates while it's open, without polling.
--
-- Listening needs the publishable key in the browser, which also lets anyone
-- call the API functions directly. The functions that write (feedback_submit,
-- scan_record, feedback_admin_login) therefore check a server-only secret
-- (app_private.settings 'rpc_secret', env SUPABASE_RPC_SECRET). The check is
-- off until the app that sends the secret is deployed:
--   update app_private.settings set value = 'on' where key = 'enforce_rpc_secret';

-- ---------------------------------------------------------------------------
-- Broadcast
-- ---------------------------------------------------------------------------

create function stats_private.broadcast_scan_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(public.scan_stats(), 'update', 'scan-stats', false);
  return null;
exception when others then
  -- A failed broadcast must never stop a scan from being counted
  return null;
end
$$;

revoke all on function stats_private.broadcast_scan_stats() from public, anon, authenticated;

create trigger scan_totals_broadcast
  after update on stats_private.scan_totals
  for each statement
  execute function stats_private.broadcast_scan_stats();

-- ---------------------------------------------------------------------------
-- Server-only secret for the write functions
-- ---------------------------------------------------------------------------

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table app_private.settings (
  key text primary key,
  value text not null
);

alter table app_private.settings enable row level security;
revoke all on table app_private.settings from public, anon, authenticated;

-- Generated here, so it never appears in the repository
insert into app_private.settings (key, value) values
  ('rpc_secret', encode(extensions.gen_random_bytes(32), 'hex')),
  ('enforce_rpc_secret', 'off');

/** Raises 'forbidden' unless the caller passed the server secret (when enforced). */
create function app_private.check_rpc_secret(p_secret text)
returns void
language plpgsql
stable
set search_path = ''
as $$
declare
  v_enforced boolean;
  v_secret text;
begin
  select s.value = 'on' into v_enforced from app_private.settings s where s.key = 'enforce_rpc_secret';
  if not coalesce(v_enforced, false) then
    return;
  end if;

  select s.value into v_secret from app_private.settings s where s.key = 'rpc_secret';
  if p_secret is null or v_secret is null or p_secret <> v_secret then
    raise exception 'forbidden';
  end if;
end
$$;

revoke all on function app_private.check_rpc_secret(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Write functions, now taking p_server_key (default null keeps the deployed
-- app working until enforcement is turned on)
-- ---------------------------------------------------------------------------

drop function public.scan_record(text, text);

/**
 * Counts one scan and returns the new stats. At most 20 scans per sender and
 * 600 overall every 10 minutes are counted; extra ones are ignored, not rejected.
 */
create function public.scan_record(
  p_scanner text,
  p_client_hash text default null,
  p_server_key text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_client text := left(coalesce(p_client_hash, 'unknown'), 128);
begin
  perform app_private.check_rpc_secret(p_server_key);

  if p_scanner is null or p_scanner not in ('screenshot', 'video', 'ai') then
    raise exception 'invalid_scanner';
  end if;

  delete from stats_private.scan_recent where created_at < now() - interval '10 minutes';

  if (
    select count(*) from stats_private.scan_recent r where r.client_hash = v_client
  ) < 20
  and (select count(*) from stats_private.scan_recent) < 600 then
    insert into stats_private.scan_recent (client_hash) values (v_client);
    update stats_private.scan_totals
    set total = total + 1, updated_at = now()
    where scanner = p_scanner;
  end if;

  return public.scan_stats();
end
$$;

drop function public.feedback_submit(text, text, text, jsonb, text, text, text, text);

/**
 * Stores a message with up to 3 images (base64 strings) and an optional
 * avatar id. The app filters bad words and compresses images first; the
 * checks here hold even if the function is called directly.
 */
create function public.feedback_submit(
  p_kind text,
  p_message text,
  p_name text default null,
  p_images jsonb default '[]'::jsonb,
  p_app_version text default null,
  p_user_agent text default null,
  p_client_hash text default null,
  p_avatar text default null,
  p_server_key text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_message text := btrim(coalesce(p_message, ''));
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_images jsonb := coalesce(p_images, '[]'::jsonb);
  v_base64 text;
  v_data bytea;
  v_mime text;
  v_position int := 0;
begin
  perform app_private.check_rpc_secret(p_server_key);

  if p_kind is null or p_kind not in ('feedback', 'bug', 'idea', 'other') then
    raise exception 'invalid_kind';
  end if;
  if char_length(v_message) not between 3 and 2000 then
    raise exception 'invalid_message';
  end if;
  if char_length(v_name) > 40 then
    raise exception 'invalid_name';
  end if;
  if jsonb_typeof(v_images) <> 'array' or jsonb_array_length(v_images) > 3 then
    raise exception 'too_many_images';
  end if;

  -- At most 5 messages per sender every 10 minutes, 30 a minute overall
  if p_client_hash is not null and (
    select count(*) from feedback_private.entries e
    where e.client_hash = p_client_hash and e.created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'rate_limited';
  end if;
  if (
    select count(*) from feedback_private.entries e
    where e.created_at > now() - interval '1 minute'
  ) >= 30 then
    raise exception 'rate_limited';
  end if;

  insert into feedback_private.entries (kind, name, message, app_version, user_agent, client_hash, avatar)
  values (
    p_kind,
    v_name,
    v_message,
    left(p_app_version, 32),
    left(p_user_agent, 300),
    left(p_client_hash, 128),
    -- An unexpected value is dropped rather than failing the message
    case when p_avatar ~ '^[a-z0-9-]{1,40}$' then p_avatar end
  )
  returning id into v_id;

  for v_base64 in select jsonb_array_elements_text(v_images) loop
    begin
      v_data := decode(v_base64, 'base64');
    exception when others then
      raise exception 'invalid_image';
    end;
    if octet_length(v_data) > 1572864 then
      raise exception 'image_too_large';
    end if;
    v_mime := feedback_private.image_mime(v_data);
    if v_mime is null then
      raise exception 'invalid_image';
    end if;

    insert into feedback_private.images (entry_id, position, mime, data)
    values (v_id, v_position, v_mime, v_data);
    v_position := v_position + 1;
  end loop;

  return jsonb_build_object('id', v_id);
end
$$;

drop function public.feedback_admin_login(text, text);

/**
 * Checks a seeded account's password and opens a 7-day session:
 * { token, username, expires_at } or { error: 'invalid' | 'locked' }.
 * Five wrong passwords lock the account for 15 minutes.
 */
create function public.feedback_admin_login(
  p_username text,
  p_password text,
  p_server_key text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_admin feedback_private.admins%rowtype;
  v_token text;
  v_expires timestamptz := now() + interval '7 days';
begin
  perform app_private.check_rpc_secret(p_server_key);

  delete from feedback_private.sessions where expires_at <= now();

  select * into v_admin
  from feedback_private.admins
  where username = lower(btrim(coalesce(p_username, '')));

  if not found then
    -- Hash anyway, so an unknown name takes as long as a wrong password
    perform extensions.crypt(coalesce(p_password, ''), extensions.gen_salt('bf', 10));
    return jsonb_build_object('error', 'invalid');
  end if;

  if v_admin.locked_until is not null and v_admin.locked_until > now() then
    return jsonb_build_object('error', 'locked');
  end if;

  if v_admin.password_hash <> extensions.crypt(coalesce(p_password, ''), v_admin.password_hash) then
    update feedback_private.admins
    set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
        locked_until = case
          when failed_attempts + 1 >= 5 then now() + interval '15 minutes'
          else locked_until
        end
    where id = v_admin.id;
    return jsonb_build_object('error', 'invalid');
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into feedback_private.sessions (token_hash, admin_id, expires_at)
  values (feedback_private.token_hash(v_token), v_admin.id, v_expires);

  update feedback_private.admins
  set failed_attempts = 0, locked_until = null, last_login_at = now()
  where id = v_admin.id;

  return jsonb_build_object('token', v_token, 'username', v_admin.username, 'expires_at', v_expires);
end
$$;

revoke all on function public.scan_record(text, text, text) from public, authenticated;
revoke all on function public.feedback_submit(text, text, text, jsonb, text, text, text, text, text) from public, authenticated;
revoke all on function public.feedback_admin_login(text, text, text) from public, authenticated;
grant execute on function public.scan_record(text, text, text) to anon, service_role;
grant execute on function public.feedback_submit(text, text, text, jsonb, text, text, text, text, text) to anon, service_role;
grant execute on function public.feedback_admin_login(text, text, text) to anon, service_role;
