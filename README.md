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

Back Room.html           The Back Room (private admin lobby) — served at /back-room (/scaffold redirects here)
Admin.html               Website Backend content editor (CMS), door 01 of The Back Room
admin.jsx                Admin app shell (editor + live preview split view)
admin-ui.jsx             Admin form primitives (fields, buttons, image/PDF upload)
admin-sections.jsx       Admin form sections (Identity, About, Videos, Designs, Résumé, Travels)

The Scaffold.html         The Scaffold, by Carter Groff — the public studio page, served at /design
design.jsx                Page source: Design + Automation lanes, FAQ, lane-aware brief form
design.js                 GENERATED from design.jsx (node scripts/build-design.mjs) — the page loads this
scaffold.css              Studio page styles, built on parlor.css's tokens

Business Hub.html         The Business Hub CRM, door 02 of The Back Room — served at /business
business-hub.jsx          Clients, leads (+ thread), projects (+ deliverables), invoices, notes, Design-briefs inbox
supabase-schema.sql       Full schema for the one live Supabase project (already applied) — Business Hub tables, Docket, Wick, campaigns/links
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

## Editing content

Open `Admin.html` and edit any section (Identity, About, Video Work, Design
Work, Résumé, Travels) — changes autosave as you type into the browser's
local storage as a draft safety net. Click **Save / Publish** to push that
draft live: it's written to Supabase, and the public site picks it up on
its next page load — no redeploy needed.

The Back Room (`/back-room`) is password-protected: `api/login.js` checks
`ADMIN_PASSWORD` and sets a signed, 8-hour session cookie (`lib/session.js`),
which `middleware.js` verifies on every private page and API. Private
tables are read through `/api/back-room-read` and written through
`/api/scaffold-write`, both server-side with the service-role key; the anon
key can only read `site_content`.

## Editing the studio page

`/design` loads the precompiled `design.js`, not `design.jsx`. After editing
`design.jsx`, rebuild:

```bash
npm install --no-save @babel/standalone@7.29.0
node scripts/build-design.mjs
```

## Deployment

Hosted on Vercel, auto-deploying from the `main` branch of this repo.

**Required environment variables** (Vercel → Project Settings → Environment
Variables — set directly there, never committed):

| Variable | Used by | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | `api/login.js`, `lib/session.js` | Back Room password; also signs session cookies unless `SESSION_SECRET` is set |
| `SESSION_SECRET` | `lib/session.js` | Optional. Signs session cookies independently of the password |
| `ANTHROPIC_API_KEY` | `api/brief-triage.js`, Wick, Content Builder | Not set yet. AI triage shows "off" until it is |
| `RESEND_FROM` | `api/design-brief.js` | Optional. A sender on a domain verified in Resend, e.g. `The Scaffold <studio@cargroff.com>`. When set, clients get a confirmation email |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/save-content.js`, `api/scaffold-write.js`, `api/design-brief.js`, `api/create-invoice-link.js`, `api/stripe-webhook.js`, `api/wick-brain-server.js`, `api/wick-close-session.js` | Full-access key, server-side only. One Supabase project, one key — see DECISIONS.md for why there used to be two |
| `RESEND_API_KEY` | `api/contact.js`, `api/design-brief.js` | Sends the portfolio contact form and design-brief notifications |
| `STRIPE_SECRET_KEY` | `api/create-invoice-link.js` | Set. Turns a draft invoice into a real Stripe Payment Link |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js` | Not set yet, deliberately deferred. Invoices still work via the manual "Mark sent"/"Mark paid" buttons in the Business Hub until this is wired up |

The Supabase project URL and public anon key are safe to expose client-side
and are already committed in `data.jsx`. Everything — the public portfolio's
content, the Docket, Wick, campaign/link tracking, and the Business Hub CRM —
lives in this one Supabase project; see `supabase-schema.sql` for the full
schema (already applied) and DECISIONS.md for why there used to be a second
project.
