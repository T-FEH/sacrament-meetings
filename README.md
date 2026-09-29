# Sacrament Meeting Planner

A Next.js (App Router) application for planning, reviewing, and printing sacrament
meeting agendas, backed by a live PostgreSQL (Neon) database. Built for WDD 430.

## Features

- Browse every meeting on file, newest first, five per page
- Search by speaker, presiding, conducting, or meeting type — all state lives in the URL
- View a full agenda: announcements, hymns, prayers, ward and stake business,
  speakers, and musical numbers
- Jump straight to the current Sunday's program via `/meetings/current`
- Create, edit, and delete meetings through Server Actions with server-side
  Zod validation and accessible, field-level error messages
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
| `/meetings/new` | Create form (Server Action + Zod validation) |
| `/meetings/[id]/edit` | Edit form; `notFound()` for unknown ids |
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
│   │   ├── error.tsx              Error boundary for meetings routes
│   │   ├── [id]/
│   │   │   ├── page.tsx           /meetings/[id]
│   │   │   └── not-found.tsx
│   │   └── current/page.tsx       /meetings/current redirect
│   ├── (admin)/
│   │   ├── layout.tsx             Leader-facing layout
│   │   ├── error.tsx              Error boundary for admin routes
│   │   └── meetings/
│   │       ├── new/page.tsx       Create form
│   │       └── [id]/edit/
│   │           ├── page.tsx       Edit form
│   │           └── not-found.tsx  Unknown meeting id
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
│   ├── MeetingForm.tsx            Client form, useActionState + a11y errors
│   ├── DeleteMeetingButton.tsx    Client form posting to deleteMeeting
│   ├── MeetingSearch.tsx          Client Component, URL-driven search
│   ├── Pagination.tsx             Client Component, URL-driven paging
│   └── PrintButton.tsx            Client Component, triggers print
├── lib/
│   ├── types.ts                   TypeScript interfaces
│   ├── meetings-db.ts             Neon PostgreSQL queries + mutations
│   ├── actions.ts                 Server Actions ('use server')
│   ├── form-state.ts              Shared form state shape
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

### Why the form state lives outside `lib/actions.ts`

A `'use server'` module may only export async functions. Exporting the
`emptyMeetingFormState` constant from `lib/actions.ts` fails the build with
*"A 'use server' file can only export async functions, found object"*, so the
state interface and its initial value live in `lib/form-state.ts`.

### Forms and validation

The create and edit pages stay Server Components so they can fetch the record
and call `notFound()`; `components/MeetingForm.tsx` is the Client Component that
calls `useActionState` and renders the returned errors. Every input has a
matching `<label htmlFor>`, an `aria-describedby` pointing at its error
container, and `aria-invalid` when that field failed. Each error container is
`aria-live="polite"` so screen readers announce validation changes. A duplicate
meeting date is caught as a Postgres unique violation (`23505`) and returned as
a field error rather than an unhandled exception.

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
