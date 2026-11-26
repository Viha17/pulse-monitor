export { formatDuration } from "@pulse/core";

export function formatPercent(ratio: number | null | undefined): string {
  if (ratio == null) return "-";
  const pct = ratio * 100;
  if (pct === 100) return "100%";
  return `${pct >= 99.99 ? pct.toFixed(3) : pct.toFixed(2)}%`;
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "-";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

export function timeAgo(date: Date | null | undefined): string {
  if (!date) return "never";
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((date.getTime() - Date.now()) / 86_400_000);
}
