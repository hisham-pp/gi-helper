"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { loginAction, registerAction } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <Card className="w-full max-w-md p-8" variant="elevated">
      <h1 className="text-on-surface text-3xl font-bold">
        {isLogin ? "Login" : "Create account"}
      </h1>
      <p className="text-on-surface-variant mt-3 text-sm">
        {isLogin
          ? "Sign in to access your personal material inventory and goals."
          : "Create a simple username and password to keep your tracker data separate."}
      </p>

      <div className="mt-8 space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          className="mt-4 w-full"
          disabled={isPending}
          onClick={handleSubmit}
          variant="filled"
        >
          {isPending ? "Please wait..." : isLogin ? "Login" : "Create account"}
        </Button>
      </div>

      <p className="text-on-surface-variant mt-6 text-sm">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          className="font-medium text-primary hover:underline"
          href={isLogin ? "/register" : "/login"}
        >
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </Card>
  );
}
