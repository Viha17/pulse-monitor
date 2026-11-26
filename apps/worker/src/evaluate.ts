import type { MonitorStatus } from "@pulse/core";

export interface ResponseInput {
  statusCode: number;
  body: string;
  expectedStatus: number | null;
  keyword: string | null;
}

export type Verdict = { ok: true } | { ok: false; reason: string };

/** Decides whether an HTTP response counts as "up". Pure, so it's easy to test. */
export function evaluateResponse({ statusCode, body, expectedStatus, keyword }: ResponseInput): Verdict {
  if (expectedStatus != null) {
    if (statusCode !== expectedStatus) {
      return { ok: false, reason: `Expected HTTP ${expectedStatus}, got ${statusCode}` };
    }
  } else if (statusCode < 200 || statusCode >= 400) {
    return { ok: false, reason: `HTTP ${statusCode}` };
  }

  if (keyword && !body.includes(keyword)) {
    return { ok: false, reason: `Keyword "${keyword}" not found in response` };
  }

  return { ok: true };
}

export interface MonitorState {
  status: MonitorStatus;
  consecutiveFailures: number;
}

export interface Transition extends MonitorState {
  /** Set when the change should notify someone. */
  event: "down" | "up" | null;
}

/**
 * State machine for a monitor. A monitor only goes DOWN after
 * `failureThreshold` failures in a row, which filters out one-off network blips.
 * Recovery takes a single successful check.
 */
export function nextState(prev: MonitorState, ok: boolean, failureThreshold: number): Transition {
  if (ok) {
    return { status: "up", consecutiveFailures: 0, event: prev.status === "down" ? "up" : null };
  }

  const consecutiveFailures = prev.consecutiveFailures + 1;
  if (consecutiveFailures >= Math.max(1, failureThreshold)) {
    return { status: "down", consecutiveFailures, event: prev.status === "down" ? null : "down" };
  }

  // Below the threshold: keep the previous status ("paused" should never reach here, but treat it as pending).
  const status = prev.status === "up" ? "up" : prev.status === "down" ? "down" : "pending";
  return { status, consecutiveFailures, event: null };
}
