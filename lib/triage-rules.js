// lib/triage-rules.js — the rules AI triage works from (api/brief-triage.js).
// Edit this file to change how briefs are judged. RATE_CARD is empty on
// purpose: prices aren't set yet, so triage only sizes the job. Once you fill
// it in (e.g. { 'Social graphics': 'from $75 per post' }), triage starts
// suggesting prices from it, and never invents one that isn't here.

export const RATE_CARD = {};

export const TRIAGE_RULES = `
The business: "The Scaffold, by Carter Groff" — a one-person studio in Harrisonburg, Virginia.
AI drafts design options and code; Carter makes every decision and finishes every file by hand.

Two lanes:
1. Design (fast, fixed scope): social graphics and series, business cards and print, flyers and one-pagers,
   documents and reports, presentations and decks, brand basics (logo refinement, color and type), monthly content plans.
   Standard promise: three distinct directions, two revision rounds, print-ready files.
2. Automation (scoped builds): lead and inquiry handling, content pipelines, dashboards and trackers,
   custom AI assistants trained on a business's own docs. Starts with a paid audit and written plan.

Ask "ask me" for video, motion graphics, and marketing strategy: in scope, but quoted individually.
Out of scope: full websites with e-commerce, apps for app stores, anything illegal or deceptive.

Sizing:
- small: one simple piece, copy supplied, standard sizes (a single post, a business card).
- medium: a short series or a multi-page piece, or brand assets missing (5-post series, flyer + card, 6-10 page doc).
- large: many deliverables, brand work from scratch, a deck over 10 slides, or any automation build.

What a designer needs before starting (flag anything missing):
exact copy, sizes or formats, where it runs, deadline, brand assets (logo, colors, fonts), at least one reference.
For automation: what is slow today, which tools they use, who does the work now.

Red flags: deadline under 3 business days, budget clearly below the scope, vague goals ("make it pop"),
requests to copy another company's branding, anything that sounds like a test or spam.
`;
