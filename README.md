# Sacrament Meeting Planner

A Next.js (App Router) application for planning, reviewing, and printing sacrament
meeting agendas. Built for WDD 430, Week 02.

## Features

- Browse every meeting on file, newest first
- View a full agenda: announcements, hymns, prayers, ward and stake business,
  speakers, and musical numbers
- Jump straight to the current Sunday's program via `/meetings/current`
- Print-friendly program view (navigation chrome is hidden when printing)
- Typed API routes backing every page

## Getting Started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with hero image and feature summary |
| `/meetings` | List of all meetings, rendered as `MeetingCard`s |
| `/meetings/[id]` | Full agenda for one meeting, with print control |
| `/meetings/current` | 307 redirect to the most recent Sunday's meeting |
| `GET /api/meetings` | All meetings; optional `?date=YYYY-MM-DD` filter |
| `GET /api/meetings/[id]` | One meeting — `200`, `400` (bad id), or `404` (missing) |

## Project Structure

```
sacrament-meetings/
├── app/
│   ├── api/meetings/
│   │   ├── route.ts               GET /api/meetings
│   │   └── [id]/route.ts          GET /api/meetings/[id]
│   ├── meetings/
│   │   ├── layout.tsx             Meetings section layout (breadcrumb)
│   │   ├── (list)/
│   │   │   ├── loading.tsx        Route-level loading UI
│   │   │   └── page.tsx           /meetings
│   │   ├── [id]/
│   │   │   ├── page.tsx           /meetings/[id]
│   │   │   └── not-found.tsx      404 view for unknown ids
│   │   └── current/page.tsx       /meetings/current redirect
│   ├── globals.css                Design tokens + print styles
│   ├── layout.tsx                 Root layout, Google fonts, Header/Footer
│   └── page.tsx                   Landing page
├── components/
│   ├── Header.tsx                 Ward name + current date
│   ├── Footer.tsx
│   ├── NavLinks.tsx               Client Component, active-link styling
│   ├── MeetingCard.tsx            Summary card
│   ├── MeetingDetail.tsx          Full agenda
│   └── PrintButton.tsx            Client Component, triggers print
├── lib/
│   ├── types.ts                   TypeScript interfaces
│   ├── meetings-db.ts             Temporary in-memory data
│   ├── api.ts                     Server-side fetch helpers
│   └── format.ts                  Date formatting
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

`lib/meetings-db.ts` is temporary in-memory data. Three records use fixed dates
as a small archive; the rest are anchored to the current week so
`/meetings/current` resolves to a real meeting whenever the app is opened.

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
