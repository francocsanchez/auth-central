import type { AppRole, UserApplicationAccessRecord } from "@/lib/access/types";
import {
  applicationsCollection,
  ensureCollectionsReady,
  userApplicationAccessCollection,
} from "@/lib/db/collections";

export async function listApplications() {
  await ensureCollectionsReady();
  return applicationsCollection.find({}).sort({ name: 1 }).toArray();
}

export async function listActiveApplications() {
  await ensureCollectionsReady();
  return applicationsCollection.find({ active: true }).sort({ name: 1 }).toArray();
}

export async function getApplicationByKey(key: string) {
  await ensureCollectionsReady();
  return applicationsCollection.findOne({ key });
}

export async function upsertApplication(input: {
  key: string;
  name: string;
  url?: string | null;
  active: boolean;
}) {
  await ensureCollectionsReady();
  const now = new Date();

  await applicationsCollection.updateOne(
    { key: input.key },
    {
      $set: {
        name: input.name,
        url: input.url ?? null,
        active: input.active,
        updatedAt: now,
      },
      $setOnInsert: {
        key: input.key,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return getApplicationByKey(input.key);
}

export async function getUserApplicationAccess(userId: string) {
  await ensureCollectionsReady();
  return userApplicationAccessCollection.find({ userId }).sort({ appKey: 1 }).toArray();
}

export async function replaceUserApplicationAccess(
  userId: string,
  entries: Array<{ appKey: string; role: AppRole }>,
) {
  await ensureCollectionsReady();
  const now = new Date();

  await userApplicationAccessCollection.deleteMany({ userId });

  if (!entries.length) {
    return;
  }

  const documents: UserApplicationAccessRecord[] = entries.map((entry) => ({
    userId,
    appKey: entry.appKey,
    role: entry.role,
    createdAt: now,
    updatedAt: now,
  }));

  await userApplicationAccessCollection.insertMany(documents, {
    ordered: true,
  });
}

export async function hasApplicationAccess(userId: string, appKey: string) {
  await ensureCollectionsReady();
  return userApplicationAccessCollection.findOne({ userId, appKey });
}
