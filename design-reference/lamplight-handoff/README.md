# Handoff: Marketing Command Center — "Lamplight" visual treatment

## Overview
Lamplight is a visual-styling pass on the existing Marketing Command Center (The Scaffold).
Structure, routes, data and class names stay as they are. What changes is **material**:
a photographic masthead under a gold hairline, content in lifted panels on a darker floor,
film grain over the whole app, and an amber glow rationed to the single element the user is
meant to act on.

It replaces nothing in the information architecture. No new screens, no moved controls.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes of the intended
look, not production code to paste in. `MCC Visual Directions.dc.html` is a design-canvas board
that renders six mockups inside fake browser chrome; it is not a runnable version of the app.

The task is to apply the Lamplight rules to the **real** Command Center
(`Marketing Command Center.html` + `mcc.css` + `mcc-*.js` in the working project), keeping its
existing markup and class names. `lamplight.css` in this bundle is a working starting point:
it is written as an overlay on top of `mcc.css`, using the class names already in the app.

## Fidelity
**High fidelity.** Colors, type sizes, letter-spacing, rule opacities, gradient stops and shadow
values below are exact and were authored against the shipped `mcc.css` / `parlor.css` tokens.
Where a value is new (panel gradients, glows, plate gradient) it is listed in Design Tokens.

## The five rules
1. **Plate masthead.** Every screen opens with a 104–132px photographic band: the job photo under
   `linear-gradient(to bottom, rgba(21,14,8,.35), rgba(21,14,8,.62) 46%, #150e08 100%)`, brand mark
   and brand switcher on the first line, nav on the last line, closed by a gold hairline that fades
   at both ends. Builder/Present may swap the photo for a flat `linear-gradient(180deg,#1f150d,#150e08)`
   because their content is the artwork.
2. **Lifted panels.** Content groups sit on `linear-gradient(180deg,#241810,#1b120b)`,
   `1px solid rgba(236,217,178,.10)` border, a `1px rgba(236,217,178,.18)` top highlight line, and
   `box-shadow:0 30px 60px -30px rgba(0,0,0,.85)`. The page floor darkens to `#150e08` so panels read
   as objects on a surface. Hairline-only groups from the current build become panels; hairlines
   survive *inside* panels at `rgba(236,217,178,.07)`.
3. **Recessed inputs.** Anything the user types or picks goes the other way:
   `background:rgba(0,0,0,.42)`, `inset 0 1px 3px rgba(0,0,0,.6)`, same hairline border.
   Filter bars become one recessed console strip rather than three floating selects.
4. **Grain everywhere.** The existing `.p-grain` turbulence overlay from `parlor.css`, 10% opacity,
   `mix-blend-mode:overlay`, above content, `pointer-events:none`.
5. **Ration the glow.** Exactly one glowing element per screen — the number or bar that carries the
   decision. Glow = a breathing radial `rgba(217,154,61,.30)` behind it plus
   `text-shadow:0 0 46px rgba(217,154,61,.35)` on the numeral / `box-shadow:0 0 16px rgba(245,205,106,.55)`
   on the bar. Present mode is the one exception: one per brand column. Everything else is bone
   (`#ecd9b2`), dim gold (`#8a7758`) and near-black brown.

## Screens / Views

### 1. Home
**Purpose:** monthly pulse for the selected brand; catch anything broken.
**Layout:** plate masthead 132px → gold hairline → content column, `padding:24px 28px 30px`,
`display:flex;flex-direction:column;gap:16px`.
- **Goal panel** (full width, lifted). Eyebrow `LEADS VS. GOAL · FROM PIPEDRIVE` Karla 9.5px/.26em/uppercase
  `#8a7758`. Numeral `Cormorant Garamond 92px`, `line-height:.82`, `letter-spacing:-.045em`, `#f7e6c4`,
  `text-shadow:0 0 46px rgba(217,154,61,.35)`; denominator `/ 57` Cormorant 30px `#6b5940`.
  Right side: `ON PACE` Karla 9px/.22em `#8e9462` over `74%` Cormorant 34px `#f5cd6a`.
  Progress bar 4px, track `rgba(0,0,0,.45)` + `inset 0 1px 2px rgba(0,0,0,.6)`,
  fill `linear-gradient(90deg,#a9722a,#f5cd6a)` + `0 0 16px rgba(245,205,106,.55)`.
  Footer row: `15 LEADS TO GO` / `SYNCED TODAY, 8:12A`, Karla 9.5px/.14em `#8a7758`.
  Glow: 300px circle, `left:8%;top:-90px`, radial `rgba(217,154,61,.30)→transparent 70%`,
  `mix-blend-mode:screen`, breathing animation (below).
- **Row of two**, `grid-template-columns:1.35fr 1fr;gap:16px`.
  - *Channel breakdown* panel: title Cormorant 19px, month label Karla 9px `#5a4a36`; four rows
    `gap:13px`, each label Spectral 13px `#c9b48a` + right-aligned `33 · $114/lead` Karla 11px;
    bar 3px on `rgba(0,0,0,.4)`, fill `linear-gradient(90deg,#8a5c22,#e0b25c)`. The efficient
    channel (Instagram) gets the lit fill + `#f5cd6a` figure. `no spend` rows go `#5a4a36` / flat `#6b5940`.
  - *Needs a hand* panel: `linear-gradient(180deg,#2a1710,#1d1109)`, border `rgba(184,100,63,.34)`,
    2px `#b8643f` left spine. Eyebrow `NEEDS A HAND` `#d98a63`; headline Cormorant 21px;
    body Spectral 12.5px/1.6 `#a08d6c`; solid `#ecd9b2` button, `#1a120b` Karla 9px 600/.20em caps, 11px 15px.

### 2. Campaigns
**Purpose:** the log; find and repair records.
**Layout:** plate masthead 104px (uses the second job photo, `background-position:center 35%`) →
gold hairline → `padding:22px 28px 28px`, `gap:14px`.
- **Console strip** (recessed, `padding:10px 12px`, `gap:10px`): three filter chips
  (`7px 11px`, hairline border, Karla 10px/.14em caps `#c9b48a`, 9×6 chevron `#8a7758`),
  then `6 CAMPAIGNS · $3,998 SPENT` pushed right (Karla 9.5px/.20em `#8a7758`), then the primary
  `+ LOG A CAMPAIGN` in solid bone. **This replaces the floating FAB** — the action lives with the list.
- **Table panel** (lifted, `padding:0 20px 8px`): 7-column grid
  `58px 1.7fr 96px 92px 78px 62px 96px`. Header row Karla 9px/.20em caps `#5a4a36`,
  `padding:15px 0 11px`, closed by `1px solid rgba(236,217,178,.14)`. Body rows `padding:13px 0`,
  divider `rgba(236,217,178,.07)`, name `#ecd9b2` 13.5px, meta `#c9b48a`, numerals tabular.
  Type and status are Karla 9px/.16–.18em caps `#5a4a36`/`#8a7758`.
- **Flagged row:** `background:linear-gradient(90deg,rgba(184,100,63,.16),rgba(184,100,63,0) 70%)`,
  `box-shadow:inset 2px 0 0 #b8643f`, date cell shifted `padding-left:10px`, status `#d98a63`.
  Hover on normal rows stays `rgba(236,217,178,.035)` from `mcc.css`.

### 3. Builder
**Purpose:** brief Wick, review the generated piece.
**Layout:** flat masthead (no photo) → gold hairline → `grid-template-columns:1fr 1fr;gap:20px`,
`padding:22px 28px 28px`.
- **Left, the console** (lifted panel): title `Ask for a piece` Cormorant 21px + Spectral 12.5px
  `#8a7758` sub. Section labels Karla 9px/.24em caps `#5a4a36`. Segmented brand context and piece
  type: hairline box, active segment `rgba(236,217,178,.07)` + `inset 0 1px 0 rgba(236,217,178,.12)`
  + `#ecd9b2`; inactive `#5a4a36`. LTW dot `#b8643f` with `0 0 8px` of itself; Squeeky `#8e9462` unlit.
  Palette row: four 15px squares (`#b33624 #ffc20e #231f1e #f6f1e6`, the dark one hairlined).
  Guide rules: Karla 10px `#8a7758` with a 5×1px `#5a4a36` dash at `top:6px`.
  Prompt field recessed, `min-height:66px`, Spectral 13.5px/1.55 `#c9b48a`.
  `GENERATE` solid bone with `0 0 26px rgba(217,154,61,.28)` — the screen's one glow;
  `REFINE THIS ONE` hairline ghost.
- **Right, the lightbox:** `Preview` Cormorant 21px + `EMAIL · LOG & TIMBER WORX` Karla 9px `#8a7758`.
  Frame: `padding:16px`, `radial-gradient(120% 80% at 50% 0%,rgba(236,217,178,.09),rgba(236,217,178,.02) 60%,transparent)`,
  hairline `rgba(236,217,178,.08)`. The piece inside is rendered **by the brand guide, not by app
  styles** — cream `#f6f1e6`, 7px `#ffc20e` band, 3px `#231f1e`, charcoal logo band, photo hero with
  the LTW gradient, 5px `#b33624` rule, Oswald caps headline with one gold word, DM Serif italic
  `Howdy,` in `#b33624`, brick + outlined CTA pair, `Dan Link / Plan Ahead with Confidence`.
  It only gets `box-shadow:0 26px 50px -18px rgba(0,0,0,.8)` from the app. Never restyle the artwork.

### 4. Present
**Purpose:** monthly review, projected or exported.
**Layout:** no masthead, no nav. Floor becomes
`radial-gradient(120% 90% at 50% -10%,#241810,#120c07 70%)`, `padding:26px 30px 30px`.
Header: `←` `August 2026` (Cormorant 34px, `-.02em`) `→`, right side `EXPORT AS PDF` ghost +
`EXIT PRESENT MODE` quiet `#5a4a36`, closed by a `rgba(236,217,178,.13)` hairline.
Body: `grid-template-columns:1fr 1px 1fr;gap:26px` with a real `rgba(236,217,178,.13)` divider column.
Each brand column: dot + name (dot lit with its own hue), numeral Cormorant 84px `#f7e6c4` with
brand-tinted glow (`rgba(217,154,61,.32)` LTW, `rgba(142,148,98,.30)` Squeeky), 4px bar in the brand
gradient (`#8a4a2e→#d98a63` / `#5d6340→#a8ae74`) with `0 0 14px` of the light end,
then a titled chart (Cormorant 19px over a hairline) of `104px 1fr 34px` rows — label Spectral 13px,
3px bar, figure Cormorant 17px right-aligned. Footer callout: Karla 9px/.24em eyebrow
(`#8e9462` for the win, `#d98a63` for the concern), Cormorant 22px name, Spectral 12.5px `#8a7758` line.
No panels here — Present is deliberately flat and dark so a projector doesn't fight the panel edges.

## Interactions & Behavior
- Nav / tab hover: `color .2s`; active nav item is `#f5cd6a` with `text-shadow:0 0 18px rgba(217,154,61,.6)`
  (replaces the current amber underline).
- Panel hover (clickable panels only): border `rgba(236,217,178,.10)→rgba(236,217,178,.20)`, `.25s`.
  Panels never move or scale.
- Table rows: `background .2s` to `rgba(236,217,178,.035)`, cursor pointer. Flagged row keeps its wash.
- Buttons: bone → `#f5cd6a` fill on hover (`background .25s, border-color .25s`), plus
  `box-shadow:0 0 26px rgba(217,154,61,.32)` for the primary only.
- Inputs: focus `border-color:#d99a3d` + `box-shadow:0 0 22px -4px rgba(217,154,61,.32)` (already in `parlor.css`).
- **Glow animation:** `@keyframes lamp-breathe` — 7s ease-in-out infinite, opacity 1 → .95 (45%) →
  .78 (48%) → .92 (52%) → .88 (70%) → 1, with a matching `filter:brightness(.94→1)` dip. It is a
  gas-lamp flicker, not a pulse; do not make it symmetrical or faster.
- Sheet/scrim behavior is unchanged (`fade .2s`, `up .34s cubic-bezier(.2,.7,.3,1)`); the sheet body
  becomes a lifted panel and its fields recessed.
- `prefers-reduced-motion`: kill the breathe and flicker animations, keep the static glow.
- Responsive: below 760px the plate drops to 96px, panels go `padding:16px 18px`, the two-up rows
  stack, and the Campaigns table falls back to the existing stacked-row treatment inside one panel.
  Glow sizes scale to 60%.

## State Management
No new state. Existing state is unchanged: selected brand (`ltw` | `sq` | `both`), active view,
month cursor, filter values, sheet open/closed, sync timestamp, and the derived
"needs a hand" list (campaigns missing attribution). Lamplight only adds one **derived display**
value per screen: `glowTarget` — which single element receives the glow (Home: goal numeral;
Campaigns: none, the flag wash carries it; Builder: Generate; Present: each brand numeral).
Keep that a computed constant per view, not a stored preference.

## Design Tokens
Existing (keep, from `mcc.css` / `parlor.css`):
`--bg:#1a120b` `--text:#ecd9b2` `--text-2:#c9b48a` `--text-3:#8a7758` `--text-4:#5a4a36`
`--accent:#d99a3d` `--accent-lit:#f5cd6a` `--ltw:#b8643f` `--sq:#8e9462`
`--line:rgba(236,217,178,.13)` `--line-2:rgba(236,217,178,.26)`
`--display:"Cormorant Garamond"` `--sans:"Spectral"` `--ui:"Karla"` `--r:0px` (square edges stay)

New in Lamplight:
| Token | Value | Use |
|---|---|---|
| `--floor` | `#150e08` | page background behind panels |
| `--panel` | `linear-gradient(180deg,#241810,#1b120b)` | panel face |
| `--panel-flag` | `linear-gradient(180deg,#2a1710,#1d1109)` | attention panel face |
| `--panel-edge` | `rgba(236,217,178,.10)` | panel border |
| `--panel-top` | `rgba(236,217,178,.18)` | 1px top highlight |
| `--panel-shadow` | `0 30px 60px -30px rgba(0,0,0,.85)` | panel lift |
| `--hair-in` | `rgba(236,217,178,.07)` | hairlines inside panels |
| `--recess` | `rgba(0,0,0,.42)` | field / console fill |
| `--recess-shadow` | `inset 0 1px 3px rgba(0,0,0,.6)` | field depth |
| `--plate-grad` | `linear-gradient(to bottom,rgba(21,14,8,.35),rgba(21,14,8,.62) 46%,#150e08 100%)` | masthead photo scrim |
| `--ink-lit` | `#f7e6c4` | glowing numerals only |
| `--glow` | `rgba(217,154,61,.30)` | radial glow core |
| `--glow-text` | `0 0 46px rgba(217,154,61,.35)` | numeral halo |
| `--glow-bar` | `0 0 16px rgba(245,205,106,.55)` | lit bar |
| `--bar-track` | `rgba(0,0,0,.40)` | chart track |
| `--bar-fill` | `linear-gradient(90deg,#8a5c22,#e0b25c)` | normal chart bar |
| `--bar-lit` | `linear-gradient(90deg,#a9722a,#f5cd6a)` | the one lit bar |
| `--bar-dead` | `#6b5940` | zero-spend / worst bar |

Spacing: 4 / 6 / 9 / 13 / 16 / 20 / 22 / 26 / 28 px. Panel padding `20–24px 22–26px`.
Screen gutters 28px desktop, 18px mobile. Panel gap 16px. Radius 0 everywhere.

Type scale (unchanged families):
| Role | Font | Size / spacing |
|---|---|---|
| Hero numeral | Cormorant Garamond 500 | 84–92px, `line-height:.82`, `-.045em` |
| Screen title / panel title | Cormorant Garamond 500 | 19–21px |
| Present month | Cormorant Garamond 500 | 34px, `-.02em` |
| Chart figure | Cormorant Garamond 500 | 17px |
| Body | Spectral 400 | 13.5px / 1.6 |
| Small body | Spectral 400 | 12.5px / 1.6 |
| Eyebrow | Karla 500 | 9–9.5px, `.24–.26em`, caps |
| Nav / button | Karla 500–600 | 9–9.5px, `.20em`, caps |
| Meta / figures | Karla 400 | 10–11px, tabular-nums |

## Assets
- `assets/plate-mcc.jpg`, `assets/plate-mcc2.jpg` — job photography used as masthead plates.
  Any real LTW hero from `photos/` works; crop so a person or working hand survives the scrim.
- `assets/antler.png` — Scaffold mark in the masthead, 24–26px wide, `opacity:.9`.
- `assets/ltw-logo.png` — used **inside** the Builder preview artwork only, `height:38px`,
  `filter:drop-shadow(0 4px 12px rgba(0,0,0,.5))`.
- Grain: inline SVG `feTurbulence` data URI, already in `parlor.css` as `.p-grain`. No image file.
- No icon set. The only glyphs are a 9×6 chevron and arrows as text.

## Files
- `lamplight.css` — drop-in overlay for the real app. Load **after** `mcc.css`. Uses the app's
  existing class names plus a few new ones (`.plate`, `.panel`, `.console`, `.lit`, `.flagrow`).
- `MCC Visual Directions.dc.html` — the design board. Turn 2 (`2a`/`2b`/`2c`) is Lamplight on
  Campaigns / Builder / Present; turn 1 `1b` is Lamplight on Home. Turns 1a/1c are rejected
  alternatives, kept for context only — do not implement them.
- `browser-window.jsx` — fake browser chrome used by the board. Not part of the app.
- `ref/` — the current shipped app (`Marketing Command Center.html`, `mcc.css`, `parlor.css`,
  `mcc-*.js`) as it existed before this pass. This is the code to modify.

## Implementation order
1. Add the Lamplight tokens and `.p-grain` to the app shell; change the body floor to `--floor`.
2. Convert the header into `.plate` and move the nav into it; add the fading gold hairline.
3. Wrap existing `.card` groups in `.panel`; downgrade their internal rules to `--hair-in`.
4. Recess every `.input`/`.select`/`textarea`; convert the Campaigns `.filters` row into `.console`
   and move the FAB into it.
5. Add the glow to exactly one element per view, behind a `prefers-reduced-motion` guard.
6. Present mode last: flat radial floor, no panels, brand-tinted glows.
