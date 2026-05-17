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
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error") === "supabase_not_configured"
      ? "Supabase is not configured for this environment yet."
      : null
  );
  const [isPending, setIsPending] = React.useState(false);
  const configured = Boolean(getSupabasePublicConfig());
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

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
    <Card className="mx-auto w-full max-w-md border-border/60 bg-card/85 shadow-2xl backdrop-blur">
      <CardHeader className="gap-3">
        <Badge variant="outline" className="w-fit">
          Supabase Auth
        </Badge>
        <CardTitle className="text-2xl font-black tracking-tight">
          {details.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{details.helper}</p>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {showEmail ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <input
                autoComplete="email"
                className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
          ) : null}
          {showPassword ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
              {message}
            </p>
          ) : null}
          <Button disabled={isPending || !configured} size="lg" type="submit">
            {isPending ? "Working..." : details.action}
          </Button>
        </form>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {mode !== "login" ? <Link href="/auth/login">Sign in</Link> : null}
          {mode !== "signup" ? (
            <Link href="/auth/signup">Create account</Link>
          ) : null}
          {mode !== "forgot-password" ? (
            <Link href="/auth/forgot-password">Forgot password?</Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
