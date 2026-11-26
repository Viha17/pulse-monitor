"use client";

import type { MonitorStatus } from "@pulse/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "./icons";
import { StateBlock, catalogNo } from "./state";

const links = [
  { href: "/", label: "Monitors", match: (p: string) => p === "/" || p.startsWith("/monitors") },
  { href: "/settings", label: "Alerts", match: (p: string) => p.startsWith("/settings") },
];

export function RailNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex gap-px lg:flex-col">
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`caps relative flex h-10 items-center px-3 transition-colors ${
              active ? "bg-ink pr-10 text-ground" : "text-ink-2 hover:bg-ground-raised hover:text-ink"
            }`}
          >
            {l.label}
            {active && <span aria-hidden className="absolute inset-y-0 right-0 w-1.5 bg-down" />}
          </Link>
        );
      })}
      <Link href="/status" className="caps flex h-10 items-center gap-2 px-3 text-ink-2 transition-colors hover:bg-ground-raised hover:text-ink">
        <span className="sm:hidden">Status</span>
        <span className="hidden sm:inline">Status page</span> <ArrowUpRight />
      </Link>
    </nav>
  );
}

export function MonitorIndex({ monitors }: { monitors: { id: number; name: string; status: MonitorStatus }[] }) {
  const pathname = usePathname();
  if (monitors.length === 0) return null;

  return (
    <div>
      <h2 className="caps mb-3 px-3 text-ink-3">Index</h2>
      <ul>
        {monitors.map((m) => {
          const href = `/monitors/${m.id}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={m.id}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`grid grid-cols-[auto_1fr] items-center gap-x-3 border px-3 py-2 transition-colors ${
                  active ? "border-down text-ink" : "border-transparent text-ink-2 hover:bg-ground-raised hover:text-ink"
                }`}
              >
                <StateBlock status={m.status} size={8} />
                <span className="num text-[11px] tracking-[0.08em]">{catalogNo(m.id)}</span>
                <span className="col-start-2 truncate text-[13px]">{m.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
