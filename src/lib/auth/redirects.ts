import { getAllowedReturnOrigins, getEnv } from "@/lib/env";

function fallbackUrl(pathname = "/dashboard") {
  const env = getEnv();
  return new URL(pathname, env.AUTH_BASE_URL).toString();
}

export function normalizeReturnTo(
  input: string | null | undefined,
  fallbackPathname = "/dashboard",
) {
  if (!input) {
    return fallbackUrl(fallbackPathname);
  }

  const env = getEnv();
  const allowedOrigins = new Set(getAllowedReturnOrigins());

  try {
    const url = new URL(input, env.AUTH_BASE_URL);

    if (!allowedOrigins.has(url.origin)) {
      return fallbackUrl(fallbackPathname);
    }

    return url.toString();
  } catch {
    return fallbackUrl(fallbackPathname);
  }
}

export function buildCentralLoginUrl({
  appKey,
  returnTo,
}: {
  appKey?: string;
  returnTo?: string;
}) {
  const env = getEnv();
  const url = new URL("/login", env.AUTH_BASE_URL);

  if (appKey) {
    url.searchParams.set("appKey", appKey);
  }

  if (returnTo) {
    url.searchParams.set("returnTo", normalizeReturnTo(returnTo));
  }

  return url.toString();
}

export function buildCentralLogoutUrl(returnTo?: string) {
  const env = getEnv();
  const url = new URL("/logout", env.AUTH_BASE_URL);

  if (returnTo) {
    url.searchParams.set("returnTo", normalizeReturnTo(returnTo));
  }

  return url.toString();
}
