"use server";

import { alertChannels, db, eq, monitors, sendAlert } from "@pulse/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, signIn, signOut } from "@/lib/auth";
import { channelInput, fieldErrors, monitorFromForm } from "@/lib/validation";

export interface FormState {
  errors?: Record<string, string>;
  message?: string;
}

// ---- Monitors -------------------------------------------------------------

export async function createMonitor(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = monitorFromForm(form);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const [created] = await db.insert(monitors).values(parsed.data).returning({ id: monitors.id });
  revalidatePath("/");
  redirect(`/monitors/${created.id}`);
}

export async function updateMonitor(id: number, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = monitorFromForm(form);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await db.update(monitors).set(parsed.data).where(eq(monitors.id, id));
  revalidatePath("/");
  revalidatePath(`/monitors/${id}`);
  redirect(`/monitors/${id}`);
}

export async function togglePause(id: number): Promise<void> {
  await requireAdmin();
  const [m] = await db.select({ isActive: monitors.isActive }).from(monitors).where(eq(monitors.id, id));
  if (!m) return;

  await db
    .update(monitors)
    .set(
      m.isActive
        ? { isActive: false, status: "paused" }
        : { isActive: true, status: "pending", consecutiveFailures: 0 },
    )
    .where(eq(monitors.id, id));
  revalidatePath("/");
  revalidatePath(`/monitors/${id}`);
}

export async function deleteMonitor(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(monitors).where(eq(monitors.id, id));
  revalidatePath("/");
  redirect("/");
}

// ---- Alert channels -------------------------------------------------------

export async function createChannel(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = channelInput.safeParse({
    name: form.get("name"),
    type: form.get("type"),
    url: form.get("url"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await db.insert(alertChannels).values(parsed.data);
  revalidatePath("/settings");
  return { message: "Channel added" };
}

export async function toggleChannel(id: number, enabled: boolean): Promise<void> {
  await requireAdmin();
  await db.update(alertChannels).set({ enabled }).where(eq(alertChannels.id, id));
  revalidatePath("/settings");
}

export async function deleteChannel(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(alertChannels).where(eq(alertChannels.id, id));
  revalidatePath("/settings");
}

export async function testChannel(id: number): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const [channel] = await db.select().from(alertChannels).where(eq(alertChannels.id, id));
  if (!channel) return { ok: false, message: "Channel not found" };
  try {
    await sendAlert(channel, { kind: "test" });
    return { ok: true, message: "Test alert sent" };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

// ---- Session --------------------------------------------------------------

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const ok = await signIn(String(form.get("password") ?? ""));
  if (!ok) return { errors: { password: "Incorrect password" } };
  redirect("/");
}

export async function logout(): Promise<void> {
  await signOut();
  redirect("/login");
}
