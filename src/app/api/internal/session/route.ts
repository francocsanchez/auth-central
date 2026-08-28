import { NextResponse } from "next/server";

import { getApplicationByKey, getUserApplicationAccess } from "@/lib/access/repository";
import { auth } from "@/lib/auth/auth";
import { ensureCollectionsReady } from "@/lib/db/collections";

export async function GET(request: Request) {
  await ensureCollectionsReady();

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No authenticated user." },
      { status: 401 },
    );
  }

  if (session.user.isActive === false) {
    return NextResponse.json(
      { error: "The user is inactive." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const appKey = searchParams.get("appKey");
  const access = await getUserApplicationAccess(session.user.id);

  if (appKey) {
    const application = await getApplicationByKey(appKey);
    const appAccess = access.find((entry) => entry.appKey === appKey);

    if (!application || !application.active || !appAccess) {
      return NextResponse.json(
        { error: "The user does not have access to this application." },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email,
      isActive: Boolean(
        (session.user as { isActive?: boolean | null }).isActive !== false,
      ),
      isCentralAdmin:
        typeof session.user.role === "string" &&
        session.user.role.split(",").includes("admin"),
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt.toISOString(),
    },
    access: access.map((entry) => ({
      appKey: entry.appKey,
      role: entry.role,
    })),
  });
}
