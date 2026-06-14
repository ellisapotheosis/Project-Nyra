export type SupabasePublicConfig = {
  anonKey: string;
  url: string;
};

function getEnvValue(value: string | undefined) {
  if (!value || value.trim() === "" || value.includes("replace-me")) {
    return null;
  }

  return value;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    return null;
  }

  return {
    anonKey,
    url,
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
