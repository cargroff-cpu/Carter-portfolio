# Decisions

## The Scaffold's Supabase project was deleted; everything now lives in one project

The Scaffold's business data lived in a second Supabase project
(`kvgeimwitzdlstagqumw`, separate from the portfolio's `rodxrkzwpsgeeatmbwku`)
— that's what the Docket, Wick, campaigns/links, and generated_content
already wrote to, and what `freelance-schema.sql` was written against.
Carter deleted that project (moved-device cleanup, believing it was
disposable "work stuff") before the Business Hub tables were ever created in
it, and confirmed he didn't want to attempt recovery. All of its data —
Docket tasks, Wick's memory and conversation history, campaign/link
tracking, generated content — is gone; nothing in this repo depends on that
data existing, only on the schema, which is version-controlled.

Fix, confirmed with Carter: consolidate everything into the one remaining
Supabase project rather than provisioning a new second project. Applied
`supabase-schema.sql` (superseding both `freelance-schema.sql`, now
deleted, and `content-builder-schema.sql`, kept only as a historical
pointer) directly via the Supabase MCP connection to `rodxrkzwpsgeeatmbwku`.
Updated every file that referenced the old project URL or the
`SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY` env var (`command-center-data.jsx`,
`api/scaffold-write.js`, `api/design-brief.js`, `api/create-invoice-link.js`,
`api/stripe-webhook.js`, `api/wick-brain-server.js`, `api/wick-close-session.js`)
to point at the portfolio's project and reuse the existing
`SUPABASE_SERVICE_ROLE_KEY` instead of a second key — one project, one
service-role key, no new Vercel env var needed. RLS policies mirror the
original design: public-read for anon-key tables (campaigns, links,
docket_tasks, generated_content, and the whole Business Hub CRM), no select
policy at all for `wick_*` tables (service-role only), matching
`api/wick-memory.js`'s documented intent.

Judgment calls made while building out the Business Hub CRM and the Cargroff
Design public page from `design-reference/`, per the build-to-completion
handoff. One entry per call, newest first.

## Stack: keep the existing architecture, don't rewrite to Next.js

The handoff doc this build followed was written against a hypothetical
from-scratch state (empty repo → scaffold as Next.js/TypeScript/Supabase) and
explicitly marked Wick as out of scope. Neither matches this repo: it's
already a deployed, no-build-step static HTML/JSX-via-CDN site wired to real
Supabase (`api/save-content.js`, `api/scaffold-write.js`, two live Supabase
projects), and Wick already exists and works (`Wick.html`, `wick.jsx`,
`api/wick-*.js`, real Claude tool-use). Confirmed with Carter: keep the
current stack, build the remaining pieces (Cargroff Design page, Business Hub
CRM) on top of it rather than rewriting. Wick stays as-is; the Marketing
Command Center stays removed (a prior session's deliberate call).

## Business Hub scope: the handoff's §6 schema, not freelance-views.js's full feature set

`design-reference/freelance-views.js` and `freelance-data.js` sketch a much
larger tool than the handoff's actual schema section asks for — proposals,
contracts, referrals, cut-version review, per-project time tracking, brand
kit storage, a "Mem"-backed cross-entity search ("Vault"), and Pipedrive-style
attribution. None of that is in the handoff's §6 table list. Built to the
handoff's schema instead: `clients`, `leads` (+ `lead_messages`), `projects`
(+ `project_deliverables`), `invoices`, `notes`, plus `design_briefs` (+
`design_brief_attachments`). The richer freelance-views.js feature set is a
reasonable v2, not this round's job — flagged here rather than half-built.

## Business Hub navigation: tab bar, not the radial "orbit" room UI

`Business Hub.dc.html`'s prototype nav is a radial ring of tool nodes over an
illustrated room (`cg-room.js`, `orbit.css`), inherited from the now-removed
Marketing Command Center. That CSS was never ported here (root `mcc.css` is
already a trimmed, non-radial rewrite used by the Docket) and the rest of
this Scaffold suite (Docket, Wick) uses a plain sticky top-nav + content
layout. Business Hub follows that same established pattern — a top nav with
Overview / Leads / Projects / Invoices / Notes / Design tabs — for
consistency with the rest of the suite, rather than reintroducing the retired
orbit UI for one screen.

## Design page: functional fidelity over animation-for-animation fidelity

`Carter Groff Design v2.dc.html` carries heavy scroll-driven motion (parallax
props, masked word reveals, an ember particle system, a scroll-linked nav
progress hairline). Ported the page's structure, copy, the three-movement
brief walker, and the Parlor visual language faithfully, but did not
replicate every decorative animation pixel-for-pixel — effort was spent on
the working brief-to-database-to-inbox pipeline instead, which is the part
that didn't exist before.

## `design_briefs` / CRM data lives in the Scaffold's Supabase project, not the portfolio's

The public `/design` page's brief submission needs to show up in the Business
Hub's Leads and Design-briefs inbox, which read from the Scaffold's Supabase
project (`kvgeimwitzdlstagqumw`), not the portfolio's content project
(`rodxrkzwpsgeeatmbwku`). `api/design-brief.js` writes there with the
Scaffold's service-role key, same pattern as `api/scaffold-write.js` — the
public page never touches the key directly.

## Docket's 4-quadrant board stays; CRM doesn't get its own kanban

The handoff's §6 flagged the Docket's quadrant design as an open call from an
earlier session. That's already shipped and working — not revisited here.

## Stripe and Resend are wired but need real API keys to go live

`api/create-invoice-link.js` (Stripe Payment Links) and the Resend call in
`api/design-brief.js` are written against `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and `RESEND_API_KEY` env vars that aren't set yet —
same pattern as `ADMIN_PASSWORD`/`SUPABASE_SERVICE_ROLE_KEY`: never committed,
set in Vercel. See `TODO(carter):` comments at each call site.
