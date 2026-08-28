import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("3000"),
  AUTH_BASE_URL: z.string().url(),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1),
  TRUSTED_ORIGINS: z.string().default(""),
  ALLOWED_RETURN_TO_ORIGINS: z.string().default(""),
  AUTH_DEBUG: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  BOOTSTRAP_ON_STARTUP: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  BOOTSTRAP_ADMIN_NAME: z.string().min(1).default("Auth Central Admin"),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe12345!"),
  BOOTSTRAP_INTRANIC_NAME: z.string().min(1).default("IntraNIC"),
  BOOTSTRAP_NFC_NAME: z.string().min(1).default("NFC"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

function splitOrigins(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export function getTrustedOrigins() {
  const env = getEnv();

  return Array.from(
    new Set([
      new URL(env.AUTH_BASE_URL).origin,
      new URL(env.BETTER_AUTH_URL).origin,
      ...splitOrigins(env.TRUSTED_ORIGINS),
      ...splitOrigins(env.ALLOWED_RETURN_TO_ORIGINS),
    ]),
  );
}

export function getAllowedReturnOrigins() {
  const env = getEnv();

  return Array.from(
    new Set([
      new URL(env.AUTH_BASE_URL).origin,
      ...splitOrigins(env.ALLOWED_RETURN_TO_ORIGINS),
    ]),
  );
}

export function shouldUseSecureCookies() {
  const env = getEnv();

  return (
    new URL(env.AUTH_BASE_URL).protocol === "https:" &&
    new URL(env.BETTER_AUTH_URL).protocol === "https:"
  );
}

export function isAuthDebugEnabled() {
  return getEnv().AUTH_DEBUG;
}
