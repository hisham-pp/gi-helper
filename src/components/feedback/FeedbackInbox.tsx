"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  CircleCheck,
  CircleDot,
  Eye,
  EyeOff,
  Filter,
  Inbox,
  Loader2,
  LogOut,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassSegmentedControl } from "@/components/ui/GlassSegmentedControl";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { PillDropdown } from "@/components/ui/PillDropdown";
import {
  FEEDBACK_KINDS,
  feedbackErrorMessage,
  PUBLIC_FEEDBACK_KIND,
  type FeedbackKind,
  type FeedbackStatus,
  type InboxEntry,
  type InboxPage,
} from "@/lib/feedback/types";
import { FeedbackAuthor } from "./FeedbackCard";
import { FeedbackImages } from "./FeedbackImages";
import { KIND_META } from "./feedback-kinds";

type KindFilter = FeedbackKind | "all";
type StatusFilter = FeedbackStatus | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "resolved", label: "Resolved" },
];

interface InboxCardProps {
  entry: InboxEntry;
  busy: boolean;
  onToggleResolved: (entry: InboxEntry) => void;
  onToggleHidden: (entry: InboxEntry) => void;
  onDelete: (entry: InboxEntry) => void;
}

function InboxCard({ entry, busy, onToggleResolved, onToggleHidden, onDelete }: InboxCardProps) {
  const meta = KIND_META[entry.kind];
  const KindIcon = meta.icon;
  const resolved = entry.status === "resolved";

  return (
    <article className={`glass-card p-5 transition-opacity ${resolved ? "opacity-75" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <FeedbackAuthor name={entry.name} createdAt={entry.createdAt} />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`glass-chip gap-1 px-2.5 py-1 text-[11px] font-semibold ${meta.color}`}>
            <KindIcon className="h-3 w-3" />
            {meta.label}
          </span>
          {resolved ? (
            <span className="glass-chip gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <CircleCheck className="h-3 w-3" />
              Resolved
            </span>
          ) : (
            <span className="glass-chip gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
              <CircleDot className="h-3 w-3" />
              New
            </span>
          )}
          {entry.hidden && (
            <span className="glass-chip gap-1 px-2.5 py-1 text-[11px] font-semibold text-white/60">
              <EyeOff className="h-3 w-3" />
              Hidden
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-white/85">
        {entry.message}
      </p>
      <FeedbackImages ids={entry.images} />

      {(entry.appVersion || entry.userAgent) && (
        <p
          className="mt-3 truncate font-mono text-[10px] text-white/40"
          title={entry.userAgent ?? undefined}
        >
          {entry.appVersion && `v${entry.appVersion}`}
          {entry.appVersion && entry.userAgent && " · "}
          {entry.userAgent}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        <button
          onClick={() => onToggleResolved(entry)}
          disabled={busy}
          className="glass-btn px-3 py-1.5 text-xs"
        >
          {resolved ? <RotateCcw className="h-3.5 w-3.5" /> : <CircleCheck className="h-3.5 w-3.5" />}
          {resolved ? "Reopen" : "Mark resolved"}
        </button>
        {entry.kind === PUBLIC_FEEDBACK_KIND && (
          <button
            onClick={() => onToggleHidden(entry)}
            disabled={busy}
            className="glass-btn px-3 py-1.5 text-xs"
          >
            {entry.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {entry.hidden ? "Show on page" : "Hide from page"}
          </button>
        )}
        <button
          onClick={() => onDelete(entry)}
          disabled={busy}
          className="glass-btn glass-btn--danger ml-auto px-3 py-1.5 text-xs"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
      </div>
    </article>
  );
}

/**
 * The /feedback/inbox page for signed-in inbox accounts: every message (bugs,
 * ideas, other, and the public feedback), filtered by kind and status. Mark
 * messages resolved, hide public feedback from the page, or delete them.
 */
export function FeedbackInbox({ username }: { username: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InboxPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const requestRef = useRef(0);

  // The session ended (expired, signed out elsewhere): show the sign-in again
  const handleUnauthorized = useCallback(() => {
    toast.error(feedbackErrorMessage("unauthorized"));
    router.refresh();
  }, [router]);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (kind !== "all") params.set("kind", kind);
    if (status !== "all") params.set("status", status);

    try {
      const res = await fetch(`/api/feedback/inbox?${params}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (request !== requestRef.current) return;
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) throw new Error(json?.message);
      setData(json as InboxPage);
      setError(null);
    } catch (err) {
      if (request !== requestRef.current) return;
      setError((err instanceof Error && err.message) || feedbackErrorMessage("unavailable"));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [kind, status, page, handleUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Sends a change; reports any error and resolves to whether it worked. */
  const send = async (
    entry: InboxEntry,
    method: "PATCH" | "DELETE",
    body?: Record<string, unknown>,
  ): Promise<boolean> => {
    setBusyId(entry.id);
    try {
      const res = await fetch(`/api/feedback/inbox/${entry.id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { message?: string } | null;
        toast.error(json?.message ?? feedbackErrorMessage(undefined));
        return false;
      }
      return true;
    } catch {
      toast.error(feedbackErrorMessage("unavailable"));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const patchLocal = (id: string, patch: Partial<InboxEntry>) =>
    setData((prev) =>
      prev && {
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    );

  const handleToggleResolved = async (entry: InboxEntry) => {
    const next: FeedbackStatus = entry.status === "resolved" ? "new" : "resolved";
    if (!(await send(entry, "PATCH", { status: next }))) return;
    toast.success(next === "resolved" ? "Marked as resolved" : "Moved back to new");
    // With a status filter on, the message leaves this list
    if (status === "all") patchLocal(entry.id, { status: next });
    else void load();
  };

  const handleToggleHidden = async (entry: InboxEntry) => {
    const hidden = !entry.hidden;
    if (!(await send(entry, "PATCH", { hidden }))) return;
    toast.success(hidden ? "Hidden from the Feedback page" : "Shown on the Feedback page again");
    patchLocal(entry.id, { hidden });
  };

  const handleDelete = async (entry: InboxEntry) => {
    const label = KIND_META[entry.kind].label.toLowerCase();
    if (!confirm(`Delete this ${label} for good? Its images are deleted too.`)) return;
    if (!(await send(entry, "DELETE"))) return;
    toast.success("Deleted");
    // Step back when the last message on a later page goes
    if (data && data.items.length === 1 && page > 1) setPage(page - 1);
    else void load();
  };

  const handleSignOut = async () => {
    await fetch("/api/feedback/session", { method: "DELETE" }).catch(() => {});
    toast.success("Signed out");
    router.refresh();
  };

  const counts = data?.counts;
  const kindOptions = [
    {
      value: "all" as KindFilter,
      label: counts ? `All (${counts.all})` : "All",
      icon: <Inbox className="h-3.5 w-3.5" />,
      title: "All",
    },
    ...FEEDBACK_KINDS.map((value) => {
      const Icon = KIND_META[value].icon;
      const plural = KIND_META[value].plural;
      return {
        value: value as KindFilter,
        label: counts ? `${plural} (${counts[value]})` : plural,
        icon: <Icon className="h-3.5 w-3.5" />,
        title: plural,
      };
    }),
  ];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) || 1 : 1;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <main className="w-full max-w-4xl space-y-6 pb-12">
        {/* Hero */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                  <Inbox className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                  Feedback Inbox
                </h1>
              </div>
              <p className="text-xs text-white/80 sm:text-sm">
                Signed in as <strong className="font-semibold text-white">{username}</strong>.
                Bug reports, ideas and other messages only show up here.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void load()}
                disabled={loading}
                className="glass-icon-btn h-9 w-9 rounded-full"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={handleSignOut} className="glass-btn px-4 py-2 text-sm">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card glass-card--lg flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-full overflow-x-auto">
            <GlassSegmentedControl
              ariaLabel="Message type"
              options={kindOptions}
              value={kind}
              onChange={(value) => {
                setKind(value);
                setPage(1);
              }}
              compactOnMobile
            />
          </div>
          <PillDropdown
            label="Status:"
            icon={<Filter className="h-3.5 w-3.5 text-cyan-300" />}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
          >
            <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        {!data ? (
          loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
            </div>
          )
        ) : data.total === 0 ? (
          <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
            <div className="glass-lens mb-4 h-16 w-16 text-white/50">
              <Inbox className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-white">Nothing here</h2>
            <p className="mt-1 max-w-md text-xs text-white/60">
              No messages match this type and status.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 px-1 text-xs text-white/70">
              <span>
                <strong className="font-mono text-white">{data.total}</strong>{" "}
                {data.total === 1 ? "message" : "messages"}
              </span>
              {totalPages > 1 && (
                <span className="text-white/60">
                  Page <strong className="text-white">{page}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong>
                </span>
              )}
            </div>

            <div className={`space-y-4 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}>
              {data.items.map((entry) => (
                <InboxCard
                  key={entry.id}
                  entry={entry}
                  busy={busyId === entry.id}
                  onToggleResolved={handleToggleResolved}
                  onToggleHidden={handleToggleHidden}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              pageSize={data.pageSize}
              totalItems={data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
