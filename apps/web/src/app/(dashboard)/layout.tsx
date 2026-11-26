import Link from "next/link";
import { logout } from "@/app/actions";
import { Logo } from "@/components/logo";
import { MonitorIndex, RailNav } from "@/components/rail-nav";
import { authEnabled, requireAdmin } from "@/lib/auth";
import { getMonitorIndex } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const index = await getMonitorIndex();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-rule lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 lg:block lg:px-4 lg:py-6">
          <Link href="/" aria-label="Pulse, all monitors" className="lg:px-1">
            <Logo />
          </Link>
          <div className="lg:mt-10">
            <RailNav />
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 overflow-y-auto px-4 pt-8 lg:block">
          <MonitorIndex monitors={index} />
        </div>

        <div className="hidden space-y-4 border-t border-rule px-7 py-5 lg:block">
          {authEnabled() ? (
            <form action={logout}>
              <button className="caps text-ink-3 transition-colors hover:text-ink">Sign out</button>
            </form>
          ) : (
            <p className="text-[12px] leading-snug text-ink-2">
              <span className="caps block text-ink">Open access</span>
              Set <span className="num text-[11px] text-ink">PULSE_ADMIN_PASSWORD</span> before deploying.
            </p>
          )}
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}
