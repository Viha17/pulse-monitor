import { db, eq, monitors } from "@pulse/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateMonitor } from "@/app/actions";
import { ArrowLeft } from "@/components/icons";
import { MonitorForm } from "@/components/monitor-form";
import { catalogNo } from "@/components/state";

export const metadata = { title: "Edit monitor" };

export default async function EditMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [m] = await db.select().from(monitors).where(eq(monitors.id, id));
  if (!m) notFound();

  return (
    <div>
      <Link href={`/monitors/${id}`} className="caps inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink">
        <ArrowLeft /> {catalogNo(id)}
      </Link>
      <header className="mt-8 mb-10 max-w-4xl border-b border-ink pb-8">
        <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">Edit {m.name}</h1>
        <p className="mt-4 text-ink-2">Changes apply from the next check. History is kept.</p>
      </header>
      <MonitorForm action={updateMonitor.bind(null, id)} values={m} submitLabel="Save changes" cancelHref={`/monitors/${id}`} />
    </div>
  );
}
