"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";

export async function updateProfileAction(formData: FormData) {
  const requestHeaders = await headers();
  const name = z.string().trim().min(1).parse(formData.get("name"));

  await auth.api.updateUser({
    headers: requestHeaders,
    body: {
      name,
    },
  });

  redirect("/profile?success=profile_updated");
}

export async function changeProfilePasswordAction(formData: FormData) {
  const requestHeaders = await headers();
  const schema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });

  const parsed = schema.parse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  await auth.api.changePassword({
    headers: requestHeaders,
    body: {
      currentPassword: parsed.currentPassword,
      newPassword: parsed.newPassword,
      revokeOtherSessions: true,
    },
  });

  redirect("/profile?success=profile_password_updated");
}
