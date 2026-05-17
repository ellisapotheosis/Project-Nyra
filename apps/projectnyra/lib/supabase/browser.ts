"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicConfig } from "./env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { anonKey, url } = requireSupabasePublicConfig();

  browserClient = createBrowserClient(url, anonKey, {
    cookieOptions: {
      name: "nyra-supabase-auth",
      path: "/",
      sameSite: "lax",
    },
  });

  return browserClient;
}
