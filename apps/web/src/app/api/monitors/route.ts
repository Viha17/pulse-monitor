import { asc, db, monitors } from "@pulse/core";
import { NextResponse } from "next/server";
import { checkApiKey, readJson, validationError } from "@/lib/api";
import { monitorDefaults, monitorInput } from "@/lib/validation";

export async function GET(req: Request) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const list = await db.select().from(monitors).orderBy(asc(monitors.id));
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const body = await readJson(req);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const parsed = monitorInput.safeParse({ ...monitorDefaults, ...body });
  if (!parsed.success) return validationError(parsed.error);

  const [created] = await db.insert(monitors).values(parsed.data).returning();
  return NextResponse.json({ data: created }, { status: 201 });
}
