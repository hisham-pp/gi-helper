-- Scan counter: also cap counted scans overall (600 per 10 minutes), so calls
-- that make up a new sender hash each time can't inflate the total quickly.

/**
 * Counts one scan and returns the new stats. At most 20 scans per sender and
 * 600 overall every 10 minutes are counted; extra ones are ignored, not rejected.
 */
create or replace function public.scan_record(p_scanner text, p_client_hash text default null)
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
