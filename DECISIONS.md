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
