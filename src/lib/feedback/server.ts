import { NextResponse } from "next/server";
import pkg from "../../../package.json";
import { getCharacter } from "@/lib/characters";
import { hashClient } from "@/lib/request-client";
import { callRpc, isSupabaseConfigured, RpcError, rpcServerKey } from "@/lib/supabase-rpc";
import { censorProfanity } from "./profanity";
import {
  feedbackErrorMessage,
  INBOX_PAGE_SIZE,
  PUBLIC_FEEDBACK_PAGE_SIZE,
  type FeedbackKind,
  type FeedbackStatus,
  type InboxEntry,
  type InboxPage,
  type PublicFeedback,
  type PublicFeedbackPage,
} from "./types";

/**
 * Server side of the feedback page and inbox. Everything goes through the
 * `public.feedback_*` Postgres functions (supabase/migrations/*_feedback*.sql)
 * via callRpc (src/lib/supabase-rpc.ts, publishable key, server-only); the
 * tables themselves aren't reachable through the API.
 */

/** httpOnly cookie holding the inbox session token. */
export const FEEDBACK_SESSION_COOKIE = "gi_feedback_session";

export function isFeedbackConfigured(): boolean {
  return isSupabaseConfigured();
}

/** A failure with an error code from types.ts and the HTTP status to answer with. */
export class FeedbackError extends RpcError {
  constructor(code: string, status: number) {
    super(code, status);
    this.name = "FeedbackError";
  }
}

/** Exceptions the database functions raise on purpose, by HTTP status. */
const DATABASE_ERRORS: Record<string, number> = {
  unauthorized: 401,
  not_found: 404,
  rate_limited: 429,
  image_too_large: 413,
  invalid_kind: 400,
  invalid_message: 400,
  invalid_name: 400,
  too_many_images: 400,
  invalid_image: 400,
  invalid_status: 400,
  // Missing server secret (see supabase-rpc.ts rpcServerKey)
  forbidden: 403,
};

function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  return callRpc<T>(fn, args, DATABASE_ERRORS);
}

// ---------------------------------------------------------------------------
// Public page
// ---------------------------------------------------------------------------

interface RawFeedback {
  id: string;
  name: string | null;
  avatar: string | null;
  message: string;
  created_at: string;
  images: string[];
}

interface RawInboxEntry extends RawFeedback {
  kind: FeedbackKind;
  status: FeedbackStatus;
  hidden: boolean;
  app_version: string | null;
  user_agent: string | null;
}

function toPublicFeedback(row: RawFeedback): PublicFeedback {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? null,
    message: row.message,
    createdAt: row.created_at,
    images: row.images ?? [],
  };
}

function toInboxEntry(row: RawInboxEntry): InboxEntry {
  return {
    ...toPublicFeedback(row),
    kind: row.kind,
    status: row.status,
    hidden: row.hidden,
    appVersion: row.app_version,
    userAgent: row.user_agent,
  };
}

/** A page of public feedback, newest first. */
export async function listPublicFeedback(page: number): Promise<PublicFeedbackPage> {
  const pageSize = PUBLIC_FEEDBACK_PAGE_SIZE;
  const data = await rpc<{ total: number; items: RawFeedback[] }>("feedback_list_public", {
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });
  return { items: data.items.map(toPublicFeedback), total: data.total, page, pageSize };
}

export interface FeedbackSubmission {
  kind: FeedbackKind;
  name: string;
  /** Character id picked in the form; anything not in the list is dropped. */
  avatar: string | null;
  message: string;
  /** Validated PNG, JPEG or WebP files. */
  images: Uint8Array[];
  userAgent: string | null;
  /** Sender's IP; only a salted hash is stored, for rate limiting. */
  ip: string;
}

/** Masks bad words in the name and message, then stores the message. */
export async function submitFeedback(input: FeedbackSubmission): Promise<{ id: string }> {
  return rpc<{ id: string }>("feedback_submit", {
    p_kind: input.kind,
    p_name: censorProfanity(input.name.trim()) || null,
    p_message: censorProfanity(input.message.trim()),
    p_images: input.images.map((bytes) => Buffer.from(bytes).toString("base64")),
    p_app_version: pkg.version,
    p_user_agent: input.userAgent?.slice(0, 300) ?? null,
    p_client_hash: hashClient(input.ip),
    p_avatar: getCharacter(input.avatar)?.id ?? null,
    p_server_key: rpcServerKey(),
  });
}

export interface FeedbackImage {
  mime: string;
  bytes: Uint8Array<ArrayBuffer>;
  /** Belongs to visible public feedback (cacheable by anyone). */
  isPublic: boolean;
}

/** An image of public feedback, or of any message with an inbox session. */
export async function getFeedbackImage(
  id: string,
  token: string | undefined,
): Promise<FeedbackImage | null> {
  const data = await rpc<{ mime: string; data: string; public: boolean } | null>("feedback_image", {
    p_id: id,
    p_token: token ?? null,
  });
  if (!data) return null;
  return {
    mime: data.mime,
    bytes: new Uint8Array(Buffer.from(data.data, "base64")),
    isPublic: data.public,
  };
}

// ---------------------------------------------------------------------------
// Inbox
// ---------------------------------------------------------------------------

export type LoginResult =
  | { ok: true; token: string; username: string; expiresAt: string }
  | { ok: false; error: "invalid_login" | "locked" };

/** Checks a seeded account's password and opens a 7-day session. */
export async function loginInbox(username: string, password: string): Promise<LoginResult> {
  const data = await rpc<
    { token: string; username: string; expires_at: string } | { error: "invalid" | "locked" }
  >("feedback_admin_login", {
    p_username: username,
    p_password: password,
    p_server_key: rpcServerKey(),
  });

  if ("error" in data) {
    return { ok: false, error: data.error === "locked" ? "locked" : "invalid_login" };
  }
  return { ok: true, token: data.token, username: data.username, expiresAt: data.expires_at };
}

/** The signed-in account for a session token, or null when it's missing or expired. */
export async function getInboxUser(token: string | undefined): Promise<{ username: string } | null> {
  if (!token) return null;
  return rpc<{ username: string } | null>("feedback_admin_whoami", { p_token: token });
}

export async function logoutInbox(token: string): Promise<void> {
  await rpc<null>("feedback_admin_logout", { p_token: token });
}

export interface InboxFilters {
  kind: FeedbackKind | null;
  status: FeedbackStatus | null;
  page: number;
}

export async function listInbox(token: string, filters: InboxFilters): Promise<InboxPage> {
  const pageSize = INBOX_PAGE_SIZE;
  const data = await rpc<{ total: number; counts: InboxPage["counts"]; items: RawInboxEntry[] }>(
    "feedback_admin_list",
    {
      p_token: token,
      p_kind: filters.kind,
      p_status: filters.status,
      p_limit: pageSize,
      p_offset: (filters.page - 1) * pageSize,
    },
  );
  return {
    items: data.items.map(toInboxEntry),
    total: data.total,
    counts: data.counts,
    page: filters.page,
    pageSize,
  };
}

export async function updateInboxEntry(
  token: string,
  id: string,
  patch: { status?: FeedbackStatus; hidden?: boolean },
): Promise<{ id: string; status: FeedbackStatus; hidden: boolean }> {
  return rpc("feedback_admin_update", {
    p_token: token,
    p_id: id,
    p_status: patch.status ?? null,
    p_hidden: patch.hidden ?? null,
  });
}

export async function deleteInboxEntry(token: string, id: string): Promise<void> {
  await rpc("feedback_admin_delete", { p_token: token, p_id: id });
}

// ---------------------------------------------------------------------------
// Request helpers for the route handlers
// ---------------------------------------------------------------------------

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 1-based page from a query string value; anything odd becomes page 1. */
export function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1;
}

/** Inbox changes must come from this site (the session cookie is SameSite=Lax on top). */
export { isSameOrigin } from "@/lib/request-client";

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/** `{ error, message }` JSON for a failed request; unexpected errors become a 500. */
export function feedbackErrorResponse(err: unknown): NextResponse {
  // Also covers callRpc's own errors (not_configured, unavailable)
  if (err instanceof RpcError) {
    return NextResponse.json(
      { error: err.code, message: feedbackErrorMessage(err.code) },
      { status: err.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  console.error("[feedback] unexpected error:", err);
  return NextResponse.json(
    { error: "unavailable", message: feedbackErrorMessage("unavailable") },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}
