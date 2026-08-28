import { NextResponse } from "next/server";

import { getSanitizedAuthHeaders, logAuthDebug } from "@/lib/auth/debug";
import { auth } from "@/lib/auth/auth";
import { normalizeReturnTo } from "@/lib/auth/redirects";

async function signOutAndRedirect(request: Request, method: "GET" | "POST") {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"), "/login");

  logAuthDebug("logout.request", {
    method,
    pathname: url.pathname,
    returnTo,
    headers: getSanitizedAuthHeaders(request.headers),
  });

  const signOutResponse = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  const response = NextResponse.redirect(returnTo);
  const setCookies =
    typeof signOutResponse.headers.getSetCookie === "function"
      ? signOutResponse.headers.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  logAuthDebug("logout.response", {
    method,
    pathname: url.pathname,
    returnTo,
    setCookieCount: setCookies.length,
  });

  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"), "/login");

  logAuthDebug("logout.blocked_get", {
    pathname: url.pathname,
    returnTo,
    headers: getSanitizedAuthHeaders(request.headers),
  });

  return NextResponse.redirect(returnTo);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request, "POST");
}
