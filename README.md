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

Admin.html               Content editor (CMS), "The Scaffold" — served at /scaffold, not linked from the public site
admin.jsx                Admin app shell (editor + live preview split view)
admin-ui.jsx             Admin form primitives (fields, buttons, image/PDF upload)
admin-sections.jsx       Admin form sections (Identity, About, Videos, Designs, Résumé, Travels)

Carter Groff Design.html  Cargroff Design, the public design-service page — served at /design
design.jsx                Design page sections + the three-movement brief form
cargroff-design.css       Design page styles, built on parlor.css's tokens

Business Hub.html         The Business Hub CRM, door 02 of The Scaffold — served at /business
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

The Scaffold (`/scaffold`) is password-protected (checked in
`middleware.js` against the `ADMIN_PASSWORD` environment variable).

## Deployment

Hosted on Vercel, auto-deploying from the `main` branch of this repo.

**Required environment variables** (Vercel → Project Settings → Environment
Variables — set directly there, never committed):

| Variable | Used by | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | `middleware.js` | Basic Auth password for `/Admin.html` |
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
