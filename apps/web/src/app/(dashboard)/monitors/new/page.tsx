import Link from "next/link";
import { createMonitor } from "@/app/actions";
import { ArrowLeft } from "@/components/icons";
import { MonitorForm } from "@/components/monitor-form";
import { monitorDefaults } from "@/lib/validation";

export const metadata = { title: "New monitor" };

export default function NewMonitorPage() {
  return (
    <div>
      <Link href="/" className="caps inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink">
        <ArrowLeft /> All monitors
      </Link>
      <header className="mt-8 mb-10 max-w-4xl border-b border-ink pb-8">
        <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">New monitor</h1>
        <p className="mt-4 text-ink-2">It gets the next catalog number. The first check runs within a few seconds of saving.</p>
      </header>
      <MonitorForm action={createMonitor} values={{ ...monitorDefaults, name: "", url: "" }} submitLabel="Create monitor" cancelHref="/" />
    </div>
  );
}
