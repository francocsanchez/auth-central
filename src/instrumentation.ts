import { ensureBootstrapData } from "@/lib/bootstrap/ensure-bootstrap";
import { getEnv } from "@/lib/env";

export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const env = getEnv();

  if (!env.BOOTSTRAP_ON_STARTUP) {
    return;
  }

  await ensureBootstrapData();
}
