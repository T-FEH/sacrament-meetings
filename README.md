# Sacrament Meeting Planner

A Next.js (App Router) application for planning, reviewing, and printing sacrament
meeting agendas, backed by a live PostgreSQL (Neon) database. Built for WDD 430.


## Team — Group 4

| Member | Role on this project |
| --- | --- |
| Michael Kyne | Developer |
| Armando Fernandez | Developer |
| Boluwatife Alewi ([@T-FEH](https://github.com/T-FEH)) | Developer — this repository |
| Ifeanyi Eme ([@KhiddleCodes](https://github.com/KhiddleCodes)) | Developer |

Each member maintains their own copy of the planner; this repository is
Boluwatife Alewi's implementation.

## Live Application

- **Production:** https://sacrament-meetings-khaki.vercel.app
- **Repository:** https://github.com/T-FEH/sacrament-meetings

### Demo credentials

| Field | Value |
| --- | --- |
| Email | `bishop@maplehills.test` |
| Password | `Sacrament2026!` |

Authentication uses **Auth.js v5** (`next-auth@beta`) with a credentials
provider. You can also register a new account at `/signup`.

## Features

- Browse every meeting on file, newest first, five per page
- Search by speaker, presiding, conducting, or meeting type — all state lives in the URL
- View a full agenda: announcements, hymns, prayers, ward and stake business,
  speakers, and musical numbers
- Jump straight to the current Sunday's program via `/meetings/current`
- Create, edit, and delete meetings through Server Actions with server-side
  Zod validation and accessible, field-level error messages
- Bishopric sign-in (Auth.js credentials) protecting the create and edit routes
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

### Authentication

Sign-in uses Auth.js (`next-auth@beta`) with a credentials provider backed by a
`users` table; passwords are stored as bcrypt hashes. Create the table and the
demo account with:

```bash
psql "$DATABASE_URL" -f db/users.sql
```

A local `AUTH_SECRET` is also required:

```bash
openssl rand -base64 32    # add to .env.local as AUTH_SECRET
```

**Demo account:** `bishop@maplehills.test` / `Sacrament2026!`

`/meetings/new` and `/meetings/[id]/edit` are protected. Signed-out visitors are
redirected to `/login` with a `callbackUrl` and returned to the page they asked
for after signing in. Everything members need — browsing, searching, viewing and
printing programs — stays public.

**Route protection is not only middleware.** A Server Action is a POST to
whichever route rendered it, so the delete form on `/meetings` would satisfy a
middleware check for `/meetings` even though it mutates data. Every mutation in
`lib/actions.ts` therefore calls `requireUser()` and re-checks the session on the
server. This was verified by replaying a captured action POST with no session
cookie: it fails and the record survives.

### Database setup

The schema and seed data live in [`db/`](db/):

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

`db/seed.sql` inserts 12 meetings across all five meeting types, which gives
three pages at five per page and enough variety to exercise search.

## Routes

### Pages

| Route | Auth | Description |
| --- | --- | --- |
| `/` | public | Landing page with hero image and feature summary |
| `/meetings` | public | Paginated, searchable list (`?query=`, `?page=`) |
| `/meetings/[id]` | public | Full agenda with print view |
| `/meetings/current` | public | 307 redirect to the most recent Sunday's meeting |
| `/meetings/new` | **protected** | Create a meeting |
| `/meetings/[id]/edit` | **protected** | Edit a meeting |
| `/profile` | **protected** | View, update, or deactivate your account |
| `/login` | public | Bishopric sign-in |
| `/signup` | public | Register a bishopric account |

### API

All handlers live in `app/api/` and return JSON. Every query is parameterised.

#### `GET /api/meetings`

Returns an array of meetings, newest first.

| Query param | Type | Description |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | Only meetings on this exact date |
| `query` | string | Matches presiding, conducting, meeting type, or speaker names (case-insensitive) |
| `page` | integer | Page number, 5 per page. Omit to return every match |

```bash
curl https://sacrament-meetings-khaki.vercel.app/api/meetings
curl "https://sacrament-meetings-khaki.vercel.app/api/meetings?date=2026-10-11"
curl "https://sacrament-meetings-khaki.vercel.app/api/meetings?query=smith&page=2"
```

Response `200`:

```json
[
  {
    "id": 19,
    "date": "2026-10-11",
    "meetingType": "regular",
    "presiding": "Bishop Smith",
    "conducting": "Sister Torres",
    "announcements": ["Ward temple night Thursday at 6:30 PM"],
    "openingHymn": { "number": 2, "title": "The Spirit of God" },
    "openingPrayer": "Brother Kim",
    "wardBusiness": [{ "description": "Sustaining of Sister Agbavor" }],
    "stakeBusiness": false,
    "sacramentHymn": { "number": 169, "title": "In Remembrance of Thy Suffering" },
    "speakers": [{ "name": "Sister Chen", "topic": "Walking by Faith", "type": "speaker" }],
    "closingHymn": { "number": 223, "title": "Have I Done Any Good?" },
    "closingPrayer": "Sister Jensen"
  }
]
```

This endpoint is consumed by `components/DateAvailability.tsx`, a client
component that checks whether a date is already scheduled while a leader fills
in the meeting form — a full client → route handler → database round trip.

#### `GET /api/meetings/[id]`

| Status | Meaning |
| --- | --- |
| `200` | The meeting, as a single object |
| `400` | `id` is not a positive integer — `{"error":"Invalid meeting id 'abc'…"}` |
| `404` | No meeting with that id — `{"error":"No meeting found with id 9999."}` |

#### `GET|POST /api/auth/[...nextauth]`

Auth.js session, sign-in, and sign-out handlers. Not called directly.

### Mutations

Create, update, and delete run as **Server Actions** (`lib/actions.ts`,
`lib/account-actions.ts`), not REST endpoints. Each one re-checks the session
server-side via `requireUser()` — middleware alone does not protect Server
Actions, because an action is a POST to whichever route rendered it.

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
│   ├── api/auth/[...nextauth]/route.ts  Auth.js handlers
│   ├── login/page.tsx             Bishopric sign-in
│   ├── opengraph-image.png        Social preview (1200x630)
│   ├── globals.css
│   ├── layout.tsx                 Root metadata + layout
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
├── auth.ts                        Auth.js + credentials provider
├── auth.config.ts                 Edge-safe config (route rules)
├── middleware.ts                  Route protection
├── db/
│   ├── schema.sql                 meetings table definition
│   ├── seed.sql                   15 seed records
│   └── users.sql                  users table + demo account
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

## Metadata

The root layout sets `metadataBase`, a title template, a default description,
keywords, canonical URL, and Open Graph plus Twitter card defaults.
`app/opengraph-image.png` (1200x630) is picked up automatically by Next.js and
resolved to an absolute URL through `metadataBase` — social crawlers will not
follow a relative image path.

Route-specific metadata overrides those defaults on `/meetings` (custom title,
description, canonical) and on `/meetings/[id]`, where `generateMetadata` builds
a description from the actual meeting — its type, date, presiding leader, and
speaker names — and sets `og:type` to `article`. `/login` is marked
`robots: { index: false }` since there is nothing for search engines there.

## Deployment

Hosted on Vercel with a Neon (serverless PostgreSQL) database.

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string. Added automatically by the Vercel Neon integration |
| `AUTH_SECRET` | Signs Auth.js session JWTs. Generate with `openssl rand -base64 32` |

Set both in **Vercel → Project → Settings → Environment Variables** for
Production and Preview. Locally, run `vercel env pull .env.local --environment=production`
(the development environment has no values, so pulling without the flag returns
an empty `DATABASE_URL`). `.env.local` is gitignored and must never be committed.

### First-time database setup

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
psql "$DATABASE_URL" -f db/users.sql
```

### Deploying

```bash
vercel deploy --prod
```

> The Vercel GitHub App is **not** connected to this repository, so pushing to
> `main` does not trigger a build. Deployments are run manually with the command
> above. Connecting GitHub in Vercel → Settings → Git would enable automatic
> deployments and per-branch previews.

## Known Issues and Opportunities

### Known issues

- **Dates are computed in the server's timezone (UTC on Vercel).** A ward
  several hours behind UTC will see "today" and "the current Sunday" roll over
  before local midnight. A proper fix stores a ward timezone and resolves dates
  against it.
- **Every authenticated user is a full administrator.** There is one role: if
  you can sign in, you can create, edit, and delete any meeting, and anyone can
  self-register at `/signup`. A real deployment needs an invite flow and
  separate bishopric/clerk roles.
- **Deactivation is self-service only.** A user can deactivate their own
  account, but there is no admin screen to reactivate one; that currently needs
  a SQL update.
- **The app is single-ward.** Ward name is a prop default on `Header`, and
  meetings are not scoped to an organisation.
- **Deleting a meeting has no undo.** Meetings are hard-deleted, unlike user
  accounts, which are soft-deleted.
- **The meeting form caps speakers at four rows.** Longer programs need more
  rows added dynamically.

### Opportunities

- Roles and permissions, plus an invite-based sign-up
- Per-ward tenancy so several wards can share one deployment
- Soft delete and an undo window for meetings
- Email or text reminders to assigned speakers and prayer-givers
- A printable quarterly view rather than one program at a time
- Automated tests; verification is currently manual plus scripted browser checks

## Quality Checks

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run build         # production build
```

Accessibility was verified with axe-core in headless Chrome across `/`,
`/meetings`, and `/meetings/[id]` at 375px and 1280px: **0 violations**, no
horizontal overflow, and keyboard navigation confirmed (skip link, logical tab
order, visible focus rings, Enter activation, `aria-current` on the active nav
link).
