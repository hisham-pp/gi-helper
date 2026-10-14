"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CircleAlert,
  Loader2,
  MessageSquareHeart,
  MessagesSquare,
  RefreshCw,
  Send,
  type LucideIcon,
} from "lucide-react";
import { PaginationBar } from "@/components/ui/PaginationBar";
import {
  feedbackErrorMessage,
  PUBLIC_FEEDBACK_KIND,
  type FeedbackKind,
  type PublicFeedbackPage,
} from "@/lib/feedback/types";
import { FeedbackCard } from "./FeedbackCard";
import { LazySendFeedbackModal, preloadSendFeedbackModal } from "./lazy-modals";

/** Placeholder cards while the first page loads. */
function FeedbackSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading feedback">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-card p-5 motion-safe:animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="h-2.5 w-16 rounded-full bg-white/[0.07]" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-white/[0.07]" />
            <div className={`h-3 rounded-full bg-white/[0.07] ${i === 1 ? "w-1/2" : "w-4/5"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
      <div className="glass-lens mb-4 h-16 w-16 text-white/50">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 max-w-md text-xs text-white/60">{text}</p>
      {children}
    </div>
  );
}

/**
 * The /feedback page: public feedback, newest first, with the Send feedback
 * button. Bug reports, ideas and other messages are sent from the same form
 * but only show up in the inbox. The page itself is static, so navigating
 * here is instant; the posts load in the browser, behind skeleton cards.
 */
export function FeedbackBoard() {
  const [data, setData] = useState<PublicFeedbackPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The server has no Supabase settings
  const [offline, setOffline] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const load = useCallback(async (target: number) => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback?page=${target}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (request !== requestRef.current) return;
      if (!res.ok) {
        if (json?.error === "not_configured") setOffline(true);
        throw new Error(json?.message);
      }
      setData(json as PublicFeedbackPage);
      setPage(target);
      setError(null);
    } catch (err) {
      if (request !== requestRef.current) return;
      setError((err instanceof Error && err.message) || feedbackErrorMessage("unavailable"));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const handlePageChange = (target: number) => {
    void load(target);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSent = (kind: FeedbackKind) => {
    setOpen(false);
    // New public feedback goes to the top of the first page
    if (kind === PUBLIC_FEEDBACK_KIND) void load(1);
  };

  const openForm = () => setOpen(true);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) || 1 : 1;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <main className="w-full max-w-3xl space-y-6 pb-12">
        {/* Hero */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                  <MessageSquareHeart className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                  Feedback
                </h1>
              </div>
              <p className="max-w-xl text-xs text-white/80 sm:text-sm">
                What travelers think of GI Helper. Found a bug or have an idea? Send it
                here too; those go privately to the developer.
              </p>
            </div>

            {!offline && (
              <button
                onClick={openForm}
                onPointerEnter={preloadSendFeedbackModal}
                onFocus={preloadSendFeedbackModal}
                className="glass-btn glass-btn--primary w-full shrink-0 justify-center px-5 py-2.5 text-sm sm:w-auto"
              >
                <Send className="h-4 w-4" /> Send feedback
              </button>
            )}
          </div>
        </div>

        <div ref={listRef} className="scroll-mt-4 space-y-4">
          {offline ? (
            <EmptyState
              icon={MessagesSquare}
              title="Feedback is offline"
              text="Feedback isn't set up on this server yet. Please check back later."
            />
          ) : !data && loading ? (
            <FeedbackSkeleton />
          ) : !data ? (
            <EmptyState
              icon={CircleAlert}
              title="Couldn't load feedback"
              text={error ?? feedbackErrorMessage("unavailable")}
            >
              <button
                onClick={() => void load(page)}
                disabled={loading}
                className="glass-btn glass-btn--primary mt-5 px-5 py-2 text-xs"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Try again
              </button>
            </EmptyState>
          ) : data.total === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="No feedback yet"
              text="Be the first to tell us what you think of GI Helper."
            >
              <button
                onClick={openForm}
                onPointerEnter={preloadSendFeedbackModal}
                className="glass-btn glass-btn--primary mt-5 px-5 py-2 text-xs"
              >
                <Send className="h-4 w-4" /> Send feedback
              </button>
            </EmptyState>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 px-1 text-xs text-white/70">
                <span>
                  <strong className="font-mono text-white">{data.total}</strong>{" "}
                  {data.total === 1 ? "post" : "posts"}
                </span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />}
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

              <div
                className={`space-y-4 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}
              >
                {data.items.map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} />
                ))}
              </div>

              <PaginationBar
                page={page}
                totalPages={totalPages}
                pageSize={data.pageSize}
                totalItems={data.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>

      {open && <LazySendFeedbackModal onClose={() => setOpen(false)} onSent={handleSent} />}
    </div>
  );
}
