"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Eye, EyeOff, Loader2, Lock, LogIn } from "lucide-react";
import { feedbackErrorMessage } from "@/lib/feedback/types";

/**
 * Sign-in for the feedback inbox. Accounts are seeded in the database (see
 * docs/feedback.md); there's no sign-up. On success the page re-renders on
 * the server and shows the inbox.
 */
export function InboxLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(data?.message ?? feedbackErrorMessage(undefined));
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError(feedbackErrorMessage("unavailable"));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="glass-card glass-card--lg w-full max-w-sm space-y-5 p-6 sm:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="glass-chip h-12 w-12 justify-center rounded-2xl text-cyan-300">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Feedback Inbox</h1>
            <p className="mt-1 text-xs text-white/60">
              Bug reports, ideas and messages. Sign in with an inbox account.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${id}-username`} className="text-xs font-semibold text-white/80">
            Username
          </label>
          <input
            id={`${id}-username`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${id}-password`} className="text-xs font-semibold text-white/80">
            Password
          </label>
          <div className="relative">
            <input
              id={`${id}-password`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 pr-11 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              className="glass-icon-btn absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg bg-transparent shadow-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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

        <button
          type="submit"
          disabled={submitting || !username.trim() || !password}
          className="glass-btn glass-btn--primary w-full justify-center px-5 py-2.5 text-sm font-bold"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <Link
          href="/feedback"
          className="block text-center text-xs text-white/55 transition-colors hover:text-white/85"
        >
          Back to the Feedback page
        </Link>
      </form>
    </div>
  );
}
