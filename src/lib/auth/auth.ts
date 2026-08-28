import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import { mongoClient, mongoDb } from "@/lib/db/mongo";
import { getEnv, getTrustedOrigins } from "@/lib/env";

const env = getEnv();

export const auth = betterAuth({
  appName: "Auth Central",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),
  trustedOrigins: getTrustedOrigins(),
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
  plugins: [
    admin(),
  ],
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    cookiePrefix: "auth-central",
  },
});
