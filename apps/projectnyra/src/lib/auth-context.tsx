"use client";

import type { ReactNode } from "react";

const demoUser = {
  id: "operator-ellis",
  email: "ellis@projectnyra.com",
  name: "Ellis Andersen",
  role: "broker_operator",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const demoAuthEnabled = process.env.NEXT_PUBLIC_NYRA_DEMO_AUTH === "true";

  return {
    user: demoAuthEnabled ? demoUser : null,
    loading: false,
  };
}
