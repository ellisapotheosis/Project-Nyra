export function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !key ||
    key.trim() === "" ||
    key === "replace-me" ||
    key.includes("replace-me")
  ) {
    return null;
  }

  return key;
}
