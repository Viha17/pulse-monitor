import type { Monitor } from "@pulse/core";
import { evaluateResponse } from "./evaluate";

export interface CheckResult {
  ok: boolean;
  statusCode: number | null;
  responseMs: number;
  error: string | null;
}

const USER_AGENT = "PulseMonitor/0.1 (uptime check)";
const MAX_BODY_BYTES = 1_000_000;

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause as { code?: string; message?: string } | undefined;
    if (cause?.code) return `${cause.code}${cause.message ? `: ${cause.message}` : ""}`;
    return err.message;
  }
  return String(err);
}

async function readBody(res: Response): Promise<string> {
  const text = await res.text();
  return text.length > MAX_BODY_BYTES ? text.slice(0, MAX_BODY_BYTES) : text;
}

export async function runHttpCheck(
  monitor: Pick<Monitor, "url" | "method" | "timeoutMs" | "expectedStatus" | "keyword">,
): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), monitor.timeoutMs);
  const started = performance.now();

  try {
    const res = await fetch(monitor.url, {
      method: monitor.method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
    // Response time = time to first byte of headers, like most uptime tools.
    const responseMs = Math.round(performance.now() - started);

    const needsBody = Boolean(monitor.keyword) && monitor.method === "GET";
    const body = needsBody ? await readBody(res) : "";
    if (!needsBody) await res.body?.cancel();

    const verdict = evaluateResponse({
      statusCode: res.status,
      body,
      expectedStatus: monitor.expectedStatus,
      keyword: monitor.keyword,
    });

    return {
      ok: verdict.ok,
      statusCode: res.status,
      responseMs,
      error: verdict.ok ? null : verdict.reason,
    };
  } catch (err) {
    return {
      ok: false,
      statusCode: null,
      responseMs: Math.round(performance.now() - started),
      error: controller.signal.aborted ? `Timed out after ${monitor.timeoutMs}ms` : describeError(err),
    };
  } finally {
    clearTimeout(timer);
  }
}
