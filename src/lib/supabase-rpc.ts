/**
 * Calls `public.*` Postgres functions over Supabase's REST API with the
 * project's publishable key (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`).
 * The app's tables live in schemas the API doesn't expose, so these
 * security-definer functions are the only way in (see supabase/migrations).
 * Server-only: the env vars aren't NEXT_PUBLIC_, so the browser never sees them.
 */

interface SupabaseConfig {
  url: string;
  key: string;
}

function getConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Project URL and publishable key for listening to Realtime in the browser.
 * The publishable key is made to be public; the functions that write also
 * check rpcServerKey(), which never leaves the server.
 */
export function getRealtimeConfig(): { url: string; key: string } | null {
  return getConfig();
}

/**
 * Shared secret the write functions (feedback_submit, feedback_admin_login,
 * scan_record) check once app_private.settings 'enforce_rpc_secret' is on.
 * Server-only (SUPABASE_RPC_SECRET); null until it's configured.
 */
export function rpcServerKey(): string | null {
  return process.env.SUPABASE_RPC_SECRET?.trim() || null;
}

/** A failure with an error code and the HTTP status to answer with. */
export class RpcError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "RpcError";
  }
}

/**
 * Runs `public.<fn>(args)`. Exceptions the function raises on purpose are
 * listed in `knownErrors` (message → HTTP status) and thrown as that code;
 * anything else becomes "unavailable", and a missing config "not_configured".
 */
export async function callRpc<T>(
  fn: string,
  args: Record<string, unknown>,
  knownErrors: Record<string, number> = {},
): Promise<T> {
  const config = getConfig();
  if (!config) throw new RpcError("not_configured", 503);

  const headers: Record<string, string> = {
    apikey: config.key,
    "Content-Type": "application/json",
  };
  // Legacy anon keys are JWTs and also go in Authorization; sb_publishable_ keys must not
  if (config.key.startsWith("eyJ")) headers.Authorization = `Bearer ${config.key}`;

  let res: Response;
  try {
    res = await fetch(`${config.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers,
      body: JSON.stringify(args),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[supabase] ${fn} request failed:`, err);
    throw new RpcError("unavailable", 503);
  }

  const text = await res.text();
  if (!res.ok) {
    let message = "";
    try {
      message = (JSON.parse(text) as { message?: string }).message ?? "";
    } catch {
      // Not JSON (e.g. a gateway error page)
    }
    if (Object.hasOwn(knownErrors, message)) {
      throw new RpcError(message, knownErrors[message]);
    }
    console.error(`[supabase] ${fn} failed with ${res.status}:`, text.slice(0, 500));
    throw new RpcError("unavailable", 502);
  }

  return (text ? JSON.parse(text) : null) as T;
}
