import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { z } from "zod";

const envSchema = z.object({
  AUTH_BASE_URL: z.string().url(),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email(),
  BOOTSTRAP_ADMIN_NAME: z.string().min(1),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8),
  BOOTSTRAP_INTRANIC_NAME: z.string().min(1).default("IntraNIC"),
  BOOTSTRAP_NFC_NAME: z.string().min(1).default("NFC"),
});

const env = envSchema.parse(process.env);

const mongoClient = new MongoClient(env.MONGODB_URI, {
  appName: "Auth Central Bootstrap",
});

const mongoDb = mongoClient.db(env.MONGODB_DB_NAME);
const authUsersCollection = mongoDb.collection("user");
const applicationsCollection = mongoDb.collection("applications");
const userApplicationAccessCollection = mongoDb.collection("userApplicationAccess");

const auth = betterAuth({
  appName: "Auth Central",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [admin()],
  advanced: {
    useSecureCookies: true,
  },
});

async function ensureCollectionsReady() {
  await Promise.all([
    applicationsCollection.createIndex({ key: 1 }, { unique: true }),
    applicationsCollection.createIndex({ active: 1 }),
    userApplicationAccessCollection.createIndex(
      { userId: 1, appKey: 1 },
      { unique: true },
    ),
    userApplicationAccessCollection.createIndex({ appKey: 1, role: 1 }),
    authUsersCollection.createIndex({ email: 1 }, { unique: true }),
  ]);
}

async function upsertApplication(key, name) {
  const now = new Date();

  await applicationsCollection.updateOne(
    { key },
    {
      $set: {
        name,
        active: true,
        updatedAt: now,
        url: null,
      },
      $setOnInsert: {
        key,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

async function replaceUserApplicationAccess(userId, entries) {
  const now = new Date();

  await userApplicationAccessCollection.deleteMany({ userId });

  if (!entries.length) {
    return;
  }

  await userApplicationAccessCollection.insertMany(
    entries.map((entry) => ({
      userId,
      appKey: entry.appKey,
      role: entry.role,
      createdAt: now,
      updatedAt: now,
    })),
    { ordered: true },
  );
}

async function main() {
  await ensureCollectionsReady();

  await upsertApplication("intranic", env.BOOTSTRAP_INTRANIC_NAME);
  await upsertApplication("nfc", env.BOOTSTRAP_NFC_NAME);

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
    throw new Error("No se pudo crear ni recuperar el usuario admin bootstrap.");
  }

  await replaceUserApplicationAccess(String(adminUser._id), [
    { appKey: "intranic", role: "admin" },
    { appKey: "nfc", role: "admin" },
  ]);

  console.log("Bootstrap de admin completado.");
  console.log(`Admin: ${env.BOOTSTRAP_ADMIN_EMAIL}`);
  console.log("Aplicaciones base aseguradas: intranic, nfc");
} 

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close();
  });
