"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { replaceUserApplicationAccess } from "@/lib/access/repository";
import { appRoleValues } from "@/lib/access/types";
import { auth } from "@/lib/auth/auth";
import { getAuthUserById } from "@/lib/db/collections";

const appRoleSchema = z.enum(appRoleValues);

const userSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8).optional(),
  centralRole: z.enum(["admin", "user"]),
  isActive: z.boolean(),
});

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseAppAccess(formData: FormData) {
  const entries: Array<{ appKey: string; role: z.infer<typeof appRoleSchema> }> = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("app:") || !key.endsWith(":enabled") || value !== "on") {
      continue;
    }

    const appKey = key.replace("app:", "").replace(":enabled", "");
    const roleValue = formData.get(`app:${appKey}:role`);
    const role = appRoleSchema.parse(roleValue);
    entries.push({ appKey, role });
  }

  return entries;
}

export async function createUserAction(formData: FormData) {
  const requestHeaders = await headers();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    centralRole: formData.get("centralRole"),
    isActive: parseBoolean(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect("/users/new?error=action_failed");
  }

  const { name, email, password, centralRole, isActive } = parsed.data;

  const result = await auth.api.createUser({
    headers: requestHeaders,
    body: {
      name,
      email,
      password,
      role: centralRole,
      data: {
        isActive,
      },
    },
  });

  const access = parseAppAccess(formData);
  await replaceUserApplicationAccess(result.user.id, access);

  if (!isActive) {
    await auth.api.banUser({
      headers: requestHeaders,
      body: {
        userId: result.user.id,
        banReason: "Deactivated by central admin.",
      },
    });
  }

  redirect("/users?success=user_created");
}

export async function updateUserAction(userId: string, formData: FormData) {
  const requestHeaders = await headers();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    centralRole: formData.get("centralRole"),
    isActive: parseBoolean(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect(`/users/${userId}?error=action_failed`);
  }

  const currentUser = await getAuthUserById(userId);

  if (!currentUser) {
    redirect("/users?error=user_not_found");
  }

  const { name, email, centralRole, isActive } = parsed.data;

  await auth.api.adminUpdateUser({
    headers: requestHeaders,
    body: {
      userId,
      data: {
        name,
        email,
        isActive,
      },
    },
  });

  await auth.api.setRole({
    headers: requestHeaders,
    body: {
      userId,
      role: centralRole,
    },
  });

  if (isActive) {
    if (currentUser.isActive === false || currentUser.banned) {
      await auth.api.unbanUser({
        headers: requestHeaders,
        body: { userId },
      });
    }
  } else {
    await auth.api.banUser({
      headers: requestHeaders,
      body: {
        userId,
        banReason: "Deactivated by central admin.",
      },
    });
  }

  const access = parseAppAccess(formData);
  await replaceUserApplicationAccess(userId, access);

  redirect("/users?success=user_updated");
}

export async function setUserPasswordAction(userId: string, formData: FormData) {
  const requestHeaders = await headers();
  const password = z.string().min(8).parse(formData.get("newPassword"));

  await auth.api.setUserPassword({
    headers: requestHeaders,
    body: {
      userId,
      newPassword: password,
    },
  });

  redirect(`/users/${userId}?success=password_updated`);
}

export async function revokeUserSessionsAction(userId: string) {
  const requestHeaders = await headers();

  await auth.api.revokeUserSessions({
    headers: requestHeaders,
    body: {
      userId,
    },
  });

  redirect(`/users/${userId}?success=user_updated`);
}
