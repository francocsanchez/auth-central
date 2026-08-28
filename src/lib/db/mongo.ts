import { MongoClient } from "mongodb";

import { getEnv } from "@/lib/env";

declare global {
  var __authCentralMongoClient: MongoClient | undefined;
}

const env = getEnv();

const mongoClient =
  globalThis.__authCentralMongoClient ??
  new MongoClient(env.MONGODB_URI, {
    appName: "Auth Central",
  });

if (env.NODE_ENV !== "production") {
  globalThis.__authCentralMongoClient = mongoClient;
}

export const mongoDb = mongoClient.db(env.MONGODB_DB_NAME);
export { mongoClient };
