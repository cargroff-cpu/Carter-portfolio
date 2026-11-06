# Carter Groff — Portfolio

Carter Groff's personal portfolio site: a single-page, dark "Parlor" themed
site (gas lamp, candlelight, botanical motifs) built with React + Babel
loaded directly from a CDN — no build step, no bundler. Content (bio, video
reel, design work, résumé, travels) is data-driven so it can be edited
without touching the page markup.

## Project structure

```
Carter Portfolio.html   The public site — loads the scripts below in order
app.jsx                  Mounts <Portfolio /> once content has loaded
themes.jsx               Design tokens (colors, type, spacing) + global CSS/animations
data.jsx                 Default content (bio, videos, designs, résumé, travels)
motifs.jsx               Reusable decorative components (gas lamp, botanicals, raven — unused)
portfolio.jsx            Page sections + composition (Hero, About, Video, Design, Résumé, Contact)
cg-store.js              Shared storage helper used by the site and the admin CMS
assets/                  Images (portrait, etc.)

Admin.html               Content editor (CMS), part of "The Backroom" (private tools) — served under /backroom, not linked from the public site
admin.jsx                Admin app shell (editor + live preview split view)
admin-ui.jsx             Admin form primitives (fields, buttons, image/PDF upload)
admin-sections.jsx       Admin form sections (Identity, About, Videos, Designs, Résumé, Travels)

Carter Groff Design.html  The Scaffold, by Carter Groff — the public studio page (Design + Automation lanes) — served at /design
design.jsx                Studio page source: sections + the three-movement brief form. EDIT THIS, then run `npm run build:design`
design.js                 GENERATED from design.jsx (precompiled, so the public page ships no in-browser Babel). Commit it with design.jsx
cargroff-design.css       Studio page styles, built on parlor.css's tokens

Scaffold Hub.html         The Backroom's entry (served at /backroom; /scaffold redirects there)
Business Hub.html         The Business Hub CRM, door 02 of The Backroom — served at /business
business-hub.jsx          Clients, leads (+ thread), projects (+ deliverables), invoices, notes, briefs inbox with AI triage
command-center-data.jsx   Backroom data layer: reads via /api/scaffold-read, writes via /api/scaffold-write (no Supabase key in the browser)

api/design-brief.js       Public brief endpoint (email first, then DB, uploads, AI triage, client confirmation, event log). GET = health check / keep-alive
api/brief-reply.js        Backroom only: re-run triage, approve & send a reply, or reject
lib/                      Server helpers: session tokens, rate limiting, Supabase/Resend helpers, AI triage
supabase-schema.sql       Record of the live schema
supabase/migrations/      Changes still to apply, in order (see the top of each file)
```

## Running locally

This is a static site — no `npm install`, no build command. Any static file
server works:

```bash
cd "Carter Groff Website code"
python3 -m http.server 8765
```

Then open `http://localhost:8765/Carter%20Portfolio.html` for the site, or
`http://localhost:8765/Admin.html` for the content editor.

The one build step: after editing `design.jsx`, run `npm install` (first
time) and `npm run build:design`, and commit the regenerated `design.js`.

Vercel's Hobby plan allows **12 serverless functions**; every file in
`api/` counts. There are 10. Put shared code in `lib/`, not `api/`.

## Editing content

Open `Admin.html` and edit any section (Identity, About, Video Work, Design
Work, Résumé, Travels) — changes autosave as you type into the browser's
local storage as a draft safety net. Click **Save / Publish** to push that
draft live: it's written to Supabase, and the public site picks it up on
its next page load — no redeploy needed.

The Backroom (`/backroom`, `/business`, `/docket`, the admin) is
password-protected: `api/login.js` checks `ADMIN_PASSWORD` and sets a
signed, 8-hour session token (`lib/session.js`) that `middleware.js`
verifies. Login is rate-limited.

## Deployment

Hosted on Vercel, auto-deploying from the `main` branch of this repo.

**Environment variables** (Vercel → Project Settings → Environment
Variables — set directly there, never committed):

| Variable | Used by | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | `api/login.js` | The Backroom password. Rotate it after deploying the 2026-11-04 changes |
| `SESSION_SECRET` | `lib/session.js` | **New.** Long random string that signs session cookies. Until set, sessions are signed with `ADMIN_PASSWORD` |
| `SUPABASE_SERVICE_ROLE_KEY` | every `api/` route that touches the database | Full-access key, server-side only. Rotate it after the lockdown migration |
| `RESEND_API_KEY` | `api/contact.js`, `api/design-brief.js`, `api/brief-reply.js` | Email |
| `RESEND_FROM` | same | **New.** e.g. `The Scaffold <studio@cargroff.com>`, on a domain verified in Resend. Until set, mail goes from Resend's test sender and client-facing email (brief confirmations, approved replies) is switched off, because the test sender can only reach the account owner |
| `NOTIFY_EMAIL` | `lib/server.js` | Optional. Where new briefs and failure alerts go (default car.groff@gmail.com) |
| `ANTHROPIC_API_KEY` | `lib/brief-triage.js` | AI triage on incoming briefs. Without it, briefs still work and the Hub just shows "No AI triage yet" |
| `TRIAGE_MODEL`, `TRIAGE_DAILY_CAP` | `lib/brief-triage.js` | Optional. Model override, and the daily cap on automatic triage (default 40) |
| `STRIPE_SECRET_KEY` | `lib/stripe.js` (from `api/job.js`, `api/stripe-webhook.js`, `api/scaffold-write.js`) | Makes a one-payment Stripe Payment Link when the client presses Pay, and switches it off once the invoice is paid |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js` | Set. The Stripe dashboard side (endpoint → `/api/stripe-webhook`, event `checkout.session.completed`) is still to do; until then use "Mark paid" |

The Supabase project URL and the publishable (anon) key in `data.jsx` only
read `site_content`, the public portfolio's own content. Every other table
has no public-read policy (`supabase/migrations/20261104_lockdown.sql`).

A daily Vercel Cron (`vercel.json`) calls `GET /api/design-brief`, which
runs one query so the free-tier Supabase project never pauses from
inactivity.
