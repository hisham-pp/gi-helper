"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginAction, registerAction } from "@/app/actions";
import { Card } from "@/components/ui/card";
import AppTextField from "@/components/core/app-textfield";
import { Button } from "@/components/ui/button";

type AuthFormValues = {
  username: string;
  password: string;
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const isLogin = mode === "login";

  function onSubmit(values: AuthFormValues) {
    startTransition(async () => {
      const action = isLogin ? loginAction : registerAction;
      const result = await action(values);

      if (!result.success) {
        setError("root", {
          message: result.error ?? "Authentication failed.",
        });
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

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AppTextField
          label="Username"
          variant="outlined"
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          {...register("username", {
            maxLength: {
              value: 30,
              message: "Username must be 30 characters or fewer.",
            },
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters.",
            },
            pattern: {
              value: /^[a-zA-Z0-9_-]+$/,
              message: "Use letters, numbers, underscores, or hyphens.",
            },
            required: "Username is required.",
          })}
        />
        <AppTextField
          label="Password"
          variant="outlined"
          type="password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", {
            maxLength: {
              value: 100,
              message: "Password must be 100 characters or fewer.",
            },
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters.",
            },
            required: "Password is required.",
          })}
        />
        {errors.root?.message && (
          <p className="text-sm font-medium text-error">
            {errors.root.message}
          </p>
        )}
        <Button
          className="mt-4 w-full"
          disabled={isPending}
          type="submit"
          variant="filled"
        >
          {isPending ? "Please wait..." : isLogin ? "Login" : "Create account"}
        </Button>
      </form>

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
