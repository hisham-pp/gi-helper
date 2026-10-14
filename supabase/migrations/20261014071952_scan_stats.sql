-- Scan counter shown on the home page: how many scans visitors have run, per
-- scanner (screenshot, video, AI Vision). A scan counts once it recognises at
-- least one material; the "Try a sample" buttons don't count.
--
-- Same pattern as the feedback tables: an unexposed schema, reached only
-- through the security-definer functions below with the app's publishable key.

create schema if not exists stats_private;
revoke all on schema stats_private from public, anon, authenticated;

create table stats_private.scan_totals (
  scanner text primary key check (scanner in ('screenshot', 'video', 'ai')),
  total bigint not null default 0 check (total >= 0),
  updated_at timestamptz not null default now()
);

insert into stats_private.scan_totals (scanner) values ('screenshot'), ('video'), ('ai');

-- Recent scans per sender (salted IP hash), only for rate limiting; rows
-- older than 10 minutes are deleted as new scans come in
create table stats_private.scan_recent (
  client_hash text not null check (char_length(client_hash) <= 128),
  created_at timestamptz not null default now()
);

create index scan_recent_client_idx on stats_private.scan_recent (client_hash, created_at);
create index scan_recent_created_idx on stats_private.scan_recent (created_at);

alter table stats_private.scan_totals enable row level security;
alter table stats_private.scan_recent enable row level security;
revoke all on all tables in schema stats_private from public, anon, authenticated;

/** { total, by_scanner: { screenshot, video, ai } }. */
create function public.scan_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'total', coalesce(sum(t.total), 0),
    'by_scanner', coalesce(jsonb_object_agg(t.scanner, t.total), '{}'::jsonb)
  )
  from stats_private.scan_totals t
$$;

/**
 * Counts one scan and returns the new stats. At most 20 scans per sender
 * every 10 minutes are counted; extra ones are ignored, not rejected.
 */
create function public.scan_record(p_scanner text, p_client_hash text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_client text := left(coalesce(p_client_hash, 'unknown'), 128);
begin
  if p_scanner is null or p_scanner not in ('screenshot', 'video', 'ai') then
    raise exception 'invalid_scanner';
  end if;

  delete from stats_private.scan_recent where created_at < now() - interval '10 minutes';

  if (
    select count(*) from stats_private.scan_recent r where r.client_hash = v_client
  ) < 20 then
    insert into stats_private.scan_recent (client_hash) values (v_client);
    update stats_private.scan_totals
    set total = total + 1, updated_at = now()
    where scanner = p_scanner;
  end if;

  return public.scan_stats();
end
$$;

revoke all on function public.scan_stats() from public, authenticated;
revoke all on function public.scan_record(text, text) from public, authenticated;
grant execute on function public.scan_stats() to anon, service_role;
grant execute on function public.scan_record(text, text) to anon, service_role;
