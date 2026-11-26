import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { Plus } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Ridgeline } from "@/components/ridgeline";
import { SignalReadout } from "@/components/signal-readout";
import { StateBlock, StateTag, catalogNo } from "@/components/state";
import { formatDuration, formatInterval, formatMs, formatPercent, timeAgo } from "@/lib/format";
import { getDashboard, type DashboardMonitor } from "@/lib/queries";

export const metadata = { title: "Monitors" };

function verdict(monitors: DashboardMonitor[]): { text: string; alarm: boolean } {
  const down = monitors.filter((m) => m.status === "down").length;
  const active = monitors.filter((m) => m.status !== "paused");
  const up = active.filter((m) => m.status === "up").length;
  if (down > 0) return { text: down === 1 ? "One monitor is down." : `${down} monitors are down.`, alarm: true };
  if (active.length === 0) return { text: "Every monitor is paused.", alarm: false };
  if (up < active.length) return { text: `Checking ${active.length - up} new monitor${active.length - up > 1 ? "s" : ""}.`, alarm: false };
  return { text: active.length === 1 ? "The monitor is up." : `All ${active.length} monitors are up.`, alarm: false };
}

function EmptyState() {
  return (
    <div className="grid min-h-[70dvh] content-center gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="max-w-2xl">
        <Logo compact />
        <h1 className="display mt-10 text-[clamp(2.5rem,5vw,4.5rem)]">Nothing is being watched yet.</h1>
        <p className="mt-6 max-w-[52ch] text-ink-2">
          Add a website or API. Pulse checks it on a schedule, draws its response time here and alerts you the moment it
          goes down.
        </p>
      </div>
      <Link href="/monitors/new" className="control-primary justify-self-start">
        <Plus /> Add first monitor
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const { monitors, windowSeconds } = await getDashboard();
  if (monitors.length === 0) return <EmptyState />;
  const fullDay = windowSeconds >= 86_000;
  const windowLabel = fullDay ? "24h" : formatDuration(windowSeconds * 1000).split(" ")[0];

  const v = verdict(monitors);
  const failing = monitors.filter((m) => m.status === "down");

  return (
    <div>
      <AutoRefresh seconds={10} />

      <div className="mb-10 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
        <p className="num text-[11px] text-ink-3">{monitors.length} monitors · updates every 10s</p>
        <Link href="/monitors/new" className="control-primary">
          <Plus /> Add monitor
        </Link>
      </div>

      <section className="grid gap-10 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] xl:gap-14">
        <div className="flex flex-col">
          <h1 className="display text-[clamp(2.25rem,3.6vw,4rem)] text-balance">
            {v.alarm && <span aria-hidden className="mr-4 inline-block size-[0.55em] bg-down align-[0.08em]" />}
            {v.text}
          </h1>

          {failing.length > 0 && (
            <ul className="mt-8 border-t border-rule">
              {failing.map((m) => (
                <li key={m.id} className="border-b border-rule py-3">
                  <Link href={`/monitors/${m.id}`} className="group grid grid-cols-[auto_1fr] gap-x-3">
                    <span className="num pt-0.5 text-[11px] text-down">{catalogNo(m.id)}</span>
                    <span className="font-medium group-hover:underline">{m.name}</span>
                    <span className="col-start-2 text-[13px] text-ink-2">
                      {m.lastError ?? "Failing"}
                      {m.downSince && ` · down ${formatDuration(Date.now() - m.downSince.getTime())}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

        </div>

        <figure>
          <Ridgeline windowLabel={windowLabel} bucketSeconds={windowSeconds / 96} rows={monitors.map((m) => ({ id: m.id, name: m.name, status: m.status, ...m.ridge }))} />
          <figcaption className="mt-3 text-[12px] text-ink-3">
            Response time, {fullDay ? "last 24 hours" : `since the first check (${formatDuration(windowSeconds * 1000)})`}. Each line uses its own
            scale, shown on the right. Red ticks mark failed checks. Stretches with no checks are collapsed at the double slashes, labelled with the
            time they hide.
          </figcaption>
        </figure>
      </section>

      <section className="mt-14" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">
          All monitors
        </h2>
        <div className="caps hidden grid-cols-[92px_minmax(0,1fr)_220px_96px_110px_96px] gap-6 border-b border-ink pb-3 text-ink-2 xl:grid">
          <span>No.</span>
          <span>Monitor</span>
          <span>Last 24 checks</span>
          <span className="text-right">Avg 24h</span>
          <span className="text-right">Uptime 24h</span>
          <span className="text-right">Checked</span>
        </div>
        <ul>
          {monitors.map((m) => (
            <li key={m.id}>
              <Link
                href={`/monitors/${m.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-rule py-4 transition-colors hover:bg-ground-raised xl:grid-cols-[92px_minmax(0,1fr)_220px_96px_110px_96px]"
              >
                <span className={`num hidden items-center gap-2.5 text-[11px] xl:flex ${m.status === "down" ? "text-down" : "text-ink-2"}`}>
                  <StateBlock status={m.status} size={8} />
                  {catalogNo(m.id)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.name}</span>
                  <span className="num block truncate text-[11px] text-ink-3">
                    {m.url.replace(/^https?:\/\//, "")} · {formatInterval(m.intervalSeconds)}
                  </span>
                </span>
                <span className="xl:hidden">
                  <StateTag status={m.status} />
                </span>
                <span className="col-span-2 xl:col-span-1">
                  <SignalReadout checks={m.recent} />
                </span>
                <span className="num hidden text-right text-[13px] xl:block">{formatMs(m.avgMs24h)}</span>
                <span className="num hidden text-right text-[13px] xl:block">
                  {formatPercent(m.uptime24h)}
                </span>
                <span className="num hidden text-right text-[11px] text-ink-3 xl:block">{timeAgo(m.lastCheckedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
