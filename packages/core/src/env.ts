import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Loads the repo-root .env file when running locally.
 * Import this module first in any entry point. Variables that are already
 * set (e.g. by Docker) are never overwritten.
 */
const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const file of candidates) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}
