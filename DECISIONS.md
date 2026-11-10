# Decisions

## 2026-11-06 operations audit: fixes before the first real client

An end-to-end audit (code, Supabase, Vercel) found the workflow sound but
never exercised, with a handful of places that would stall or mislead on the
first paying job. Fixed here:

- **Scaffold page editor could not publish.** `site_content` only allowed
  `id = 1`; the editor writes id 2. Constraint is now `id in (1, 2)`
  (`supabase/migrations/20261106b_audit_fixes.sql`, applied 2026-11-06, along
  with dropping three unused `design_briefs` columns and indexing three
  foreign keys).
- **Briefs can be answered without AI.** The brief card always shows a reply
  box; AI triage, when `ANTHROPIC_API_KEY` is set, only pre-fills it.
- **"No reply needed" closes the brief's job** (if it never got past New), so
  it no longer sits on the board asking for a proposal.
- **Mark as sent** on a proposal makes it acceptable on the client's page
  without the email, for proposals shared another way (`api/job.js`
  `mark-sent`).
- **One Mark paid.** Both buttons call `api/job.js` `mark-paid`: logs it,
  switches off the Stripe link, moves the job to Paid when nothing issued is
  left unpaid. Previously the Money tab's button did none of that.
- **No double payments.** Payment Links take one payment
  (`restrictions[completed_sessions][limit]=1`) and are deactivated when the
  invoice is paid (webhook or by hand). An invoice whose amount is edited
  drops its old link so Pay makes a fresh one.
- **Webhook:** 5-minute timestamp tolerance; accepts any of several `v1`
  signatures; draft invoices no longer keep a job from reaching Paid.
- **Final invoice** counts only issued invoices (sent, paid, overdue) toward
  what is already billed.
- **Needs you** no longer keeps "send the directions" or "revise and resend"
  after that email has gone out.
- **Save as client** on a job creates (or links) a client; the Clients empty
  state no longer claims this happens on its own.
- **Docket:** every re-ranked task is saved (order no longer resets on
  reload), failed saves show a message, the date label sets a due date, and
  on touch screens a small menu moves a task between columns.

Left as decisions for Carter, not changed: whether the deposit should gate
the directions (today accepting moves straight to Drafts), and whether
"Ask for changes" should stop once the included rounds are used.

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
  admin tools are renamed **The Backroom** (`/backroom`; `/scaffold`
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
  `ProfessionalService` structured data. The Backroom pages keep in-browser
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
  - Old tracked-caps and literal-colour rules from the shared `parlor.css`: /design no longer loads `parlor.css`. The tokens and base rules it used are copied, tokenized, into `cargroff-design.css`, so the Backroom pages are untouched.
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

## Scaffold hero: a lane of lamps receding into fog

Picked from ten hero options, then five combinations that kept the centre
(crest, twelve hours, rays, green glow). The hero now stands at the end of a
lane of four pairs of the portfolio's lamp posts. Each farther pair stands
higher up the lane, smaller and closer to the middle, dimmed and softened,
with a bank of fog (a dark veil plus a drifting light wisp) rolling in front
of it, so the lane drifts away behind the medallion. A faint amber path runs
down the middle. Every globe still snuffs on click.

On phones the hero stays as it was before the lane: just the tops of the two
near lamps. Carter tried a phone lane (first one blurred pair, then three
pairs in perspective) and preferred the two lamps. The other pairs are hidden
with `visibility`, not `display`, because every GasLamp shares one set of
gradient ids and a display:none copy earlier in the page breaks the lit ones.

## Scaffold hero: the lamps come in on load

The lamp posts fade up out of the fog when the page loads, pair by pair from
the back of the lane to the front (0.3s, 0.8s, 1.3s, 1.8s, each over 2.4s):
each rises a little, settles, and flickers once like gas catching. On phones
the two lamps come in at 0.4s. Reduced motion shows them at once.

## The Scaffold offers websites

Website design and production joins the Design half: "Websites: designed,
built and launched, then kept running", quoted after a brief (no from-price).
To keep six items a side, "Cards and print" and "Flyers and one-pagers" merge
into one "Cards, flyers and print" line; both brief options stay. "Website"
is added to the brief's design options, the server's allowed list
(api/design-brief.js) and the Backroom hub's service list. The hero line,
search description, JSON-LD and no-script copy now name websites, and the FAQ
says websites are quoted like tools.

## Scaffold: even halves, "tools" not "small tools", back end said plainly

- The Design and Tools columns in What I make share rows (CSS subgrid at
  desktop widths), and every list row has the same minimum height, so a
  blurb that wraps on one side no longer pushes that list and its button down.
- The hero lamps hide the shared drawing's curved white glint on the right of
  the glass (scaffold only; motifs.jsx and the portfolio are unchanged).
- Carter's call: say "tools", never "small tools". Hero line, tools blurb,
  the example caption, How it works, meta and no-script copy updated.
- Websites read "Websites, front and back end", with an FAQ answer listing
  the back end (logins, databases, payments, forms, admin pages); meta,
  JSON-LD and no-script copy say front and back end too.

## Scaffold hero on phones: the lamps light, they don't slide

On phones the lamp-in animation (rise and fade of the whole cropped lamp top)
read as a picture sliding into place. Now the posts stand still and dark from
the start, and the gas catches: the glass's dark overlay and the halo
sputter to full light over about two seconds, the left lamp at 0.5s and the
right at 0.95s, then the usual slow candle flicker takes over. Desktop keeps
the lane coming in out of the fog. Reduced motion shows them lit at once.

The Websites line is "Websites" with "front and back end" as a side note to
its right: Karla, 14px, muted, on the same line (`sub` on the service, shown
as `.dlist-sub`).

## Scaffold lamps: variations, not weathering

The lane's lamps were one drawing copied eight times. Each post now leans and
sizes a little differently, and each pair carries its own ironwork (a scroll
under the lantern, a lamplighter's bar, a brass plate, extra collars); the
flames flicker out of step. Desktop only; phones stay upright and plain.

Tried and dropped at Carter's call: verdigris, rust and stains (they read as
a straight line down the middle), film grain and the edge light. Left out for
now: a wider glow round each flame, a pool of light on the boards, drifting
dust. motifs.jsx is untouched, so the portfolio's lamp is unchanged.

The brass plate on two of the lamps read as a stray orange box on the post, so
it is gone; those lamps take a collar or a lamplighter's bar instead.

## The Backroom gets a Scaffold Backend

scaffold.cargroff.com's copy and lists are now edited from the Backroom, like
the portfolio: /backroom/scaffold (Scaffold Admin.html + scaffold-admin.jsx),
behind the same login (middleware.js) and logout-on-close.

- Editable: hero headline and line, the Design and Tools lists (name, small
  side note, turnaround, price, and which brief option the row opens), the
  show-prices switch, the four How it works steps, About you (heading, intro,
  rules), Questions, and Kind words (real client quotes; hidden while empty).
- Storage: Supabase site_content row 2 (row 1 stays the portfolio). The table
  is public-read; writes go only through /api/save-content, which now takes
  ?page=scaffold for row 2. No new function, so the Vercel function count is
  unchanged.
- The page reads row 2 at load (applyScaffoldContent in design.jsx, waiting
  at most 1.5s) and merges it over its defaults; missing or malformed fields
  keep the default. Brief options are a fixed list (they must match
  api/design-brief.js), so the editor picks from them rather than typing new
  ones. How it works only takes a full set of four (the dial has four stops).
- The editor's defaults come from design.jsx itself: npm run build:design
  now also writes scaffold-defaults.js, so they cannot drift.
- Drafts autosave in the browser; Publish pushes them live; Discard returns to
  what is live.
- Not covered: the page's no-script fallback text and search description in
  Carter Groff Design.html, which stay as written in the file.
- The Backroom's doors are now Portfolio Backend, Scaffold Backend and
  Business Hub, on one row on desktop and stacked on phones.
- The sconce (the tall light bar on the right, a horizontal bar on phones)
  is back as the room's light. Wick is retired, so it is decoration only: no
  link, no label, it ignores the pointer, embers drift up gently, and it
  holds still under reduced motion.

## Backroom: no more random sign-ins, and the light bars light up again

- Cause of the random sign-in: every Backroom page sent a logout beacon
  whenever it was left in any way except clicking a same-origin link (Back,
  refresh, closing a tab, switching apps on a phone), so the next page found
  no session and showed the sign-in. The beacon is gone from all five pages.
- The session cookie is now a browser-session cookie (no Max-Age): it ends
  when the browser closes, the signed token still expires after 8 hours, and
  the Backroom footer has a Sign out button that clears it at once.
  Trade-off: a Backroom tab left open stays signed in until the browser
  closes or 8 hours pass, instead of ending the moment the tab closes.
- Wick stays retired, but the light bar in the Business Hub's tool wheel is
  back (a non-link div at the centre) and brightens on hover, like the sconce
  on the Backroom page, which surges again when you rest on it. Neither does
  anything when clicked.

## One simple workflow: brief to paid

- A brief now opens a job. Each job moves through New, Proposed, Directions
  (drafts), Final and Paid, or is closed if it is dropped. It all lives in
  four new tables: jobs, proposals, job_files and job_events. The empty
  lead, project, campaign and link tables are dropped
  (supabase/migrations/20261106_workflow.sql; apply it when this merges).
- Each job has a private client page at scaffold.cargroff.com/j/<token>.
  The long random token is the only key. Opening the page never changes
  anything; only the buttons on it do: accept the proposal, pick a
  direction, ask for changes, approve the final, pay.
- Payment is set per proposal: half up front and half on approval, or all at
  the end. There is no card fee. Invoices are made automatically when the
  client accepts and when they approve. Pay opens a Stripe Payment Link,
  created when first clicked and reused after that. The Stripe webhook marks
  the invoice paid and moves the job to Paid once nothing is still owed.
- Directions and finals can be uploaded files (private storage, signed links
  that expire after 6 hours) or links (Canva, Figma, Drive).
- Emails go out from the job page. Templates cover the proposal, directions
  ready, final ready, invoice, a reminder and a note, and each one can be
  sent as a test to Carter first. Every email uses one branded frame
  (lib/mail.js) with one button to the client page. Client emails stay off
  until RESEND_FROM is set on a verified domain.
- The Business Hub's tool wheel is now Today, Jobs, Proposals, Mail, Money
  and Clients. Removed with the old marketing board: brand kits, campaigns,
  links, the Pipedrive goals route and the manual invoice-link route.
- The tools brief has an optional "Your plan or spec" upload, up to 25 MB.
  It goes straight to a private bucket and shows with the brief's other
  attachments.
- Ideas borrowed from the work platform (a client page opened by a token
  link, pay-on-click Stripe links, a single email frame) were rewritten from
  scratch. No code, names or data were copied.

## Backroom as a phone app

- The five Backroom pages link a web app manifest (backroom.webmanifest):
  name "Backroom", opens at /backroom full-screen with the Scaffold crest
  icon and the room's dark colour. On a phone, use Add to Home Screen
  (iPhone: Share, then Add to Home Screen; Android: the browser menu, then
  Install app).
- It is the same site, not a separate app: no store listing and no offline
  mode. There is deliberately no service worker, so private pages are never
  cached on the device.
- The sign-in cookie lasts for the browser session. An installed app may
  ask for the password again more often than a browser tab does.

## Backroom on phones

- Phone-only styles (760px and under) in mcc.css and Business Hub.html;
  desktop is unchanged. Labels are 12px with tighter spacing instead of 9-10px
  spaced capitals, muted text is brighter, fields are 16px so iOS does not
  zoom in on focus, buttons are 44-48px, and file pickers are styled.
- The Business Hub's tools sit in a bar at the bottom of the screen (Today,
  Jobs, Proposals, Mail, Money, Clients), so you can switch without going back
  to the wheel. The wheel becomes a list with the count beside each name and
  the blurb under it, and the centre light bar lies flat across the top.
- Jobs are tiles inside each stage. The header is one row.

## The Backroom: one name, no client brands

- The name is "The Backroom" (one word) everywhere it shows: page titles,
  the home-screen app name, headings and emails.
- Nothing in the Backroom or the repo mentions Log & Timber Worx or Squeeky
  Clean as clients any more. The Docket has no brand filter or dots (every task
  is just a task), and the old brand guides, the design-reference mocks
  (campaigns, Wick) and the two client logos are deleted. They stay in git
  history if ever needed. supabase/migrations/20261107_docket_brand.sql
  removes the old brand values from the database.
- Left alone on purpose: the public portfolio's own work history and résumé
  (cg-store.js, data.jsx, admin-ui.jsx) still name Log & Timber Worx, since
  that is Carter's real employment, not Backroom data.

## Client page and Today dashboard

- The client page (/j/<token>) has one screen per stage and a four-part
  progress line (Proposal, Directions, Final, Paid), laid out like the
  studio's existing client tools, but it looks like the Scaffold's public
  site: lamplit dark wood, Cormorant headings, sentence-case labels, hairline
  rules and square bone buttons. No cream card, bands or capital labels.
- One screen per stage: waiting, proposal with Accept, directions with Pick,
  final with Approve or Ask for changes, and an all-done screen with the files
  and payments. Anything owed shows as a Payment block at the top; the
  proposal and directions stay under "Look back at your project".
- Today is a dashboard for the Scaffold only: five clickable cards (Needs
  you, Open jobs, Proposals out, Due to you, Paid this month), a Needs you
  list, paid by month for six months, a pipeline by stage and a latest
  activity feed. A greeting and a New job button sit at the top.

## 2026-11-06 — One motion layer for the Backroom

- `motion.css` is linked from every Backroom page and the client page. Things arrive once on mount (a short rise, staggered and capped), charts draw themselves, KPI numbers count up, tabs and pages cross-fade, and buttons and cards respond to a touch or press.
- Only transform, opacity and colour move, never width or height. Arrivals use `fill-mode: backwards` so hover transforms keep working after they finish. All movement sits behind `prefers-reduced-motion: no-preference`, and the count-up checks it too.
- Page-to-page fades use `@view-transition` (Chrome, Safari 18+); other browsers just navigate as before. There is still no service worker.

## 2026-11-06 — Clients tab in the studio's client-tool layout

- List page: a title and Add client button, four summary cards (clients, open jobs, paid all time, owed), search, and a table of clients with jobs, paid, owed and last activity.
- Client page: back link, name and email, tabs (Overview, Jobs, Money, Activity). Overview holds lifetime figures, editable notes, recent activity and open jobs.
- Kept to what the Scaffold needs. Ideas and layout only from the studio's tool; no code, names or data copied. Jobs match a client by id or email; money comes from their jobs' invoices.

## 2026-11-06 — Mail templates as boxes, and an email dialog with a live preview

- Mail > Templates is a grid of boxes (name, subject, opening line, when it is used). Click one to read the whole email as the client sees it, drawn in the same paper frame as `lib/mail.js`, with made-up details.
- The email sender is now a dialog like the studio tool's: a note on where it sends from and where replies go, To, Subject, Message, a status line, Cancel and Send. Added in the Scaffold's look: template chips, a heading and button option, a live preview beside the form (a Write/Preview switch on phones), and Send a test to me.
- A client's page can open the same dialog on their latest job. The sending API is unchanged.

## 2026-11-06 — Emails in a darker, lamplit frame

- `lib/mail.js` now renders a dark card (warm near-black, cream type, amber accents): an amber band on top, a crest header with "The Scaffold, by Carter Groff", a large heading with an amber rule, an amber button, and a darker footer with the sign-off. It declares `color-scheme: dark` and uses `bgcolor` attributes so mail apps keep it dark.
- All text is cream or soft tan on the dark surface (7:1 or better), links are lit amber and underlined. Still tables and inline styles only; everything typed is escaped. The Backroom's preview matches.

## Scaffold on phones: the desktop page, fitted

Carter found the phone page crowded and in your face. Four bigger rethinks
(merged sections, chapters, a contents list) were turned down in favour of
keeping the desktop page as it is and only fitting it to a phone. Phone-only
rules (899px and under) in cargroff-design.css, desktop unchanged:

- 24px side margins instead of 16px.
- A slimmer header whose Start a brief is an outline, so the hero's is the
  one filled button on screen. Section buttons are outlines on phones too.
- The hero is sized to its content, not the screen, and the headline breaks
  between its sentences ("Design that looks right." / "Tools that work
  right."), one line each from 360px up. design.jsx wraps each sentence in a
  span; desktop reads exactly as before.
- Headings one size down, body text 16px.
- The two halves of What each half looks like are split by a hairline; the
  drafts sheet and the terminal are inset, with a smaller terminal font.
- The dial sits above its steps (as it sits beside them on desktop), smaller.
- The menu cards are inset from the edges with tighter type, so most rows fit
  on one line; the portrait is capped at 320px.

### Fewer Start a brief buttons on phones

Carter: too many Start a brief buttons. On phones there is now one at a time.
The hero's is the only one at the top; the header's fades in once the hero is
behind you (a scroll check in Nav, phone CSS only), and "See the work" is a
quiet text link. The buttons under each example and inside the menu card are
hidden on phones (the card's rows and the header still open the brief).
Desktop keeps every button.

### Two kinds of work: a swipe on phones

The two menu cards (Design, Tools) now sit side by side in a snap-scrolling
row on phones, each 84% wide so the next card peeks in from the edge. The
Design | Tools switch follows the swipe and jumps to a card when tapped, and
a hint line under the row ("Swipe for Tools" / "Swipe for Design") flips the
card too. Desktop still shows both cards in two columns.

### The swipe gets character (and loses its buttons)

The Design | Tools buttons above the phone swipe are gone; two dots and the
hint line below it (with a nudging arrow) show where you are and also jump to a
card. As you swipe, the card coming in straightens, lifts and brightens while
the one leaving tilts away and dims (driven by scroll position through a
`--a` custom property); the new card's crest and name pop and its lines rise in
one after another; the Tools card gets a lamp glow. The next card nudges in
from the edge once, the first time the cards come into view. Reduced motion turns all
of it off. Desktop is unchanged.

Follow-up: the nudge was too much on repeat, so it plays once the first time
the cards scroll into view (an IntersectionObserver in Make) and never again.
Then softened again: one slow 12px ease out and back, no bounce.

## 2026-11-06 — Business Hub: the ring is gone, Today is home

Carter: the ring was an extra step. The Business Hub now opens straight on
Today with the tool sidebar (bottom bar on phones) always showing. Removed the
Ring launcher, its lamps, the fly-to-sidebar hand-off and the hidden "ghost"
sidebar (business-hub.jsx), the ring/launch styles (mcc.css, motion.css), and
motifs.jsx from Business Hub.html (only the ring's lamps used it there). The
header's back link is "← Backroom" everywhere except a job page ("← Jobs"),
and the header's Home link is now "Today". Old `#ring` links land on Today.

## 2026-11-06 — Business Hub: tabs on top, Scaffold type (layout options 4 + 1)

Carter picked option 4 (tabs on top) with option 1 (cleaner type) from five
mockups. On a computer or tablet the tools are a row of tabs under the
header, sticky just below it (its height is measured into `--toph`), and
every screen gets the full width. On a phone and in the home-screen app the
same tools stay a bar at the bottom, where a thumb reaches; only its styling
changed. Type follows the Scaffold: sentence case instead of small spaced
capitals, bigger and brighter small text, cream buttons in sentence case.
Today's numbers are one ruled row and the panels sit on hairlines with no
boxes. The header's "Today" link is gone (the Today tab does that). All of
it lives in Business Hub.html's own styles, so the Docket, which shares
mcc.css, is unchanged.

## 2026-11-06 — Sidebar back; an opening that plays once per visit

- Carter preferred the sidebar to the top tabs, so it's back on computers and
  tablets (sticky under the header, sentence case). The Scaffold type from
  option 1 stays. Phones and the home-screen app keep the bottom bar.
- Opening (`Intro` in business-hub.jsx): the antler crest lights over a green
  glow inside the Scaffold's dial (a ring that draws itself, twelve amber
  hours, slow fine rays), "Business Hub" rises under it, then the crest flies
  into its place in the header and the page settles in. About two seconds; a
  tap skips it. It plays once per visit: the flag is in sessionStorage, which
  lasts while the tab or home-screen app is open, so moving between tools or
  reloading doesn't replay it, and closing and reopening does. Reduced motion
  never plays it.

## 2026-11-06 — Leads tool in the Business Hub; polish pass

- New **Leads** tool between Today and Jobs: the briefs coming in and the
  jobs not yet won (New, Proposed, Directions, Final). It reads the data the
  hub already loads, so there is no database change.
- One focal number, the open pipeline value (proposal totals for jobs still
  in play). Under the title a tab row: Overview (stage cards, Needs you, New
  briefs), Pipeline (the existing jobs board), Contacts (the existing
  Clients), Activity (every job event) and Reports (briefs per month, typical
  time to reply, proposals accepted, average accepted proposal, design vs
  automation briefs, jobs paid).
- Tabs sit under the title on every screen size. On a phone the tools bar
  already owns the bottom of the screen, so the tab row scrolls sideways
  instead of adding a second bar. The last tab used is remembered for the
  visit (sessionStorage); arrow keys move between tabs.
- No ring: the ring stays out of the Business Hub, as decided in #50.
- Polish, all in Business Hub.html's own styles, no behaviour change: header
  links and list rows reach 44px, visible focus rings, tabular numbers,
  balanced headings, a hover state on job cards. Docket and the rest of
  mcc.css untouched.
- Not changed: any API route, migration, or Stripe/session setting. The
  remaining audit items (register the Stripe webhook, set SESSION_SECRET,
  rotate the Backroom password, check the Resend domain) are dashboard steps.

## 2026-11-07 — CRM tools in the Business Hub (from the crm-designer / custom-CRM skills)
- Added: Tasks (own Leads tab, plus Follow-ups on every job and client; overdue job tasks feed Needs you), header search across clients/jobs/briefs ("/" focuses it), CSV export (jobs, clients, tasks; cells starting = + - @ are quoted against spreadsheet formulas), duplicate check on Add client plus a Possible duplicates panel with Merge, custom fields on clients, and Call/Meeting entries in a job's History.
- Database: supabase/migrations/20261108_crm_tasks_fields.sql adds crm_tasks and clients.custom. NOT APPLIED. The Hub shows a setup note instead of failing until it is run. Duplicate detection is app-level on purpose: a unique email index would fail on any existing duplicates.
- Notes reuse job_events (kind note, meta.type note/call/meeting), so no table for them.
- Also fixed: Remove client threw a ReferenceError because deleteClient was never pulled from window.CC.

## 2026-11-06 — The Scaffold hero gets a black cat

A small 3D black cat lives in the hero's lamp lane (`scaffold-cat.js`, model
`assets/cat/scaffold-cat.glb` from the Blender pipeline, 29 clips). It walks in
from the side, wanders between the posts, sits and loafs under the lit ones,
walks back into the fog to the far lamps, and plays with the cursor: it watches
it, chases a cursor on the ground, stalks, wiggles and pounces, swats at one
hanging just over its head, chatters at one it can't reach, then gets bored and
grooms. Clicking it makes it sit and slow-blink. Snuffing the lamp it's resting
under makes it look up and move.

- **Fits the lane, not a separate 3D scene.** The lane is DOM layers, so the
  cat reads its ground from the lamp rows every frame: screen height, scale and
  spread come from the measured rows; depth is integrated from them so walking
  away moves the paws exactly as fast as they push the ground.
- **One layer, own fog.** The canvas sits just behind the near posts (z 6).
  The walkable ground never reaches the mid/far/back posts on screen, so the
  cat doesn't need to slip under each CSS fog bank; the banks it's behind are
  laid on it as haze (60% strength) that ramps across each row, plus the rows'
  brightness/blur. Under the real banks a black cat vanished at the back.
- **Smooth by construction.** Eased, normalised crossfades; walk/trot/run are
  phase-synced and speed-blended; walks stop on the gait's phase 0 so
  `walk_to_idle` starts from an identical pose; transition clips move the cat by
  per-frame travel sampled from the GLB's planted paws; head and neck turn
  toward what it's watching with damped, overlapping motion on top of the clip.
- **Cheap and polite.** three.js r169 and the 1.4 MB model load only on
  desktop (lane is hidden under 900px), after the page is idle, never for
  reduced motion. It pauses off screen and in background tabs. Under 1 ms of
  script and GPU per frame.
- `?catdebug` exposes `window.__cat`; `?catdebug=lines` draws the measured lane.
- **Cursor play, tightened (2026-11-07).** Medium-range hunts (1.2–2.6 m) now
  land the pounce in about 5 s instead of 7–8: the notice beat is cut short, a
  hunting cat takes turns under 75° into its first steps instead of turning in
  place, trots in (capped at the trot's own 0.6 m/s), sinks into the crouch a
  little farther out and pounces from up to 0.85 m. It doesn't creep faster:
  `stalk_crouch` barely moves its paws, so faster creeping would slide.
  A ground spot under 0.8 m behind the cat lands on the same pixels as its body,
  so it counts as ground behind it (the cat turns round) instead of air over
  its back. An air cursor higher than 1.5 m is only watched and never builds
  play interest. New: pounces lead a cursor that is actually going somewhere
  (smoothed ground velocity, scaled by how steady it is, so a jiggle isn't led);
  ears flick twice and the tail tip twitches when it locks on (the tail layer is
  undone in `unlayer()` like the head); a flick past its face gets a one-two
  swat; a dodged pounce gets a short "missed it" look around; woken from a
  loaf, it watches for a beat before getting up. Each has a scenario in
  `scripts/cat-test` (17 scenarios, all passing at RUNS=5).
- **A new cat (v7, 2026-11-07).** The first model's back legs, bare skin and
  floor clipping were replaced by a re-rig of "Bicolor Cat" by kenchoo (itself
  based on "3d modelling my cat: Fripouille" by guillaume.bolis), CC BY 4.0.
  Recoloured black, re-weighted to our bone names, morphs added, a fur texture
  baked on four alpha shells, animated again with the same 29 clip names.
  `cat-motion.json` is re-exported (trot is now 0.5625 m/s, the pounce flight
  0.23–0.67 s). CC BY needs a visible credit, so the Scaffold footer carries it
  (`.dfootcredit` in `design.jsx`); keep it as long as this model is used. The
  site zeroes the model's fur sheen at load: under the amber lamps it turned the
  underside pale and showed the old white markings. Eyes are the model's own,
  solid white with no pupil, shrunk to 55% about each eye's centre at load
  (`EYE_SCALE`): at full size they read huge from the hero camera. The cool rim
  light is 1.2 (was 2.8) and the fur's specular 0.15: on this model the old
  values lit the belly and inner legs violet in crouches and stretches. The
  suite is unchanged and passes with the new model.
- **Every post is somewhere to go (2026-11-07).** The far posts were barely
  visited (about 30 s each in 15 minutes, nearly all of it walking past) and he
  sat a metre away from the post he had gone to, so it looked like a sprite laid
  over the lane. Now a post nobody has visited yet is his next stop 9 times in
  10, and after that the longest-neglected one is likeliest (unlit posts too).
  He sits 0.5 m from the post (was 0.8), turns to face it, looks up at the
  lantern and flicks his tail. The one canvas sits between the near and mid
  posts, so it is always drawn over the mid, far and back posts; sitting closer
  made it show at the wrong depth now and then (110 frames in 15 minutes by the
  far posts). `avoidPosts()` keeps him inward of any post nearer than he is, so
  its base is never hidden by his sprite. The suite has a 15-minute no-cursor
  scenario (rendering off, about 20 s) that fails if any of the eight posts gets
  no visit or if he is ever drawn over a nearer post.
- **Audit: the model was inside out, and the motion snapped (2026-11-09).**
  He looked fine standing still and wrong in motion. Measured frame by frame in
  headless Chromium, the causes were:
  - *Inside-out body.* The fur mesh's triangles and normals all point inward
    (signed volume < 0). Drawn front-side, the renderer showed the inside of the
    far wall of his body: his eyes showed through the back of his head when he
    faced away, and the lamps lit the wrong side (the pale underside and violet
    belly worked around in v7). Now drawn `BackSide`, which is the mesh's true
    outside, and three flips back-face normals for lighting, so one setting
    fixes both. The four alpha fur shells were extruded inward and can't be
    seen any more, so they're hidden. The eyes are shrunk across the face only
    (shrinking in depth too had sunk them behind the lids) and are a lamplit
    gold-green instead of glowing white.
  - *Pops.* A clip asked to play again while still showing (`idle_stand`
    restarts, back-to-back swats, both halves of a big turn) reset to frame 0,
    because one three.js action can't crossfade into itself: bones jumped up to
    90° in a frame. Every clip but the gaits now has a twin action that takes
    over and fades in, and a loop that's already playing just carries on.
    Swat/pounce/notice fades are 0.14–0.2 s (were 0.08–0.12).
  - *Snappy stride.* The walk and trot swing each leg in 2–3 keys (34° and 68°
    a frame). `walk`, `trot`, `idle_stand` and `stalk_crouch` get three passes
    of a cyclic [1 2 1] filter and a 60 fps Catmull-Rom resample at load. Gait
    speeds are then re-measured from the smoothed clips (median speed of a
    planted paw), which gives 0.269 m/s on the raw walk, the same as the
    export. Unhurried walks use that speed instead of a fixed 0.27. The `run`
    clip is never blended in: its hind legs flip up to 160° between keys.
  - *Swivelling.* During the butt wiggle and the stalk the whole body turned on
    the spot after every jiggle (380 frames in 5 minutes): now a dead zone and
    a 22–35°/s limit, so the head follows the toy and the body only creeps.
  - *Owl head.* Gaze targets more than ~100° behind him (the viewer, a toy) fade
    out instead of twisting the head round. Turning is the body's job.
  - *Swat loop.* A cursor jiggling over him got a swat every 0.35 s. Now there's
    a watching beat after each one (longer as a bout goes on), the bout cools
    after four, and the one-two happens at most every 2.5 s (a flick that
    comes while one paw is still rising turns it into a one-two).
  - Tests: every scenario now fails on any bone jumping more than 70° in a
    frame (the pounce launch is the biggest real move, ~67°). New: a swat-pacing
    scenario, and a render check that the eyes are lit facing the viewer and
    dark from behind. Both fail on the previous cat. All pass at RUNS=3.
- **No crab walk; a peek-round-the-post intro (2026-11-09).**
  - *Crab walk.* The lane converges on a vanishing point, so near its sides
    "straight into the lane" runs about 20° off vertical on screen, but the cat
    is drawn with a flat camera that pointed him straight up the screen. Walking
    into or out of the lane at the sides, he moved up to 61° away from where his
    body pointed. His camera now swings round by the lane's own lean at his spot
    (sampled over ±0.15 m and eased, because the lean steps at each lamp row),
    so he is seen from the side a real eye would see him from. Worst case is now
    ~8° (diagonals: the lane's post spacing isn't a perfect perspective).
    Looking "at the viewer" follows the same angle.
  - *Intro (superseded below, see "A real entrance").* Instead of walking in from the edge, he starts out of sight behind
    one of the mid posts, walks out from behind it, stops with his head and
    shoulders round the post and looks at you (ear flick, a blink), glances down
    the lane and carries on out. His canvas is drawn over the mid posts, so while
    he's behind one it is cut off along the post's inner edge (outline measured
    from the lamp art) with a plain one-piece `clip-path` polygon. A first version
    cut the post out as a hole (`polygon(evenodd, ...)`, not supported in every
    browser), and started him crouched with an ear and tail already showing: it
    read as him appearing next to the lamp. Dropping his canvas under the post
    instead was tried and rejected: the real mid fog and wisps then lay over him
    and he went grey for the peek. Cursor play and petting wait until he's clear
    of the post. The old walk-in remains as a fallback if a page has no mid post.
  - Tests: a crab-walk check (screen motion vs screen heading under 12° at the
    lane's sides) and an intro scenario (starts hidden behind a mid post, looks at
    the viewer, comes out in front of the post inside the lane, no pose pops).
- **A real entrance, and a walk that gets somewhere (2026-11-09).** After the
  last two attempts he still read as appearing next to the lamp, and as walking
  on the spot. Measured, not guessed: the old intro moved him 0.15 body lengths
  across the screen in 3 s, and 35–55 % of his ordinary walking time moved him
  under 0.2 body lengths a second on screen.
  - *Why it read as walking on the spot.* The lane is seen from 13° above, so a
    metre of walking along the lane (toward or away from the viewer) is about a
    quarter of a metre across the screen. The intro walked him toward the viewer.
    The walk clip's stride is also short (about 0.28 body lengths; a cat's is
    nearer twice that), so his feet cycled and his body hardly got anywhere.
  - *Intro.* He starts completely hidden behind one of the front posts (near or
    mid row, either side), side-on to us, with his nose just inside the post's
    outline. That spot is worked out in screen pixels from the post as laid out
    right now (`hiddenSpot`, `postEdgeX`: the lane converges, so "behind" a post is
    not at the same lane X), so it holds at any window size. After a beat he
    walks out from behind the post across the screen, at 1.2× his usual walk,
    and is revealed a little at a time as he passes the post's edge (his canvas is
    cut off along the post's inner edge with a one-piece `clip-path` polygon until
    his tail is clear of the post's widest point, `peekDone`). He looks at the
    viewer as he comes out and carries on across the lane. Cursor play and petting
    wait until he is clear. A resize mid-intro doesn't shove him out of hiding.
  - *Walk.* The walk's leg rotations are scaled ×1.35 about their mean pose
    (`lengthenStride`), which lengthens the stride; his walking speed is
    re-measured from the planted paws afterwards (0.27 → 0.36 m/s at the same
    step rate) and foot slide went down (5.5 → 2.1 cm/s), so he gets further
    per step without skating. Where he wanders, routes across the screen are now
    likelier than routes up or down the lane (posts nobody has visited still come
    first, so trips to the far lamps remain, and those are inherently low on
    screen travel). Over 8 runs of 4 minutes each, walking time that reads as
    on-the-spot fell from 42 % to 31 % and his average on-screen speed rose from
    0.26 to 0.32 body lengths a second.
  - *Tests.* `npm run test:cat:sizes` plays the entrance on all four front posts at
    900×640, 1024×768, 1280×720, 1440×900, 1920×1080 and 2560×1440 in the real
    page and checks with pixels (the page with him vs without him) that nothing of
    him shows at the start, counts how much of him is visible through the live
    clip-path to check he is revealed gradually, checks he really crosses the
    screen (not on the spot), stays inside the hero, and ends up in the lane. It
    fails on the previous intro ("on the spot: 0.15 body lengths in 3 s"). The
    suite's intro scenario now checks the same behaviour on the front rows. Also
    run once, all passing, at 1366×768, 1728×1117, 1280×1000 and 3440×1440. Pop
    detection samples every tenth of a second: at half-second samples a stepped
    plinth uncovers enough of him to look like a pop when it isn't (checked on
    film at 900×640).
- **Pre-scripted by default (2026-11-10).** Simpler is the brief now: he runs
  out from behind one of the front (near) lamp posts (now: in from the side of
  the screen, see below), sits down beside it and
  stays there, blinking, with an ear twitch or slow blink every 6–12 s, and turns
  his head to look at the cursor when it comes within about 1.6 m of him (fading
  out by 2.2 m). No wandering, hunting, pouncing or petting, and no idle glances.
  `SCRIPTED` in `scaffold-cat.js` (or `cat.scripted = false`) brings back the
  free-roaming cat, which is all still in the file and still covered by the suite
  (its scenarios switch it on). He runs at the trot (the run clip is broken). The
  seat is placed on screen, just clear of the post's widest point
  (`SEAT_GAP_M`): he can't stand level with a front post's base, which is on the
  hero's bottom edge, so he sits a little behind it, and measured in lane metres
  that looked a long way off because the lane converges. The near posts are
  drawn above his canvas, so anything of him behind one stays covered. Tests: a
  suite scenario (starts behind a front post, runs, sits by 9 s beside the post,
  looks at a close cursor and not a far one, never gets up, no pops), and the
  size sweep now plays the scripted entrance on the near posts.
- **Scripted entrance: in from the side of the screen (2026-11-10).** Coming out
  from behind a post still read as appearing from nowhere for the owner, in their
  browser; it depends on cutting his canvas with a `clip-path` along the post's
  edge, which could not be checked outside headless Chromium. Now he starts just
  past the edge of the hero on the side of his front post (the hero is
  `overflow: hidden`, so nothing of him shows), already blending into a quick
  trot, runs in, passes behind the near post (near posts are drawn over his
  canvas, so the page's own layering covers him there, in any browser), stops
  just clear of it, turns three-quarters on and sits. No mask is involved. The
  suite's scripted scenario checks he starts off-screen on the post's side; the
  size sweep counts only what is inside the hero.
- **The scripted entrance is one move (2026-11-10).** It was run in → stop →
  turn on the spot → sit, which looked scripted. Now he runs in along the lane a
  little behind his seat, curves toward us as he slows from a trot to a walk
  (aiming first for a point `BEND_M` before the seat on his sitting heading, then
  the seat), arrives already facing the way he sits, and starts to sit halfway
  through his last step (`walk_to_idle` into `stand_to_sit`). He sits
  three-quarters on (`SEAT_YAW` 62° from facing us): a short, gentle curve,
  because walking toward the camera barely moves on screen, and head-on he
  reads as a blob. The suite's scripted scenario now fails if he stands still,
  turns on the spot or swings round faster than 160°/s before sitting (the
  previous version fails it: 31 still frames and a turn on the spot).
- **Running in side-on, calmer eyes, and a toy mouse (2026-11-10).**
  - *Running at an angle.* The camera swing that stops the crab walk (the lane's
    perspective lean at his spot) was applied whatever way he faced. On the run-in
    he crosses the hero's bottom edge, where the lean is ~45°, so he was drawn
    three-quarters on while sliding straight across the screen. The swing is now
    solved for his heading: the angle at which his heading, drawn, points the way
    it really moves him on screen. Across the lane that is 0 (side-on), into the
    lane it is the lean as before. The crab-walk check's worst case went from ~8°
    to 6.5°.
  - *Head tracking.* Scripted, he no longer turns his head to the cursor while he
    runs in. As he settles he looks at you; seated, he fixes on the cursor and holds
    it, re-fixing when it moves ~9 cm (not slaved to every pixel), takes a beat to
    notice, and loses interest if it sits still for ~4 s (`watchCursor`).
  - *The toy mouse* (`bat-mouse.js`). See "Jump in, a livelier sit" below for how
    it works now (the first version, carried to Bat and given to him, was dropped).
  - Tests: "run-in side-on" (fails on the previous cat: camera 46° off, head on
    the cursor mid-run) and "toy mouse" (since replaced by "seated life").
- **Jump in, a livelier sit, a firmer belly, a simpler mouse (2026-11-10).**
  - *Jump in.* The scripted entrance starts with a leap: the pounce's wind-up plays
    just past the hero's edge (clipped), its flight (`JUMP_M`, 0.72 m) carries him
    into view, and he lands straight into the trot. The size sweep allows a leap's
    speed (up to 60% of him in a tenth of a second) in the first 0.6 s after he
    shows, and keeps the 30% pop limit after that.
  - *Seated.* He glances about every 3.5–7 s (a lantern, you, down the lane) when
    no cursor is being watched, and his tail is never still: a slow sway that
    travels down it, and every 5–10 s a lazy curl of the tip (`applyTail`). The
    arrival look at you used to leave a stale override that blocked glances.
  - *Belly.* It wobbled on every stride: the skin under the body, between the legs,
    is partly tied to the shoulder, upper-leg and thigh bones. `firmBelly` hands
    85% (`BELLY_FIRM`) of that pull to the torso bone each vertex is blended with,
    fading out towards the legs (as `firmChest` does for the chest).
  - *The mouse.* A plain grey mouse sits whole at the foot of the portrait in "Why".
    Clicking it tucks it away and opens the dialog: Bat thanks you, says his owner
    will take 5% off your final price, and calls it his favour ("Yours, Bat."),
    with clear "Write a brief" / "Carry on" buttons. No carrying, no code: it is
    remembered in the browser, emails Carter on the spot, and a later brief from
    that browser says "Bat's favour: 5% off". It shows wherever Bat does (900px and wider,
    reduced motion off) without waiting for the 3D cat to load, and comes back each visit (clicking it again
    brings the dialog back; Carter is emailed only on a browser's first find). The
    first version hid it for good once found and waited for the cat, so the owner,
    having found it once, never saw it again.
  - Tests: "seated life" (tail moves, 2–7 glances in 20 s, stays sitting, no pops).
- **Sitting up, and a livelier trot in (2026-11-10).**
  - *Arched back.* Sitting, he read as hunched: the sit clip lays the chest nearly flat
    (19°) with the head hanging forward at shoulder height, and the outline from tail to
    shoulders bows out. Neither skin weights (the back is all spine) nor lining up the
    spine bones (the joints are nearly in line already) changed it much. `applyBack()`
    does it while he sits (weighted by how much of the pose is a sit): the spine bones are
    lined up (`BACK_STRAIGHT`), the chest tips up 8° (`SIT_CHEST_UP`) with the front legs
    kept pointing as they were, and the neck lifts 32° (`SIT_NECK_UP`) with the head kept
    level, so he sits up with his head above his shoulders. Mostly the neck: more chest
    lifts his front paws (straight in this pose) off the ground; at 8° they rise 7 mm. The
    bones it touches are snapshotted first each frame (`frameNo`; `applyGaze` leaves them)
    so `unlayer()` takes it back off; checked for drift over 18 s.
  - *Trotting in.* His tail goes up as he trots in (`applyTailWalk`): raised from the
    base (`tail_01–03`, 24°/14°/8°), the tip curled over, swaying with his stride and
    bobbing with each step. His head nods a little with each step (`applyStrideBob`), and
    half a second after landing he glances at you for 0.9 s. The run-in test now checks
    that he doesn't track the cursor mid-run (a glance is fine) and that his tail is up.
  - The free-roaming "stops when the cursor goes still" scenario can time out (ends at
    10 s) on its second run in a full-suite pass, before and after these changes; on its
    own it passes 6/6. It isn't the mode the site uses.
- **A soft tail, a round rump, and a mouse you give back (2026-11-10).**
  - *Boxy rump.* The rest pose is round; the lumps came from the trotting tail-up layer.
    `tail_01` also carries the skin on top of and behind the rump, so tipping it up 24°
    folded the rump into box-like lumps under the tail. Spreading the hindquarter skin
    weights and Taubin-smoothing the rest shape were tried and measured first and made no
    visible difference (the shape moved 1–1.5 mm on 13 mm edges), so they were dropped.
  - *Stiff tail.* `applyTailWalk` now treats tail_01–07 as one chain: the first bone is left
    as the clip has it, the lift is spread along the rest as a soft arc with the tip hooked
    over (`TAIL_ARC`), a sway travels from base to tip with the stride, and each bone
    follows its target through a spring that is slower towards the tip, so it lags, follows
    through, and trails a little when he turns.
  - *The mouse.* It now hides small and dim at the very end of the footer's "Cat model"
    credit, like a full stop (it first sat under the last "Short answers" question). Clicking
    it stows it away, with no slot on screen (an "ITEMS" slot was tried and dropped), and a
    one-page pixel dialogue with no name tag: "I know someone who might like this." It
    doesn't open Bat's dialogue.
    Clicking Bat while you have it (the cursor turns to a pointer over him; he must be
    sitting) gives it back: he looks at you, his ears flick, he slow-blinks, and the
    dialogue opens (at the top of the screen if it would cover him). That is when Carter
    is emailed (first time per browser) and the favour is recorded for briefs. A stowed
    mouse stays stowed across visits. The cat exposes `window.ScaffoldCat`
    (`near`, `where`, `thank`) again for this.
- **The mouse peeks from behind the portrait, and Bat keeps it (2026-11-10).**
  - *Where.* In "I'm Carter", the mouse peeks out from behind the right edge of the portrait,
    low down: a box sits just outside the photo with overflow hidden and the mouse (facing
    out) mostly inside the photo's area, so only its nose, an eye and an ear show (clipping
    also blocks clicks, so nothing invisible sits over the photo). Hover: it leans out a
    little. Small and dim (opacity .72 once the portrait has faded in).
  - *Picking it up.* It ducks back behind the photo and is stowed. No dialog box: a line of
    handwriting ("Caveat", loaded on hover) fades in under the photo's corner and away again
    on its own: "I know someone who might like this."
  - *Giving it back.* Clicking Bat (sitting) drops the mouse in front of him: it falls in
    from above, bounces once, and stays at his paws (`receive`/`placeGift` in
    `scaffold-cat.js`, placed every frame like his canvas). He looks down at it, then at you
    and slow-blinks, then the dialog opens.
  - *Afterwards he has it.* On later visits in that browser the mouse is waiting just in
    front of where he sits (`keep`; `seatAt` is worked out with the seat, before he arrives)
    and the portrait has no mouse.
- **The mouse budges, is shown as a found item, and Bat talks in the page's style (2026-11-10).**
  - *Budge.* The first time the peeking mouse scrolls into view (90% visible) it waits 1.8 s
    and gives one small twitch out and back with a little tilt (`bm-budge`), once per visit:
    easy to miss on purpose.
  - *The find.* Clicking it still ducks it behind the photo and stows it. The whole mouse and
    "I know someone who might like this." in italic serif then float up over the page, with no
    box, border or label (a framed "Found / A toy mouse" card was tried and dropped), and fade
    away together after ~5 s. Nothing to click away.
    The line is in the page's own italic serif (Cormorant, the same as Bat's dialog), not
    handwriting: a handwriting font (Caveat, first from Google on hover, then bundled in
    `assets/fonts`) was tried and dropped.
  - *Bat's dialog.* The pixel game box (Press Start 2P, thick white border) is gone. It is a
    card in the page's own style: dark wood gradient, a brass hairline with an inner rule,
    Cormorant italic, a small amber "BAT" label with a rule, each word fading in a beat after
    the last (a click skips), and the site's own `.p-btn` / `.p-btn.ghost` for "Write a brief"
    and "Carry on". Same pages, same placement (top of the screen if it would cover him).
  - *Looking at you.* While the dialog is open the cat is `speaking`: `gazeTarget` returns the
    viewer at full weight, ahead of idle glances and the cursor, and lets go when it closes
    (`ScaffoldCat.speak`). Test: "talking".
- **A cat's outline, not a brick; a trot with some give; a mouse that leaps (2026-11-10).**
  Measured on big clay-coloured renders of every pose (side, three-quarters, behind), since a
  black cat is all silhouette.
  - *Why he was boxy.* In the rest shape the line of his back was dead flat from hips to
    shoulders (0.290–0.295 m all the way), the belly line ran parallel to it, and he was the same
    width from end to end: a rectangle on legs. `sculpt()` reshapes the trunk at load (`SHAPE`:
    change by distance along the body): the back dips behind the shoulders and rises over the
    hips, the rump rounds down to the tail, the chest is deeper between the front legs, the belly
    tucks up toward the back legs, and he has ribs and a waist. The hindquarters taper toward
    the top and their back corners are drawn in (`RUMP_TAPER`, `RUMP_ROUND_M`): from behind they
    were a block with a flat back face. The neck is a little slimmer (`NECK_SLIM`). Only
    torso-weighted skin moves, so legs, head, face, eyes and tail are untouched.
  - *The plate under his chest.* The whole midline of his underside (breastbone and groin) was
    weighted to the leg bones only, shared left and right, with no torso bone; the floor of the
    chest between the front legs belonged to the forearms. Each stride dragged it both ways
    into a flat plate with hard corners. `firmKeel` hands 90% (`KEEL_FIRM`) of that to the chest
    / spine / hips bone over each vertex.
  - *Shoulder seam.* The mesh is split along its texture seams with separate normals each side,
    which lit as a hard line round the shoulders. `weldNormals` recomputes them for the new
    shape, shared across coincident vertices (same inward convention as the mesh).
  - *Trot.* His body was carried like a plank. `applyStrideBob` now also lifts it a little with
    each step (`TROT_BOB_M`, 5 mm on a 29 cm back) and bends the spine gently side to side with
    the stride (`TROT_SWAY`, 2.2°; the neck counters it so the head holds its line). Small on
    purpose.
  - *Not changed:* the sit's back and neck (tuned earlier). Tipping the head up with the neck was
    tried for the bump behind his ears in side view and made no visible difference.
  - *Talking.* The "talking" test failed about one run in four before this work: a slow blink
    while his dialog was open loosened his gaze to 0.8. Speaking, the gaze now stays at full.
  - *The mouse.* Clicking it no longer just slides it behind the photo. It gives a startled
    shake (0.2 s), springs out in a puff of dust, tumbles once through an arc across the page,
    growing as it comes (`pickUp`, 0.82 s, placed per frame), and lands with a squash and a hop
    where the find shows; the line comes in under it once it has landed. Same wording, same
    place, still fades on its own, still stowed from the moment of the click.
  - Suite and size sweep pass.
- **Sitting: back legs you can see (2026-11-10).** The sit clip lays hip, knee and hock at one
  height with the foot tucked back under the rump, so the back legs folded in and all but
  disappeared. Two tries at aiming the joints failed (owner: "they fold in and disappear"): on
  this rig the leg bones don't run through the limbs they move (about 4 cm forward of the mesh),
  the thigh bone is a 4 cm stub, and the back toes had no bone of their own, so a lower leg laid
  flat took the toes up into the air.
  - `giveToes` (at load): everything at toe height on a back foot (standing, below `TOE_Y`) is
    handed to that side's paw bone.
  - `applyHaunch` (weighted by how much of the pose is a sit) places each part of the leg as a
    piece, starting from its standing shape: the upper leg is tipped forward about the hock into
    a thigh lying along his flank, the hock is set on the ground beside the rump, the lower leg
    is laid forward along the ground, and the toes stay flat at its end. All in `HAUNCH`.
  - Checked on grey renders from six sides and in silhouette: a thigh, a lower leg on the
    ground and a paw reaching toward the front paws, from both sides; the sit-down eases into
    it. Suite and size sweep pass. ("Seated life" and "stops when the cursor goes still" can each
    fail once in a full pass and pass on repeat, with and without this: random/timing checks.)
- **The crouch belly (2026-11-09).** Crouched (stalk, wiggle, the pounce
  wind-up), his belly hung as a flat, sharp-cornered plate: a triangle in side
  view. The body drops ~5 cm while both upper legs fold hard (front 97°, back 75°)
  and take the skin over them up with them; the spine barely bends, so the belly
  between was left hanging. Fixed with a corrective shape, as a rig would have it:
  belly vertices between the legs get a weight at load, and the vertex shader
  lifts them (up to 4.5 cm, `BELLY_TUCK_M`) in proportion to how much of the
  current pose is a crouch. The midline chest skin's pull from the upper-leg
  bones is also mostly handed to the torso bone it's blended with
  (`firmChest`).

## 2026-11-07 — Business Hub: one home per thing
- Leads is a lens on work not yet won: Overview, Tasks, Activity, Reports. Its Pipeline and Contacts tabs are gone, since they were the Jobs board and the Clients page under a second name; Leads' stage cards now open Jobs.
- Jobs owns its CSV export. Tasks are follow-ups tied to a job or client; personal to-dos stay in the Docket (the Tasks tab says so and links there).
- Touch: on phones every button, stage row and inline link is at least 44px. Checked at 360/390/1280 on every tool, a job page and a client page: no sideways scroll, no page errors.

## 2026-11-07 — Backroom safety layer (validated writes, audit, auto follow-ups)

Added on top of the Business Hub CRM tools above; the screens (Tasks, search,
Possible duplicates, Leads reports) are that work, not duplicated.

- **Writes are validated.** `api/scaffold-write.js` checks every row against
  `lib/validate.js`: only the columns the screens edit, with types (including
  `crm_tasks`, client custom fields and call/meeting notes). Tokens, Stripe
  ids, approval times, revision counts and proposal status can no longer be
  written from the browser. A paid invoice and an accepted proposal are
  locked; a job's invoice can only be marked paid through `mark-paid` (it
  switches off the Stripe link). Rows can be deleted only from `clients`,
  `docket_tasks` and `crm_tasks`; close a job instead. `npm test` covers it.
- **Audit trail.** Edits to jobs, clients, invoices and sent proposals are
  written to `job_events` (kind `change` or `stage`) with old and new values.
- **Automatic follow-ups.** The Backroom adds `crm_tasks` itself (reply to a
  brief, follow up a proposal / directions / final after 3 days, chase an
  invoice after 7) and clears them when the step happens. Each has an
  `auto_key`, so re-sending reopens one task. Tasks Carter wrote are never
  auto-closed. Needs `20261109_crm_autotasks.sql` (after `20261108`).
- **Clients.** Emails are stored lower-case and unique (applied
  2026-11-07), so the Hub's Merge now runs on the server
  (`mergeClients` in `lib/crm.js`) in the order the unique index needs. A
  brief from a known address attaches to that client. Clients have a
  `source` ("Came from"); closing a job asks why (`close_reason`). Both show
  in Leads > Reports.
- Applied to the live database 2026-11-07: `job_events.client_id`, nullable
  `job_events.job_id`, `jobs.close_reason/closed_at`, `clients.source`, the
  unique email index. Also added, now unused: `docket_tasks.job_id/client_id/
  auto_key` (harmless; the automation writes `crm_tasks` instead).
