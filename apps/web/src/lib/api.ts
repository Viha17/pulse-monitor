import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { safeEqual } from "./auth";
import { fieldErrors } from "./validation";

/**
 * The REST API uses a bearer token from PULSE_API_KEY.
 * When no key is configured the API is disabled rather than left open.
 */
export function checkApiKey(req: Request): NextResponse | null {
  const key = process.env.PULSE_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API disabled. Set PULSE_API_KEY to enable it." }, { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !safeEqual(token, key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function validationError(error: ZodError) {
  return NextResponse.json({ error: "Validation failed", fields: fieldErrors(error) }, { status: 422 });
}

export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
