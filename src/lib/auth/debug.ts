import { isAuthDebugEnabled } from "@/lib/env";

function getCookieNames(cookieHeader: string | null) {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter(Boolean);
}

function sanitizeHeaders(input: Headers | Record<string, string | null | undefined>) {
  const read = (name: string) =>
    input instanceof Headers ? input.get(name) : input[name] ?? null;

  const cookieHeader = read("cookie");

  return {
    host: read("host"),
    origin: read("origin"),
    referer: read("referer"),
    "user-agent": read("user-agent"),
    "x-forwarded-host": read("x-forwarded-host"),
    "x-forwarded-proto": read("x-forwarded-proto"),
    "x-forwarded-port": read("x-forwarded-port"),
    "x-forwarded-for": read("x-forwarded-for"),
    "x-forwarded-prefix": read("x-forwarded-prefix"),
    "x-real-ip": read("x-real-ip"),
    "next-url": read("next-url"),
    cookieNames: getCookieNames(cookieHeader),
    hasSessionCookie:
      getCookieNames(cookieHeader).includes("auth-central.session_token") ||
      getCookieNames(cookieHeader).includes("__Secure-auth-central.session_token"),
  };
}

export function logAuthDebug(event: string, details: Record<string, unknown>) {
  if (!isAuthDebugEnabled()) {
    return;
  }

  console.log(
    `[AUTH_DEBUG] ${event}`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ...details,
      },
      null,
      2,
    ),
  );
}

export function getSanitizedAuthHeaders(headers: Headers | Record<string, string | null | undefined>) {
  return sanitizeHeaders(headers);
}
