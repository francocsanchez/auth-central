import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserApplicationAccess } from "@/lib/access/repository";
import { getSanitizedAuthHeaders, logAuthDebug } from "@/lib/auth/debug";
import type { CentralSessionPayload } from "@/lib/access/types";
import { auth } from "@/lib/auth/auth";

function isCentralAdminRole(role?: string | null) {
  if (!role) {
    return false;
  }

  return role.split(",").includes("admin");
}

export async function getAuthSession() {
  const requestHeaders = await headers();
  const headerSnapshot = getSanitizedAuthHeaders(requestHeaders);

  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
      query: {
        disableCookieCache: true,
        disableRefresh: true,
      },
    });

    logAuthDebug("session.read", {
      headers: headerSnapshot,
      sessionFound: Boolean(session),
      userId: session?.user.id ?? null,
      userEmail: session?.user.email ?? null,
      expiresAt: session?.session.expiresAt?.toISOString?.() ?? null,
    });

    return session;
  } catch (error) {
    logAuthDebug("session.read_error", {
      headers: headerSnapshot,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function getCentralSessionPayload(): Promise<CentralSessionPayload | null> {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const access = await getUserApplicationAccess(session.user.id);

  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email,
      isActive: Boolean(
        (session.user as { isActive?: boolean | null }).isActive !== false,
      ),
      isCentralAdmin: isCentralAdminRole(session.user.role ?? null),
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt.toISOString(),
    },
    access: access.map((entry) => ({
      appKey: entry.appKey,
      role: entry.role,
    })),
  };
}

export async function requireSession() {
  const payload = await getCentralSessionPayload();

  if (!payload) {
    logAuthDebug("session.redirect_login", {
      reason: "missing_session",
    });
    redirect("/login");
  }

  if (!payload.user.isActive) {
    logAuthDebug("session.redirect_login", {
      reason: "inactive_user",
      userId: payload.user.id,
      userEmail: payload.user.email,
    });
    redirect("/login?error=inactive");
  }

  return payload;
}

export async function requireCentralAdminSession() {
  const payload = await requireSession();

  if (!payload.user.isCentralAdmin) {
    logAuthDebug("session.redirect_profile", {
      reason: "not_central_admin",
      userId: payload.user.id,
      userEmail: payload.user.email,
    });
    redirect("/profile?error=forbidden");
  }

  return payload;
}

export function hasAppAccess(session: CentralSessionPayload, appKey: string) {
  return session.access.some((entry) => entry.appKey === appKey);
}

export function getAppRole(session: CentralSessionPayload, appKey: string) {
  return session.access.find((entry) => entry.appKey === appKey)?.role ?? null;
}
