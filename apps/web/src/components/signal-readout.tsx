import type { RecentCheck } from "@/lib/queries";
import { formatMs } from "@/lib/format";

const SLOTS = 24;

/**
 * The last 24 checks as a row of countable blocks, oldest left.
 * White = passed, red = failed, outline = no check yet (grey stays reserved for paused).
 */
export function SignalReadout({ checks }: { checks: RecentCheck[] }) {
  const recent = checks.slice(-SLOTS);
  const empty = SLOTS - recent.length;
  const failed = recent.filter((c) => !c.ok).length;

  return (
    <div
      className="flex items-center gap-[3px]"
      role="img"
      aria-label={`Last ${recent.length} checks: ${recent.length - failed} passed, ${failed} failed`}
    >
      {Array.from({ length: Math.max(0, empty) }, (_, i) => (
        <span key={`e${i}`} className="h-3 w-[7px] border border-rule-2" />
      ))}
      {recent.map((c, i) => (
        <span
          key={i}
          title={`${c.checkedAt.toLocaleTimeString()} · ${c.ok ? formatMs(c.responseMs) : "failed"}`}
          className={`h-3 w-[7px] ${c.ok ? "bg-up" : "bg-down"}`}
        />
      ))}
    </div>
  );
}
