# RescueWave — Disaster Response Command Center

A premium, operator-focused web command center for disaster response rovers. It covers the full
response cycle: **predict & prepare → detect & locate → respond & learn**, across earthquake,
flood, landslide and avalanche scenarios.

> All data in this build is **simulated**. Nothing here is a live sensor feed or a real prediction
> service. The UI is explicitly labelled so nobody mistakes prototype values for field truth.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Overview: mission HUD, map, telemetry, detections, alerts |
| `/map` | Full-screen tactical map: rover, trail, waypoints, risk zones, terrain toggle |
| `/rover` | Telemetry, safe rover controls, camera, system health |
| `/detection` | Radar + camera + multi-sensor verification, target register |
| `/alerts` | Event-based alert center with severity filters and acknowledgement |
| `/risk` | High-risk zones, contributing factors, planned data sources |
| `/log` | Searchable mission event history |
| `/analytics` | Post-mission metrics and charts |
| `/settings` | Data-source mode, endpoint map, connection simulation, demo controls |

## Detection language (important)

A radar return is **never** presented as a rescued or confirmed person. Targets move through:

`UNVERIFIED CONTACT → POSSIBLE SURVIVOR → VERIFIED (operator) / DISMISSED`

Verification always requires an explicit operator action; the UI shows which sensors agree
(radar, thermal, camera, audio) before a target can be promoted.

## Architecture

```
src/
  types/           shared contracts (rover, detection, alerts, mission, risk, analytics)
  mock/            disaster profiles + the simulation engine that drives every screen
  services/        centralized API layer — one place to swap mock → real backend
  hooks/           app-wide simulation context + selector hooks
  components/      layout, map (Leaflet), dashboard panels, shared primitives
  routes/          TanStack Router file routes
```

### Connecting a real backend

Every read goes through `src/services/`. Endpoints live in `src/services/api.ts`.

1. Set `VITE_API_BASE_URL` to your backend origin.
2. The service layer automatically stops using the simulation and calls the endpoint map.
3. No component changes are required — components only consume typed contracts from `src/types`.

Set `VITE_DEBUG_MODE=true` to expose the technical diagnostics drawer. Operator screens stay free
of raw engineering data by default.

### Offline behaviour

The rover link can drop. When it does, the UI shows a clear offline banner, keeps the last known
state, counts buffered rover events, and syncs them when the link returns. Toggle this from
**Settings → Connection Simulation**.

## Demo sequence

**Settings → Run full demo sequence** plays the complete story: patrol → unverified contact →
possible survivor → alert → waypoint → operator verification → post-mission report.

## Development

```bash
npm install
npm run dev
```

Stack: TanStack Start (React 19), Vite, Tailwind CSS v4, Leaflet, Recharts, Lucide.
