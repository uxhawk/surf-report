# Surf Tracker

A personal log for surf sessions — what you rode, where, in what conditions, and how each piece of gear performs over time. Built mobile-first with a retro/neon aesthetic.

## Features

- Log every session with date, location, board, fins, wave size, and notes
- Auto-fetch swell height, period, direction, and water temperature from the Open-Meteo Marine API based on location + date
- Dashboard with sortable session table, year-over-year monthly comparisons, water-temp ranges by month, and current/longest streaks
- Gear inventory for boards, fins, and locations — each with photos and a metrics page showing usage over time
- Filter sessions by year, month, location, board, or fins
- Email/password and Google OAuth login via Supabase

## Tech stack

- **React 19** + **Vite 8** for the UI and dev tooling
- **TypeScript** — migration in progress; see the [migration plan in Notion](https://www.notion.so/3496fc190e058105924ec645b88462fb)
- **Supabase** for auth, Postgres database, and gear-photo storage
- **Tailwind CSS v4** with custom `neon-*` and `retro-*` utility classes
- **Recharts** for dashboard charts
- **react-router-dom 7** with `HashRouter`
- **pixelarticons** for the icon set
- **Open-Meteo Marine API** for swell + sea-surface temperature
- **Nominatim** (OpenStreetMap) for location geocoding

## Getting started

### Prerequisites

- Node 20 or later
- A Supabase project — [create one for free](https://supabase.com)

### Install and run

```bash
git clone https://github.com/<you>/surf-tracker.git
cd surf-tracker
npm install
```

Copy the env template and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values live in your Supabase dashboard under *Project Settings → API*.

Start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:5173.

### Supabase setup

The app expects four tables in your Postgres database: `sessions`, `locations`, `boards`, `fins`. The exact column shapes are documented in `src/types/db.ts` once Phase 0 of the TypeScript migration is complete — until then, refer to the queries in `src/hooks/` and the form fields in `src/pages/LogSurf.jsx`, `BoardsPage.jsx`, `FinsPage.jsx`, and `LocationsPage.jsx`.

You also need a Storage bucket named `gear-photos` with public read access for board/fin/location photo uploads.

## Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint + typescript-eslint |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm run backfill-swell` | Backfill swell data on existing sessions from Open-Meteo |

## Project structure

```
src/
├── components/
│   ├── ui/              Reusable UI primitives (Button, Modal, Spinner, Toast, etc.)
│   ├── dashboard/       Dashboard widgets (StatCard, SurfChart, FilterBar, SessionsTable)
│   ├── BottomNav.jsx    Tab nav at the top of the layout
│   ├── Layout.jsx       App shell with sticky header + nav
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx  Supabase auth wrapper
├── hooks/               One hook per resource: useSessions, useLocations, useBoards, useFins
├── lib/
│   ├── supabase.js      Supabase client singleton
│   ├── openmeteo.js     Geocoding + marine API helpers
│   ├── utils.js         Date formatting, streak math, dashboard aggregations
│   └── constants.js     Wave sizes, fin setups, location types, color maps
├── pages/               One file per route (Dashboard, LogSurf, EditSession, gear pages)
├── types/               Shared domain types (added during TS migration)
├── App.jsx              Router configuration
└── main.jsx             Entry point

scripts/
└── backfill-swell.js    Node script for backfilling swell data on historical sessions

.github/
├── pull_request_template.md   PR description template
└── workflows/ci.yml            Type check + build on every PR
```

## Architecture notes

**Routing.** `HashRouter` with nested `Routes`. Public routes: `/login`, `/reset-password`. Everything else lives behind `ProtectedRoute → Layout`. The `/profile` routes use an `Outlet` via `GearLayout` to render Locations / Boards / Fins sub-tabs.

**Data layer.** All Supabase queries go through `lib/supabase.js` and the four hooks in `src/hooks/`. Each hook owns the list state for one resource and exposes `create / update / delete / refresh`. The `useSessions` hook is the only one that joins related rows (`location`, `board`, `fins`) — everything else is a flat query.

**External APIs.** `lib/openmeteo.js` wraps two services. Nominatim handles location geocoding when you add a new spot — it knows beaches, points, and reefs, not just cities. Open-Meteo Marine returns daily swell (height, period, direction) and hourly sea-surface temperature; the form fetches both whenever date + location change.

**Styling.** Tailwind v4 with custom `neon-*` and `retro-*` utility classes for the retro/neon look. Mobile-first throughout; the main column is capped at `max-w-2xl` so it reads cleanly on tablets and desktop.

## TypeScript migration

This codebase is mid-migration from JavaScript to TypeScript. The full plan — ordered from easiest to hardest, with learning notes for each task — lives in [Notion](https://www.notion.so/3496fc190e058105924ec645b88462fb).

While the migration is in progress:

- New files should be written in TypeScript (`.ts` / `.tsx`).
- Existing `.js` / `.jsx` files coexist thanks to `allowJs: true` in `tsconfig.json`.
- Run `npm run typecheck` after every conversion to verify nothing downstream broke.
- Strict mode (`strict: true`) is off until Phase 7 — don't be surprised by loose nullability checks until then.

## Contributing

Open a PR against `main`. The CI workflow runs type-check and build on every PR; both must pass before merging. The PR template prompts for a summary, screenshots (for UI changes), and a testing checklist.
