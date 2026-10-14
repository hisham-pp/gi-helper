-- Feedback page (/feedback) and private inbox (/feedback/inbox).
--
-- Anyone can send feedback, bug reports, ideas and other messages. Only the
-- "feedback" kind is listed publicly; everything else is read in the inbox by
-- seeded accounts (plain table, bcrypt hashes, no Supabase Auth).
--
-- The tables live in the `feedback_private` schema, which PostgREST doesn't
-- expose and anon can't use. The app (server-side, publishable key) reaches
-- them only through the security-definer `public.feedback_*` functions below,
-- which validate input and check inbox sessions themselves. See docs/feedback.md.

create schema if not exists feedback_private;
revoke all on schema feedback_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table feedback_private.entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('feedback', 'bug', 'idea', 'other')),
  name text check (char_length(name) between 1 and 40),
  message text not null check (char_length(message) between 3 and 2000),
  status text not null default 'new' check (status in ('new', 'resolved')),
  -- Hidden feedback stays in the inbox but leaves the public list
  hidden boolean not null default false,
  app_version text check (char_length(app_version) <= 32),
  user_agent text check (char_length(user_agent) <= 300),
  -- Salted hash of the sender's IP, only for rate limiting
  client_hash text check (char_length(client_hash) <= 128),
  created_at timestamptz not null default now()
);

create index entries_public_idx on feedback_private.entries (created_at desc)
  where kind = 'feedback' and not hidden;
create index entries_kind_created_idx on feedback_private.entries (kind, created_at desc);
create index entries_created_idx on feedback_private.entries (created_at desc);
create index entries_client_created_idx on feedback_private.entries (client_hash, created_at desc);

create table feedback_private.images (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references feedback_private.entries (id) on delete cascade,
  position smallint not null check (position between 0 and 2),
  mime text not null check (mime in ('image/webp', 'image/jpeg', 'image/png')),
  data bytea not null check (octet_length(data) between 1 and 1572864),
  created_at timestamptz not null default now(),
  unique (entry_id, position)
);

create table feedback_private.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique
    check (username = lower(username) and username ~ '^[a-z0-9._-]{3,32}$'),
  password_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table feedback_private.sessions (
  -- sha256 of the cookie token; the token itself is never stored
  token_hash text primary key,
  admin_id uuid not null references feedback_private.admins (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_admin_idx on feedback_private.sessions (admin_id);
create index sessions_expires_idx on feedback_private.sessions (expires_at);

-- Deny-all for the API roles; only the functions below (run as owner) read them
alter table feedback_private.entries enable row level security;
alter table feedback_private.images enable row level security;
alter table feedback_private.admins enable row level security;
alter table feedback_private.sessions enable row level security;

revoke all on all tables in schema feedback_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private helpers (not reachable through the API)
-- ---------------------------------------------------------------------------

create function feedback_private.token_hash(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

/** The signed-in admin for a session token, or null. */
create function feedback_private.session_admin(p_token text)
returns uuid
language sql
stable
set search_path = ''
as $$
  select s.admin_id
  from feedback_private.sessions s
  where p_token is not null
    and s.token_hash = feedback_private.token_hash(p_token)
    and s.expires_at > now()
$$;

create function feedback_private.require_admin(p_token text)
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  v_admin uuid := feedback_private.session_admin(p_token);
begin
  if v_admin is null then
    raise exception 'unauthorized';
  end if;
  return v_admin;
end
$$;

/** Image type from the file's magic bytes (never trusts a declared type). */
create function feedback_private.image_mime(p_data bytea)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when substring(p_data from 1 for 8) = '\x89504e470d0a1a0a'::bytea then 'image/png'
    when substring(p_data from 1 for 3) = '\xffd8ff'::bytea then 'image/jpeg'
    when substring(p_data from 1 for 4) = '\x52494646'::bytea
      and substring(p_data from 9 for 4) = '\x57454250'::bytea then 'image/webp'
  end
$$;

create function feedback_private.entry_images(p_entry uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_agg(i.id order by i.position), '[]'::jsonb)
  from feedback_private.images i
  where i.entry_id = p_entry
$$;

/**
 * Seeds or updates an inbox account from a bcrypt hash (see
 * scripts/feedback-admin.ts). Run it from the SQL editor; the API can't reach it.
 * A new password signs the account out everywhere.
 */
create function feedback_private.set_admin(p_username text, p_password_hash text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_username text := lower(btrim(p_username));
begin
  if p_password_hash !~ '^\$2[abxy]\$[0-9]{2}\$[./A-Za-z0-9]{53}$' then
    raise exception 'expected a bcrypt hash';
  end if;

  insert into feedback_private.admins (username, password_hash)
  -- pgcrypto reads $2a$; $2b$/$2y$ hashes are the same algorithm
  values (v_username, regexp_replace(p_password_hash, '^\$2[by]\$', '$2a$'))
  on conflict (username) do update
    set password_hash = excluded.password_hash,
        failed_attempts = 0,
        locked_until = null;

  delete from feedback_private.sessions s
  using feedback_private.admins a
  where s.admin_id = a.id and a.username = v_username;
end
$$;

revoke all on all functions in schema feedback_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public page
-- ---------------------------------------------------------------------------

/** Visible "feedback" posts, newest first: { total, items: [...] }. */
create function public.feedback_list_public(p_limit int default 12, p_offset int default 0)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with visible as (
    select e.id, e.name, e.message, e.created_at
    from feedback_private.entries e
    where e.kind = 'feedback' and not e.hidden
  ),
  page as (
    select v.*
    from visible v
    order by v.created_at desc
    limit least(greatest(coalesce(p_limit, 12), 1), 50)
    offset greatest(coalesce(p_offset, 0), 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from visible),
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'message', p.message,
            'created_at', p.created_at,
            'images', feedback_private.entry_images(p.id)
          )
          order by p.created_at desc
        )
        from page p
      ),
      '[]'::jsonb
    )
  )
$$;

/**
 * Stores a message with up to 3 images (base64 strings). The app filters bad
 * words and compresses images first; the checks here hold even if the
 * function is called directly.
 */
create function public.feedback_submit(
  p_kind text,
  p_message text,
  p_name text default null,
  p_images jsonb default '[]'::jsonb,
  p_app_version text default null,
  p_user_agent text default null,
  p_client_hash text default null
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

  insert into feedback_private.entries (kind, name, message, app_version, user_agent, client_hash)
  values (
    p_kind,
    v_name,
    v_message,
    left(p_app_version, 32),
    left(p_user_agent, 300),
    left(p_client_hash, 128)
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

/**
 * One image as { mime, data (base64), public }. Images of visible feedback are
 * public; the rest need an inbox session. Null when missing or not allowed.
 */
create function public.feedback_image(p_id uuid, p_token text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'mime', i.mime,
    'data', encode(i.data, 'base64'),
    'public', e.kind = 'feedback' and not e.hidden
  )
  from feedback_private.images i
  join feedback_private.entries e on e.id = i.entry_id
  where i.id = p_id
    and (
      (e.kind = 'feedback' and not e.hidden)
      or feedback_private.session_admin(p_token) is not null
    )
$$;

-- ---------------------------------------------------------------------------
-- Inbox sessions
-- ---------------------------------------------------------------------------

/**
 * Checks a seeded account's password and opens a 7-day session:
 * { token, username, expires_at } or { error: 'invalid' | 'locked' }.
 * Five wrong passwords lock the account for 15 minutes.
 */
create function public.feedback_admin_login(p_username text, p_password text)
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

/** { username } for a live session, or null. */
create function public.feedback_admin_whoami(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('username', a.username)
  from feedback_private.sessions s
  join feedback_private.admins a on a.id = s.admin_id
  where p_token is not null
    and s.token_hash = feedback_private.token_hash(p_token)
    and s.expires_at > now()
$$;

create function public.feedback_admin_logout(p_token text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from feedback_private.sessions
  where token_hash = feedback_private.token_hash(p_token)
$$;

-- ---------------------------------------------------------------------------
-- Inbox
-- ---------------------------------------------------------------------------

/**
 * Every message, newest first, filtered by kind and status:
 * { total, counts: { all, feedback, bug, idea, other }, items: [...] }.
 * Counts follow the status filter, so the kind tabs match the list.
 */
create function public.feedback_admin_list(
  p_token text,
  p_kind text default null,
  p_status text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform feedback_private.require_admin(p_token);

  return (
    with by_status as (
      select e.*
      from feedback_private.entries e
      where p_status is null or e.status = p_status
    ),
    filtered as (
      select b.* from by_status b where p_kind is null or b.kind = p_kind
    ),
    page as (
      select f.*
      from filtered f
      order by f.created_at desc
      limit least(greatest(coalesce(p_limit, 20), 1), 50)
      offset greatest(coalesce(p_offset, 0), 0)
    )
    select jsonb_build_object(
      'total', (select count(*) from filtered),
      'counts', (
        select jsonb_build_object(
          'all', count(*),
          'feedback', count(*) filter (where b.kind = 'feedback'),
          'bug', count(*) filter (where b.kind = 'bug'),
          'idea', count(*) filter (where b.kind = 'idea'),
          'other', count(*) filter (where b.kind = 'other')
        )
        from by_status b
      ),
      'items', coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'kind', p.kind,
              'name', p.name,
              'message', p.message,
              'status', p.status,
              'hidden', p.hidden,
              'app_version', p.app_version,
              'user_agent', p.user_agent,
              'created_at', p.created_at,
              'images', feedback_private.entry_images(p.id)
            )
            order by p.created_at desc
          )
          from page p
        ),
        '[]'::jsonb
      )
    )
  );
end
$$;

/** Sets status ('new' | 'resolved') and/or hidden; null leaves a field as is. */
create function public.feedback_admin_update(
  p_token text,
  p_id uuid,
  p_status text default null,
  p_hidden boolean default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_entry feedback_private.entries%rowtype;
begin
  perform feedback_private.require_admin(p_token);

  if p_status is not null and p_status not in ('new', 'resolved') then
    raise exception 'invalid_status';
  end if;

  update feedback_private.entries
  set status = coalesce(p_status, status),
      hidden = coalesce(p_hidden, hidden)
  where id = p_id
  returning * into v_entry;

  if not found then
    raise exception 'not_found';
  end if;

  return jsonb_build_object('id', v_entry.id, 'status', v_entry.status, 'hidden', v_entry.hidden);
end
$$;

/** Deletes a message and its images. */
create function public.feedback_admin_delete(p_token text, p_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform feedback_private.require_admin(p_token);

  delete from feedback_private.entries where id = p_id;
  if not found then
    raise exception 'not_found';
  end if;

  return jsonb_build_object('id', p_id);
end
$$;

-- ---------------------------------------------------------------------------
-- API access: only these functions, only for the app's key
-- ---------------------------------------------------------------------------

revoke all on function public.feedback_list_public(int, int) from public, authenticated;
revoke all on function public.feedback_submit(text, text, text, jsonb, text, text, text) from public, authenticated;
revoke all on function public.feedback_image(uuid, text) from public, authenticated;
revoke all on function public.feedback_admin_login(text, text) from public, authenticated;
revoke all on function public.feedback_admin_whoami(text) from public, authenticated;
revoke all on function public.feedback_admin_logout(text) from public, authenticated;
revoke all on function public.feedback_admin_list(text, text, text, int, int) from public, authenticated;
revoke all on function public.feedback_admin_update(text, uuid, text, boolean) from public, authenticated;
revoke all on function public.feedback_admin_delete(text, uuid) from public, authenticated;

grant execute on function public.feedback_list_public(int, int) to anon, service_role;
grant execute on function public.feedback_submit(text, text, text, jsonb, text, text, text) to anon, service_role;
grant execute on function public.feedback_image(uuid, text) to anon, service_role;
grant execute on function public.feedback_admin_login(text, text) to anon, service_role;
grant execute on function public.feedback_admin_whoami(text) to anon, service_role;
grant execute on function public.feedback_admin_logout(text) to anon, service_role;
grant execute on function public.feedback_admin_list(text, text, text, int, int) to anon, service_role;
grant execute on function public.feedback_admin_update(text, uuid, text, boolean) to anon, service_role;
grant execute on function public.feedback_admin_delete(text, uuid) to anon, service_role;
