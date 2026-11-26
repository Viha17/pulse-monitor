import { alertChannels, db, eq, sendAlert, type AlertEvent } from "@pulse/core";
import { log } from "./log";

/** Sends an event to every enabled channel. One failing channel never blocks the others. */
export async function notifyAll(event: AlertEvent): Promise<void> {
  const channels = await db.select().from(alertChannels).where(eq(alertChannels.enabled, true));
  const results = await Promise.allSettled(channels.map((c) => sendAlert(c, event)));

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      log.warn(`Alert to channel "${channels[i].name}" failed: ${(r.reason as Error).message}`);
    }
  });
}
