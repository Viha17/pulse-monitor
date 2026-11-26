"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

interface Values {
  name: string;
  url: string;
  method: "GET" | "HEAD";
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatus: number | null;
  keyword: string | null;
  failureThreshold: number;
  isPublic: boolean;
}

const INTERVALS = [
  [30, "Every 30 seconds"],
  [60, "Every minute"],
  [120, "Every 2 minutes"],
  [300, "Every 5 minutes"],
  [600, "Every 10 minutes"],
  [1800, "Every 30 minutes"],
  [3600, "Every hour"],
] as const;

/** One spec-sheet row: label and help on the left, the control on the right. */
function Row({ id, label, help, error, children }: { id: string; label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-rule py-5 md:grid-cols-[240px_1fr] md:gap-10">
      <div>
        <label htmlFor={id} className="caps block text-ink">
          {label}
        </label>
        {help && <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{help}</p>}
      </div>
      <div>
        {children}
        {error && (
          <p id={`${id}-error`} className="mt-2 text-[13px] text-down">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function MonitorForm({
  action,
  values,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  values: Values;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const e = state.errors ?? {};
  const intervalOptions = INTERVALS.some(([s]) => s === values.intervalSeconds)
    ? INTERVALS
    : [...INTERVALS, [values.intervalSeconds, `Every ${values.intervalSeconds} seconds`] as const];
  const describe = (k: string) => (e[k] ? `${k}-error` : undefined);

  return (
    <form action={formAction} className="max-w-4xl">
      <h2 className="caps mb-1 text-ink-2">Target</h2>
      <Row id="name" label="Name" help="How it appears on the dashboard and status page." error={e.name}>
        <input id="name" name="name" defaultValue={values.name} placeholder="Nimaka Foods API" className="field" required aria-invalid={!!e.name} aria-describedby={describe("name")} />
      </Row>
      <Row id="url" label="URL" help="Full address including https://" error={e.url}>
        <input id="url" name="url" type="url" defaultValue={values.url} placeholder="https://api.example.com/health" className="field num" required aria-invalid={!!e.url} aria-describedby={describe("url")} />
      </Row>
      <Row id="intervalSeconds" label="Check" error={e.intervalSeconds}>
        <div className="grid gap-3 sm:grid-cols-2">
          <select id="intervalSeconds" name="intervalSeconds" defaultValue={values.intervalSeconds} className="field">
            {intervalOptions.map(([s, label]) => (
              <option key={s} value={s}>
                {label}
              </option>
            ))}
          </select>
          <select name="method" defaultValue={values.method} className="field" aria-label="HTTP method">
            <option value="GET">GET request</option>
            <option value="HEAD">HEAD request (no body)</option>
          </select>
        </div>
      </Row>

      <h2 className="caps mt-10 mb-1 text-ink-2">Down when</h2>
      <Row id="expectedStatus" label="Status code is not" help="Leave empty to accept any 2xx or 3xx." error={e.expectedStatus}>
        <input id="expectedStatus" name="expectedStatus" type="number" min={100} max={599} defaultValue={values.expectedStatus ?? ""} placeholder="Any 2xx / 3xx" className="field num sm:max-w-56" aria-invalid={!!e.expectedStatus} aria-describedby={describe("expectedStatus")} />
      </Row>
      <Row id="keyword" label="Body does not contain" help="Optional. GET requests only." error={e.keyword}>
        <input id="keyword" name="keyword" defaultValue={values.keyword ?? ""} placeholder="ok" className="field num" aria-invalid={!!e.keyword} aria-describedby={describe("keyword")} />
      </Row>
      <Row id="timeoutMs" label="No response within" help="Milliseconds before the check counts as failed." error={e.timeoutMs}>
        <input id="timeoutMs" name="timeoutMs" type="number" min={1000} max={60000} step={500} defaultValue={values.timeoutMs} className="field num sm:max-w-56" aria-invalid={!!e.timeoutMs} aria-describedby={describe("timeoutMs")} />
      </Row>
      <Row id="failureThreshold" label="Failures in a row" help="Checks that must fail before Pulse alerts. 2 filters out one-off network blips." error={e.failureThreshold}>
        <input id="failureThreshold" name="failureThreshold" type="number" min={1} max={10} defaultValue={values.failureThreshold} className="field num sm:max-w-24" aria-invalid={!!e.failureThreshold} aria-describedby={describe("failureThreshold")} />
      </Row>
      <Row id="isPublic" label="Status page">
        <label className="flex items-center gap-3 text-sm">
          <input id="isPublic" type="checkbox" name="isPublic" defaultChecked={values.isPublic} className="size-4" />
          List this monitor on the public status page
        </label>
      </Row>

      <div className="flex items-center justify-end gap-3 border-t border-rule pt-6">
        <Link href={cancelHref} className="control">
          Cancel
        </Link>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
