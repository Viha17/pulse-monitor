import type { MonitorStatus } from "@pulse/core";

export const stateColor: Record<MonitorStatus, string> = {
  up: "var(--color-up)",
  down: "var(--color-down)",
  pending: "var(--color-pending)",
  paused: "var(--color-paused)",
};

export const stateLabel: Record<MonitorStatus, string> = {
  up: "Up",
  down: "Down",
  pending: "Pending",
  paused: "Paused",
};

export function catalogNo(id: number): string {
  return `PLS ${String(id).padStart(3, "0")}`;
}

/** A solid square from the colour code. Colour is never the only signal: pair it with a label. */
export function StateBlock({ status, size = 10 }: { status: MonitorStatus; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{ width: size, height: size, background: stateColor[status] }}
    />
  );
}

export function StateTag({ status }: { status: MonitorStatus }) {
  return (
    // Paused grey is a block colour only; as text it would fall below 4.5:1, so the label uses ink-2.
    <span
      className={`caps inline-flex items-center gap-2.5 ${status === "paused" ? "text-ink-2" : ""}`}
      style={{ color: status === "down" || status === "pending" ? stateColor[status] : undefined }}
    >
      <StateBlock status={status} size={8} />
      {stateLabel[status]}
    </span>
  );
}

/**
 * The Factory strip: all five code colours in a row, the current state lit and the rest
 * dimmed, so the code decodes itself wherever it appears.
 */
export function StateStrip({ status }: { status: MonitorStatus }) {
  const order: { key: MonitorStatus | "signal"; color: string; label: string }[] = [
    { key: "paused", color: "var(--color-paused)", label: "Paused" },
    { key: "signal", color: "var(--color-signal)", label: "Selected" },
    { key: "pending", color: "var(--color-pending)", label: "Pending" },
    { key: "down", color: "var(--color-down)", label: "Down" },
    { key: "up", color: "var(--color-up)", label: "Up" },
  ];
  return (
    <span className="inline-flex gap-1.5" aria-hidden>
      {order.map((o) => (
        <span key={o.key} title={o.label} className="h-2.5 w-7" style={{ background: o.color, opacity: o.key === status ? 1 : 0.18 }} />
      ))}
    </span>
  );
}

/** The five-block code strip, used as a legend so the colour code is always decodable. */
export function CodeLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((i) => (
        <li key={i.label} className="caps flex items-center gap-2.5 text-ink-2">
          <span aria-hidden className="inline-block h-2 w-5" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
