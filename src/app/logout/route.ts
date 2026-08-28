import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { normalizeReturnTo } from "@/lib/auth/redirects";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"), "/login");

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

  return response;
}
