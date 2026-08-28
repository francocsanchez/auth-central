import { toNextJsHandler } from "better-auth/next-js";

import { getSanitizedAuthHeaders, logAuthDebug } from "@/lib/auth/debug";
import { auth } from "@/lib/auth/auth";

const handler = toNextJsHandler(auth);

function getSetCookieHeaders(response: Response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const setCookie = response.headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

function getSetCookieNames(response: Response) {
  return getSetCookieHeaders(response)
    .map((value) => value.split("=")[0]?.trim())
    .filter(Boolean);
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
    setCookieCount: getSetCookieHeaders(response).length,
    setCookieNames: getSetCookieNames(response),
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
    setCookieCount: getSetCookieHeaders(response).length,
    setCookieNames: getSetCookieNames(response),
  });

  return response;
}
