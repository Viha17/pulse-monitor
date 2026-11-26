import {
  alertChannels,
  asc,
  checks,
  db,
  desc,
  eq,
  gte,
  incidents,
  inArray,
  monitors,
  sql,
} from "@pulse/core";

const HOUR = 3_600_000;
const RIDGE_BUCKETS = 96;
const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR);

const uptimeExpr = sql<number | null>`(count(*) filter (where ${checks.ok}))::float8 / nullif(count(*), 0)`;
const avgMsExpr = sql<number | null>`(avg(${checks.responseMs}) filter (where ${checks.ok}))::float8`;

export interface RecentCheck {
  ok: boolean;
  responseMs: number;
  checkedAt: Date;
}

export async function getDashboard() {
  const list = await db.select().from(monitors).orderBy(asc(monitors.id));
  if (list.length === 0) return { windowSeconds: 86_400, monitors: [] };

  const ids = list.map((m) => m.id);

  const stats = await db
    .select({ monitorId: checks.monitorId, uptime: uptimeExpr, avgMs: avgMsExpr })
    .from(checks)
    .where(gte(checks.checkedAt, hoursAgo(24)))
    .groupBy(checks.monitorId);

  // Latest 40 checks per monitor for the sparkline, using a window function.
  const recent = (await db.execute(sql`
    select monitor_id, ok, response_ms, checked_at from (
      select monitor_id, ok, response_ms, checked_at,
             row_number() over (partition by monitor_id order by checked_at desc) as rn
      from ${checks}
      where checked_at > now() - interval '24 hours' and ${inArray(checks.monitorId, ids)}
    ) t
    where rn <= 24
    order by checked_at asc
  `)) as unknown as { monitor_id: number; ok: boolean; response_ms: number; checked_at: string | Date }[];

  // 96 buckets per monitor for the ridgeline. The window is the last 24h, or since the
  // first check when there is less history than that (minimum 30 minutes).
  const [win] = (await db.execute(sql`
    select extract(epoch from greatest(interval '30 minutes', least(interval '24 hours', now() - min(checked_at))))::float8 as seconds
    from ${checks} where checked_at > now() - interval '24 hours'
  `)) as unknown as { seconds: number | null }[];
  const windowSeconds = win?.seconds ?? 86_400;
  const bucketSeconds = windowSeconds / RIDGE_BUCKETS;

  const buckets = (await db.execute(sql`
    select monitor_id,
           least(${RIDGE_BUCKETS - 1}, floor(extract(epoch from (${checks.checkedAt} - (now() - make_interval(secs => ${windowSeconds})))) / ${bucketSeconds}))::int as b,
           (avg(response_ms) filter (where ok))::float8 as avg_ms,
           bool_or(not ok) as failed
    from ${checks}
    where checked_at > now() - make_interval(secs => ${windowSeconds}) and ${inArray(checks.monitorId, ids)}
    group by 1, 2
  `)) as unknown as { monitor_id: number; b: number; avg_ms: number | null; failed: boolean }[];

  const ridgeById = new Map<number, { buckets: (number | null)[]; failed: boolean[] }>();
  for (const row of buckets) {
    const entry = ridgeById.get(row.monitor_id) ?? {
      buckets: new Array<number | null>(RIDGE_BUCKETS).fill(null),
      failed: new Array<boolean>(RIDGE_BUCKETS).fill(false),
    };
    entry.buckets[row.b] = row.avg_ms;
    entry.failed[row.b] = row.failed;
    ridgeById.set(row.monitor_id, entry);
  }

  const open = await db
    .select({ monitorId: incidents.monitorId, startedAt: incidents.startedAt })
    .from(incidents)
    .where(sql`${incidents.resolvedAt} is null and ${inArray(incidents.monitorId, ids)}`);
  const openById = new Map(open.map((o) => [o.monitorId, o.startedAt]));

  const statsById = new Map(stats.map((s) => [s.monitorId, s]));
  const recentById = new Map<number, RecentCheck[]>();
  for (const r of recent) {
    const arr = recentById.get(r.monitor_id) ?? [];
    arr.push({ ok: r.ok, responseMs: r.response_ms, checkedAt: new Date(r.checked_at) });
    recentById.set(r.monitor_id, arr);
  }

  return {
    windowSeconds,
    monitors: list.map((m) => ({
    ...m,
    uptime24h: statsById.get(m.id)?.uptime ?? null,
    avgMs24h: statsById.get(m.id)?.avgMs ?? null,
    recent: recentById.get(m.id) ?? [],
    downSince: openById.get(m.id) ?? null,
    ridge: ridgeById.get(m.id) ?? {
      buckets: new Array<number | null>(RIDGE_BUCKETS).fill(null),
      failed: new Array<boolean>(RIDGE_BUCKETS).fill(false),
    },
  })),
  };
}

/** Lightweight list for the navigation rail. */
export async function getMonitorIndex() {
  return db
    .select({ id: monitors.id, name: monitors.name, status: monitors.status })
    .from(monitors)
    .orderBy(asc(monitors.id));
}

export type DashboardMonitor = Awaited<ReturnType<typeof getDashboard>>["monitors"][number];

export async function getMonitorDetail(id: number) {
  const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id));
  if (!monitor) return null;

  const [windows] = await db
    .select({
      day: sql<number | null>`(count(*) filter (where ${checks.ok} and ${checks.checkedAt} > now() - interval '24 hours'))::float8 / nullif(count(*) filter (where ${checks.checkedAt} > now() - interval '24 hours'), 0)`,
      week: sql<number | null>`(count(*) filter (where ${checks.ok} and ${checks.checkedAt} > now() - interval '7 days'))::float8 / nullif(count(*) filter (where ${checks.checkedAt} > now() - interval '7 days'), 0)`,
      month: uptimeExpr,
      avgMs: sql<number | null>`(avg(${checks.responseMs}) filter (where ${checks.ok} and ${checks.checkedAt} > now() - interval '24 hours'))::float8`,
      p95Ms: sql<number | null>`(percentile_cont(0.95) within group (order by ${checks.responseMs}) filter (where ${checks.ok} and ${checks.checkedAt} > now() - interval '24 hours'))::float8`,
    })
    .from(checks)
    .where(sql`${checks.monitorId} = ${id} and ${checks.checkedAt} > now() - interval '30 days'`);

  const series = await db
    .select({ checkedAt: checks.checkedAt, responseMs: checks.responseMs, ok: checks.ok })
    .from(checks)
    .where(sql`${checks.monitorId} = ${id} and ${checks.checkedAt} > now() - interval '24 hours'`)
    .orderBy(asc(checks.checkedAt));

  const latest = await db
    .select()
    .from(checks)
    .where(eq(checks.monitorId, id))
    .orderBy(desc(checks.checkedAt))
    .limit(15);

  const history = await db
    .select()
    .from(incidents)
    .where(eq(incidents.monitorId, id))
    .orderBy(desc(incidents.startedAt))
    .limit(10);

  return { monitor, windows, series, latest, incidents: history };
}

export async function getStatusPage() {
  const list = await db
    .select()
    .from(monitors)
    .where(eq(monitors.isPublic, true))
    .orderBy(asc(monitors.name));
  if (list.length === 0) return { monitors: [], incidents: [] };

  const ids = list.map((m) => m.id);

  const daily = await db
    .select({
      monitorId: checks.monitorId,
      day: sql<string>`to_char(date_trunc('day', ${checks.checkedAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
      uptime: uptimeExpr,
    })
    .from(checks)
    .where(sql`${inArray(checks.monitorId, ids)} and ${checks.checkedAt} > now() - interval '90 days'`)
    .groupBy(checks.monitorId, sql`2`);

  const recentIncidents = await db
    .select({
      id: incidents.id,
      monitorName: monitors.name,
      startedAt: incidents.startedAt,
      resolvedAt: incidents.resolvedAt,
      cause: incidents.cause,
    })
    .from(incidents)
    .innerJoin(monitors, eq(monitors.id, incidents.monitorId))
    .where(sql`${monitors.isPublic} and ${incidents.startedAt} > now() - interval '14 days'`)
    .orderBy(desc(incidents.startedAt))
    .limit(20);

  const byMonitor = new Map<number, Map<string, number | null>>();
  for (const d of daily) {
    const days = byMonitor.get(d.monitorId) ?? new Map();
    days.set(d.day, d.uptime);
    byMonitor.set(d.monitorId, days);
  }

  return {
    monitors: list.map((m) => {
      const days = byMonitor.get(m.id) ?? new Map<string, number | null>();
      const values = [...days.values()].filter((v): v is number => v != null);
      return {
        id: m.id,
        name: m.name,
        status: m.status,
        days,
        uptime90d: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
      };
    }),
    incidents: recentIncidents,
  };
}

export async function getChannels() {
  return db.select().from(alertChannels).orderBy(asc(alertChannels.createdAt));
}
