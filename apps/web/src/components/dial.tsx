import { formatMs } from "@/lib/format";

interface Point {
  checkedAt: Date;
  responseMs: number;
  ok: boolean;
}

const S = 560;
const C = S / 2;
const R0 = 52;
const R = 236;
const BUCKETS = 288; // five minutes each

function niceMax(v: number): number {
  if (v <= 0) return 100;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

const polar = (angle: number, r: number) => [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
const angleFor = (minuteOfDay: number) => (minuteOfDay / 1440) * Math.PI * 2 - Math.PI / 2;
const minuteOf = (d: Date) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

/**
 * The 24-hour dial. Angle is the time of day (00 at the top, clockwise),
 * distance from the centre is response time. Red ticks on the rim are failed checks,
 * the blue hand is now. Because the window is exactly 24 hours, the trace meets
 * itself at the hand.
 */
export function Dial({ points, now = new Date() }: { points: Point[]; now?: Date }) {
  const sums = new Array<number>(BUCKETS).fill(0);
  const counts = new Array<number>(BUCKETS).fill(0);
  const failed = new Array<boolean>(BUCKETS).fill(false);

  for (const p of points) {
    const b = Math.min(BUCKETS - 1, Math.floor((minuteOf(p.checkedAt) / 1440) * BUCKETS));
    if (p.ok) {
      sums[b] += p.responseMs;
      counts[b]++;
    } else {
      failed[b] = true;
    }
  }

  const avgs = sums.map((s, i) => (counts[i] ? s / counts[i] : null));
  const readings = avgs.filter((v): v is number => v != null);
  const hasReadings = readings.length > 0;
  const max = hasReadings ? niceMax(Math.max(...readings)) : 1000;
  const radius = (ms: number) => R0 + (ms / max) * (R - R0);

  // Trace runs clockwise starting just after "now", so the oldest data begins at the hand.
  const nowBucket = Math.floor((minuteOf(now) / 1440) * BUCKETS);
  const order = Array.from({ length: BUCKETS }, (_, k) => (nowBucket + 1 + k) % BUCKETS);
  // One open path per unbroken run of readings; gaps stay empty rather than collapsing to the centre.
  const segments: string[] = [];
  let current = "";
  for (const b of order) {
    const v = avgs[b];
    if (v == null) {
      if (current) segments.push(current);
      current = "";
      continue;
    }
    const [px, py] = polar(angleFor(((b + 0.5) / BUCKETS) * 1440), radius(v));
    current += `${current ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)} `;
  }
  if (current) segments.push(current);
  const fullCircle = avgs.every((v) => v != null);

  const rings = [0.25, 0.5, 0.75, 1].map((f) => ({ ms: max * f, r: radius(max * f) }));
  const hand = angleFor(minuteOf(now));
  const hasData = counts.some((c) => c > 0) || failed.some(Boolean);

  const at = (x: number, y: number) => ({ left: `${(x / S) * 100}%`, top: `${(y / S) * 100}%` });

  return (
    <div className="relative w-full max-w-[560px]">
    <svg viewBox={`0 0 ${S} ${S}`} className="block h-auto w-full" role="img" aria-label="Response time by time of day over the last 24 hours">
      {/* spokes, one per hour */}
      {Array.from({ length: 24 }, (_, h) => {
        const a = angleFor(h * 60);
        const [x1, y1] = polar(a, R0);
        const [x2, y2] = polar(a, R);
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-rule)" strokeWidth={1} />;
      })}
      {rings.map((ring) => (
        <circle key={ring.ms} cx={C} cy={C} r={ring.r} fill="none" stroke={ring.ms === max ? "var(--color-rule-2)" : "var(--color-rule)"} strokeWidth={1} />
      ))}

      {segments.map((seg, i) => (
        <path key={i} d={fullCircle ? `${seg}Z` : seg} fill="none" stroke="var(--color-ink)" strokeWidth={1.4} strokeLinejoin="round" />
      ))}

      {failed.map((f, b) => {
        if (!f) return null;
        const a = angleFor(((b + 0.5) / BUCKETS) * 1440);
        const [x1, y1] = polar(a, R - 10);
        const [x2, y2] = polar(a, R + 2);
        return <line key={b} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-down)" strokeWidth={3} />;
      })}

      {(() => {
        const [x1, y1] = polar(hand, R0);
        const [x2, y2] = polar(hand, R + 4);
        return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-signal)" strokeWidth={2} />;
      })()}

      <circle cx={C} cy={C} r={R0 - 1} fill="var(--color-ground)" stroke="var(--color-rule-2)" />
    </svg>

      {/* Labels are HTML so they keep a readable size when the dial scales down. */}
      {hasReadings &&
        rings.map((ring) => (
          <span key={ring.ms} className="num absolute ml-1.5 text-[11px] text-ink-3" style={at(C, C - ring.r + 2)}>
            {formatMs(ring.ms)}
          </span>
        ))}
      {[0, 6, 12, 18].map((h) => {
        const [x, y] = polar(angleFor(h * 60), R + 17);
        return (
          <span key={h} className="num absolute -translate-x-1/2 -translate-y-1/2 text-[11px] text-ink-2" style={at(x, y)}>
            {String(h).padStart(2, "0")}
          </span>
        );
      })}
      {!hasReadings && (
        <span className={`caps absolute w-[16%] -translate-x-1/2 -translate-y-1/2 text-center leading-tight ${hasData ? "text-down" : "text-ink-3"}`} style={{ ...at(C, C), fontSize: 11, letterSpacing: "0.1em" }}>
          {hasData ? "No passes" : "No data"}
        </span>
      )}
    </div>
  );
}
