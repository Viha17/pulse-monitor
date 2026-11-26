import { and, checks, db, eq, incidents, isNull, monitors, type Monitor } from "@pulse/core";
import { nextState } from "./evaluate";
import { runHttpCheck } from "./http-check";
import { log } from "./log";
import { notifyAll } from "./notify";
import { getCertificateExpiry } from "./ssl";

const SSL_CHECK_EVERY_MS = 12 * 60 * 60 * 1000;
const SSL_WARN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Runs one check for a monitor and records the result, incidents and alerts. */
export async function processMonitor(monitorId: number): Promise<void> {
  const [monitor] = await db.select().from(monitors).where(eq(monitors.id, monitorId));
  if (!monitor || !monitor.isActive) return;

  const result = await runHttpCheck(monitor);
  const state = nextState(monitor, result.ok, monitor.failureThreshold);
  const now = new Date();
  const ssl = await maybeCheckSsl(monitor, now);

  await db.transaction(async (tx) => {
    await tx.insert(checks).values({
      monitorId: monitor.id,
      checkedAt: now,
      ok: result.ok,
      statusCode: result.statusCode,
      responseMs: result.responseMs,
      error: result.error,
    });

    await tx
      .update(monitors)
      .set({
        status: state.status,
        consecutiveFailures: state.consecutiveFailures,
        lastCheckedAt: now,
        lastResponseMs: result.responseMs,
        lastError: result.error,
        ...(ssl && { sslExpiresAt: ssl.expiresAt, sslCheckedAt: now }),
      })
      .where(eq(monitors.id, monitor.id));

    if (state.event === "down") {
      await tx.insert(incidents).values({ monitorId: monitor.id, startedAt: now, cause: result.error });
    }
  });

  const alertMonitor = { id: monitor.id, name: monitor.name, url: monitor.url };

  if (state.event === "down") {
    log.warn(`${monitor.name} is DOWN (${result.error})`);
    await notifyAll({ kind: "down", monitor: alertMonitor, reason: result.error ?? "Unknown error" });
  }

  if (state.event === "up") {
    const resolved = await db
      .update(incidents)
      .set({ resolvedAt: now })
      .where(and(eq(incidents.monitorId, monitor.id), isNull(incidents.resolvedAt)))
      .returning({ startedAt: incidents.startedAt });
    const downtimeMs = resolved[0] ? now.getTime() - resolved[0].startedAt.getTime() : null;
    log.info(`${monitor.name} is back UP`);
    await notifyAll({ kind: "up", monitor: alertMonitor, downtimeMs });
  }

  if (ssl?.expiresAt) {
    const daysLeft = Math.floor((ssl.expiresAt.getTime() - now.getTime()) / DAY_MS);
    if (daysLeft <= SSL_WARN_DAYS) {
      await notifyAll({ kind: "ssl", monitor: alertMonitor, daysLeft: Math.max(0, daysLeft) });
    }
  }
}

/** Reads the certificate at most every 12 hours per monitor. */
async function maybeCheckSsl(monitor: Monitor, now: Date): Promise<{ expiresAt: Date | null } | null> {
  if (!monitor.url.startsWith("https://")) return null;
  if (monitor.sslCheckedAt && now.getTime() - monitor.sslCheckedAt.getTime() < SSL_CHECK_EVERY_MS) return null;
  return { expiresAt: await getCertificateExpiry(monitor.url) };
}
