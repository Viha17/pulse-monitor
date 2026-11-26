import "@pulse/core/env";
import { checks, closeDb, db, eq, lt, monitors, runMigrations } from "@pulse/core";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { log } from "./log";
import { processMonitor } from "./process-monitor";

const QUEUE = "monitor-checks";
const SYNC_EVERY_MS = 10_000;
const RETENTION_EVERY_MS = 60 * 60 * 1000;
const retentionDays = Number(process.env.RETENTION_DAYS ?? 30);
const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 10);

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6380", {
  maxRetriesPerRequest: null, // required by BullMQ
});

const queue = new Queue<{ monitorId: number }>(QUEUE, { connection });

const worker = new Worker<{ monitorId: number }>(
  QUEUE,
  async (job) => processMonitor(job.data.monitorId),
  { connection, concurrency },
);

worker.on("failed", (job, err) => log.error(`Check job ${job?.id} failed`, err));

const schedulerId = (monitorId: number) => `monitor:${monitorId}`;

/** monitorId -> interval (seconds) of the schedulers this process has registered. */
const scheduled = new Map<number, number>();

/**
 * The database is the source of truth. Every few seconds we reconcile it with
 * BullMQ's job schedulers, so creating, editing, pausing or deleting a monitor in
 * the dashboard takes effect without the web app ever talking to Redis.
 */
async function syncSchedulers(initial = false) {
  const active = await db
    .select({ id: monitors.id, intervalSeconds: monitors.intervalSeconds })
    .from(monitors)
    .where(eq(monitors.isActive, true));

  const wanted = new Map(active.map((m) => [m.id, m.intervalSeconds]));

  if (initial) {
    // Drop schedulers left over from a previous run for monitors that no longer exist.
    for (const s of await queue.getJobSchedulers()) {
      const id = Number(String(s.key).replace("monitor:", ""));
      if (!wanted.has(id)) await queue.removeJobScheduler(String(s.key));
    }
  }

  for (const [id, interval] of wanted) {
    if (scheduled.get(id) === interval) continue;
    await queue.upsertJobScheduler(
      schedulerId(id),
      { every: interval * 1000 },
      {
        name: "check",
        data: { monitorId: id },
        opts: { removeOnComplete: 100, removeOnFail: 500 },
      },
    );
    log.info(`${scheduled.has(id) ? "Rescheduled" : "Scheduled"} monitor ${id} every ${interval}s`);
    scheduled.set(id, interval);
  }

  for (const id of scheduled.keys()) {
    if (!wanted.has(id)) {
      await queue.removeJobScheduler(schedulerId(id));
      scheduled.delete(id);
      log.info(`Unscheduled monitor ${id}`);
    }
  }
}

async function pruneOldChecks() {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const deleted = await db.delete(checks).where(lt(checks.checkedAt, cutoff)).returning({ id: checks.id });
  if (deleted.length) log.info(`Pruned ${deleted.length} checks older than ${retentionDays} days`);
}

async function main() {
  await runMigrations();
  log.info("Database migrations up to date");

  await syncSchedulers(true);
  log.info(`Worker started (concurrency ${concurrency})`);

  const syncTimer = setInterval(() => syncSchedulers().catch((e) => log.error("Scheduler sync failed", e)), SYNC_EVERY_MS);
  const pruneTimer = setInterval(() => pruneOldChecks().catch((e) => log.error("Pruning failed", e)), RETENTION_EVERY_MS);
  pruneOldChecks().catch((e) => log.error("Pruning failed", e));

  const shutdown = async (signal: string) => {
    log.info(`${signal} received, shutting down`);
    clearInterval(syncTimer);
    clearInterval(pruneTimer);
    await worker.close();
    await queue.close();
    connection.disconnect();
    await closeDb();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  log.error("Worker failed to start", err);
  process.exit(1);
});
