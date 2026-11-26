import {
  bigserial,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const monitorStatus = pgEnum("monitor_status", ["pending", "up", "down", "paused"]);
export const httpMethod = pgEnum("http_method", ["GET", "HEAD"]);
export const channelType = pgEnum("channel_type", ["discord", "slack", "webhook"]);

const tz = { withTimezone: true } as const;

export const monitors = pgTable("monitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  method: httpMethod("method").notNull().default("GET"),
  intervalSeconds: integer("interval_seconds").notNull().default(60),
  timeoutMs: integer("timeout_ms").notNull().default(10_000),
  /** Exact status code to expect. When null, any 2xx/3xx counts as up. */
  expectedStatus: integer("expected_status"),
  /** Text that must appear in the response body (GET only). */
  keyword: text("keyword"),
  /** Consecutive failures required before the monitor is marked down. */
  failureThreshold: integer("failure_threshold").notNull().default(2),
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),

  status: monitorStatus("status").notNull().default("pending"),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  lastCheckedAt: timestamp("last_checked_at", tz),
  lastResponseMs: integer("last_response_ms"),
  lastError: text("last_error"),
  sslExpiresAt: timestamp("ssl_expires_at", tz),
  sslCheckedAt: timestamp("ssl_checked_at", tz),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

export const checks = pgTable(
  "checks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    checkedAt: timestamp("checked_at", tz).notNull().defaultNow(),
    ok: boolean("ok").notNull(),
    statusCode: integer("status_code"),
    responseMs: integer("response_ms").notNull(),
    error: text("error"),
  },
  (t) => [index("checks_monitor_time_idx").on(t.monitorId, t.checkedAt.desc())],
);

export const incidents = pgTable(
  "incidents",
  {
    id: serial("id").primaryKey(),
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", tz).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", tz),
    cause: text("cause"),
  },
  (t) => [index("incidents_monitor_idx").on(t.monitorId, t.startedAt.desc())],
);

export const alertChannels = pgTable("alert_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: channelType("type").notNull(),
  url: text("url").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

export type Monitor = typeof monitors.$inferSelect;
export type NewMonitor = typeof monitors.$inferInsert;
export type Check = typeof checks.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type AlertChannel = typeof alertChannels.$inferSelect;
export type MonitorStatus = (typeof monitorStatus.enumValues)[number];
export type ChannelType = (typeof channelType.enumValues)[number];
