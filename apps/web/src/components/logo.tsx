/** The heartbeat mark set inside an outlined square, with the wordmark in tracked capitals. */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="grid size-9 place-items-center border border-ink">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="miter" aria-hidden>
          <path d="M2 12h4.5l2.5-7 4 14 2.5-7H22" />
        </svg>
      </span>
      {!compact && <span className="text-[13px] font-medium tracking-[0.32em]">PULSE</span>}
    </span>
  );
}
