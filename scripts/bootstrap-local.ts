import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvConfig } from "@next/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

loadEnvConfig(rootDir);

async function main() {
  const [{ ensureBootstrapData }, { getEnv }] = await Promise.all([
    import("../src/lib/bootstrap/ensure-bootstrap"),
    import("../src/lib/env"),
  ]);

  const env = getEnv();

  await ensureBootstrapData();

  console.log("Bootstrap local completo.");
  console.log(`Admin: ${env.BOOTSTRAP_ADMIN_EMAIL}`);
  console.log("Aplicaciones base: intranic, nfc");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
