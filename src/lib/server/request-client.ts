import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/** The sender's IP (first hop of x-forwarded-for, as set by Vercel). */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Whether a request came from this site. Browsers send Origin on every
 * POST/PATCH/DELETE, so a cross-site form or script can't pass this.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Salted hash of an IP, to rate-limit without storing the address
 * (`FEEDBACK_HASH_SALT`; shared by feedback and the scan counter).
 */
export function hashClient(ip: string): string {
  const salt = process.env.FEEDBACK_HASH_SALT || "gi-helper-feedback";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
