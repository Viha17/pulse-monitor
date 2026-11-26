import type { ChannelType } from "./schema";

export type AlertEvent =
  | { kind: "down"; monitor: AlertMonitor; reason: string }
  | { kind: "up"; monitor: AlertMonitor; downtimeMs: number | null }
  | { kind: "ssl"; monitor: AlertMonitor; daysLeft: number }
  | { kind: "test" };

export interface AlertMonitor {
  id: number;
  name: string;
  url: string;
}

export interface AlertTarget {
  type: ChannelType;
  url: string;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

/** Human-readable message. `bold` wraps text in the target's markdown flavour. */
export function formatAlert(event: AlertEvent, bold: (s: string) => string = (s) => s): string {
  switch (event.kind) {
    case "down":
      return `🔴 ${bold(event.monitor.name)} is DOWN: ${event.reason}\n${event.monitor.url}`;
    case "up":
      return event.downtimeMs == null
        ? `🟢 ${bold(event.monitor.name)} is back UP\n${event.monitor.url}`
        : `🟢 ${bold(event.monitor.name)} is back UP after ${formatDuration(event.downtimeMs)} of downtime\n${event.monitor.url}`;
    case "ssl":
      return `⚠️ The SSL certificate for ${bold(event.monitor.name)} expires in ${event.daysLeft} day${event.daysLeft === 1 ? "" : "s"}\n${event.monitor.url}`;
    case "test":
      return `✅ Test alert from Pulse. This channel is working.`;
  }
}

export function buildPayload(target: AlertTarget, event: AlertEvent): unknown {
  switch (target.type) {
    case "discord":
      return { username: "Pulse", content: formatAlert(event, (s) => `**${s}**`) };
    case "slack":
      return { text: formatAlert(event, (s) => `*${s}*`) };
    case "webhook":
      return { event: event.kind, message: formatAlert(event), data: event, sentAt: new Date().toISOString() };
  }
}

/** Sends one alert. Throws on network errors or non-2xx responses. */
export async function sendAlert(target: AlertTarget, event: AlertEvent): Promise<void> {
  const res = await fetch(target.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildPayload(target, event)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Alert endpoint responded with HTTP ${res.status}`);
  }
}
