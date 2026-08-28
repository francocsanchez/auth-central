"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { upsertApplication } from "@/lib/access/repository";

const applicationSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1),
  url: z.union([z.url(), z.literal(""), z.null()]).transform((value) => value || null),
  active: z.boolean(),
});

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function createApplicationAction(formData: FormData) {
  const parsed = applicationSchema.safeParse({
    key: formData.get("key"),
    name: formData.get("name"),
    url: formData.get("url"),
    active: parseBoolean(formData.get("active")),
  });

  if (!parsed.success) {
    redirect("/applications/new?error=action_failed");
  }

  await upsertApplication(parsed.data);
  redirect(`/applications/${parsed.data.key}?success=application_created`);
}

export async function updateApplicationAction(currentKey: string, formData: FormData) {
  const parsed = applicationSchema.safeParse({
    key: formData.get("key") ?? currentKey,
    name: formData.get("name"),
    url: formData.get("url"),
    active: parseBoolean(formData.get("active")),
  });

  if (!parsed.success) {
    redirect(`/applications/${currentKey}?error=action_failed`);
  }

  await upsertApplication(parsed.data);
  redirect(`/applications/${parsed.data.key}?success=application_updated`);
}
