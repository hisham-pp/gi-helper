"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { loginAction, registerAction } from "@/app/actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === "login";

  function handleSubmit() {
    startTransition(async () => {
      const action = isLogin ? loginAction : registerAction;
      const result = await action({ username, password });

      if (!result.success) {
        toast.error(result.error ?? "Authentication failed.");
        return;
      }

      window.location.href = "/";
    });
  }

  return (
    <div className="w-full max-w-md rounded-[32px] border border-border bg-card/80 p-6 shadow-panel backdrop-blur dark:bg-slate-950/80">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
        {isLogin ? "Login" : "Create account"}
      </h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {isLogin
          ? "Sign in to access your personal material inventory and goals."
          : "Create a simple username and password to keep your tracker data separate."}
      </p>

      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={isPending}
          onClick={handleSubmit}
          type="button"
        >
          {isPending ? "Please wait..." : isLogin ? "Login" : "Create account"}
        </button>
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link className="font-medium text-sky-600 dark:text-sky-300" href={isLogin ? "/register" : "/login"}>
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </div>
  );
}
