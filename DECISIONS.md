# Decisions

## /design rebalanced: design and tools 50/50, broad not specific

Carter's feedback on the tools-first version: too much weight on the tools
side, and too specific about what he'd built for Operator. Changes:

- Hero is two equal halves: "Design that looks right. Tools that work
  right." with two equal CTAs (design brief, tools brief) and two equal
  illustrative panels (three drafts / an inquiry-to-follow-up chain).
- One "What I make" section replaces the eight-card "Tools I've built"
  section: Design and Tools side by side, six items each.
- Tool types are now broad and widely applicable (inquiries and leads,
  quotes and invoices, scheduling and bookings, dashboards and reports,
  reminders and follow-ups, AI assistants). The form, server whitelist,
  Hub tally and triage prompt use the same list.
- No Operator-specific modules anywhere. "Why me" says only that Carter
  leads marketing and automation at a local company.
- How it works gives each step a design version and a tools version. The
  brief's lane toggle is Design | Tools, defaulting to Design.

## /design goes tools-first, copy cut down

Carter's feedback on the first rework: the copy felt heavy, and the page
needed much more weight on the kinds of tools he builds. Changes:

- Hero leads with tools ("I build the tools that run the busywork"), with
  a job-won → labels → crew checklist → follow-up chain; the three-drafts
  visual moved into the Design section.
- "Tools I've built": eight cards for tools Carter has built for a
  log-home restoration company, each with a short flow line. Kept generic
  on purpose (Carter's call): no platform name, screenshots or data.
- "What I can build for you": eight tool kinds linking into the brief with
  that kind pre-selected. The brief defaults to the tools lane.
- "How a tool gets built" states the rules: prove it by hand first,
  automate the bottleneck, a person approves anything customer-facing.
- Design is one shorter section; copy and FAQ trimmed throughout. Why me
  uses Carter's current title.

## 2026-11-04 assessment: open for business safely, The Scaffold, two lanes

Worked from the "Carter Groff Design — Full Assessment" doc. What changed
and why, in the order the assessment ranked them:

- **A database outage can't eat a lead any more.** `api/design-brief.js`
  now emails the full brief (with a reference number like `TS-261104-AB12`)
  *before* writing to Supabase; a failed write sends a separate alert email
  and the visitor still sees success. Every attempt is logged to
  `brief_events`. A daily Vercel Cron hits `GET /api/design-brief` so the
  free-tier project doesn't pause from inactivity (it had: the project was
  INACTIVE and every brief was failing).
- **Client data is no longer world-readable** (once the migration runs).
  The Business Hub and Docket read through the new `api/scaffold-read.js`
  behind the session check instead of the browser holding the anon key;
  `supabase/migrations/20261104_lockdown.sql` drops every public-read policy
  except `site_content`'s. Order matters: deploy, *then* run the migration.
- **The login cookie is no longer the password.** Signed 8-hour token
  (`lib/session.js`, HMAC with `SESSION_SECRET`), constant-time password
  check, 5-attempts-per-15-minutes rate limit. The limiter (and the brief
  route's) is in-memory per serverless instance: blunt, not distributed.
- **Spam:** hidden honeypot field + per-IP limit on the brief route.
- **AI triage v1** (`lib/brief-triage.js`): every brief gets a summary,
  lane, scope, missing info, red flags and a draft reply, shown as a card in
  the Business Hub's Design tab with Approve & send / Edit / Reject
  (`api/brief-reply.js`). It never sends on its own. The brief goes to the
  model as tagged data with no tools; output is shape-checked and anything
  off-format is discarded. `RATE_CARD` is empty, so it never suggests a
  price (enforced in code, not just the prompt) until real prices exist.
- **Name:** public brand is **The Scaffold, by Carter Groff**; the private
  admin tools are renamed **The Back Room** (`/backroom`; `/scaffold`
  redirects). File names (`Scaffold Hub.html`, `api/scaffold-*`) were left
  alone to keep the diff to what visitors and Carter see.
- **The /design page:** Design and Automation lanes (automation in a brass
  accent), hero shows one brief beside three drafts, "AI drafts the
  options, I finish every file" said plainly, How it works rewritten around
  the real workflow, portrait + first-person Why me, an 8-question FAQ with
  "Do you use AI?" first, 3-column services grid (no empty cells), brighter
  body text and 12–13 px labels. The four "drop images here" placeholder
  slots are gone: `WORK` and `TESTIMONIALS` arrays in `design.jsx` render
  only when they have real entries. Prices are wired but hidden behind
  `SHOW_PRICES = false` (the numbers are the assessment's placeholders).
  Brief: lane toggle, automation questions, budget as ranges, optional
  uploads (3 files, 2.5 MB each, to a private `brief-uploads` bucket).
- **Page build:** `/design` now loads production React and a precompiled
  `design.js` (`npm run build:design`) instead of React's dev build plus
  in-browser Babel, and ships real HTML in `#root`, OG/Twitter tags and
  `ProfessionalService` structured data. The Back Room pages keep in-browser
  Babel; they're private and not worth a build step.
- **Wick and the Content Builder were removed** at Carter's request (pages,
  API routes, `lib/wick-brain-server.js`, the Hub/Docket dock). Their tables
  are left in the database untouched. This also freed three of Vercel
  Hobby's 12 function slots; `api/` is at 11.
- **Analytics:** the Vercel Web Analytics script is on `/` and `/design`;
  it records nothing until Web Analytics is switched on in the dashboard.

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

## /design: the Dial with Two doors (Hallmark pass, November 2026)

Carter picked the "Dial" direction from five Hallmark options that keep the
Parlor look, combined with the "Two doors" section. Page order is now: hero
over the rings, the two halves (Design: three drafts you can pick; Tools: a
short brass session that types once), How it works on a dial (all four step
names stay visible; choosing one moves the needle and opens its detail), the
services shelf with turnarounds, I'm Carter, the brief beside a large "2 days"
(or "1 day" on the Tools lane), then the FAQ.

Kept: Parlor tokens and faces, the antler crest, the rings, square buttons,
amber for Design and brass for Tools, all the brief's fields and its post to
`api/design-brief.js`. Dropped: the tracked-capital labels (now sentence
case), the italic amber second line and italic brand word, arrows in button
text, the "01 / 04" counters, the proof strip under the hero and the hero's
small two-card visual (it became the two-halves section). Hidden-until-reveal
states are now scoped under `html.js`, set by an inline script in the page
head, so content shows if scripts fail.

## /design hero: the portfolio's lamp post on wood, inside an engraved seal

The hero now uses the portfolio's own room: the 34px wood panels with sawn
grain (also on How it works), a deep vignette, and the portfolio's GasLamp
on the right with its pool of light. The old spinning CSS rings are replaced
by an engraved seal centred on the lamp's globe, drawn like the How it works
seal: hairline rings, a slow ring of lettering, counter-turning ticks.
Clicking the globe snuffs the lamp, as on the portfolio.

GasLamp is not duplicated: `scripts/build-design.mjs` copies the function out
of `motifs.jsx` into `design.js` at build time, so rebuild /design after
changing the lamp.

Update, same day: after five hero options, Carter chose "Medallion and
lamps", with bigger lamps and more colour. The hero is now centred: a
medallion (the crest in gold on a green enamel disc, inside the engraved
seal) between two of the portfolio's lamp posts at nearly full height, each
throwing a warm pool on the wall and the floor. Each globe still snuffs its
own lamp. The single-lamp, text-left hero above is replaced.
The hero's background is the portfolio hero's own, copied value for value
from themes.jsx and portfolio.jsx: the `.cg-wood` 34px panels and sawn grain,
a `.cg-candlelight` pool at each lamp, three fog banks rolling across, and
the same deep vignette. A brighter custom wood was tried and dropped.

## /design: Hallmark audit fixes, and its own address (scaffold.cargroff.com)

A Hallmark audit of the live page found these, all now fixed:

- **Floor findings**
  - Too many words per screen: the service rows lost their one-line descriptions, and tool rows say "quoted after a short brief" once instead of on every row.
  - Low-contrast greys: `--ink-mute` is now the portfolio's AA value `#9a8462`, and the session comments and form placeholders use it.
  - A dash in the title: it is now a colon.
  - Old tracked-caps and literal-colour rules from the shared `parlor.css`: /design no longer loads `parlor.css`. The tokens and base rules it used are copied, tokenized, into `cargroff-design.css`, so the Back Room pages are untouched.
- **Reflex findings**
  - Sections now vary their surface and spacing: soft ground, wood, plain, wood, deep, soft. Lamplight continues onto How it works and I'm Carter.
  - I'm Carter has a large portrait, with the three rules set large.
  - The FAQ sits beside its heading.
  - There is one primary button style: no brass button, and no hover glow.
  - The lamp drawing (80) and the centred hero (6b) are waived on the record in the stamp.

The page also gets its own address. `scaffold.cargroff.com` is added to the Vercel project, a host-matched rewrite serves the page at its root, and `www.cargroff.com/design` redirects there (302 for now; switch it to permanent once the subdomain is settled). Canonical, OG and JSON-LD URLs point at the subdomain, and the page's Portfolio links go to www.cargroff.com. DNS for cargroff.com is on Cloudflare, which needs a CNAME `scaffold` pointing to the target Vercel gives, set to DNS only.

## /design: motion and character (Impeccable pass)

- **Focal moment:** the hero medallion. On load its tick ring spins up and settles into a slow turn. The gold rim and amber ticks breathe on a six-second beat, two rings ripple out from it in turn, and light passes over the gold crest.
- **The brief:** it returns to the original page's centred composition. The crest, a large heading and the meta line sit with the engraved ring turning behind them and a lamplight glow above, and the ring fades out before the form. The large "2 days" figure is folded into the meta line.
- **Two kinds of work on phones:** a Design | Tools switch shows one list at a time.
- **Supporting motion:**
  - The drafts are dealt onto the sheet the first time it comes into view.
  - The How it works lozenge pulses.
  - Nav links draw an amber underline on hover.
  - The identical fade-up on every section is gone.
- **Looping and reduced motion:** looping motion pauses when its section is off screen. Reduced motion turns off every loop and spatial movement.

## /design hero mark: twelve hours over a green glow

The medallion felt boxy (a dark band and a hard-edged enamel disc). After five open options, Carter chose "Twelve marks" with green added:

- The gold crest sits over a soft, edgeless green glow.
- Twelve amber marks hang in a wide circle round it like the hours, with no outline.
- The marks light one after another, so the pulse travels round the crest.
- The circle spins up on load and then turns slowly, the glow breathes, and light passes over the gold.
- The brief's engraved ring is unchanged.

## Portfolio polish: the Scaffold's Hallmark rules, applied to www.cargroff.com

The portfolio keeps its look (the lamp, rain, candles, wood, Cormorant and its
italic second lines) and takes the same fixes the Scaffold page got:

- Labels are Karla in sentence case at 13px, untracked; no tracked capitals
  anywhere on the page. The section eyebrows above each heading are gone (the
  nav already names each section), and the hero's eyebrow line went with them
  (its year and town are in the hero's meta row and the footer).
- No dot-joined strings, no glued arrows, no dashes in titles or meta.
- "See the work" is now the page's one filled button, visible at 1280 by 800.
- The footer's design-services link goes to scaffold.cargroff.com.
- The tab icon is the Scaffold's gold antler set, served at /favicon.ico for
  every host (the old black antler vanished on dark tab bars).
- The page is precompiled: `npm run build:portfolio` turns themes, data,
  motifs, portfolio and app into `portfolio.js`, each file in its own scope,
  and the page loads React's production build. Visitors no longer download
  and run in-browser Babel. Admin.html still compiles the .jsx in the browser.
  Commit portfolio.js after editing any of those sources.
- Decorative SVGs carry aria-hidden; the travel map has a label; the follower
  count jumps straight to its value under reduced motion.

Kept on purpose: the italic accent words in the headings ("Six recent
*pictures*.") are the portfolio's signature, and the inline overlay colours
stay as they are.
