import { Suspense } from "react";

import { AuthCard } from "./auth-card";

type AuthMode = "forgot-password" | "login" | "reset-password" | "signup";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading auth...
        </div>
      }
    >
      <AuthCard mode={mode} />
    </Suspense>
  );
}
