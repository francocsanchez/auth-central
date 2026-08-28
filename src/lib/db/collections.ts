import type {
  ApplicationRecord,
  UserApplicationAccessRecord,
} from "@/lib/access/types";
import { ObjectId } from "mongodb";
import { mongoDb } from "@/lib/db/mongo";

export type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  isActive?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthUserCollectionRecord = Omit<AuthUserRecord, "id"> & {
  _id: ObjectId | string;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const authUsersCollection =
  mongoDb.collection<AuthUserCollectionRecord>("user");

export const authSessionsCollection =
  mongoDb.collection<AuthSessionRecord>("session");

export const applicationsCollection =
  mongoDb.collection<ApplicationRecord>("applications");

export const userApplicationAccessCollection =
  mongoDb.collection<UserApplicationAccessRecord>("userApplicationAccess");

let ensureIndexesPromise: Promise<void> | null = null;

export function ensureCollectionsReady() {
  if (ensureIndexesPromise) {
    return ensureIndexesPromise;
  }

  ensureIndexesPromise = Promise.all([
    applicationsCollection.createIndex({ key: 1 }, { unique: true }),
    applicationsCollection.createIndex({ active: 1 }),
    userApplicationAccessCollection.createIndex(
      { userId: 1, appKey: 1 },
      { unique: true },
    ),
    userApplicationAccessCollection.createIndex({ appKey: 1, role: 1 }),
    authUsersCollection.createIndex({ email: 1 }, { unique: true }),
  ]).then(() => undefined);

  return ensureIndexesPromise;
}

export async function getCollectionCounts() {
  await ensureCollectionsReady();

  const [users, activeUsers, inactiveUsers, applications] = await Promise.all([
    authUsersCollection.countDocuments(),
    authUsersCollection.countDocuments({ isActive: { $ne: false } }),
    authUsersCollection.countDocuments({ isActive: false }),
    applicationsCollection.countDocuments(),
  ]);

  return {
    users,
    activeUsers,
    inactiveUsers,
    applications,
  };
}

export async function getAuthUserById(userId: string) {
  await ensureCollectionsReady();
  const filter = ObjectId.isValid(userId)
    ? { _id: new ObjectId(userId) }
    : { _id: userId };
  const user = await authUsersCollection.findOne(filter);
  return user ? { ...user, id: String(user._id) } : null;
}

export async function listAuthUsers(search?: string) {
  await ensureCollectionsReady();

  const filter =
    search && search.trim()
      ? {
          $or: [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
          ],
        }
      : {};

  const users = await authUsersCollection.find(filter).sort({ createdAt: -1 }).toArray();
  return users.map((user) => ({
    ...user,
    id: String(user._id),
  }));
}
