-- Feedback: a character avatar per message. The send form starts with a random
-- Genshin character's name and avatar; `avatar` is that character's id from
-- src/data/characters.json (e.g. 'hu-tao'). The app only passes ids from its
-- list; the check here keeps anything else out if the function is called directly.

alter table feedback_private.entries
  add column avatar text check (avatar ~ '^[a-z0-9-]{1,40}$');

-- New parameter, so replace the function rather than overload it
drop function public.feedback_submit(text, text, text, jsonb, text, text, text);

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
  p_avatar text default null
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

revoke all on function public.feedback_submit(text, text, text, jsonb, text, text, text, text) from public, authenticated;
grant execute on function public.feedback_submit(text, text, text, jsonb, text, text, text, text) to anon, service_role;

/** Visible "feedback" posts, newest first: { total, items: [...] }. */
create or replace function public.feedback_list_public(p_limit int default 12, p_offset int default 0)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with visible as (
    select e.id, e.name, e.avatar, e.message, e.created_at
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
            'avatar', p.avatar,
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
 * Every message, newest first, filtered by kind and status:
 * { total, counts: { all, feedback, bug, idea, other }, items: [...] }.
 * Counts follow the status filter, so the kind tabs match the list.
 */
create or replace function public.feedback_admin_list(
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
              'avatar', p.avatar,
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
