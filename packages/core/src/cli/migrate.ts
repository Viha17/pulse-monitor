import "../env";
import { closeDb } from "../client";
import { runMigrations } from "../migrate";

try {
  await runMigrations();
  console.log("✔ Database migrations applied");
} catch (err) {
  console.error("✖ Migration failed:", err);
  process.exitCode = 1;
} finally {
  await closeDb();
}
