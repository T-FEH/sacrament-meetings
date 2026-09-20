# Sacrament Meeting Planner

A Next.js (App Router) application for planning, reviewing, and printing sacrament
meeting agendas, backed by a live PostgreSQL (Neon) database. Built for WDD 430.

## Features

- Browse every meeting on file, newest first, five per page
- Search by speaker, presiding, conducting, or meeting type — all state lives in the URL
- View a full agenda: announcements, hymns, prayers, ward and stake business,
  speakers, and musical numbers
- Jump straight to the current Sunday's program via `/meetings/current`
- Print-friendly program view (navigation chrome is hidden when printing)
- Typed API routes backing every page

## Getting Started

```bash
npm install
vercel link          # link to the Vercel project
vercel env pull .env.local   # writes DATABASE_URL
npm run dev
```

Open <http://localhost:3000>.

`.env.local` holds the database credentials and is covered by `.gitignore` —
never commit it.

### Database setup

The schema and seed data live in [`db/`](db/):

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

`db/seed.sql` inserts 12 meetings across all five meeting types, which gives
three pages at five per page and enough variety to exercise search.

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with hero image and feature summary |
| `/meetings` | Paginated, searchable list (`?query=`, `?page=`) |
| `/meetings/new` | Create form placeholder (Week 04) |
| `/meetings/[id]/edit` | Edit form placeholder (Week 04) |
| `/meetings/[id]` | Full agenda for one meeting, with print control |
| `/meetings/current` | 307 redirect to the most recent Sunday's meeting |
| `GET /api/meetings` | All meetings; `?date=`, `?query=`, `?page=` filters |
| `GET /api/meetings/[id]` | One meeting — `200`, `400` (bad id), or `404` (missing) |

## Project Structure

```
sacrament-meetings/
├── app/
│   ├── (public)/meetings/
│   │   ├── layout.tsx             Section layout (breadcrumb)
│   │   ├── (list)/
│   │   │   ├── loading.tsx        Route-level loading UI
│   │   │   └── page.tsx           /meetings — search + pagination
│   │   ├── [id]/
│   │   │   ├── page.tsx           /meetings/[id]
│   │   │   └── not-found.tsx
│   │   └── current/page.tsx       /meetings/current redirect
│   ├── (admin)/
│   │   ├── layout.tsx             Leader-facing layout
│   │   └── meetings/
│   │       ├── new/page.tsx       /meetings/new (Week 04)
│   │       └── [id]/edit/page.tsx /meetings/[id]/edit (Week 04)
│   ├── api/meetings/
│   │   ├── route.ts               GET /api/meetings
│   │   └── [id]/route.ts          GET /api/meetings/[id]
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx                 Ward name + current date
│   ├── Footer.tsx
│   ├── NavLinks.tsx               Client Component, active-link styling
│   ├── MeetingCard.tsx            Summary card
│   ├── MeetingDetail.tsx          Full agenda
│   ├── MeetingSearch.tsx          Client Component, URL-driven search
│   ├── Pagination.tsx             Client Component, URL-driven paging
│   └── PrintButton.tsx            Client Component, triggers print
├── lib/
│   ├── types.ts                   TypeScript interfaces
│   ├── meetings-db.ts             Neon PostgreSQL queries
│   └── format.ts                  Date helpers
├── db/
│   ├── schema.sql                 meetings table definition
│   └── seed.sql                   12 seed records
└── public/chapel-hero.jpg
```

### Why `loading.tsx` sits in a `(list)` route group

A `loading.tsx` placed directly in `app/meetings/` creates a Suspense boundary
above **every** child route. That makes Next.js flush the document shell before
the page resolves, which silently downgrades two behaviours:

- `redirect()` in `/meetings/current` becomes a one-second
  `<meta http-equiv="refresh">` (HTTP 200) instead of a 307 — a visible stall
  without JavaScript, and a WCAG 2.2.1 failure.
- `notFound()` in `/meetings/[id]` responds **200** instead of **404**.

Route groups do not affect URLs, so scoping the boundary to `(list)` keeps the
loading state on the list route while `/meetings/current` returns a real 307 and
unknown meeting ids return a real 404. Both were verified with `curl`.

### Data note

`lib/meetings-db.ts` now queries a live Neon PostgreSQL database. The Neon
client is created lazily on first query rather than at module load, so
`next build` succeeds on a machine without `DATABASE_URL` set — every page that
queries is dynamic, so nothing needs the database at build time.

**Known limitation:** "today" and "the current Sunday" are computed in the
server's timezone, which is UTC on Vercel. A ward several hours behind UTC will
see the date roll over before local midnight. Fixing this properly means
storing a ward timezone and resolving dates against it, which is out of scope
for this week.

Nested fields (hymns, speakers, ward business) are stored as `JSONB` and
announcements as `TEXT[]`. Columns are aliased in SQL (`meeting_type AS
"meetingType"`) so rows map straight onto the `SacramentMeeting` interface with
no transformation layer.

## Quality Checks

```bash
npm run lint
npm run build
```

Accessibility was verified with axe-core in headless Chrome across `/`,
`/meetings`, and `/meetings/[id]` at 375px and 1280px: **0 violations**, no
horizontal overflow, and keyboard navigation confirmed (skip link, logical tab
order, visible focus rings, Enter activation, `aria-current` on the active nav
link).
