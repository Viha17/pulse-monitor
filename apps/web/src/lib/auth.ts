import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "pulse_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function authEnabled(): boolean {
  return Boolean(process.env.PULSE_ADMIN_PASSWORD);
}

/** Compares strings in constant time, even when their lengths differ. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sessionToken(): string {
  const password = process.env.PULSE_ADMIN_PASSWORD ?? "";
  const secret = process.env.PULSE_SECRET || password;
  // Changing the password invalidates every existing session.
  return createHmac("sha256", secret).update(`pulse-admin:${password}`).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  if (!authEnabled()) return true;
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, sessionToken());
}

/** Call at the top of every protected page and server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/login");
}

export async function signIn(password: string): Promise<boolean> {
  if (!authEnabled() || !safeEqual(password, process.env.PULSE_ADMIN_PASSWORD!)) return false;
  (await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
