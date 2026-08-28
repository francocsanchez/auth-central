import { toNextJsHandler } from "better-auth/next-js";

import { getSanitizedAuthHeaders, logAuthDebug } from "@/lib/auth/debug";
import { auth } from "@/lib/auth/auth";

const handler = toNextJsHandler(auth);

function getSetCookieCount(response: Response) {
  return typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie().length
    : 0;
}

export async function GET(request: Request) {
  logAuthDebug("auth.route.request", {
    method: "GET",
    pathname: new URL(request.url).pathname,
    headers: getSanitizedAuthHeaders(request.headers),
  });

  const response = await handler.GET(request);

  logAuthDebug("auth.route.response", {
    method: "GET",
    pathname: new URL(request.url).pathname,
    status: response.status,
    location: response.headers.get("location"),
    setCookieCount: getSetCookieCount(response),
  });

  return response;
}

export async function POST(request: Request) {
  logAuthDebug("auth.route.request", {
    method: "POST",
    pathname: new URL(request.url).pathname,
    headers: getSanitizedAuthHeaders(request.headers),
  });

  const response = await handler.POST(request);

  logAuthDebug("auth.route.response", {
    method: "POST",
    pathname: new URL(request.url).pathname,
    status: response.status,
    location: response.headers.get("location"),
    setCookieCount: getSetCookieCount(response),
  });

  return response;
}
