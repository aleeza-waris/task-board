const SAFE_RETURN_ORIGIN = "https://task-board.invalid";

export function getSafeReturnTo(value: string | null): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }

  try {
    const url = new URL(value, SAFE_RETURN_ORIGIN);
    if (url.origin !== SAFE_RETURN_ORIGIN) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getReturnToFromCurrentUrl(): string | null {
  if (typeof window === "undefined") return null;

  return getSafeReturnTo(
    new URLSearchParams(window.location.search).get("returnTo"),
  );
}

export function getGoogleLoginUrl(apiUrl: string | undefined): string {
  const params = new URLSearchParams({
    frontendOrigin: window.location.origin,
  });
  const returnTo = getReturnToFromCurrentUrl();
  if (returnTo) params.set("returnTo", returnTo);
  return `${apiUrl}/auth/google/login?${params.toString()}`;
}

export function loginPathWithReturnTo(returnTo: string | null): string {
  return returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/login";
}
