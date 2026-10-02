# OU Parking Occupancy Prototype

A prototype web app to help University of Oklahoma students see how full
campus parking garages are before they drive there.

**All data is simulated.** Nothing connects to OU, PGS, cameras, or any real
parking system yet.

## Stack

- **Backend**: Node.js + Express, SQLite via `better-sqlite3` (`/server`)
- **Frontend**: React + Vite + Tailwind CSS + Recharts (`/client`)

## Running locally

Two terminals:

```bash
cd server
npm install
npm run dev        # API on http://localhost:4000
```

```bash
cd client
npm install
npm run dev        # UI on http://localhost:5173
```

The Vite dev server proxies `/api/*` to the Express server.

## Features

### Dashboard (`/`)
- Grid of all OU parking garages with live occupancy
- Status badges: Available / Filling Up / Full
- Occupancy progress bars
- Global Start/Stop Simulation buttons
- Polls every 3 seconds

### Garage Detail (`/garages/:id`)
- Large occupancy display
- Per-garage simulation controls
- Live event feed (entry/exit)
- 24h / 7d occupancy history chart
- Simulated parking forecast (hour-of-day patterns)

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/garages` | All garages with occupancy + sim status |
| GET | `/api/garages/:id` | Single garage |
| POST | `/api/garages/:id/events` | Record entry/exit `{ "event_type": "entry" \| "exit" }` |
| GET | `/api/garages/:id/events?limit=20` | Recent events |
| POST | `/api/garages/simulate/start` | Start simulation for all garages |
| POST | `/api/garages/simulate/stop` | Stop all simulations |
| POST | `/api/garages/:id/simulate/start` | Start simulation for one garage |
| POST | `/api/garages/:id/simulate/stop` | Stop simulation for one garage |
| GET | `/api/garages/:id/history?range=24h` | Occupancy snapshots (24h or 7d) |
| GET | `/api/garages/:id/forecast?day=today` | Simulated hour-of-day forecast |
| POST | `/api/admin/snapshot` | Manually record a snapshot |

## Key design decision

Occupancy is **derived from entry/exit events**, not stored as a number. When
real PGS data is available, it feeds the same `events` table and everything
above it stays unchanged.

Historical charts use `occupancy_snapshots` (recorded every 5 minutes while the
server runs). Synthetic 7-day history is seeded on first run so charts and
forecasts aren't empty during demos.

## Roadmap status

- [x] Milestone 1: Multi-garage live dashboard + simulation
- [x] Milestone 2: Garage detail pages with event feed
- [x] Milestone 3: Historical occupancy charts
- [x] Milestone 4: Simulated parking forecast

## Meeting prep (OU Parking Services)

Questions to bring:
- Does PGS expose an API, webhook, or database view?
- Is data per-garage entry/exit counts, or aggregate occupancy only?
- Is historical data retained, and for how long?
- Are there licensing/privacy constraints on making data public?
