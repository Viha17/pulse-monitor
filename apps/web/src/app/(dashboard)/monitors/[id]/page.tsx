import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMonitor, togglePause } from "@/app/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { Dial } from "@/components/dial";
import { ArrowLeft, ArrowUpRight } from "@/components/icons";
import { StateStrip, StateTag, catalogNo } from "@/components/state";
import { SubmitButton } from "@/components/submit-button";
import {
  daysUntil,
  formatDateTime,
  formatDuration,
  formatInterval,
  formatMs,
  formatPercent,
  timeAgo,
} from "@/lib/format";
import { getMonitorDetail } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const data = await getMonitorDetail(Number((await params).id));
  return { title: data?.monitor.name ?? "Monitor" };
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-rule py-2.5">
      <dt className="caps text-ink-2">{label}</dt>
      <dd className="num text-right text-[13px]">{children}</dd>
    </div>
  );
}

export default async function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const data = await getMonitorDetail(id);
  if (!data) notFound();

  const { monitor: m, windows, series, latest, incidents } = data;
  const sslDays = daysUntil(m.sslExpiresAt);

  return (
    <div>
      <AutoRefresh seconds={15} />
      <Link href="/" className="caps inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink">
        <ArrowLeft /> All monitors
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-b border-ink pb-8">
        <div className="min-w-0">
          <h1 className="min-w-0">
            <span className={`display block text-[clamp(3.5rem,8vw,6rem)] ${m.status === "down" ? "text-down" : ""}`}>{catalogNo(m.id)}</span>
            <span className="mt-5 block">
              <StateStrip status={m.status} />
            </span>
            <span className="mt-5 block text-[clamp(1.1rem,2vw,1.5rem)] font-medium tracking-[0.18em] uppercase">{m.name}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <StateTag status={m.status} />
            <a href={m.url} target="_blank" rel="noreferrer" className="num inline-flex min-w-0 items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink">
              <span className="truncate">
                {m.method} {m.url}
              </span>
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/monitors/${m.id}/edit`} className="control">
            Edit
          </Link>
          <form action={togglePause.bind(null, m.id)}>
            <SubmitButton className="control" pendingText={m.isActive ? "Pausing" : "Resuming"}>
              {m.isActive ? "Pause" : "Resume"}
            </SubmitButton>
          </form>
          <form action={deleteMonitor.bind(null, m.id)}>
            <SubmitButton className="control-danger" pendingText="Deleting">
              Delete
            </SubmitButton>
          </form>
        </div>
      </header>

      {m.status === "down" && m.lastError && (
        <p className="flex items-start gap-3 border-b border-rule py-4 text-[14px]">
          <span aria-hidden className="mt-1.5 inline-block size-2 shrink-0 bg-down" />
          <span>
            <span className="text-down">Failing since {incidents[0] && !incidents[0].resolvedAt ? timeAgo(incidents[0].startedAt) : "recently"}.</span>{" "}
            <span className="num text-[12px] text-ink-2">{m.lastError}</span>
          </span>
        </p>
      )}

      <section className="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-16">
        <figure className="flex flex-col items-center">
          <Dial points={series} />
          <figcaption className="mt-4 max-w-[46ch] text-center text-[12px] text-ink-3">
            Last 24 hours by time of day. Distance from the centre is response time; red ticks are failed checks; the blue hand is now.
          </figcaption>
        </figure>

        <div>
          <h2 className="caps border-b border-ink pb-3">Readings</h2>
          <dl>
            <Spec label="Uptime 24h">{formatPercent(windows?.day)}</Spec>
            <Spec label="Uptime 7d">{formatPercent(windows?.week)}</Spec>
            <Spec label="Uptime 30d">{formatPercent(windows?.month)}</Spec>
            <Spec label="Avg response">{formatMs(windows?.avgMs)}</Spec>
            <Spec label="p95 response">{formatMs(windows?.p95Ms)}</Spec>
            <Spec label="Last check">{timeAgo(m.lastCheckedAt)}</Spec>
            <Spec label="SSL expires">
              {sslDays == null ? "—" : sslDays <= 14 ? `in ${sslDays} days · renew soon` : `in ${sslDays} days`}
            </Spec>
          </dl>

          <h2 className="caps mt-10 border-b border-ink pb-3">Configuration</h2>
          <dl>
            <Spec label="Interval">every {formatInterval(m.intervalSeconds)}</Spec>
            <Spec label="Timeout">{formatMs(m.timeoutMs)}</Spec>
            <Spec label="Expected status">{m.expectedStatus ?? "2xx / 3xx"}</Spec>
            <Spec label="Keyword">{m.keyword ? `"${m.keyword}"` : "—"}</Spec>
            <Spec label="Alert after">{m.failureThreshold} failures</Spec>
            <Spec label="Status page">{m.isPublic ? "listed" : "hidden"}</Spec>
          </dl>
        </div>
      </section>

      <div className="mt-16 grid gap-12 xl:grid-cols-2 xl:gap-16">
        <section aria-labelledby="checks-heading">
          <h2 id="checks-heading" className="caps border-b border-ink pb-3">
            Recent checks
          </h2>
          {latest.length === 0 ? (
            <p className="py-6 text-[14px] text-ink-2">Waiting for the first check. It runs within a few seconds of saving.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="sr-only">
                <tr>
                  <th>Result</th>
                  <th>Time</th>
                  <th>Status code</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((c) => (
                  <tr key={c.id} className="border-b border-rule">
                    <td className="w-6 py-2.5">
                      <span aria-label={c.ok ? "Passed" : "Failed"} className={`inline-block h-3 w-[7px] ${c.ok ? "bg-up" : "bg-down"}`} />
                    </td>
                    <td className="num py-2.5 text-[12px] text-ink-2">{formatDateTime(c.checkedAt)}</td>
                    <td className="num py-2.5 text-[12px] text-ink-2">{c.statusCode ?? "—"}</td>
                    <td className="num max-w-[220px] truncate py-2.5 text-right text-[12px]" title={c.error ?? undefined}>
                      {c.ok ? formatMs(c.responseMs) : <span className="text-down">{c.error}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section aria-labelledby="incidents-heading">
          <h2 id="incidents-heading" className="caps border-b border-ink pb-3">
            Incidents
          </h2>
          {incidents.length === 0 ? (
            <p className="py-6 text-[14px] text-ink-2">No incidents recorded for this monitor.</p>
          ) : (
            <ul>
              {incidents.map((i) => (
                <li key={i.id} className="grid grid-cols-[1fr_auto] gap-x-6 border-b border-rule py-3">
                  <span className={`caps ${i.resolvedAt ? "text-ink-2" : "text-down"}`}>{i.resolvedAt ? "Resolved" : "Ongoing"}</span>
                  <span className="num text-right text-[12px]">
                    {formatDuration((i.resolvedAt ?? new Date()).getTime() - i.startedAt.getTime())}
                  </span>
                  <span className="num text-[11px] text-ink-3">{formatDateTime(i.startedAt)}</span>
                  {i.cause && <span className="num col-span-2 mt-1 truncate text-[11px] text-ink-2">{i.cause}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
