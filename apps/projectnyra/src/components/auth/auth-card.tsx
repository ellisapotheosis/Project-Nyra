"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nyra/ui";
import {
  createSupabaseBrowserClient,
  getSupabasePublicConfig,
} from "@/lib/supabase";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

type AuthMode = "forgot-password" | "login" | "reset-password" | "signup";

const copy: Record<
  AuthMode,
  { action: string; helper: string; title: string }
> = {
  "forgot-password": {
    action: "Send reset link",
    helper: "We will send a password reset link through Supabase Auth.",
    title: "Recover access",
  },
  login: {
    action: "Sign in",
    helper: "Use the broker account attached to Project Nyra.",
    title: "Sign in to Project Nyra",
  },
  "reset-password": {
    action: "Update password",
    helper: "Choose a new password for the current recovery session.",
    title: "Reset password",
  },
  signup: {
    action: "Create account",
    helper: "Create a Supabase Auth user for the Project Nyra webapp.",
    title: "Create Project Nyra account",
  },
};

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const initialError = searchParams?.get("error") ?? null;
  const [error, setError] = React.useState<string | null>(() => {
    if (initialError === "supabase_not_configured") {
      return "Supabase is not configured for this environment yet.";
    }

    if (initialError === "auth_callback_failed") {
      return "Supabase could not complete the sign-in callback. Try signing in again.";
    }

    return null;
  });
  const [isPending, setIsPending] = React.useState(false);
  const configured = Boolean(getSupabasePublicConfig());
  const redirectTo = getSafeRedirectPath(searchParams?.get("redirect") ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!configured) {
      setError("Supabase URL and anon key are required before auth can run.");
      return;
    }

    setIsPending(true);
    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        router.replace(redirectTo);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setMessage("Check your email to confirm your Project Nyra account.");
        return;
      }

      if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          }
        );

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setMessage("Password reset email sent.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password updated. You can continue to Project Nyra.");
      router.replace(redirectTo);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  const details = copy[mode];
  const showEmail = mode !== "reset-password";
  const showPassword = mode !== "forgot-password";

  return (
    <div className="w-full max-w-md mx-auto">
      <Card variant="glass" className="p-8">
        <CardHeader className="gap-3 pb-8 px-0">
          <div className="flex items-center justify-between">
            <Badge variant="glass">Supabase Auth</Badge>
          </div>
          <CardTitle className="text-3xl font-normal text-white tracking-tight">
            {details.title}
          </CardTitle>
          <p className="text-sm text-white/60">{details.helper}</p>
        </CardHeader>
        <CardContent className="px-0">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {showEmail ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="glass-input h-12 w-full rounded-2xl px-4 text-white"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                />
              </div>
            ) : null}
            {showPassword ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">
                  Password
                </label>
                <input
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  className="glass-input h-12 w-full rounded-2xl px-4 text-white"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                  placeholder="••••••••"
                />
              </div>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive backdrop-blur-sm">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary backdrop-blur-sm">
                {message}
              </p>
            ) : null}
            <Button
              disabled={isPending || !configured}
              size="lg"
              type="submit"
              variant="glass"
              className="h-12 rounded-2xl font-semibold"
            >
              {isPending ? "Working..." : details.action}
            </Button>
          </form>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/40 justify-center font-medium">
            {mode !== "login" ? (
              <Link
                href="/auth/login"
                className="hover:text-white transition-colors"
              >
                Sign in
              </Link>
            ) : null}
            {mode !== "signup" ? (
              <Link
                href="/auth/signup"
                className="hover:text-white transition-colors"
              >
                Create account
              </Link>
            ) : null}
            {mode !== "forgot-password" ? (
              <Link
                href="/auth/forgot-password"
                className="hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
