import { checks, db, desc, eq, monitors } from "@pulse/core";
import { NextResponse } from "next/server";
import { checkApiKey, parseId, readJson, validationError } from "@/lib/api";
import { monitorInput } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Monitor not found" }, { status: 404 });

export async function GET(req: Request, { params }: Ctx) {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (!id) return notFound();

  const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id));
  if (!monitor) return notFound();

  const recentChecks = await db
    .select()
    .from(checks)
    .where(eq(checks.monitorId, id))
    .orderBy(desc(checks.checkedAt))
    .limit(50);

  return NextResponse.json({ data: { ...monitor, recentChecks } });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (!id) return notFound();

  const body = await readJson(req);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const parsed = monitorInput.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db.update(monitors).set(parsed.data).where(eq(monitors.id, id)).returning();
  return updated ? NextResponse.json({ data: updated }) : notFound();
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (!id) return notFound();

  const deleted = await db.delete(monitors).where(eq(monitors.id, id)).returning({ id: monitors.id });
  return deleted.length ? new NextResponse(null, { status: 204 }) : notFound();
}
