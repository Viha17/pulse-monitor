import { AutoRefresh } from "@/components/auto-refresh";
import { Logo } from "@/components/logo";
import { CodeLegend, StateTag } from "@/components/state";
import { UptimeBlocks, uptimeLegend } from "@/components/uptime-blocks";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import { getStatusPage } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "System status" };

export default async function StatusPage() {
  const { monitors, incidents } = await getStatusPage();
  const down = monitors.filter((m) => m.status === "down");
  const allUp = monitors.length > 0 && down.length === 0;

  const headline =
    monitors.length === 0
      ? "No services are listed yet."
      : allUp
        ? "All systems operational."
        : down.length === 1
          ? `${down[0].name} is down.`
          : `${down.length} services are down.`;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <AutoRefresh seconds={30} />
      <header className="flex items-center justify-between gap-6">
        <Logo />
        <p className="num text-[11px] text-ink-3">Updated {new Date().toLocaleTimeString()}</p>
      </header>

      <section className="mt-16 border-b border-ink pb-10 sm:mt-24">
        <h1 className="display text-[clamp(2.5rem,7vw,5.5rem)] text-balance">
          {!allUp && monitors.length > 0 && <span aria-hidden className="mr-4 inline-block size-[0.5em] bg-down align-[0.06em]" />}
          {headline}
        </h1>
        {!allUp && monitors.length > 0 && (
          <p className="mt-6 max-w-[60ch] text-ink-2">Detected automatically by repeated failed checks. This page refreshes on its own.</p>
        )}
      </section>

      <section aria-labelledby="services-heading" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-3">
          <h2 id="services-heading" className="caps">
            Services · last 90 days
          </h2>
          <CodeLegend items={uptimeLegend} />
        </div>
        <ul>
          {monitors.map((m) => (
            <li key={m.id} className="border-b border-rule py-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <span className="text-lg font-medium">{m.name}</span>
                <span className="flex items-center gap-6">
                  <span className="num text-[12px] text-ink-2">{formatPercent(m.uptime90d)} uptime</span>
                  <StateTag status={m.status} />
                </span>
              </div>
              <UptimeBlocks days={m.days} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="incidents-heading" className="mt-16">
        <h2 id="incidents-heading" className="caps border-b border-ink pb-3">
          Incidents · last 14 days
        </h2>
        {incidents.length === 0 ? (
          <p className="py-6 text-ink-2">No incidents in the last 14 days.</p>
        ) : (
          <ul>
            {incidents.map((i) => (
              <li key={i.id} className="grid gap-x-6 gap-y-1 border-b border-rule py-4 sm:grid-cols-[1fr_auto]">
                <span className="font-medium">
                  {i.monitorName}
                  <span className={`caps ml-3 ${i.resolvedAt ? "text-ink-2" : "text-down"}`}>{i.resolvedAt ? "Resolved" : "Investigating"}</span>
                </span>
                <span className="num text-[12px] text-ink-2 sm:text-right">
                  {formatDateTime(i.startedAt)}
                  {i.resolvedAt && ` · down ${formatDuration(i.resolvedAt.getTime() - i.startedAt.getTime())}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-20 flex items-center justify-between border-t border-rule pt-6 text-[12px] text-ink-3">
        <span>Self-hosted with Pulse</span>
        <span className="num">{monitors.length} services</span>
      </footer>
    </main>
  );
}
