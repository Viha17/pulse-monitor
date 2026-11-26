---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# Surface brief: Pulse web app (dashboard, monitor detail, alerts, login, public status page)

Mode: Operate (dashboard, detail, alerts, login); the status page is the same world tuned for glance-reading by non-technical visitors.

Audience and job: solo devs and small teams glance to confirm everything is fine, or open one failing monitor to see what failed and since when. The status page answers "is it down?" for end users and developers.

Constraints: Next.js 16 App Router server components, Tailwind 4, hand-built SVG charts, no chart library. Keep every existing function, route and copy fact. User complaints to resolve: generic AI dark dashboard, boxes everywhere, no personality, data hard to read.

## Direction contract

THESIS: Pulse is a catalog of signals. Each monitor is a numbered entry (PLS 001) whose response times are drawn as a white hairline pulse plot, one plot owning the field. Refuses the category default: rounded zinc cards, KPI tiles, green pills and sparklines.

OWN-WORLD: matte near-black ground (#0c0c0c) with white hairline ink (1px rules, outlined square controls, zero radius). The colour code is the Factory strip: white = up, red = down, yellow = pending, grey = paused, blue = selection and the "now" hand (never branding). Colour appears only as small solid blocks and as a red bar on the active control. Archivo Expanded for the catalog number and verdict, Archivo for body, Martian Mono only for measurements, timestamps and codes. Wide tracked caps for labels that sit beside values, never above headings.

STORY: The visitor sees the verdict and the stacked pulse of all monitors first, spots the red line, opens that entry, reads the 24-hour dial and the failing checks, and acts (pause, edit, alert channels).

FIRST VIEWPORT: Left rail: mark, nav (Monitors, Alerts, Status page; active item white with a red end bar) and the numbered monitor index with a state block each (active entry outlined red). Main: the "Add monitor" outlined button with a red end bar sits top right. Below it, on the left (one third), the verdict set large as a sentence ("One monitor is down." / "All 5 monitors are up.") with the failing entry named beneath; on the right (two thirds, the dominant object), the stacked ridgeline of every monitor's response times, the down monitor's line in red. Below a full-width rule: the catalog table (number, name/url, signal readout of 24 check blocks, avg, uptime). Deviation, cited: the verdict is a sentence, not "4 / 5 up", because the craft floor refuses the hero-metric template and a sentence names the problem more plainly for a glance.

FORM: Pulsar Sleeve (Factory catalog sleeve), challenger chosen by user over assigned Swiss Grid; seed: 8d1ab1bd3efd07ed. Signature moves: stacked response-time ridgeline on the dashboard; 24-hour radial dial (angle = time of day, radius = response time) on the monitor page.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
