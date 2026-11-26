import type { MonitorStatus } from "@pulse/core";
import { catalogNo } from "./state";
import { formatDuration, formatMs } from "@/lib/format";

export interface RidgeRow {
  id: number;
  name: string;
  status: MonitorStatus;
  /** Average response time per bucket, oldest first. null = no successful check in that bucket. */
  buckets: (number | null)[];
  failed: boolean[];
}

const W = 720;
const ROW = 58;
const AMP = 66;
const TOP_PAD = AMP - ROW / 2 + 10;
/** A run of buckets empty for every monitor longer than this collapses to a marked break. */
const GAP_MIN = 3;
const GAP_UNITS = 2.5;

/**
 * Maps bucket index to an x position. Stretches where no monitor has any data
 * (the worker was off, or before the first check) collapse to a short marked break,
 * so the plot spends its width on real readings.
 */
function buildXScale(rows: RidgeRow[], n: number) {
  const empty = Array.from({ length: n }, (_, i) => rows.every((r) => r.buckets[i] == null && !r.failed[i]));
  const units: number[] = new Array(n).fill(1);
  const breaks: { start: number; end: number }[] = [];
  let i = 0;
  while (i < n) {
    if (!empty[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < n && empty[j]) j++;
    if (j - i >= GAP_MIN) {
      for (let k = i; k < j; k++) units[k] = GAP_UNITS / (j - i);
      // Leading emptiness (before the first check) is dropped instead of marked.
      if (i > 0) breaks.push({ start: i, end: j });
      else for (let k = i; k < j; k++) units[k] = 0;
    }
    i = j;
  }
  const cum: number[] = [0];
  for (let k = 0; k < n; k++) cum.push(cum[k] + units[k]);
  const total = cum[n] - (units[n - 1] ?? 0) || 1;
  const x = (idx: number) => {
    const whole = Math.floor(idx);
    const frac = idx - whole;
    const pos = cum[Math.min(whole, n)] + frac * (units[Math.min(whole, n - 1)] ?? 0);
    return (pos / total) * W;
  };
  return { x, breaks };
}

/**
 * The stacked pulse plot: one white hairline per monitor, left to right in time.
 * Each line is scaled to its own range (printed at the right), so the shape shows
 * spikes and slowdowns. Where no check ran, the line breaks instead of pretending
 * to be flat; failed periods are red ticks under the baseline. Lines are drawn top
 * to bottom and filled with the ground, so lower lines occlude the ones behind them.
 *
 * Labels are HTML beside the SVG so they keep a readable size at every width.
 */
export function Ridgeline({
  rows,
  windowLabel = "24h",
  bucketSeconds = 900,
}: {
  rows: RidgeRow[];
  windowLabel?: string;
  /** Duration of one bucket, used to label how much time each collapsed break hides. */
  bucketSeconds?: number;
}) {
  if (rows.length === 0) return null;

  const H = TOP_PAD + rows.length * ROW + 6;
  const pct = (y: number) => `${(y / H) * 100}%`;
  const { x, breaks } = buildXScale(rows, rows[0].buckets.length);

  const lines = rows.map((row, r) => {
    const base = TOP_PAD + r * ROW + ROW / 2;
    const values = row.buckets.filter((v): v is number => v != null);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const span = max - min;
    const n = row.buckets.length;
    const y = (v: number) => base - Math.pow(span > 0 ? (v - min) / span : 0.12, 1.35) * AMP * 0.9 - 2;

    // Contiguous runs of buckets that have readings.
    const runs: { i: number; v: number }[][] = [];
    let run: { i: number; v: number }[] = [];
    row.buckets.forEach((v, i) => {
      if (v == null) {
        if (run.length) runs.push(run);
        run = [];
      } else run.push({ i, v });
    });
    if (run.length) runs.push(run);

    const paths = runs.map((pts) => {
      // A single isolated reading still gets a short visible stroke.
      const p = pts.length === 1 ? [pts[0], { i: Math.min(n - 1, pts[0].i + 0.6), v: pts[0].v }] : pts;
      const line = p.map((pt, k) => `${k ? "L" : "M"}${x(pt.i).toFixed(1)},${y(pt.v).toFixed(1)}`).join(" ");
      const fill = `${line} L${x(p[p.length - 1].i).toFixed(1)},${base + ROW} L${x(p[0].i).toFixed(1)},${base + ROW} Z`;
      return { line, fill };
    });

    return { row, base, min, max, hasData: values.length > 0, paths };
  });

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_86px] gap-x-3 sm:grid-cols-[76px_minmax(0,1fr)_100px]">
      <div className="relative">
        {lines.map(({ row, base }) => (
          <span
            key={row.id}
            title={row.name}
            className={`num absolute left-0 -translate-y-1/2 text-[11px] tracking-[0.06em] whitespace-nowrap ${row.status === "down" ? "text-down" : "text-ink-2"}`}
            style={{ top: pct(base) }}
          >
            {catalogNo(row.id)}
          </span>
        ))}
      </div>

      <div className="relative">
      {breaks.map((b) => (
        <span
          key={`l${b.start}`}
          className="num absolute -top-5 -translate-x-1/2 bg-ground px-1 text-[11px] whitespace-nowrap text-ink-3"
          style={{ left: `${(((x(b.start) + x(b.end)) / 2) / W) * 100}%` }}
        >
          {formatDuration((b.end - b.start) * bucketSeconds * 1000).split(" ").slice(0, 2).join(" ")} gap
        </span>
      ))}
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Response time of every monitor">
        {breaks.map((b) => {
          const cx = (x(b.start) + x(b.end)) / 2;
          return (
            <g key={`b${b.start}`} stroke="var(--color-ink-3)" strokeWidth={1} vectorEffect="non-scaling-stroke">
              <line x1={cx - 5} x2={cx - 1} y1={H - 2} y2={8} />
              <line x1={cx + 1} x2={cx + 5} y1={H - 2} y2={8} />
            </g>
          );
        })}
        {lines.map(({ row, base, paths }) => {
          const color = row.status === "down" ? "var(--color-down)" : row.status === "paused" ? "var(--color-paused)" : "var(--color-ink)";
          return (
            <g key={row.id}>
              <title>{`${catalogNo(row.id)} ${row.name}`}</title>
              <line x1={0} x2={W} y1={base} y2={base} stroke="var(--color-rule)" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
              {paths.map((p, k) => (
                <g key={k}>
                  <path d={p.fill} fill="var(--color-ground)" />
                  <path d={p.line} fill="none" stroke={color} strokeWidth={1.3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
              {row.failed.map((f, i) =>
                f ? <rect key={i} x={x(i) - 1.5} y={base + 6} width={3} height={9} fill="var(--color-down)" /> : null,
              )}
            </g>
          );
        })}
      </svg>
      </div>

      <div className="relative">
        {lines.map(({ row, base, min, max, hasData }) => (
          <span key={row.id} className="num absolute right-0 -translate-y-1/2 text-right text-[11px] whitespace-nowrap text-ink-3" style={{ top: pct(base) }}>
            {hasData ? `${formatMs(min)}–${formatMs(max)}` : "no passes"}
          </span>
        ))}
      </div>

      <div className="num col-start-2 mt-2 flex justify-between text-[11px] text-ink-3">
        <span>−{windowLabel}</span>
        <span>now</span>
      </div>
    </div>
  );
}
