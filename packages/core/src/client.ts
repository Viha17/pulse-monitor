import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __pulseSql?: postgres.Sql };

// postgres-js connects lazily, so creating the client never touches the network.
// Reusing it across hot reloads keeps the dev server from leaking connections.
const sql =
  globalForDb.__pulseSql ??
  postgres(process.env.DATABASE_URL ?? "postgres://pulse:pulse@localhost:5433/pulse", {
    max: Number(process.env.DB_POOL_SIZE ?? 10),
    onnotice: () => {}, // hide "already exists, skipping" notices from migrations
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pulseSql = sql;

export const db = drizzle(sql, { schema });

export async function closeDb() {
  await sql.end({ timeout: 5 });
}
