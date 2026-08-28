import { auth } from "@/lib/auth/auth";
import { replaceUserApplicationAccess, upsertApplication } from "@/lib/access/repository";
import {
  authUsersCollection,
  ensureCollectionsReady,
} from "@/lib/db/collections";
import { getEnv } from "@/lib/env";

let ensureBootstrapPromise: Promise<void> | null = null;

async function runBootstrap() {
  const env = getEnv();

  await ensureCollectionsReady();

  await upsertApplication({
    key: "intranic",
    name: env.BOOTSTRAP_INTRANIC_NAME,
    active: true,
  });

  await upsertApplication({
    key: "nfc",
    name: env.BOOTSTRAP_NFC_NAME,
    active: true,
  });

  let adminUser = await authUsersCollection.findOne({
    email: env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
  });

  if (!adminUser) {
    await auth.api.createUser({
      body: {
        email: env.BOOTSTRAP_ADMIN_EMAIL,
        password: env.BOOTSTRAP_ADMIN_PASSWORD,
        name: env.BOOTSTRAP_ADMIN_NAME,
        role: "admin",
        data: {
          isActive: true,
        },
      },
    });

    adminUser = await authUsersCollection.findOne({
      email: env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
    });
  } else {
    await authUsersCollection.updateOne(
      { _id: adminUser._id },
      {
        $set: {
          role: "admin",
          isActive: true,
          updatedAt: new Date(),
        },
      },
    );
  }

  if (!adminUser) {
    throw new Error("No se encontró el admin bootstrap luego de inicializar Better Auth.");
  }

  await replaceUserApplicationAccess(String(adminUser._id), [
    { appKey: "intranic", role: "admin" },
    { appKey: "nfc", role: "admin" },
  ]);
}

export function ensureBootstrapData() {
  if (ensureBootstrapPromise) {
    return ensureBootstrapPromise;
  }

  ensureBootstrapPromise = runBootstrap().catch((error) => {
    ensureBootstrapPromise = null;
    throw error;
  });

  return ensureBootstrapPromise;
}
