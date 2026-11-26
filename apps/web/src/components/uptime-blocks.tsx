import { formatPercent } from "@/lib/format";

const DAYS = 90;

/** Same colour code as everywhere else: white up, red down. Yellow stays reserved for "pending". */
export const uptimeLegend = [
  { color: "var(--color-up)", label: "Up all day" },
  { color: "var(--color-down)", label: "Share of failed checks" },
  { color: "var(--color-rule)", label: "No data" },
];

/**
 * One block per day for the last 90 days (UTC). A day with failures keeps its white
 * block and fills a red portion from the bottom, sized to the share of failed checks
 * (at least a sliver, so a single failure is never invisible).
 */
export function UptimeBlocks({ days }: { days: Map<string, number | null> }) {
  const today = new Date();
  const keys = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (DAYS - 1 - i)));
    return d.toISOString().slice(0, 10);
  });

  return (
    <div>
      <div className="flex h-8 gap-[2px]">
        {keys.map((k, i) => {
          const v = days.get(k);
          const downShare = v == null ? 0 : 1 - v;
          return (
            <span
              key={k}
              title={`${k} · ${v == null ? "No data" : `${formatPercent(v)} of checks passed`}`}
              className={`relative flex-1 ${i < DAYS - 45 ? "hidden sm:block" : ""}`}
              style={{ background: v == null ? "var(--color-rule)" : "var(--color-up)" }}
            >
              {downShare > 0 && (
                <span className="absolute inset-x-0 bottom-0 bg-down" style={{ height: `${Math.max(18, downShare * 100)}%` }} />
              )}
            </span>
          );
        })}
      </div>
      <div className="num mt-2 flex justify-between text-[11px] text-ink-3">
        <span>
          <span className="hidden sm:inline">90</span>
          <span className="sm:hidden">45</span> days ago
        </span>
        <span>today</span>
      </div>
    </div>
  );
}
