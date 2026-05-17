export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/"
) {
  if (!value) {
    return fallback;
  }

  const redirectPath = value.trim();

  if (
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//") ||
    redirectPath.includes("\\")
  ) {
    return fallback;
  }

  return redirectPath;
}
