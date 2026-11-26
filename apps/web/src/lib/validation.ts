import { z } from "zod";

const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const monitorInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://"),
  method: z.enum(["GET", "HEAD"]),
  intervalSeconds: z.coerce.number().int().min(20, "Minimum interval is 20 seconds").max(86_400),
  timeoutMs: z.coerce.number().int().min(1_000).max(60_000),
  expectedStatus: z.preprocess(blankToNull, z.coerce.number().int().min(100).max(599).nullable()),
  keyword: z.preprocess(blankToNull, z.string().trim().max(200).nullable()),
  failureThreshold: z.coerce.number().int().min(1).max(10),
  isPublic: z.boolean(),
});

export type MonitorInput = z.infer<typeof monitorInput>;

export const monitorDefaults = {
  method: "GET",
  intervalSeconds: 60,
  timeoutMs: 10_000,
  expectedStatus: null,
  keyword: null,
  failureThreshold: 2,
  isPublic: true,
} as const;

export function monitorFromForm(form: FormData) {
  return monitorInput.safeParse({
    name: form.get("name"),
    url: form.get("url"),
    method: form.get("method") ?? "GET",
    intervalSeconds: form.get("intervalSeconds"),
    timeoutMs: form.get("timeoutMs"),
    expectedStatus: form.get("expectedStatus"),
    keyword: form.get("keyword"),
    failureThreshold: form.get("failureThreshold"),
    isPublic: form.get("isPublic") === "on",
  });
}

export const channelInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(["discord", "slack", "webhook"]),
  url: z
    .string()
    .trim()
    .url("Enter a valid webhook URL")
    .refine((u) => u.startsWith("https://"), "Webhook URLs must use https://"),
});

/** Flattens zod issues into { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
