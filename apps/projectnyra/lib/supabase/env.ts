const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabasePublicConfig = {
  anonKey: string;
  url: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (
    SUPABASE_URL.includes("replace-me") ||
    SUPABASE_ANON_KEY.includes("replace-me")
  ) {
    return null;
  }

  return {
    anonKey: SUPABASE_ANON_KEY,
    url: SUPABASE_URL,
  };
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return config;
}
