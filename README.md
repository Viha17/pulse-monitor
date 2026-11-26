<div align="center">

# 〰️ Pulse

**Self-hosted uptime monitoring with instant alerts and a public status page.**

Pulse checks your websites and APIs on a schedule, tells you on Discord or Slack the moment one goes down, and gives your users a clean status page.

![CI](https://github.com/Viha17/pulse-monitor/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)

</div>

<!-- Add a screenshot or GIF of the dashboard here: ![Dashboard](docs/dashboard.png) -->

## Features

- **HTTP(S) monitoring** at intervals down to 20 seconds, with GET/HEAD, timeouts, expected status codes and body keyword matching
- **False-alarm protection.** A monitor only goes down after _N_ consecutive failures, so a single network blip doesn't page you
- **Incidents** open and close automatically, with downtime duration
- **Alerts** to Discord, Slack or any JSON webhook when a site goes down, recovers, or its **SSL certificate** is about to expire
- **Dashboard** with live status, 24h sparklines, uptime (24h / 7d / 30d), average and p95 response time, and a hand-built SVG response chart
- **Public status page** with 90-day uptime bars and an incident history
- **REST API** secured with a bearer token
- **One-command deploy** with Docker Compose

## Architecture

```mermaid
flowchart LR
    subgraph Web["apps/web · Next.js"]
        D[Dashboard] --- S[Status page] --- A[REST API]
    end
    subgraph Worker["apps/worker · Node"]
        Sync[Scheduler sync] --> Q[(BullMQ queue)]
        Q --> C[Checker x N]
        C --> N[Alerts]
    end
    Web -- read/write --> PG[(PostgreSQL)]
    Sync -- active monitors --> PG
    C -- results, incidents --> PG
    Q <--> R[(Redis)]
    C -- HTTP / TLS --> T((Your sites))
    N --> X((Discord / Slack / Webhook))
```

| Package | Responsibility |
| --- | --- |
| `packages/core` | Drizzle ORM schema, migrations, DB client and alert formatting, shared by both apps |
| `apps/worker` | Schedules and runs checks, decides up or down, records incidents, sends alerts |
| `apps/web` | Next.js App Router dashboard, public status page and REST API |

## Design decisions

**The database is the single source of truth.** The web app never talks to Redis. Every 10 seconds the worker reconciles active monitors in Postgres with BullMQ job schedulers, adding, rescheduling or removing them. Creating, pausing or deleting a monitor in the UI therefore needs no extra wiring, and the worker recovers its schedule after a restart.

**BullMQ for scheduling instead of `setInterval`.** Repeatable jobs live in Redis, so they survive restarts. Concurrency is bounded, and you can scale to several worker processes without checking the same site twice.

**The up/down logic is a pure state machine** (`apps/worker/src/evaluate.ts`). It doesn't touch the network or the database, so it's fully covered by unit tests: threshold handling, alert-once-while-down and recovery events.

**Stats are computed in SQL.** Uptime percentages use `count(*) filter (...)`, p95 uses `percentile_cont`, and sparklines use a `row_number()` window function. A composite index on `(monitor_id, checked_at desc)` keeps these fast, and the worker prunes raw checks older than `RETENTION_DAYS`.

**Secure by default.** The dashboard needs a password (HMAC-signed, httpOnly session cookie). Secrets are compared in constant time. The REST API stays disabled until you set an API key.

## Quick start (local development)

Requirements: Node.js 22+ and Docker.

```bash
git clone https://github.com/Viha17/pulse-monitor.git
cd pulse-monitor
cp .env.example .env

docker compose up -d        # Postgres on :5433, Redis on :6380
npm install
npm run db:migrate
npm run dev                 # web on http://localhost:3000 + worker
```

## Deploy with Docker

```bash
cp .env.example .env        # set PULSE_ADMIN_PASSWORD, PULSE_SECRET and optionally PULSE_API_KEY
docker compose --profile app up -d --build
```

This starts Postgres, Redis, the worker (which runs migrations on boot) and the web app on port 3000.

## REST API

Set `PULSE_API_KEY` and send it as a bearer token.

```bash
# List monitors
curl -H "Authorization: Bearer $PULSE_API_KEY" http://localhost:3000/api/monitors

# Create a monitor
curl -X POST http://localhost:3000/api/monitors \
  -H "Authorization: Bearer $PULSE_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"My API","url":"https://api.example.com/health","intervalSeconds":30,"keyword":"ok"}'

# Update / delete
curl -X PATCH  .../api/monitors/1 -H "..." -d '{"intervalSeconds":120}'
curl -X DELETE .../api/monitors/1 -H "..."
```

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/monitors` | List all monitors |
| `POST` | `/api/monitors` | Create a monitor |
| `GET` | `/api/monitors/:id` | Monitor plus its latest 50 checks |
| `PATCH` | `/api/monitors/:id` | Update any fields |
| `DELETE` | `/api/monitors/:id` | Delete a monitor and its history |
| `GET` | `/api/health` | Liveness and database check (no auth) |

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://pulse:pulse@localhost:5433/pulse` | Postgres connection string |
| `REDIS_URL` | `redis://localhost:6380` | Redis connection string |
| `PULSE_ADMIN_PASSWORD` | _(empty)_ | Dashboard password. **Required in production** |
| `PULSE_SECRET` | _(password)_ | Key used to sign session cookies |
| `PULSE_API_KEY` | _(empty)_ | Enables the REST API |
| `RETENTION_DAYS` | `30` | Days of raw check history to keep |
| `WORKER_CONCURRENCY` | `10` | Checks run in parallel per worker |

## Tech stack

TypeScript · Next.js 16 (App Router, Server Actions) · React 19 · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · BullMQ · Redis · Zod · Vitest · Docker · GitHub Actions

## Roadmap

- [ ] Multi-region checks with quorum (only alert when several locations agree)
- [ ] TCP, ping and DNS monitors
- [ ] Email and Telegram alerts
- [ ] Maintenance windows
- [ ] Status page custom domain and branding
- [ ] Real-time dashboard over WebSockets / SSE

## License

[MIT](LICENSE)
