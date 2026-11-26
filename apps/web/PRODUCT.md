# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** solo developers and small teams who self-host Pulse to watch their own websites and APIs. They open the dashboard briefly (a glance to confirm everything is fine, or a dig into one failing monitor) and otherwise rely on alerts reaching them in Discord or Slack.
- **Status page audience:** both the non-technical end users of the monitored sites ("is it down for everyone or just me?") and developers who want more detail. It has to be instantly readable for the first group without hiding facts from the second.
- **Secondary:** engineers and recruiters looking at the project as a portfolio piece (it's open source on GitHub with a live demo).

## Product Purpose

Pulse checks HTTP(S) endpoints on a schedule, decides whether each one is up or down, records incidents, alerts the owner the moment something breaks or recovers, and publishes a public status page. Success means the owner learns about downtime before their users do, false alarms are rare, and the status page answers "is it down?" in one look.

## Positioning

A small, self-hosted, single-repo alternative to hosted uptime services: you own the data, deploy with one `docker compose` command, and every decision (thresholds, retention, alert channels) is visible and configurable. Its distinguishing mechanism is false-alarm protection: a monitor only goes down after N consecutive failures, and the up/down state machine is pure and unit-tested.

## Operating Context

- The dashboard is a tool used in short visits, often on a laptop alongside other dev tools, and sometimes on a phone after an alert arrives.
- Alerts arrive in Discord, Slack or generic webhooks; the dashboard is where the owner goes next to see what failed and since when.
- The status page is linked publicly (e.g. `status.example.com`) and is visited mostly during incidents.

## Capabilities and Constraints

- Monitors: name, URL, GET/HEAD, interval (min 20s), timeout, expected status, body keyword, failure threshold, public/private, pause/resume.
- Monitor states: `pending`, `up`, `down`, `paused`.
- Data shown: last check, response time (avg and p95, 24h), uptime 24h / 7d / 30d, a 24h response-time series, recent checks, incidents with duration, SSL certificate expiry.
- Status page: overall state, per-monitor 90-day daily uptime, incidents from the last 14 days.
- Alert channels: Discord, Slack, generic webhook, each testable.
- Auth: optional single admin password; REST API with a bearer token.
- Stack: Next.js 16 App Router (server components and server actions), Tailwind CSS 4, no client-side charting library (charts are hand-built SVG).
- Pages auto-refresh every 10–30 seconds rather than streaming.

## Brand Commitments

- Name "Pulse" and the heartbeat line mark are preferred but not locked; the user is open to changing them if a stronger direction calls for it.

## Evidence on Hand

- No real customers, testimonials, usage numbers or uptime claims exist. Never fabricate them.
- Real data comes only from monitors the user adds.

## Product Principles

1. **Answer "is everything OK?" in one glance.** State comes before detail.
2. **Trust over drama.** Downtime is shown clearly and factually, never alarmist; false alarms are worse than a slight delay.
3. **Show the facts behind a verdict.** Every up or down state links to the checks, errors and timings that produced it.
4. **Self-hosted and honest.** Nothing implies a hosted service, an SLA, or numbers that didn't come from real checks.
