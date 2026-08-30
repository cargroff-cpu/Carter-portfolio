# Decisions

## Second audit pass: the design moved (lampposts out, rings need to be visible), Design page rings and reveal were never ported

Carter sent a `FIXES.md` written against the live site plus an updated design
source where `cg-room.js` had shrunk from ~90 lines of lamppost SVG to 18 —
its own comment says the lampposts "rendered badly at most viewport sizes"
and were deliberately dropped in favor of ambient light alone. That directly
reverses the previous "Ring fidelity pass" entry below, which had just
*added* lamppost art. Removed it again: `business-hub.jsx`'s two `<img
className="lamp">` tags and mcc.css's `.launch .lamp` rules are gone,
replaced with the source's actual current room — three blurred ambient
blobs (`.a1`/`.a2`/`.a3`) plus grain, `position:fixed` behind everything at
`z-index:0`. Deleted `assets/lamppost.png` and the never-committed
`assets/sconce.png`, both now unreferenced — per the source's own
instruction not to add lamp art back.

`FIXES.md` also named two real gaps on `/design`, confirmed by comparing
against `source/Carter Groff Design.html`:

1. **The decorative rings were never built.** The source draws them as pure
   CSS (`.rings`/`.r1-3`/`.t1-3`, no JS) behind the hero and the brief
   section. This page's earlier build (`design.jsx`) is a from-scratch
   rewrite with entirely different class names, so the fix isn't a literal
   copy-paste — ported the same ring/tick-band technique onto `.dhero` and
   `#brief` instead of the source's `.open`/`#brief` selectors, as a `<Rings
   />` component reused in both places.
2. **No scroll motion at all.** The source's four systems (`reveal()`,
   `wordReveal()`, `stepLines()`, `atmosphere()`) are one ~270-line rAF
   loop covering per-word masked headings, connector-line draw-ins, a nav
   progress hairline, ember particles, and parallax on decorative props —
   none of which this page has (no props, no per-word markup, nothing to
   hang most of that on). Built the one piece that's a clean win regardless
   of that mismatch: a scoped `.up`/`useReveal()` IntersectionObserver fade,
   applied to each section's heading block and card/step grid. The other
   three systems stay unported — this is a narrower, deliberate line short
   of "identical," not an oversight.

Verified both pages by rendering them standalone through Playwright (as in
the prior audit entry) — the hero and brief rings and the Business Hub's
ring both now match the reference screenshots.

The FIXES doc's other two claims didn't hold up against this repo's actual
state: the Business Hub already used `assets/antler.png` for its mark (not
`logo.png`), and `assets/logo.png` itself is byte-identical to
`assets/antler.png` — already the antler crest, not "the old CG box mark."
Nothing to fix there; left as-is.

## Layout audit: a leftover stylesheet was corrupting the ring, and the room was too small

Carter said the ring looked better but the page's overall layout and the
lampposts still looked wrong, and asked for a full audit against the design
source now that the ground-truth static export (`source/Business Hub.html`,
`source/cg-room.js`) was available. Two real bugs found:

1. **`lamplight.css` was still linked into `Business Hub.html` and `The
   Docket.html`.** It's leftover from the retired Marketing Command Center
   (`.plate`/`.panel`/`.console` masthead treatment, see its own header
   comment) and neither current page's JSX uses those classes for that
   purpose — except Business Hub's ring, which *does* have a `.plate` class
   (the brass node buttons), and lamplight's `.plate` rule was clobbering it:
   `padding:16px 28px 0`, `justify-content:space-between`, and
   `min-height:132px` overriding the ring node's centered 56px square. That's
   the real cause of "the layout doesn't look right" — not a rebuild, a
   dead `<link>` tag. Removed it from both pages and deleted the now-fully-
   unreferenced file.
2. **The lampposts and ring were sized far smaller than the source.** Source
   CSS draws them as room-height fixtures (`.lamp{height:78vh}`,
   `.launch{height:calc(100dvh - header)}`); this build had them capped at
   `width:min(15vw,150px)` inside a `min-height:min(74vh,620px)` box, so the
   room never filled the screen the way the reference screenshots show.
   Resized `.lamp` to `height:78vh` (56vh under 1100px) positioned at
   `left:6vw`/`right:5vw` off the bottom edge, and `.launch` to
   `height:calc(100dvh - 60px)` (matching the 60px header height already
   assumed elsewhere in this file for the tool sidebar's sticky offset).
   `assets/lamppost.png` itself (a raster cast-iron lamppost, not the
   source's inline SVG) was already the right subject at the right aspect
   ratio — the CSS sizing was the only problem, so it stays as an image
   rather than porting `cg-room.js`'s ~90-line hand-drawn SVG for a visually
   equivalent result.

Verified locally: stubbed `window.CC`'s fetchers and rendered
`business-hub.jsx` standalone through Playwright (React/ReactDOM/Babel
pulled from npm since the CDN hosts aren't reachable from this sandbox) —
both the ring and a tool screen now match the reference screenshots.

## Ring interactivity pass: hover geometry, spokes, and the sidebar icon tint

Carter sent an actual runnable static export of the design (`source/Business
Hub.html` — real compiled CSS/JS, not the `.dc.html` preview-runtime
prototype), confirmed as ground truth by its own README. Reading it exactly
surfaced two real, high-impact gaps the earlier screenshot-based pass
missed:

1. **The sidebar's plate icons were missing a color filter**
   (`brightness(1.5) sepia(.35) saturate(1.5) hue-rotate(-12deg)`) — without
   it they render flat/gray instead of the warm brass tint the rest of the
   screen has. One-line fix, likely a good chunk of what read as "wrong."
2. **The ring had zero hover interactivity.** The source's ring is not a
   static wheel — hovering a node steps it in to `0.92r`, fans its
   neighbours outward (up to 16°, weighted by ring distance), lights that
   node's spoke, dims every other plate, and reveals a description line;
   hovering the center wick adds a warm glow. None of that existed before —
   the ring just sat there. Ported the geometry math from `wireOrbit()`'s
   `layout(hover)` (simplified: no DOM-measured label-overflow band/MINR
   correction, since the fixed 120px node width doesn't need it — radius
   comes straight from the orbit container's rendered width) as a React
   hover-state + inline-transform system. Added the spokes, the minor/fine
   tick-mark layers, and the ember motes that were also silently dropped.

Still not built, deliberately: the "carry" flight (plates physically flying
between ring and sidebar on navigation — genuinely described as "the
signature interaction" in the source's own README, real Web Animations API
choreography, high effort for a purely transitional flourish) and the
first-arrival collapse-then-launch animation. Both are pure motion on top
of navigation that already works; noted here rather than silently skipped.

## Ring fidelity pass: lampposts, tick band, persistent tool sidebar

Carter sent rendered screenshots of the actual design prototype (not
available before — earlier sessions only had raw `.dc.html`/`.css` source),
making clear the ring's simplification had gone further than intended: the
two flanking lampposts and the ring's tick-mark band are load-bearing
atmosphere, not optional decoration, and — the bigger structural gap —
every tool screen keeps the same six brass plates as a persistent left
sidebar once you're inside a tool, not a plain "← Ring" text link. Added
all three: `assets/lamppost.png` flanking the launcher, a
`repeating-conic-gradient` tick band on the ring, and a `ToolSidebar`
component mirroring `Business Hub.dc.html`'s `.tools`/`.tplate` sidebar
(same icons/labels/meta as the ring, current tab highlighted, collapses to
icon-only under 900px, hidden under 760px same as the ring itself). Notes
still isn't one of the six plates (wasn't in the source's six either) —
stays reachable from the top bar.

## Reverted the login/logout merge — it broke the shared session

Carter reported being asked to log in on every click between Scaffold
screens, not just on browser restart — a real regression. The prior fix for
Vercel's Hobby-plan 12-function cap had merged `api/login.js` and
`api/logout.js` into one file (`api/session.js`) reached via a
`vercel.json` rewrite (`/api/login` → `/api/session?action=login`). That
rewrite is the one thing this session changed directly in the auth
pathway, and auth is the highest-blast-radius place to have an unconfirmed
bug — reverted it back to the exact two-file code that worked before,
rather than keep debugging a live-untestable theory about rewrite/cookie
interaction. To stay at 12 functions, merged `api/wick-close-session.js`
into `api/wick-memory.js` instead (GET lists memory, POST closes a
session) — same technique, but dispatched by HTTP method on the file's own
stable URL rather than a rewritten query param, and on a much
lower-stakes feature than login. `wick.jsx`'s one caller was repointed
from `/api/wick-close-session` to `/api/wick-memory`.

## The ring: real radial nav, simplified geometry

Carter asked for the actual ring back after seeing the tab-bar version.
Built it: `Business Hub.dc.html`'s six-tool orbit, brass plates with icons,
Wick's glowing tube at the center linking out to `/wick`. Two things were
deliberately not replicated: the source's runtime-measured layout engine
(`wireOrbit()`, which measures every node's bounding box on resize to fit
the ring to the viewport) is replaced with fixed CSS custom-property angles
(`--a`) and a `clamp()`-style responsive radius — visually equivalent,
without the measurement code. And the "carry" animation (a tool's plate
visibly flying from the ring into a sidebar position on click) isn't
built — clicking a node just navigates, same as any other link here.
`Acquire` (proposals/referrals — out of scope, see below) is replaced by
`Clients` in the ring's six slots, since that's a real tool in this build
and Acquire isn't. `Notes` isn't one of the six — it wasn't in the source's
six either — reachable from the top bar instead, same as Docket.

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
