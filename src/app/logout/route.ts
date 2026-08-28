import { NextResponse } from "next/server";

import { getSanitizedAuthHeaders, logAuthDebug } from "@/lib/auth/debug";
import { auth } from "@/lib/auth/auth";
import { normalizeReturnTo } from "@/lib/auth/redirects";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"), "/login");

  logAuthDebug("logout.request", {
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
    pathname: url.pathname,
    returnTo,
    setCookieCount: setCookies.length,
  });

  return response;
}
