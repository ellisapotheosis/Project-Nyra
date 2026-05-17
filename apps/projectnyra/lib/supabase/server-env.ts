const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseServiceRoleKey() {
  if (
    !SUPABASE_SERVICE_ROLE_KEY ||
    SUPABASE_SERVICE_ROLE_KEY === "replace-me"
  ) {
    return null;
  }

  return SUPABASE_SERVICE_ROLE_KEY;
}
