# Decisions

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
