export * from "./schema";
export * from "./alerts";
export { db, closeDb } from "./client";
export { runMigrations } from "./migrate";

// Re-export query helpers so every package shares one drizzle-orm instance.
export { and, asc, count, desc, eq, gte, inArray, isNull, lt, ne, sql } from "drizzle-orm";
