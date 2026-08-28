import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserApplicationAccess } from "@/lib/access/repository";
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
  return auth.api.getSession({
    headers: requestHeaders,
  });
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
    redirect("/login");
  }

  if (!payload.user.isActive) {
    redirect("/login?error=inactive");
  }

  return payload;
}

export async function requireCentralAdminSession() {
  const payload = await requireSession();

  if (!payload.user.isCentralAdmin) {
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
