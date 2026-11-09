// scaffold-cat.js — a small black cat that lives in the lamp lane of the
// Scaffold hero (Carter Groff Design.html). It wanders between the posts, sits
// and loafs under the lit ones, walks back into the fog to the far lamps, and
// plays with the visitor's cursor: it watches it, stalks it across the ground,
// wiggles and pounces, and swats at it when it hangs low. Click the cat to pet it.
//
// How it fits the scene: the lane is a 2.5D stack of DOM layers (lamp rows and
// fog veils at fixed z-indexes). The cat is a real 3D model (assets/cat/
// scaffold-cat.glb, built in Blender) drawn into one small transparent canvas
// that follows it. Every frame the lane is read from the page itself, so the cat
// stays on the ground and at the right size next to the posts at any viewport:
//   - screen y, scale and lateral spread come from the measured lamp rows;
//   - depth (metres) is integrated from those rows so walking into the distance
//     moves the feet at the same rate they push the ground (no foot slide);
//   - the canvas sits just behind the near posts; the fog banks between the
//     cat and the viewer are re-applied to it as haze that ramps across each
//     row, so walking into the distance fades it smoothly into the fog.
//
// Plain ES module, no build step. Needs the importmap for "three" in the page.
// Desktop only (the lane is hidden under 900px); skipped for reduced motion.
// ?catdebug exposes window.__cat; ?catdebug=lines also draws the measured lane.

const DESK = matchMedia('(min-width: 900px)');
const CALM = matchMedia('(prefers-reduced-motion: reduce)');
const DEBUG = /[?&]catdebug\b/.test(location.search);
const GLB = new URL('assets/cat/scaffold-cat.glb', document.baseURI).href;

const LAMP_M = 4.6;            // the 200x900 lamp frame, in metres (Blender render camera)
const LANTERN_M = 4.05;        // gas mantle height
const PITCH = 13 * Math.PI / 180; // the lane is seen from slightly above
// a lamp post's outline: [height m, left, right as a share of the 200x900 frame's width],
// measured from the lamp art (all eight posts share it); from below ground to the top
const POST_PROFILE = [[-1, 0.215, 0.782], [0.15, 0.215, 0.782], [0.2, 0.242, 0.755], [0.25, 0.253, 0.745], [0.3, 0.295, 0.703],
  [0.42, 0.295, 0.703], [0.45, 0.335, 0.662], [0.55, 0.335, 0.662], [0.6, 0.352, 0.645], [0.7, 0.385, 0.613], [0.8, 0.362, 0.635],
  [1.0, 0.432, 0.565], [1.2, 0.485, 0.512], [LAMP_M, 0.485, 0.512]];
const SINP = Math.sin(PITCH), COSP = Math.cos(PITCH);
const DEG = Math.PI / 180;
const ORG_Y = 0.74;            // where the cat's feet sit inside its canvas
const CHASE_M = 2.6;           // beyond this (metres) a cursor isn't worth getting up for
const EYE_SCALE = 0.72;        // each eye shrunk across the face (not in depth): the model's eyes read huge at hero size
const BELLY_TUCK_M = 0.045;    // how far the belly is drawn up in a full crouch
const RIM_I = 1.2;             // the cool rim light that holds the silhouette (was 2.8 on the first, smoother model)
const HAZE_K = 0.6;            // share of each fog bank's haze laid on the cat
const REACH_H = 1.5;           // an air toy higher than this (metres) is only watched, never played with
const FLICK_MPS = 1.6;         // cursor speed (m/s at the cat's depth) that reads as a flick

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const wrap = (a) => { a %= 2 * Math.PI; if (a > Math.PI) a -= 2 * Math.PI; if (a < -Math.PI) a += 2 * Math.PI; return a; };
const damp = (c, t, k, dt) => c + (t - c) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;
function pick(items) {
  let s = 0; for (const it of items) s += it.w;
  let r = Math.random() * s;
  for (const it of items) { r -= it.w; if (r <= 0) return it; }
  return items[items.length - 1];
}

// ── clip facts (from CAT_HANDOFF.md / clipinfo.json, checked against the GLB) ──
const LOOPS = new Set(['idle_stand', 'walk', 'trot', 'run', 'sit_idle', 'loaf', 'groom', 'stalk_crouch']);
const ENDS = {
  stand_to_sit: 'SIT', sit_idle: 'SIT', groom: 'SIT', sit_ear_twitch: 'SIT', sit_slow_blink: 'SIT', loaf_to_sit: 'SIT',
  sit_to_loaf: 'LOAF', loaf: 'LOAF', stalk_crouch: 'CROUCH', butt_wiggle: 'CROUCH',
  idle_to_walk: 'WALK', bored_walkaway_start: 'WALK',
};
// Forward travel that keeps the planted paws still, sampled per frame (30 fps)
// from the GLB itself. The clips are in place; the code moves the cat.
const ROOT = {
  idle_to_walk: [0, 0, 0, 0.0006, 0.0023, 0.0052, 0.0096, 0.0102, 0.0121, 0.0156, 0.0204, 0.0264, 0.0335, 0.039, 0.045, 0.0519],
  walk_to_idle: [0, 0.0073, 0.0144, 0.021, 0.0265, 0.0308, 0.0336, 0.0349, 0.0401, 0.0439, 0.0462, 0.0473, 0.0474, 0.0474, 0.0474, 0.0474],
  bored_walkaway_start: [0, 0, 0, 0, 0, 0, 0.0004, 0.0011, 0.0021, 0.0034, 0.005, 0.007, 0.0093, 0.0095, 0.0099, 0.0107, 0.0119, 0.0134,
    0.0153, 0.0176, 0.0202, 0.023, 0.0262, 0.0297, 0.0333, 0.0371, 0.0396, 0.0425, 0.0456, 0.049, 0.0525],
};
const GAIT_SPEED = [0.2692, 0.6, 1.2857]; // walk, trot, run (m/s at 1x; walk and trot are re-measured at load)
const WALK = () => GAIT_SPEED[0];          // an unhurried walk is the walk clip at its own pace
const POUNCE = { start: 0.3, end: 0.7333 };  // seconds of the pounce clip the cat is airborne
// assets/cat/cat-motion.json (written by the Blender export) overrides the numbers
// above, so a re-animated model drops in without touching this file.
function applyMotion(j) {
  if (!j) return;
  if (j.gait_speed_mps) ['walk', 'trot', 'run'].forEach((g, i) => { if (+j.gait_speed_mps[g] > 0) GAIT_SPEED[i] = +j.gait_speed_mps[g]; });
  if (j.root_travel_m) for (const k of Object.keys(ROOT)) if (Array.isArray(j.root_travel_m[k]) && j.root_travel_m[k].length > 1) ROOT[k] = j.root_travel_m[k].map(Number);
  if (j.pounce && +j.pounce.flight_end_s > +j.pounce.flight_start_s) { POUNCE.start = +j.pounce.flight_start_s; POUNCE.end = +j.pounce.flight_end_s; }
}
// How much the procedural head-turn may override each clip (1 = fully).
const GAZE_ALLOW = {
  groom: 0, stretch: 0, pounce: 0.15, turn_L_90: 0.3, turn_R_90: 0.3, turn_180: 0.25, idle_look_around: 0.2,
  stand_to_sit: 0.5, sit_to_stand: 0.5, sit_to_loaf: 0.4, loaf_to_sit: 0.4, swat_L: 0.7, swat_R: 0.7, bat_play: 0.6,
  loco: 0.55, idle_to_walk: 0.5, walk_to_idle: 0.5, bored_walkaway_start: 0.2, sit_slow_blink: 0.8,
};

// speed bands follow the clips' own speeds, so each gait stays within ~0.65-1.35x.
// The run clip is never blended in: its hind legs flip up to 160° between two keys (a broken
// export), and nothing here asks for more than a trot. Past the trot band the trot just speeds up.
function gaitWeights(v) {
  const [w, t] = GAIT_SPEED;
  const a0 = w * 1.22, a1 = Math.max(a0 + 0.04, t * 0.75);
  if (v <= a0) return [1, 0, 0];
  if (v < a1) { const k = sm((v - a0) / (a1 - a0)); return [1 - k, k, 0]; }
  return [0, 1, 0];
}

// The walk and trot loops swing each leg forward in two or three keys (up to 70° a frame at
// 30 fps), so the stride reads as a snap rather than a swing. Each looping rotation track is
// softened with three passes of a cyclic [1 2 1] filter (the planted paws barely move, so stance and foot
// travel are kept; only the fast swings round off) and resampled at 60 fps with a Catmull-Rom
// spline, so the legs pass through the keys on a curve instead of a straight line between them.
// The same pass calms the tail-tip whips in the idle_stand and stalk_crouch loops.
const SMOOTH_PASSES = 3;
function smoothLoop(clip) {
  for (const tr of clip.tracks) {
    if (!tr.name.endsWith('.quaternion')) continue;
    const n = tr.times.length, m = n - 1, v = tr.values;
    if (m < 4) continue;
    const q = [];
    for (let i = 0; i < n; i++) q.push([v[4 * i], v[4 * i + 1], v[4 * i + 2], v[4 * i + 3]]);
    for (let i = 1; i < n; i++) if (dot4(q[i], q[i - 1]) < 0) q[i] = q[i].map((x) => -x);   // one hemisphere
    // the last key repeats the first (as a rotation); going round the loop may flip its sign
    const cyc = (arr, sign) => (i) => { const k = Math.floor(i / m), r = arr[i - k * m]; return (k & 1) && sign < 0 ? r.map((x) => -x) : r; };
    const Q = cyc(q, dot4(q[m], q[0]) < 0 ? -1 : 1);
    let f = q.slice(0, m), G = Q;
    for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
      const g = [];
      for (let i = 0; i < m; i++) { const a = G(i - 1), b = G(i), c = G(i + 1); g.push(norm4([0, 1, 2, 3].map((k) => (a[k] + 2 * b[k] + c[k]) / 4))); }
      for (let i = 1; i < m; i++) if (dot4(g[i], g[i - 1]) < 0) g[i] = g[i].map((x) => -x);
      f = g; G = cyc(f, dot4(f[m - 1], f[0]) < 0 ? -1 : 1);
    }
    const F = cyc(f, dot4(f[m - 1], f[0]) < 0 ? -1 : 1);
    const dt = tr.times[1] - tr.times[0], times = [], vals = [];
    for (let i = 0; i < m; i++) {
      for (const s of [0, 0.5]) {
        const p0 = F(i - 1), p1 = F(i), p2 = F(i + 1), p3 = F(i + 2);
        times.push((i + s) * dt); vals.push(...norm4([0, 1, 2, 3].map((k) => catmull(p0[k], p1[k], p2[k], p3[k], s))));
      }
    }
    const last = F(m); times.push(m * dt); vals.push(...last);
    tr.times = new Float32Array(times); tr.values = new Float32Array(vals);
  }
  return clip;
}
const dot4 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
const norm4 = (a) => { const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1; return a.map((x) => x / l); };
const catmull = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

// ───────────────────────────── the lane ─────────────────────────────
// Everything about where things are, measured from the DOM lamp rows.
const ROWS = ['near', 'mid', 'far', 'back'];
class Lane {
  constructor(hero) { this.hero = hero; this.measure(); }

  rel(el) {
    let x = 0, y = 0, e = el;
    while (e && e !== this.hero) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight, ok: e === this.hero };
  }

  measure() {
    const hero = this.hero;
    this.W = hero.clientWidth; this.H = hero.clientHeight;
    this.rows = ROWS.map((name) => {
      const L = hero.querySelector('.dhero-lamp.l.' + name), R = hero.querySelector('.dhero-lamp.r.' + name);
      const a = this.rel(L), b = this.rel(R);
      const f = parseFilter(getComputedStyle(L).filter);
      return { name, L, R, y: (a.y + a.h + b.y + b.h) / 2, ppm: (a.h + b.h) / 2 / LAMP_M,
        xl: a.x + a.w / 2, xr: b.x + b.w / 2, bright: f.bright, blur: f.blur };
    });
    this.ok = this.rows.every((r) => r.ppm > 5) && this.rows[0].y > this.rows[3].y + 20;
    if (!this.ok) return;
    // depth table: integrate dZ = dy / (ppm * sin(pitch)) from the near row back
    const y0 = this.rows[0].y, y1 = this.rows[3].y, n = Math.max(8, Math.ceil(y0 - y1));
    this.tY = new Float32Array(n + 1); this.tZ = new Float32Array(n + 1);
    let Z = 0; const step = (y0 - y1) / n;
    for (let i = 0; i <= n; i++) {
      const y = y0 - i * step;
      if (i > 0) Z += step / (this.ppmAtY(y + step / 2) * SINP);
      this.tY[i] = y; this.tZ[i] = Z;
    }
    for (const r of this.rows) {
      r.Z = this.zOfY(r.y);
      r.half = (r.xr - r.xl) / 2 / r.ppm;            // post distance from the lane centre, metres
    }
    // keep the paws (and shadow) clear of the hero's bottom edge
    this.Zmin = Math.max(0.4, 34 / (this.rows[0].ppm * SINP));
    this.Zmax = this.rows[3].Z - 0.3;
    this.lamps = [];
    for (const r of this.rows) for (const side of [-1, 1]) {
      const el = side < 0 ? r.L : r.R;
      this.lamps.push({ row: r.name, side, el, X: side * r.half, Z: r.Z, lit: !el.classList.contains('out') });
    }
    // fog banks in front of each row
    const haze = getComputedStyle(hero).getPropertyValue('--haze');
    const m = haze.match(/rgba?\(([^)]+)\)/);
    const parts = m ? m[1].split(',').map(parseFloat) : [30, 23, 17, 0.78];
    this.hazeRGB = parts.slice(0, 3); this.hazeA = parts[3] ?? 1;
    this.veils = {};
    for (const name of ['mid', 'far', 'back']) {
      const el = hero.querySelector('.dhero-veil.' + name);
      if (!el || getComputedStyle(el).display === 'none') continue;
      const r = this.rel(el);
      this.veils[name] = { ...r, op: parseFloat(getComputedStyle(el).opacity) || 1 };
    }
    this.maxPPM = this.ppmAtY(this.yOfZ(this.Zmin));
  }

  refreshLit() { for (const l of this.lamps) l.lit = !l.el.classList.contains('out'); }

  interpY(y, key) {
    const R = this.rows;
    if (y >= R[0].y) return R[0][key] + (R[0][key] - R[1][key]) / (R[0].y - R[1].y) * (y - R[0].y);
    for (let i = 0; i < 3; i++) {
      if (y >= R[i + 1].y) return lerp(R[i][key], R[i + 1][key], (R[i].y - y) / (R[i].y - R[i + 1].y));
    }
    return R[3][key] + (R[3][key] - R[2][key]) / (R[3].y - R[2].y) * (y - R[3].y);
  }
  ppmAtY(y) { return Math.max(4, this.interpY(y, 'ppm')); }
  cAtY(y) { return (this.interpY(y, 'xl') + this.interpY(y, 'xr')) / 2; }
  halfAtY(y) { return (this.interpY(y, 'xr') - this.interpY(y, 'xl')) / 2 / this.ppmAtY(y); }

  zOfY(y) {
    const { tY, tZ } = this, n = tY.length - 1;
    if (y >= tY[0]) return -(y - tY[0]) / (this.ppmAtY(tY[0]) * SINP);
    if (y <= tY[n]) return tZ[n] + (tY[n] - y) / (this.ppmAtY(tY[n]) * SINP);
    const f = (tY[0] - y) / (tY[0] - tY[n]) * n, i = Math.floor(f);
    return lerp(tZ[i], tZ[Math.min(n, i + 1)], f - i);
  }
  yOfZ(Z) {
    const { tY, tZ } = this, n = tZ.length - 1;
    if (Z <= 0) return tY[0] - Z * this.ppmAtY(tY[0]) * SINP;
    if (Z >= tZ[n]) return tY[n] - (Z - tZ[n]) * this.ppmAtY(tY[n]) * SINP;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (tZ[mid] < Z) lo = mid; else hi = mid; }
    return lerp(tY[lo], tY[hi], (Z - tZ[lo]) / (tZ[hi] - tZ[lo] || 1));
  }
  toScreen(X, Z) { const y = this.yOfZ(Z), ppm = this.ppmAtY(y); return { x: this.cAtY(y) + X * ppm, y, ppm }; }
  halfW(Z) { return this.halfAtY(this.yOfZ(Z)); }
  // ground point under a screen point, or null when the point is above the lane
  fromScreen(x, y) {
    if (y < this.rows[3].y - 4) return null;
    const Z = this.zOfY(Math.min(y, this.rows[0].y + 40));
    const yy = this.yOfZ(Z);
    return { X: (x - this.cAtY(yy)) / this.ppmAtY(yy), Z };
  }
  clampIn(X, Z, margin = 0.55) {
    Z = clamp(Z, this.Zmin, this.Zmax);
    const h = Math.max(0.2, this.halfW(Z) - margin);
    return { X: clamp(X, -h, h), Z };
  }
  inside(X, Z, margin = 0.55) {
    return Z >= this.Zmin - 1e-3 && Z <= this.Zmax + 1e-3 && Math.abs(X) <= this.halfW(Z) - margin + 1e-3;
  }
  // a spot snug against a post: a little in front of it and just inward of the plinth
  spot(lamp) {
    const Z = clamp(lamp.Z - 0.35, this.Zmin, this.Zmax);
    return { X: lamp.side * Math.max(0.3, this.halfW(Z) - 0.5), Z, lamp };
  }
  randomPoint() {
    const Z = lerp(this.Zmin, this.Zmax, Math.pow(Math.random(), 1.25));
    const h = Math.max(0.2, this.halfW(Z) - 0.6);
    return { X: rnd(-h, h), Z };
  }
  // fog-bank haze at a screen point (the CSS veil: linear haze, elliptical mask)
  veilAlpha(name, x, y) {
    const v = this.veils[name]; if (!v) return 0;
    const f = (v.y + v.h - y) / v.h; if (f < 0 || f > 1) return 0;
    const grad = f <= 0.4 ? 1 : Math.max(0, 1 - (f - 0.4) / 0.6);
    const ex = (x - (v.x + v.w / 2)) / (0.45 * v.w);
    const r = Math.hypot(ex, f);
    const mask = r <= 0.4 ? 1 : Math.max(0, 1 - (r - 0.4) / 0.6);
    return this.hazeA * grad * mask * v.op;
  }
  // per-depth extra dimming/blur the lamp rows carry (filter: brightness() blur())
  filterAt(Z) {
    const R = this.rows;
    if (Z <= R[0].Z) return { bright: R[0].bright, blur: R[0].blur };
    for (let i = 0; i < 3; i++) {
      if (Z <= R[i + 1].Z) {
        const t = (Z - R[i].Z) / (R[i + 1].Z - R[i].Z);
        return { bright: lerp(R[i].bright, R[i + 1].bright, t), blur: lerp(R[i].blur, R[i + 1].blur, t) };
      }
    }
    return { bright: R[3].bright, blur: R[3].blur };
  }
}
function parseFilter(s) {
  const b = /brightness\(([\d.]+)\)/.exec(s || ''), u = /blur\(([\d.]+)px\)/.exec(s || '');
  return { bright: b ? parseFloat(b[1]) : 1, blur: u ? parseFloat(u[1]) : 0 };
}

// ───────────────────────────── animation ─────────────────────────────
// One active "slot" at a time (a clip, or locomotion), with eased crossfades.
// Locomotion blends walk/trot/run by speed, phase-synced, and moves the cat at
// exactly the speed its planted paws push the ground.
class Motor {
  constructor(THREE, root, clips) {
    this.mixer = new THREE.AnimationMixer(root);
    this.s = new Map();
    const all = [];
    const slot = (c) => {
      const act = this.mixer.clipAction(c);
      const loop = LOOPS.has(c.name);
      act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      act.clampWhenFinished = true;
      act.play(); act.enabled = false;
      const root = ROOT[c.name] || null;
      const endSlope = root ? (root[root.length - 1] - root[root.length - 2]) * 30 : 0;
      const x = { name: c.name, act, dur: c.duration, loop, w: 0, e: 0, target: 0, rate: 4, prev: 0, root, endSlope };
      all.push(x); return x;
    };
    for (const c of clips) {
      const a = slot(c);
      this.s.set(c.name, a);
      // Every clip but the gaits gets a twin action. A clip asked to start again while it is
      // still showing (a second swat, the second half of a big turn) starts on the twin and
      // crossfades from the first; one action can't fade into itself, so it used to snap
      // back to frame 0 (bones jumped up to 90° in one frame).
      if (!['walk', 'trot', 'run'].includes(c.name)) { const b = slot(c.clone()); a.twin = b; b.twin = a; }
    }
    this.gaits = ['walk', 'trot', 'run'].map((n) => this.s.get(n));
    for (const g of this.gaits) { g.act.timeScale = 0; g.gait = true; }
    this.loco = { name: 'loco', w: 0, e: 0, target: 0, rate: 4, p: 0, v: 0.27, k: 1, speed: 0.27, wrapped: false };
    this.slots = all.filter((x) => !x.gait).concat([this.loco]);
    this.cur = null;
    this.pounceTravel = 0.45;
    this.step = 0;
  }
  has(name) { return this.s.has(name); }
  play(name, fade = 0.25, restart = true, speed = 1) {
    let x = name === 'loco' ? this.loco : this.s.get(name);
    if (!x) return;
    if (this.cur === name && (!restart || (x.loop && x.w > 0.5))) return;   // a loop already playing just carries on
    if (x !== this.loco && x.twin && (restart || !x.loop) && x.w > 0.02) { x = x.twin; this.s.set(name, x); }
    if (x !== this.loco) x.act.timeScale = speed;
    const rate = 1 / Math.max(fade, 1 / 120);
    for (const o of this.slots) { o.target = o === x ? 1 : 0; o.rate = rate; }
    if (x !== this.loco) {
      if (restart || x.w < 0.02 || !x.loop) { x.act.reset(); x.prev = 0; }
      x.act.enabled = true;
    } else if (x.w < 0.05) x.p = 0;
    this.cur = name;
  }
  time(name) { const x = this.s.get(name); return x ? x.act.time : 0; }
  dur(name) { const x = this.s.get(name); return x ? x.dur : 0; }
  done(name) { const x = this.s.get(name); return !x || (!x.loop && x.act.time >= x.dur - 1e-3); }
  busy() { return !!this.cur && this.cur !== 'loco' && !this.s.get(this.cur).loop && !this.done(this.cur); }

  update(dt) {
    let sum = 0;
    for (const o of this.slots) {
      if (o.w < o.target) o.w = Math.min(o.target, o.w + o.rate * dt);
      else if (o.w > o.target) o.w = Math.max(o.target, o.w - o.rate * dt);
      o.e = sm(o.w); sum += o.e;
    }
    sum = sum || 1;
    const L = this.loco, gw = gaitWeights(L.v);
    const nat = gw[0] * GAIT_SPEED[0] + gw[1] * GAIT_SPEED[1] + gw[2] * GAIT_SPEED[2];
    L.k = clamp(L.v / nat, 0.65, 1.35); L.speed = L.k * nat;
    const freq = gw[0] / this.gaits[0].dur + gw[1] / this.gaits[1].dur + gw[2] / this.gaits[2].dur;
    L.wrapped = false;
    if (L.w > 0) { L.p += dt * L.k * freq; if (L.p >= 1) { L.p %= 1; L.wrapped = true; } }
    for (const o of this.slots) {
      const e = o.e / sum;
      if (o === L) {
        this.gaits.forEach((g, i) => {
          const w = e * gw[i];
          g.act.enabled = w > 1e-4;
          g.act.time = L.p * g.dur;
          g.act.setEffectiveWeight(w);
        });
        continue;
      }
      if (e < 1e-4 && o.target === 0) { o.act.enabled = false; continue; }
      o.act.enabled = true;
      o.act.setEffectiveWeight(e);
    }
    this.mixer.update(dt);
    // forward root motion, weighted the same way the poses are
    let step = (L.e / sum) * L.speed * dt;
    for (const o of this.slots) {
      if (o === L || o.e < 1e-4) continue;
      const t = o.act.time;
      let d = 0;
      if (o.name === 'pounce') {
        const f = (x) => this.pounceTravel * sm((x - POUNCE.start) / (POUNCE.end - POUNCE.start));
        d = f(t) - f(Math.min(o.prev, t));
      } else if (o.root) {
        if (!o.loop && t >= o.dur - 1e-3 && o.prev >= o.dur - 1e-3) d = o.endSlope * dt;
        else d = rootAt(o.root, t) - rootAt(o.root, Math.min(o.prev, t));
      }
      o.prev = t;
      step += (o.e / sum) * d;
    }
    this.step = step;
  }
}
function rootAt(tab, t) {
  const f = t * 30, i = Math.floor(f);
  if (i >= tab.length - 1) return tab[tab.length - 1];
  return lerp(tab[i], tab[i + 1], f - i);
}

// ───────────────────────────── the cat ─────────────────────────────
class Cat {
  constructor(THREE, hero, gltf, lane) {
    this.T = THREE; this.hero = hero;
    this.lane = lane; this.hazeNow = 0; this.earsWant = 0;
    this.X = 0; this.Z = 2; this.yaw = 0; this.creep = 0; this.vis = 1; this.camPhi = 0;
    this.posture = 'STAND'; this.outside = false;
    this.interest = 0; this.cool = 4; this.playStreak = 0;
    this.time = 0; this.relocate = false;
    this.ptr = { cx: -1, cy: -1, x: 0, y: 0, inside: false, speed: 0, lastT: 0, moved: 0 };
    this.toy = null;
    this.glance = null; this.nextGlance = rnd(3, 6);
    this.gazeOverride = null;
    this.blink = { next: rnd(1.5, 4), t: -1, dbl: false, gap: 0 };
    this.chatter = 0; this.earsBack = 0;
    this.toyV = { X: 0, Z: 0, sp: 0 }; this.toyPrev = null;   // where a toy on the ground is heading
    this.atLamp = null;                                // the post it last walked up to, while it is still there
    this.lampSeen = new Map();                         // lamp -> when it last had a visit (a lamp never visited is missing)
    this.lockT = -9;                                   // when it last locked on (ear and tail flick)
    this.flickT = -9;                                  // when the cursor last whipped past its face

    // ── model ──
    for (const c of gltf.animations) {                   // GLB keys start at Blender frame 1
      let first = Infinity, last = 0;
      for (const t of c.tracks) { first = Math.min(first, t.times[0]); last = Math.max(last, t.times[t.times.length - 1]); }
      for (const t of c.tracks) { t.times = t.times.slice(); t.shift(-first); }   // times arrays are shared between tracks
      c.duration = last - first;
      if (['walk', 'trot', 'idle_stand', 'stalk_crouch'].includes(c.name)) smoothLoop(c);   // the tail tip whips in the last two
    }
    this.model = gltf.scene;
    this.morphs = [];
    this.model.traverse((o) => {
      if (o.isMesh) { o.frustumCulled = false; if (o.morphTargetInfluences) this.morphs.push(o); }
      // tuned in the page's light: matte near-black fur, eyes that catch the lamplight without blowing out
      const m = o.material;
      if (m && m.name === 'cat_fur') {
        m.color.set(0x141219); m.roughness = 0.78; if ('specularIntensity' in m) m.specularIntensity = 0.15;
        if ('sheen' in m) m.sheen = 0;
        // The model's body is inside out: its triangles wind (and its normals point) inward
        // (signed volume < 0). Drawn front-side, the renderer showed the inside of the far wall
        // of the body, so the eyes showed through the back of the head when he faced away, and
        // the lights hit the wrong side (the pale underside and violet belly worked around
        // before). Back faces of an inside-out mesh are its true outside, and three flips the
        // normals of back faces for lighting, so this one setting fixes both.
        m.side = THREE.BackSide;
        if (o.isSkinnedMesh) this.firmChest(o);
        if (o.isSkinnedMesh && !(m.alphaTest > 0)) this.addBellyTuck(THREE, o);
        // The alpha fur shells were extruded along those inward normals, so they sit inside
        // the body and can never be seen once it is drawn the right way out: skip them.
        if (m.alphaTest > 0) o.visible = false;
      }
      if (m && m.name === 'cat_eye') {
        // eyeshine, not two white lights: a lamplit gold-green that dims with the scene
        m.color.set(0xc9c27e); m.emissive.set(0x8a8236); m.emissiveIntensity = 1.1; m.side = THREE.FrontSide;
        m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -2;   // wins the tie with the lids it sits flush against
        this.shrinkEyes(o.geometry);
      }
      if (o.isBone) o.matrixAutoUpdate = true;
    });
    this.bones = { neck_01: null, neck_02: null, head: null };
    for (const n of Object.keys(this.bones)) this.bones[n] = this.model.getObjectByName(n);
    this.tail = ['tail_04', 'tail_05', 'tail_06', 'tail_07'].map((n) => this.model.getObjectByName(n)).filter(Boolean);
    this.gaze = { w: 0, yaw: 0, pitch: 0, ay: 0, ap: 0, inited: false, per: { neck_01: [0, 0], neck_02: [0, 0], head: [0, 0] } };

    // ── renderer ──
    const canvas = this.canvas = document.createElement('canvas');
    canvas.className = 'dhero-cat';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', zIndex: '6',
      opacity: '0', transition: 'opacity 1.2s ease', willChange: 'transform' });
    hero.appendChild(canvas);
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.setClearColor(0x000000, 0);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.AgXToneMapping;
    r.toneMappingExposure = 1.0;

    const scene = this.scene = new THREE.Scene();
    this.body = new THREE.Group(); scene.add(this.body); this.body.add(this.model);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
    this.camera.position.set(0, SINP * 12, COSP * 12); this.camera.lookAt(0, 0, 0);
    scene.fog = new THREE.FogExp2(new THREE.Color().setRGB(...this.lane.hazeRGB.map((v) => v / 255), THREE.SRGBColorSpace), 0);

    // gaslight: the two nearest lit lamps light the cat from where they stand
    this.hemi = new THREE.HemisphereLight(0x3a3440, 0x0a0705, 0.15); scene.add(this.hemi);
    this.keys = [0, 1].map(() => { const l = new THREE.DirectionalLight(0xffc27a, 0); scene.add(l); return l; });
    this.rim = new THREE.DirectionalLight(0xd8c9f0, RIM_I); this.rim.position.set(-1.3, 1.5, -2.2); scene.add(this.rim);
    this.fill = new THREE.DirectionalLight(0xffc27c, 0.1); this.fill.position.set(0.4, 0.6, 3); scene.add(this.fill);

    // soft contact shadow
    const sc = document.createElement('canvas'); sc.width = sc.height = 64;
    const g = sc.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.55, 'rgba(0,0,0,.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(sc);
    this.shadowMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.55, fog: false });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.shadowMat);
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.y = 0.002; this.shadow.renderOrder = -1;
    this.shadow.scale.set(0.3, 0.62, 1);
    this.body.add(this.shadow);

    this.calibrateGaits(THREE, gltf.animations);
    this.motor = new Motor(THREE, this.model, gltf.animations);
    this.motor.play('idle_stand', 0);
    this.brain = new Brain(this);
    this.sizeCanvas();
    this.tmp = { v: new THREE.Vector3(), v2: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(),
      q3: new THREE.Quaternion(), qy: new THREE.Quaternion(), qp: new THREE.Quaternion(), e: new THREE.Euler() };
    this.style = { z: '', f: '', t: '', c: 'none' };
    this.peek = null;                                  // { lamp } while he is behind a post in the intro
  }

  // The skin of the chest between the front legs is partly tied to the upper-leg bones (up to
  // half its weight). When the legs fold back into a crouch they drag it down into a point:
  // the belly hung like a triangle. Near the midline, where a vertex is also tied to the torso,
  // most of that leg pull is handed to the torso bone it is already blended with. The legs
  // themselves (no torso weight) are untouched.
  firmChest(mesh) {
    const g = mesh.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
    if (!P || !SI || !SW || g.userData.chestFirmed) return;
    g.userData.chestFirmed = true;
    const names = mesh.skeleton.bones.map((b) => b.name);
    const isLeg = (n) => /^fl_(upper|lower)_/.test(n), isTorso = (n) => /^(chest|neck_0\d|spine_0\d)$/.test(n);
    for (let i = 0; i < P.count; i++) {
      let torso = 0, best = -1, bw = 0, leg = 0;
      for (let k = 0; k < 4; k++) {
        const n = names[SI.getComponent(i, k)], w = SW.getComponent(i, k);
        if (isTorso(n)) { torso += w; if (w > bw) { bw = w; best = k; } }
        if (isLeg(n)) leg += w;
      }
      if (best < 0 || leg <= 0) continue;
      const f = 0.85 * sm((0.07 - Math.abs(P.getX(i))) / 0.03) * sm((torso - 0.1) / 0.15);
      if (f <= 0) continue;
      let moved = 0;
      for (let k = 0; k < 4; k++) if (isLeg(names[SI.getComponent(i, k)])) { const w = SW.getComponent(i, k); SW.setComponent(i, k, w * (1 - f)); moved += w * f; }
      SW.setComponent(i, best, SW.getComponent(i, best) + moved);
    }
    SW.needsUpdate = true;
  }

  // In a crouch the body drops ~5 cm while both upper legs fold hard (97° front, 75° back) and
  // take the skin over them up with them; the belly between was left hanging as a flat,
  // sharp-cornered plate (a triangle in side view). A corrective shape, as a rig would have:
  // each belly vertex between the legs has a weight (low on the torso, away from the legs),
  // and while he is crouched the vertex shader lifts it, in the model's own space, before
  // skinning. The lift follows how much of the pose is a crouch (see crouchAmount).
  addBellyTuck(THREE, mesh) {
    const g = mesh.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
    if (!P || !SI || !SW || g.attributes.tuck) return;
    const names = mesh.skeleton.bones.map((b) => b.name), tuck = new Float32Array(P.count);
    for (let i = 0; i < P.count; i++) {
      let leg = 0;
      for (let k = 0; k < 4; k++) if (/^(hl|fl)_/.test(names[SI.getComponent(i, k)])) leg += SW.getComponent(i, k);
      const span = sm((0.21 - Math.abs(P.getZ(i) - 0.02)) / 0.08);   // between the front and back legs
      const low = sm((0.2 - P.getY(i)) / 0.07);                      // the lower half of the torso
      tuck[i] = span * low * clamp(1 - 1.2 * leg, 0, 1);
    }
    g.setAttribute('tuck', new THREE.BufferAttribute(tuck, 1));
    const u = this.tuck = { value: 0 }, mat = mesh.material;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTuck = u;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float tuck;\nuniform float uTuck;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += tuck * uTuck;');
    };
    mat.customProgramCacheKey = () => 'cat-belly-tuck';
    mat.needsUpdate = true;
  }
  // how much of the current pose is a crouch (0..1): the stalk and wiggle, and a pounce until it leaves the ground
  crouchAmount() {
    const M = this.motor; let w = 0, all = 0;
    for (const o of M.slots) {
      all += o.e;
      if (o.name === 'stalk_crouch' || o.name === 'butt_wiggle') w += o.e;
      else if (o.name === 'pounce') w += o.e * (1 - sm((o.act.time - POUNCE.start + 0.08) / 0.16));
    }
    return all > 0 ? w / all : 0;
  }

  // Each gait's natural speed is read off the (smoothed) clip itself: how fast a planted paw
  // travels backward under the body. Moving the cat at exactly that speed keeps the paws still
  // on the ground; the exported speeds were measured before the strides were smoothed.
  calibrateGaits(THREE, clips) {
    const paws = ['fl_paw_L', 'fl_paw_R', 'hl_paw_L', 'hl_paw_R'].map((n) => this.model.getObjectByName(n));
    if (paws.some((p) => !p)) return;
    const mixer = new THREE.AnimationMixer(this.model), v = new THREE.Vector3(), inv = new THREE.Matrix4();
    ['walk', 'trot'].forEach((name, gi) => {
      const clip = clips.find((c) => c.name === name); if (!clip) return;
      const act = mixer.clipAction(clip); act.play();
      const N = 64, track = paws.map(() => []);
      for (let i = 0; i <= N; i++) {
        act.time = clip.duration * i / N; mixer.update(0);
        this.model.updateMatrixWorld(true); inv.copy(this.model.matrixWorld).invert();
        paws.forEach((p, k) => { p.getWorldPosition(v).applyMatrix4(inv); track[k].push([v.y, v.z]); });
      }
      const vs = [];
      for (const tr of track) {          // only the truly planted stretch (within 3 mm of the floor)
        const low = Math.min(...tr.map((x) => x[0]));
        for (let i = 1; i <= N; i++) if (tr[i][0] < low + 0.003 && tr[i - 1][0] < low + 0.003) vs.push((tr[i - 1][1] - tr[i][1]) / (clip.duration / N));
      }
      vs.sort((a, b) => a - b);
      const speed = vs.length > 4 ? vs[vs.length >> 1] : 0;   // median: lift-off and touch-down don't drag it
      if (speed > 0.05 && speed < 3) GAIT_SPEED[gi] = speed;
      act.stop(); mixer.uncacheAction(clip);
    });
    mixer.uncacheRoot(this.model);
  }

  // The two eyes are one mesh. Each is shrunk across the face only (in the plane square to its
  // own outward direction), never in depth: shrinking it in depth as well sank it behind the
  // eyelids once the head was drawn the right way out. Bind pose, so skinning still lines up;
  // the morph deltas (the blink) get the same in-plane scaling.
  shrinkEyes(geo) {
    if (!geo || !geo.attributes.position || geo.userData.eyesShrunk) return;
    geo.userData.eyesShrunk = true;
    const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count;
    const eye = [0, 1].map(() => ({ c: [0, 0, 0], d: [0, 0, 0], k: 0 }));
    const side = (i) => eye[pos.getX(i) < 0 ? 0 : 1];
    for (let i = 0; i < n; i++) {
      const e = side(i); e.k++;
      e.c[0] += pos.getX(i); e.c[1] += pos.getY(i); e.c[2] += pos.getZ(i);
      if (nor) { e.d[0] += nor.getX(i); e.d[1] += nor.getY(i); e.d[2] += nor.getZ(i); }
    }
    for (const e of eye) {
      e.c = e.c.map((v) => v / Math.max(1, e.k));
      const l = Math.hypot(...e.d);
      e.d = l > 1e-6 ? e.d.map((v) => v / l) : [0, 0, 1];
    }
    const planar = (e, x, y, z) => {          // keep the part along the eye's direction, scale the rest
      const along = x * e.d[0] + y * e.d[1] + z * e.d[2];
      return [0, 1, 2].map((k) => along * e.d[k] + ([x, y, z][k] - along * e.d[k]) * EYE_SCALE);
    };
    for (let i = 0; i < n; i++) {
      const e = side(i), p = planar(e, pos.getX(i) - e.c[0], pos.getY(i) - e.c[1], pos.getZ(i) - e.c[2]);
      pos.setXYZ(i, e.c[0] + p[0], e.c[1] + p[1], e.c[2] + p[2]);
    }
    pos.needsUpdate = true;
    for (const a of geo.morphAttributes.position || []) {
      for (let i = 0; i < a.count; i++) { const p = planar(side(i), a.getX(i), a.getY(i), a.getZ(i)); a.setXYZ(i, p[0], p[1], p[2]); }
      a.needsUpdate = true;
    }
    geo.computeBoundingSphere();
  }

  sizeCanvas() {
    const ppm = this.lane.maxPPM * 1.2;
    this.cw = Math.ceil(1.5 * ppm); this.ch = Math.ceil(1.05 * ppm);
    this.renderer.setSize(this.cw, this.ch, true);
  }
  remeasure() {
    const before = this.lane.ok;
    this.lane.measure();
    if (!this.lane.ok) return;
    this.sizeCanvas();
    if (before && !this.outside) { const c = this.lane.clampIn(this.X, this.Z, 0.45); this.X = c.X; this.Z = c.Z; }
  }

  // The cat is one canvas between the near and mid posts, so it is always drawn over the mid,
  // far and back posts. That is right when he is in front of a post and wrong when he is
  // behind it (deeper in the lane): he would look pasted over it. A post nearer than he is
  // never gets hidden: when his sprite would overlap its base on screen, he stays inward of it.
  avoidPosts() {
    const L = this.lane, s = L.toScreen(this.X, this.Z), cw = 0.2 * s.ppm * this.vis;
    for (const l of L.lamps) {
      if (l.row === 'near' || l.Z >= this.Z - 0.05) continue;     // the near posts are drawn over him already
      const ls = L.toScreen(l.X, l.Z), keep = 0.4 * ls.ppm + cw + 6;
      if ((s.x - ls.x) * l.side > -keep) this.X = (ls.x - l.side * keep - L.cAtY(s.y)) / s.ppm;
    }
  }

  // ── geometry helpers ──
  distTo(t) { return Math.hypot(t.X - this.X, t.Z - this.Z); }
  headingTo(t) { return Math.atan2(t.X - this.X, -(t.Z - this.Z)); }
  steer(t, maxRate, dt) {
    if (!t) return;
    const err = wrap(this.headingTo(t) - this.yaw);
    this.yaw = wrap(this.yaw + clamp(err * 2.6, -maxRate, maxRate) * dt);
  }
  // lane point (X, height, Z) into the cat's own space (+Z forward, +X its left)
  toLocal(X, h, Z, out) {
    const dx = X - this.X, dz = -(Z - this.Z), a = -this.yaw, c = Math.cos(a), s = Math.sin(a);
    return out.set(dx * c + dz * s, h, -dx * s + dz * c);
  }
  nearestLamps(lit = true) {
    return this.lane.lamps.filter((l) => !lit || l.lit)
      .map((l) => ({ l, d: Math.hypot(l.X - this.X, l.Z - this.Z) })).sort((a, b) => a.d - b.d);
  }
  lampHere() { return this.atLamp && this.distTo(this.lane.spot(this.atLamp)) < 0.8 ? this.atLamp : null; }
  nearLitLamp(r) { const n = this.nearestLamps(true)[0]; return n && n.d < r ? n.l : null; }

  // ── pointer ──
  onPointer(e) {
    const p = this.ptr, now = performance.now() / 1000;
    if (p.cx >= 0) {
      const d = Math.hypot(e.clientX - p.cx, e.clientY - p.cy), dtp = Math.max(1 / 240, now - p.lastT);
      p.speed = Math.max(p.speed, Math.min(3000, d / dtp) * 0.6);
      p.moved += d;
    }
    p.cx = e.clientX; p.cy = e.clientY; p.lastT = now;
    if (e.pointerType && e.pointerType !== 'mouse') p.speed = Math.max(p.speed, 400);
  }
  onPress(e) {
    this.onPointer(e);
    const p = this.ptrToHero(); if (!p) return;
    const s = this.lane.toScreen(this.X, this.Z), ppm = s.ppm * this.vis;
    const dx = Math.abs(p.x - s.x), dy = s.y - p.y;
    if (dx < 0.38 * ppm && dy > -0.08 * ppm && dy < 0.5 * ppm) this.brain.petted = true;
  }
  ptrToHero() {
    const p = this.ptr; if (p.cx < 0) return null;
    const r = this.hero.getBoundingClientRect();
    const x = p.cx - r.left, y = p.cy - r.top;
    return x >= 0 && y >= 0 && x <= r.width && y <= r.height ? { x, y } : null;
  }
  // what the cursor is to the cat: a thing on the ground, or a thing in the air
  readToy() {
    const hp = this.ptrToHero(); this.ptr.inside = !!hp;
    if (!hp) return null;
    this.ptr.x = hp.x; this.ptr.y = hp.y;
    const yc = this.lane.yOfZ(this.Z), ppm = this.lane.ppmAtY(yc) * this.vis;
    // cursor speed in metres per second at the cat's own depth, so a wiggle reads
    // the same whether the cat is near the front or back by the far lamps
    this.ptr.mps = this.ptr.speed / ppm;
    const moving = this.ptr.mps > 0.18;
    const ax = (hp.x - this.lane.cAtY(yc)) / ppm, ah = (yc - hp.y) / (ppm * COSP);
    // hovering just over the cat means "over the cat", not a spot on the ground behind it
    // on or just over the cat means "on the cat", not a spot on the ground behind
    // it; while it's hunting something on the ground it takes more to change its mind
    const hunting = this.toy && this.toy.kind === 'ground' && (this.posture === 'CROUCH' || this.brain.note === 'chase' || this.brain.note === 'stalk');
    let overCat = Math.abs(ax - this.X) < 0.5 && ah > (hunting ? 0.5 : 0.15) * this.vis && ah < 1.0;
    // Low on the body is ambiguous in 2.5D: the same pixel is a spot on the ground
    // just behind the cat. When that spot is behind it and close (under ~0.8 m deeper
    // in the lane), it is the ground: the cat turns round for it instead of swatting
    // the air over its back.
    let g0 = null;
    if (overCat && ah < 0.3 * this.vis && (g0 = this.lane.fromScreen(hp.x, hp.y))) {
      const behind = this.toLocal(g0.X, 0, g0.Z, this.tmp.v2).z < 0;
      if (behind && g0.Z - this.Z < 0.8) overCat = false;
    }
    const g = overCat ? null : g0 || this.lane.fromScreen(hp.x, hp.y);
    if (g && g.Z <= this.lane.Zmax + 0.6) {
      const c = this.lane.clampIn(g.X, g.Z, 0.5);
      return { kind: 'ground', X: c.X, Z: c.Z, h: 0.02, moving, dm: Math.hypot(c.X - this.X, c.Z - this.Z) };
    }
    return { kind: 'air', X: ax, Z: this.Z, h: ah, moving, dm: Math.hypot(ax - this.X, Math.max(0, ah - 0.3)) };
  }

  updateAttention(dt) {
    const p = this.ptr, toy = this.toy;
    p.speed = damp(p.speed, 0, 6, dt);
    if (toy && (p.mps || 0) > FLICK_MPS && toy.dm < 0.6) this.flickT = this.time;
    if (!toy) { this.interest = Math.max(0, this.interest - dt * 0.8); return; }
    const prox = Math.exp(-toy.dm / 1.1);                 // 1 on the cat, ~0.4 a metre away, ~0.1 at chase range
    const act = clamp((p.mps || 0) / 0.5, 0, 1);
    const reach = toy.kind === 'ground' || toy.h < REACH_H;   // high over the lane: watch it, never get up for it
    if (act > 0.3 && toy.dm < CHASE_M && reach) this.interest += dt * 3.0 * act * (0.15 + prox);
    else this.interest -= dt * 0.6;
    this.interest = clamp(this.interest, 0, 1.6);
  }

  // a toy on the ground: smoothed velocity, so a pounce can lead a moving cursor
  trackToy(dt) {
    const t = this.toy, v = this.toyV, p = this.toyPrev;
    if (t && t.kind === 'ground' && p && dt > 0) {
      let vx = (t.X - p.X) / dt, vz = (t.Z - p.Z) / dt;
      const sp = Math.hypot(vx, vz);
      // a flick on the ground is judged in ground metres: one that runs into the lane
      // barely moves on screen (the lane is seen from just 13 degrees up)
      if (sp > FLICK_MPS && t.dm < 0.6) this.flickT = this.time; if (sp > 2.5) { vx *= 2.5 / sp; vz *= 2.5 / sp; }
      v.X = damp(v.X, vx, 4, dt); v.Z = damp(v.Z, vz, 4, dt); v.sp = damp(v.sp, Math.hypot(vx, vz), 4, dt);
    } else { v.X = damp(v.X, 0, 8, dt); v.Z = damp(v.Z, 0, 8, dt); v.sp = damp(v.sp, 0, 8, dt); }
    this.toyPrev = t && t.kind === 'ground' ? { X: t.X, Z: t.Z } : null;
    // motion along the lane (toward or away from the viewer) hardly moves on screen,
    // so a toy on the ground also counts as moving by its speed over the ground
    if (t && t.kind === 'ground') {
      this.ptr.mps = Math.max(this.ptr.mps, 0.6 * v.sp);
      t.moving = t.moving || this.ptr.mps > 0.18;
    }
  }
  // where a ground toy will be in `sec` seconds (at most half a metre ahead of it).
  // Only a toy going somewhere is led: a jiggle averages out to no heading, so
  // the lead is scaled by how steady the motion is (net velocity / mean speed).
  lead(sec) {
    const t = this.toy, v = this.toyV; if (!t || t.kind !== 'ground') return null;
    const steady = v.sp > 0.05 ? Math.pow(clamp(Math.hypot(v.X, v.Z) / v.sp, 0, 1), 2) : 0;
    let dx = v.X * sec * steady, dz = v.Z * sec * steady;
    const d = Math.hypot(dx, dz); if (d > 0.5) { dx *= 0.5 / d; dz *= 0.5 / d; }
    return this.lane.clampIn(t.X + dx, t.Z + dz, 0.5);
  }

  // ── per-frame ──
  update(dt) {
    this.time += dt;
    this.cool = Math.max(0, this.cool - dt);
    this.toy = this.readToy();
    this.trackToy(dt);
    this.updateAttention(dt);
    this.brain.tick(dt);
    this.unlayer();
    this.motor.update(dt);
    if (this.tuck) this.tuck.value = BELLY_TUCK_M * this.crouchAmount();

    // move
    const step = this.motor.step + this.creep * dt;
    this.X += Math.sin(this.yaw) * step; this.Z -= Math.cos(this.yaw) * step;
    const L = this.lane;
    // once he is clear of the post he peeked round, he is an ordinary cat in the lane again
    if (this.peek && (Math.abs(this.X - this.peek.lamp.X) > 0.85 || this.Z < this.peek.lamp.Z - 0.15)) this.peek = null;
    if (this.peek) { /* hiding behind a post: the post's mask does the depth; no lane clamp */ }
    else if (this.outside) { if (L.inside(this.X, this.Z, 0.6)) this.outside = false; }
    else { const c = L.clampIn(this.X, this.Z, 0.45); this.X = c.X; this.Z = c.Z; this.avoidPosts(); }

    const zMid = L.rows[1].Z, zBack = L.rows[3].Z;
    this.vis = lerp(1, 1.18, sm((this.Z - zMid) / (zBack - zMid)));   // a touch larger far away so it still reads
    this.body.rotation.y = this.yaw;
    this.body.scale.setScalar(this.vis);
    this.body.updateMatrixWorld(true);
    this.applyGaze(dt);
    this.applyTail(dt);
    this.applyFace(dt);
    this.light(dt);
    this.place(dt);
    this.renderer.render(this.scene, this.camera);
  }

  gazeTarget(out) {
    const T = this.tmp;
    if (this.gazeOverride && this.gazeOverride.until > this.time) {
      const o = this.gazeOverride;
      if (o.kind === 'viewer') return { p: out.set(14 * Math.sin(this.camPhi), 3.2, 14 * Math.cos(this.camPhi)).applyAxisAngle(T.v2.set(0, 1, 0), -this.yaw), w: 1 };
      return { p: this.toLocal(o.X, o.h, o.Z, out), w: 1 };
    }
    if (this.toy && (this.interest > 0.08 || this.brain.mode === 'play')) {
      const t = this.toy;
      const p = t.kind === 'ground' ? this.toLocal(t.X, 0.03, t.Z, out) : this.toLocal(t.X, t.h, t.Z + -0.25, out);
      return { p, w: this.brain.mode === 'play' ? 1 : sm(this.interest / 0.4) };
    }
    if (this.glance && this.glance.until > this.time) {
      const g = this.glance;
      if (g.kind === 'viewer') return { p: out.set(14 * Math.sin(this.camPhi), 3.2, 14 * Math.cos(this.camPhi)).applyAxisAngle(T.v2.set(0, 1, 0), -this.yaw), w: 0.9 };
      return { p: this.toLocal(g.X, g.h, g.Z, out), w: 0.85 };
    }
    return null;
  }

  // three's mixer only writes a bone or morph when the clip's value changes, so
  // anything layered on top (head turn, blinks) must be taken back off before the
  // next mixer update, or it piles up frame after frame (the head would spin).
  unlayer() {
    for (const b of Object.values(this.bones)) if (b && b.userData.animQ) b.quaternion.copy(b.userData.animQ);
    for (const b of this.tail) if (b.userData.animQ) b.quaternion.copy(b.userData.animQ);
    for (const m of this.morphs) if (m.userData.animInf) for (let i = 0; i < 3; i++) m.morphTargetInfluences[i] = m.userData.animInf[i];
  }

  // head and neck turn toward what the cat is attending to, layered on the clip
  applyGaze(dt) {
    const T = this.tmp, G = this.gaze, B = this.bones;
    if (!B.head || !B.neck_01 || !B.neck_02) return;
    for (const b of Object.values(B)) (b.userData.animQ || (b.userData.animQ = b.quaternion.clone())).copy(b.quaternion);
    // idle glances: a lantern, the viewer, a spot on the ground
    this.nextGlance -= dt;
    if (this.nextGlance <= 0) {
      this.nextGlance = rnd(4, 9);
      if (this.interest < 0.1 && this.posture !== 'WALK' && chance(0.75)) {
        const r = Math.random(), lamp = this.nearestLamps(true)[0];
        if (r < 0.4 && lamp) this.glance = { X: lamp.l.X, h: LANTERN_M, Z: lamp.l.Z, until: this.time + rnd(1.8, 3) };
        else if (r < 0.7) this.glance = { kind: 'viewer', until: this.time + rnd(1.5, 2.6) };
        else { const a = this.yaw + rnd(-1.2, 1.2), d = rnd(0.8, 2.5); this.glance = { X: this.X + Math.sin(a) * d, h: 0, Z: this.Z - Math.cos(a) * d, until: this.time + rnd(1.2, 2.2) }; }
      }
    }
    const want = this.gazeTarget(T.v);
    const allow = this.motor.cur in GAZE_ALLOW ? GAZE_ALLOW[this.motor.cur] : 1;
    // Something behind him isn't looked at over the shoulder like an owl: past ~100° off his
    // nose the head lets go (fully by 145°). It is the body's job to turn round for it.
    const behind = want ? 1 - sm((Math.abs(Math.atan2(want.p.x, want.p.z)) - 100 * DEG) / (45 * DEG)) : 0;
    G.w = damp(G.w, want ? want.w * allow * behind : 0, 3.2, dt);

    // the animated head's own heading, smoothed so the clip's small life still shows through
    B.head.getWorldQuaternion(T.q);
    T.q2.copy(this.body.quaternion).invert();
    const fwd = T.v2.set(0, 1, 0).applyQuaternion(T.q).applyQuaternion(T.q2);
    const ay = Math.atan2(fwd.x, fwd.z), ap = Math.atan2(-fwd.y, Math.hypot(fwd.x, fwd.z));
    if (!G.inited) { G.ay = ay; G.ap = ap; G.inited = true; }
    G.ay = damp(G.ay, ay, 2.5, dt); G.ap = damp(G.ap, ap, 2.5, dt);
    if (want) {
      B.head.getWorldPosition(T.v2); this.body.worldToLocal(T.v2);
      const d = want.p.sub(T.v2);
      const ty = clamp(Math.atan2(d.x, d.z), -80 * DEG, 80 * DEG);
      const tp = clamp(Math.atan2(-d.y, Math.hypot(d.x, d.z)), -52 * DEG, 47 * DEG);
      G.yaw = clamp(wrap(ty - G.ay), -80 * DEG, 80 * DEG);
      G.pitch = clamp(tp - G.ap, -60 * DEG, 50 * DEG);
    }
    if (G.w < 0.002) { for (const k in G.per) { G.per[k][0] = damp(G.per[k][0], 0, 4, dt); G.per[k][1] = damp(G.per[k][1], 0, 4, dt); } return; }
    // per-bone share and stiffness: the head leads, the neck follows (overlap)
    const plan = [['neck_01', 0.15, 4.5], ['neck_02', 0.25, 4.5], ['head', 0.6, 7]];
    this.body.getWorldQuaternion(T.q3);
    for (const [name, share, k] of plan) {
      const bone = B[name], per = G.per[name];
      const ty = G.yaw * share * G.w, tp = G.pitch * share * G.w;
      const maxStep = 240 * DEG * share * dt;
      per[0] += clamp(damp(per[0], ty, k, dt) - per[0], -maxStep, maxStep);
      per[1] += clamp(damp(per[1], tp, k, dt) - per[1], -maxStep, maxStep);
      // delta in cat space: pitch about its lateral axis, then yaw about up
      T.qy.setFromAxisAngle(T.v2.set(0, 1, 0), per[0]);
      T.qp.setFromAxisAngle(T.v2.set(1, 0, 0), per[1]);
      T.q.copy(T.qy).multiply(T.qp);                                   // cat-space delta
      T.q.premultiply(T.q3).multiply(T.q2.copy(T.q3).invert());         // to world space
      bone.getWorldQuaternion(T.q2);
      T.q2.premultiply(T.q);                                            // new world rotation
      bone.parent.getWorldQuaternion(T.qp);
      bone.quaternion.copy(T.qp.invert().multiply(T.q2));
      bone.updateMatrixWorld(true);
    }
  }

  // locking on: the tail tip twitches side to side for a moment, layered on the clip
  applyTail() {
    const T = this.tmp, k = this.time - this.lockT;
    for (const b of this.tail) (b.userData.animQ || (b.userData.animQ = b.quaternion.clone())).copy(b.quaternion);
    if (k < 0 || k > 0.9) return;
    const env = sm(k / 0.12) * (1 - sm((k - 0.45) / 0.45));
    this.body.getWorldQuaternion(T.q3);
    this.tail.forEach((b, i) => {
      const a = 22 * DEG * env * (0.5 + 0.25 * i) * Math.sin(k * 26 - i * 0.7);
      T.q.setFromAxisAngle(T.v2.set(0, 1, 0), a);                        // side to side, in cat space
      T.q.premultiply(T.q3).multiply(T.q2.copy(T.q3).invert());
      b.getWorldQuaternion(T.q2); T.q2.premultiply(T.q);
      b.parent.getWorldQuaternion(T.qp);
      b.quaternion.copy(T.qp.invert().multiply(T.q2));
      b.updateMatrixWorld(true);
    });
  }
  lockOn() { if (this.time - this.lockT > 1.2) this.lockT = this.time; }

  // blinks, ear flattening, the chatter a cat makes at something it can't reach
  applyFace(dt) {
    // close 0.06 s, hold 0.03 s, open 0.10 s; now and then a double blink
    const b = this.blink; let blink = 0;
    const clipBlinks = this.motor.cur === 'sit_slow_blink';
    b.next -= dt;
    if (b.gap > 0) { b.gap -= dt; if (b.gap <= 0) b.t = 0; }
    else if (b.t < 0 && b.next <= 0 && !clipBlinks) { b.t = 0; b.dbl = chance(0.15); b.next = rnd(2.5, 7); }
    if (b.t >= 0) {
      b.t += dt;
      const t = b.t;
      blink = t < 0.06 ? sm(t / 0.06) : t < 0.09 ? 1 : 1 - sm((t - 0.09) / 0.1);
      if (t > 0.19) { b.t = -1; if (b.dbl) { b.dbl = false; b.gap = 0.09; } }
    }
    this.earsBack = damp(this.earsBack, this.earsWant || 0, 6, dt);
    // locking on: two quick ear flicks
    const lk = this.time - this.lockT;
    const flick = lk >= 0 && lk < 0.5 ? 0.55 * Math.max(0, Math.sin(lk / 0.5 * 4 * Math.PI)) : 0;
    const ch = this.chatter > 0 ? 0.22 * (0.5 + 0.5 * Math.sin(this.time * 52)) * this.chatter : 0;
    for (const m of this.morphs) {
      const inf = m.morphTargetInfluences;
      (m.userData.animInf || (m.userData.animInf = [0, 0, 0])).splice(0, 3, inf[0], inf[1], inf[2]);
      inf[0] = Math.min(1, inf[0] + blink);
      inf[1] = Math.min(1, inf[1] + Math.max(this.earsBack, flick));
      inf[2] = Math.min(1, inf[2] + ch);
    }
  }

  // gaslight from the lamps around it, haze when it nears a fog bank
  light(dt) {
    const near = this.nearestLamps(true);
    let pool = 0;
    for (let i = 0; i < 2; i++) {
      const k = this.keys[i], n = near[i];
      if (!n) { k.intensity = damp(k.intensity, 0, 3, dt); continue; }
      const f = 1 / (1 + Math.pow(n.d / 2.4, 2));
      pool += f;
      k.intensity = damp(k.intensity, (i === 0 ? 2.4 : 1.25) * f, 3, dt);
      k.position.set(n.l.X - this.X, LANTERN_M * 0.75, -(n.l.Z - this.Z)).normalize();
    }
    this.pool = damp(this.pool ?? pool, pool, 3, dt);
    this.shadowMat.opacity = (0.32 + 0.3 * clamp(this.pool, 0, 1)) * (1 - this.hazeNow * 0.8);
    const sit = this.posture === 'SIT' || this.posture === 'LOAF';
    this.shadow.scale.set(sit ? 0.34 : 0.3, sit ? 0.46 : 0.62, 1);
    this.shadow.position.z = sit ? -0.04 : 0;
  }

  place(dt = 0) {
    const L = this.lane, s = L.toScreen(this.X, this.Z), ppm = s.ppm;
    const cam = this.camera, cw = this.cw, ch = this.ch;
    // Perspective. The lane converges on a vanishing point: off to one side, "straight into
    // the lane" runs toward the middle of the screen (about 20° off vertical at the sides of
    // the front rows). The cat is drawn with a flat camera, so he used to point straight up
    // the screen while sliding off at that angle: walking one way, moving another. The camera
    // swings round by the lane's own lean at his spot, so the model is seen from the side a
    // real eye would see it from. Measured over ±0.15 m and eased: the measured lean steps
    // at each lamp row.
    const pa = L.toScreen(this.X, this.Z - 0.15), pb = L.toScreen(this.X, this.Z + 0.15);
    const phi = Math.atan(((pb.x - pa.x) / ((pa.y - pb.y) || 1)) * SINP);
    this.camPhi = dt > 0 && Number.isFinite(this.camPhi) ? damp(this.camPhi, phi, 10, dt) : phi;
    cam.position.set(Math.sin(this.camPhi) * COSP * 12, SINP * 12, Math.cos(this.camPhi) * COSP * 12); cam.lookAt(0, 0, 0);
    cam.left = -cw / 2 / ppm; cam.right = cw / 2 / ppm;
    cam.top = ORG_Y * ch / ppm; cam.bottom = -(1 - ORG_Y) * ch / ppm;
    cam.updateProjectionMatrix();
    // One layer, just behind the near posts. The cat's walkable ground never
    // reaches the mid, far or back posts on screen, so instead of slipping under
    // each CSS fog bank (which would leave a black cat invisible at the back) the
    // banks it is behind are applied here as haze, ramped across each row so it
    // never steps, and a little lighter than the real ones so it still reads.
    const R = L.rows, z = 6;
    const catMid = s.y - 0.16 * ppm * this.vis;
    let clear = 1;
    for (const [i, name] of [[1, 'mid'], [2, 'far'], [3, 'back']]) {
      const k = sm((this.Z - R[i].Z + 0.5) / 1.0);
      if (k > 0) clear *= 1 - k * L.veilAlpha(name, s.x, catMid) * HAZE_K;
    }
    const a = 1 - clear;
    this.hazeNow = a;
    this.scene.fog.density = a > 0.001 ? Math.sqrt(-Math.log(1 - Math.min(a, 0.98))) / 12 : 0;
    this.rim.intensity = RIM_I * (1 + 1.2 * a);          // the cool rim holds the silhouette in the fog
    const f = L.filterAt(this.Z);
    const zs = String(z), fs = `brightness(${f.bright.toFixed(3)}) blur(${f.blur.toFixed(2)}px)`;
    const ts = `translate3d(${(s.x - cw / 2).toFixed(1)}px, ${(s.y - ORG_Y * ch).toFixed(1)}px, 0)`;
    const st = this.canvas.style;
    if (this.style.z !== zs) { st.zIndex = zs; this.style.z = zs; }
    if (this.style.f !== fs) { st.filter = fs; this.style.f = fs; }
    if (this.style.t !== ts) { st.transform = ts; this.style.t = ts; }
    // In the intro he's behind a mid post, but his canvas is drawn over the mid posts: so the
    // canvas is cut off along the post's inner edge (everything on the post's side of it goes),
    // which hides exactly what the post would. One plain polygon, which every browser clips.
    const pk = this.peek, cs = pk && this.Z > pk.lamp.Z - 0.02 ? this.postClip(pk.lamp, s.x - cw / 2, s.y - ORG_Y * ch) : 'none';
    if (this.style.c !== cs) { st.clipPath = cs; st.webkitClipPath = cs; this.style.c = cs; }
  }

  // the part of the canvas on the lane side of a post's inner edge (outline from the lamp art)
  postClip(lamp, ox, oy) {
    const r = this.lane.rel(lamp.el), cw = this.cw, ch = this.ch, inward = -lamp.side;
    const edge = POST_PROFILE.map(([hm, a, b]) => [r.x + (inward > 0 ? b : a) * r.w - ox, r.y + r.h * (1 - hm / LAMP_M) - oy]);
    const far = inward > 0 ? cw + 40 : -40, top = Math.min(-40, edge[edge.length - 1][1]), bot = Math.max(ch + 40, edge[0][1]);
    const pts = [[edge[0][0], bot], ...edge, [edge[edge.length - 1][0], top], [far, top], [far, bot]];
    return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;
  }
}

// ───────────────────────────── behaviour ─────────────────────────────
// Behaviours are generators: each `yield` waits one frame and returns dt.
class Brain {
  constructor(cat) {
    this.c = cat; this.mode = 'life'; this.petted = false; this.note = '';
    this.gen = this.life(true); this.gen.next();
  }
  tick(dt) {
    const c = this.c;
    if (this.petted) {
      this.petted = false;
      if (this.mode !== 'play' && c.posture !== 'WALK' && !c.peek) this.swap('pet', this.pet());
    }
    if (this.mode === 'life' && c.cool <= 0 && !c.peek) {   // the intro plays out first
      const need = { STAND: 0.45, WALK: 0.55, SIT: 0.65, LOAF: 1.0, CROUCH: 0.45 }[c.posture] || 0.5;
      if (c.interest > need && c.toy && c.toy.dm < CHASE_M) this.swap('play', this.play());
    }
    const r = this.gen.next(dt);
    if (r.done) this.swap('life', this.life(false));
  }
  swap(mode, gen) { this.gen.return(); this.mode = mode; this.note = ''; this.gen = gen; this.gen.next(); }

  // ── primitives ──
  *wait(sec) { let t = 0; while (t < sec) t += yield; }
  *once(name, fade = 0.2, each, speed = 1) {
    const c = this.c, m = c.motor; if (!m.has(name)) return;
    m.play(name, fade, true, speed);
    c.posture = ENDS[name] || 'STAND';
    do { const dt = yield; each && each(dt, m.time(name), m.dur(name)); } while (!m.done(name));
  }
  *hold(name, sec, fade = 0.3, until) {
    const m = this.c.motor; m.play(name, fade, false);
    this.c.posture = ENDS[name] || 'STAND';
    let t = 0;
    while (t < sec) { t += yield; if (until && until()) break; }
  }
  *settle() { const m = this.c.motor; while (m.busy()) yield; }
  *toStand(speed = 1) {
    const c = this.c, m = c.motor;
    yield* this.settle();
    switch (c.posture) {
      case 'WALK': yield* this.stopWalk(); break;
      case 'LOAF': yield* this.once('loaf_to_sit', 0.2, null, speed); // falls through: then stand
      case 'SIT': yield* this.once('sit_to_stand', 0.2, null, speed); break;
      case 'CROUCH': m.play('idle_stand', 0.32); c.posture = 'STAND'; c.creep = 0; yield* this.wait(0.3); return;
      default: break;
    }
    if (m.cur !== 'idle_stand') m.play('idle_stand', 0.2, false);
    c.posture = 'STAND';
  }
  *toSit() {
    const c = this.c;
    if (c.posture === 'SIT') return;
    if (c.posture === 'LOAF') { yield* this.once('loaf_to_sit', 0.2); return; }
    yield* this.toStand();
    yield* this.once('stand_to_sit', 0.2);
  }
  *stopWalk() {
    const c = this.c, m = c.motor, L = m.loco;
    if (m.cur === 'loco') {
      let t = 0;
      while (true) {
        const dt = yield; t += dt;
        L.v = Math.max(WALK(), L.v - 0.9 * dt);
        if ((L.wrapped && L.v < WALK() * 1.3) || t > 3) break;
      }
    }
    yield* this.once('walk_to_idle', 0.12);
    m.play('idle_stand', 0.15); c.posture = 'STAND';
  }
  *turnBy(d, speed = 1) {
    d = wrap(d);
    if (Math.abs(d) < 15 * DEG) return;
    if (d > 135 * DEG) yield* this.turnClip('turn_180', d, speed);
    else if (d < -135 * DEG) { yield* this.turnClip('turn_R_90', d / 2, speed); yield* this.turnClip('turn_R_90', d / 2, speed); }
    else yield* this.turnClip(d > 0 ? 'turn_L_90' : 'turn_R_90', d, speed);
    this.c.motor.play('idle_stand', 0.2);
  }
  *turnClip(name, d, speed = 1) {
    const c = this.c, y0 = c.yaw;
    yield* this.once(name, 0.2, (dt, t, T) => { c.yaw = wrap(y0 + d * sm(t / T)); }, speed);
    c.yaw = wrap(y0 + d);
  }
  // walk (or trot) to a moving or fixed target, then stop on the walk's phase 0
  *walkTo(getT, o = {}) {
    const c = this.c, m = c.motor, L = m.loco;
    const speed = o.speed || WALK(), stop = o.stop ?? 0.12;
    let t = getT(); if (!t) return;
    if (c.posture !== 'WALK') {
      yield* this.toStand(o.hunt ? 1.6 : 1);
      t = getT(); if (!t || c.distTo(t) <= stop + 0.06) return;
      // a hunting cat turns in place only for a big turn; smaller ones it takes into the first steps
      const dy = wrap(c.headingTo(t) - c.yaw);
      if (Math.abs(dy) > (o.hunt ? 75 : 40) * DEG) yield* this.turnBy(dy, o.quick || 1);
      t = getT(); if (!t) return;
      L.v = WALK();
      yield* this.once(o.bored ? 'bored_walkaway_start' : 'idle_to_walk', 0.15, (dt) => c.steer(t, (o.hunt ? 100 : 45) * DEG, dt), o.quick || 1);
      m.play('loco', 0.2); L.p = 0;
    } else if (m.cur !== 'loco') {
      yield* this.settle(); m.play('loco', 0.2); L.p = 0;
    }
    c.posture = 'WALK';
    let elapsed = 0, stopping = false;
    const acc = o.hunt ? 1.4 : 0.6, dec = o.hunt ? 0.9 : 0.45;   // a hunting cat gets going and pulls up sharper
    while (true) {
      const dt = yield; elapsed += dt;
      t = getT();
      const d = t ? c.distTo(t) : 0;
      if (!t || (o.until && o.until(d)) || elapsed > 45) stopping = true;
      let vT = stopping ? WALK() : speed;
      if (t && !stopping) vT = Math.min(vT, Math.max(WALK() * 0.8, Math.sqrt(2 * dec * Math.max(0, d - stop))));
      L.v += clamp(vT - L.v, -2 * dec * dt, acc * dt);
      if (t) c.steer(t, L.v < WALK() * 1.3 ? 80 * DEG : L.v < 0.8 ? 115 * DEG : 150 * DEG, dt);
      if (t && !stopping && d <= stop + 0.2) stopping = true;
      if (stopping && o.toCrouch && c.toy && c.toy.kind === 'ground' && c.toy.dm < 1.2) {   // a hunting cat sinks straight from the walk into its stalk
        m.play('stalk_crouch', 0.4, true, 1.15); c.posture = 'CROUCH'; c.lockOn(); return;
      }
      if (stopping && L.wrapped && L.v < WALK() * 1.3) break;
      if (stopping && elapsed > 60) break;
    }
    yield* this.once('walk_to_idle', 0.12);
    m.play('idle_stand', 0.15); c.posture = 'STAND';
  }

  // ── a quiet life ──
  *life(first) {
    const c = this.c;
    if (first) yield* this.enter();
    while (true) {
      yield;
      if (c.posture === 'SIT' || c.posture === 'LOAF') yield* this.rest();
      else { yield* this.idleBeat(); if (chance(0.55)) yield* this.rest(); }
      yield* this.wander();
    }
  }
  // The intro: he's out of sight behind one of the mid posts (his canvas is cut off along the
  // post's edge while he's behind it, see place()). He walks out from behind it, stops with his head and
  // shoulders round the post and looks straight at you (ears flick, a blink), glances down
  // the lane, then carries on out into the lane in front of the post.
  *enter() {
    const c = this.c, L = c.lane, m = c.motor;
    const mids = L.lamps.filter((l) => l.row === 'mid'), lit = mids.filter((l) => l.lit);
    const pool = lit.length ? lit : mids;
    if (!pool.length) { yield* this.walkIn(); return; }
    const post = pool[Math.floor(Math.random() * pool.length)], inward = -post.side;
    try {
      c.peek = { lamp: post };
      // behind the plinth, turned toward the lane and a little toward you, nose out of sight
      c.Z = post.Z + 0.35; c.X = post.X - inward * 0.06; c.yaw = inward * 40 * DEG;
      m.play('idle_stand', 0); c.posture = 'STAND'; c.creep = 0;
      yield* this.wait(rnd(0.8, 1.3));
      // out from behind it, as far as his head and shoulders
      const half = { X: post.X + inward * 0.3, Z: post.Z + 0.1 };
      yield* this.walkTo(() => half, { speed: WALK(), stop: 0.05 });
      // caught: look right at the viewer
      c.lockOn(); c.gazeOverride = { kind: 'viewer', until: c.time + 99 };
      yield* this.wait(0.7); c.blink.t = 0;
      yield* this.wait(rnd(0.8, 1.2));
      // a look along the lane, then on out
      c.gazeOverride = { X: c.X + inward * 3, h: 0.2, Z: c.Z - 1, until: c.time + 99 };
      yield* this.wait(rnd(0.7, 1.0));
      c.gazeOverride = null;
      const fz = clamp(post.Z - rnd(0.8, 1.3), L.Zmin + 0.1, L.Zmax), fh = L.halfW(fz) - 0.6;
      const dest = { X: clamp(post.X + inward * rnd(1.0, 1.6), -fh, fh), Z: fz };
      yield* this.walkTo(() => dest, { speed: WALK(), stop: 0.12 });
    } finally {
      c.peek = null; c.creep = 0; c.gazeOverride = null;
    }
  }
  // the old entrance (used when there is no mid post): walk in from the side
  *walkIn() {
    const c = this.c, L = c.lane, m = c.motor;
    const side = chance(0.5) ? -1 : 1;
    const Z = lerp(L.Zmin + 0.3, L.rows[1].Z - 0.35, Math.random());
    const y = L.yOfZ(Z), ppm = L.ppmAtY(y);
    const xs = side < 0 ? -0.7 * ppm : L.W + 0.7 * ppm;
    c.X = (xs - L.cAtY(y)) / ppm; c.Z = Z; c.yaw = side < 0 ? 90 * DEG : -90 * DEG; c.outside = true;
    m.loco.v = WALK(); m.play('loco', 0); m.loco.p = 0; c.posture = 'WALK';
    const lamps = L.lamps.filter((l) => l.side === side && (l.row === 'mid' || l.row === 'near') && l.lit);   // settle by the first lit post it reaches
    const dest = lamps.length ? L.spot(lamps[Math.floor(Math.random() * lamps.length)]) : L.randomPoint();
    yield* this.walkTo(() => dest, { speed: WALK(), stop: 0.12 });
  }
  *idleBeat() {
    yield* this.toStand();
    yield* this.hold('idle_stand', rnd(1.5, 4), 0.25);
    const r = Math.random();
    if (r < 0.3) yield* this.once('idle_look_around', 0.25);
    else if (r < 0.45) yield* this.once('tail_flick', 0.2);
    if (r < 0.45) yield* this.hold('idle_stand', rnd(0.8, 2), 0.25);
  }
  *rest() {
    const c = this.c, m = c.motor;
    if (c.posture !== 'SIT' && c.posture !== 'LOAF') {
      yield* this.toStand();
      // sit facing out into the room, or, at a post, facing the post
      const L0 = c.lampHere();
      const want = L0 ? c.headingTo({ X: L0.X, Z: L0.Z }) + rnd(-0.4, 0.4) : rnd(-55, 55) * DEG, d = wrap(want - c.yaw);
      if (Math.abs(d) > 40 * DEG) yield* this.turnBy(d);
      yield* this.once('stand_to_sit', 0.2);
    }
    c.relocate = false;
    const here = c.lampHere();
    if (here) { c.lampSeen.set(here, c.time); c.gazeOverride = { X: here.X, h: LANTERN_M, Z: here.Z, until: c.time + rnd(2, 3.2) }; }
    if (c.posture === 'SIT') yield* this.sitFor(rnd(6, 15));
    if (c.posture === 'LOAF' || (!c.relocate && chance(c.nearLitLamp(2.4) ? 0.6 : 0.3))) {
      if (c.posture !== 'LOAF') yield* this.once('sit_to_loaf', 0.2);
      yield* this.hold('loaf', rnd(14, 36), 0.3, () => c.relocate);
      yield* this.once('loaf_to_sit', 0.2);
      yield* this.sitFor(rnd(1.5, 3.5));
      yield* this.once('sit_to_stand', 0.2);
      if (chance(0.75)) yield* this.once('stretch', 0.2);
      m.play('idle_stand', 0.2);
    }
  }
  *sitFor(sec) {
    const c = this.c, m = c.motor;
    m.play('sit_idle', 0.3, false); c.posture = 'SIT';
    let t = 0, next = rnd(2.5, 6);
    while (t < sec && !c.relocate) {
      const dt = yield; t += dt; next -= dt;
      if (next <= 0) {
        const r = Math.random();
        if (r < 0.3) yield* this.hold('groom', rnd(3, 6), 0.3);
        else if (r < 0.65) yield* this.once('sit_ear_twitch', 0.15);
        else yield* this.once('sit_slow_blink', 0.2);
        m.play('sit_idle', 0.3, false);
        next = rnd(4, 9);
      }
    }
  }
  *wander(o = {}) {
    const c = this.c, L = c.lane;
    c.atLamp = null;
    const opts = [];
    // Every post is somewhere to go. A post nobody has visited yet is by far the likeliest
    // next stop, and the longer one has been left alone the likelier it is; unlit posts get
    // visited too, just a little less eagerly.
    const fresh = [];
    for (const l of L.lamps) {
      const s = L.spot(l), seen = c.lampSeen.get(l);
      if (c.distTo(s) < (seen == null ? 0.7 : 1.5)) continue;
      const since = seen == null ? 1e3 : c.time - seen;
      const due = seen == null ? 8 : 1 + Math.min(4, since / 60);
      const op = { w: (l.lit ? 1.6 : 1.1) * due, t: s };
      opts.push(op);
      if (seen == null) fresh.push(op);
    }
    for (let i = 0; i < 3; i++) { const p = L.randomPoint(); if (c.distTo(p) > 1.5) opts.push({ w: 0.3, t: p }); }
    if (o.away && c.toy) {   // walk off away from the toy that bored it
      for (const op of opts) if (Math.hypot(op.t.X - c.toy.X, op.t.Z - c.toy.Z) < 2) op.w *= 0.1;
    }
    if (!opts.length) { yield* this.wait(1); return; }
    const dest = (fresh.length && chance(0.9) ? pick(fresh) : pick(opts)).t, d = c.distTo(dest);   // posts nobody has visited yet come first
    yield* this.walkTo(() => dest, { speed: d > 5 && chance(0.35) ? 0.5 : WALK(), stop: 0.12, bored: o.bored });
    c.atLamp = dest.lamp && c.distTo(dest) < 0.6 ? dest.lamp : null;
    if (c.atLamp && !o.bored) yield* this.visitLamp(c.atLamp);
  }
  // arrived at a post: turn to it, look up at the lantern, flick the tail
  *visitLamp(l) {
    const c = this.c;
    c.lampSeen.set(l, c.time);
    yield* this.toStand();
    const want = c.headingTo({ X: l.X, Z: l.Z }) + rnd(-0.35, 0.35);
    yield* this.turnBy(wrap(want - c.yaw));
    c.gazeOverride = { X: l.X, h: LANTERN_M, Z: l.Z, until: c.time + rnd(2.4, 3.6) };
    yield* this.hold('idle_stand', rnd(2.4, 3.6), 0.25);
    if (chance(0.5)) yield* this.once('tail_flick', 0.2);
  }
  *pet() {
    const c = this.c;
    if (c.posture === 'STAND' || c.posture === 'CROUCH') { yield* this.toStand(); yield* this.once('stand_to_sit', 0.25); }
    else yield* this.settle();
    c.gazeOverride = { kind: 'viewer', until: c.time + 3.2 };
    if (c.posture === 'LOAF') {
      c.blink.t = -1; c.blink.next = 0.6;
      yield* this.hold('loaf', 3);
    } else {
      yield* this.once('sit_slow_blink', 0.25);
      if (chance(0.5)) yield* this.once('sit_ear_twitch', 0.15);
      c.motor.play('sit_idle', 0.3, false);
    }
    c.interest = Math.min(c.interest, 0.3);
  }

  // ── play ──
  // Hunting: it watches, chases a cursor on the ground, stalks, wiggles and
  // pounces, swats at one dangling over it and walks under one hanging low off to
  // the side. Everything runs a little quicker while it's excited.
  *play() {
    const c = this.c, m = c.motor;
    const started = c.time, maxT = rnd(30, 50);
    let calm = 0, sideT = 0;
    try {
      if (c.posture === 'LOAF') yield* this.rouse();
      yield* this.toStand(1.6);
      // spotted from across the lane: a beat of alert first; up close, straight in
      if (c.toy && c.toy.dm > 0.9 && c.posture === 'STAND') yield* this.alert();
      while (true) {
        const dt = yield;
        const t = c.toy && c.toy.dm < CHASE_M + 0.3 ? c.toy : null;   // gone too far: let it go
        calm = !t ? calm + dt * 1.5 : t.moving ? 0 : calm + dt;        // a still or vanished toy is boring
        if (calm > 2.2 || c.time - started > maxT) break;
        if (!t) { if (m.cur !== 'idle_stand') m.play('idle_stand', 0.25, false); continue; }
        if (t.kind === 'ground') {
          c.chatter = 0;
          const d = c.distTo(t);
          if (c.posture === 'CROUCH' && d > 0.3) { this.note = 'stalk'; yield* this.stalk(); continue; }
          if (d > 1.2) {
            this.note = 'chase';
            yield* this.walkTo(() => {
              const u = c.toy; if (!u || u.kind !== 'ground') return null;
              const dd = c.distTo(u), k = Math.max(0, dd - 0.62) / (dd || 1);
              return { X: c.X + (u.X - c.X) * k, Z: c.Z + (u.Z - c.Z) * k };
            }, { speed: d > 1.7 ? Math.min(0.6, GAIT_SPEED[1]) : 0.45, stop: 0.06, quick: 1.8, hunt: true, toCrouch: true,
              until: () => !c.toy || c.toy.kind !== 'ground' || c.distTo(c.toy) < 0.95 || c.toy.dm > CHASE_M + 0.3 || c.interest < 0.2 });
          } else if (d < 0.55 && this.flicked(t)) { this.note = 'swat'; yield* this.swat(t); }
          else if (d > 0.34) { this.note = 'stalk'; yield* this.stalk(); }
          else if (t.moving) { this.note = 'swat'; yield* this.swat(t); }
          else { this.note = 'sniff'; if (m.cur !== 'idle_stand') m.play('idle_stand', 0.25, false); }
        } else {
          const dx = t.X - c.X, lat = Math.abs(dx);
          // turn the body only when it stays well off to one side; the head does the rest
          const dy = lat > 0.25 ? wrap(c.headingTo({ X: t.X, Z: c.Z }) - c.yaw) : 0;
          sideT = Math.abs(dy) > (t.h > 1.2 ? 100 : 70) * DEG ? sideT + dt : 0;
          if (sideT > (t.h > 1.2 ? 1.0 : 0.25)) { sideT = 0; yield* this.turnBy(dy, 1.4); continue; }
          this.note = 'air';
          if (t.h < 0.7 && lat < 0.55) {
            c.chatter = 0;
            if (t.moving) yield* this.swat(t); else if (m.cur !== 'idle_stand') m.play('idle_stand', 0.25, false);
          } else if (lat > 0.9 && lat < CHASE_M && t.h < 1.8) {
            yield* this.walkTo(() => {
              const u = c.toy; if (!u || u.kind !== 'air') return null;
              return c.lane.clampIn(u.X, c.Z, 0.55);
            }, { speed: 0.5, stop: 0.35, quick: 1.4, until: () => !c.toy || c.toy.kind !== 'air' || c.interest < 0.2 });
          } else {
            c.chatter = t.moving && t.h >= 0.7 ? 1 : 0;   // can't reach it: chatter at it
            if (m.cur !== 'idle_stand') m.play('idle_stand', 0.25, false);
          }
        }
      }
      c.chatter = 0; this.note = 'winddown';
      // wind down the way cats do: pretend nothing happened
      const r = Math.random();
      if (r < 0.4) { yield* this.toSit(); yield* this.hold('groom', rnd(3, 5), 0.3); c.motor.play('sit_idle', 0.3); c.posture = 'SIT'; }
      else if (r < 0.7) { yield* this.toStand(); yield* this.wander({ bored: true, away: true }); }
      else { yield* this.toStand(); yield* this.once('tail_flick', 0.2); m.play('idle_stand', 0.2); }
    } finally {
      c.chatter = 0; c.creep = 0; c.earsWant = 0;
      c.cool = rnd(3, 6); c.interest = Math.min(c.interest, 0.2);
    }
  }
  *stalk() {
    const c = this.c, m = c.motor;
    let t = c.toy;
    if (c.posture !== 'CROUCH') {
      yield* this.toStand(1.6);
      t = c.toy; if (!t || t.kind !== 'ground') return;
      const dy = wrap(c.headingTo(t) - c.yaw);
      if (Math.abs(dy) > 45 * DEG) yield* this.turnBy(dy, 1.5);
      m.play('stalk_crouch', 0.25, true, 1.15); c.posture = 'CROUCH'; c.lockOn();
    }
    if (!t || t.kind !== 'ground') { yield* this.toStand(1.4); return; }
    let still = 0, tt = 0;
    while (true) {
      const dt = yield; tt += dt;
      t = c.toy;
      if (!t || t.kind !== 'ground' || c.interest < 0.15) { c.creep = 0; yield* this.toStand(1.4); return; }
      const d = c.distTo(t), err = wrap(c.headingTo(t) - c.yaw);
      // a crouched cat re-aims in small shuffles: a few degrees off is left to the head
      if (Math.abs(err) > 6 * DEG) c.yaw = wrap(c.yaw + clamp(err * 2, -35 * DEG, 35 * DEG) * dt);
      if (d > 1.8) { c.creep = 0; yield* this.toStand(1.4); return; }
      c.creep = d > 0.62 && Math.abs(err) < 30 * DEG ? 0.06 : 0;
      still = t.moving ? 0 : still + dt;
      if (still > 3.5 && chance(dt * 0.5)) { c.creep = 0; c.interest *= 0.5; yield* this.toStand(); return; }
      if (d < 0.55 && this.flicked(t)) { c.creep = 0; yield* this.swat(t); return; }   // flicked past its face: bat at it
      if (d <= 0.85 && Math.abs(err) < 22 * DEG && tt > 0.35) break;
    }
    c.creep = 0;
    // wiggle and pounce at where the toy is going, not where it was
    const WIG = 1.4, aim = (left) => c.lead(left) || (c.toy && c.toy.kind === 'ground' ? c.toy : t);
    // During the wiggle the back legs are treading, not stepping round, so the body only
    // creeps toward the aim (the head follows the toy); it used to swivel after every jiggle.
    const face = (p, rate, dt, dead = 0) => { const e = wrap(c.headingTo(p) - c.yaw); if (Math.abs(e) > dead) c.yaw = wrap(c.yaw + clamp(e * 3, -rate, rate) * dt); };
    yield* this.once('butt_wiggle', 0.2, (dt, tm, T) => face(aim((T - tm) / WIG + POUNCE.end), 22 * DEG, dt, 8 * DEG), WIG);
    const u = c.toy;
    if (u && u.kind === 'ground' && c.distTo(u) < 0.3) { yield* this.swat(u); return; }   // it came to its paws: pin it there
    m.pounceTravel = clamp(c.distTo(aim(POUNCE.end)) - 0.14, 0.2, 0.72);
    yield* this.once('pounce', 0.14, (dt, tm) => {
      if (tm >= POUNCE.start) return;              // committed once airborne
      const p = aim(POUNCE.end - tm); face(p, 80 * DEG, dt);
      m.pounceTravel = clamp(c.distTo(p) - 0.14, 0.2, 0.72);
    });
    m.play('idle_stand', 0.18); c.posture = 'STAND';
    c.interest = Math.max(0, c.interest - 0.2);
    const v = c.toy;
    const mx = c.X + Math.sin(c.yaw) * 0.14, mz = c.Z - Math.cos(c.yaw) * 0.14;   // where its paws came down
    c.lastMiss = v && v.kind === 'ground' ? Math.hypot(v.X - mx, v.Z - mz) : -1;
    if (v && v.kind === 'ground' && c.lastMiss > 0.45 && v.dm < CHASE_M) yield* this.missed();
    else if (v && v.kind === 'ground' && c.distTo(v) < 0.55 && v.moving && chance(0.65)) yield* this.swat(v);
  }
  // woken from a loaf: a beat of looking before it gets up (longer if the toy is far)
  *rouse() {
    const c = this.c;
    c.blink.t = 0; c.lockT = c.time;
    const far = c.toy && c.toy.dm > 1.2;
    yield* this.hold('loaf', rnd(0.45, 0.75) + (far ? 0.35 : 0), 0.2, () => !c.toy);
  }
  // spotted from across the lane: head up, ears flick, then go (the clip is cut short)
  *alert() {
    const c = this.c, m = c.motor;
    m.play('notice', 0.18, true, 1.5); c.posture = 'STAND'; c.lockOn();
    let t = 0; while (t < 0.5 && !m.done('notice')) t += yield;
  }
  // the pounce came down on nothing: a quick look around, as if it meant to do that
  *missed() {
    const c = this.c, m = c.motor;
    this.note = 'missed'; c.earsWant = 0.35;
    m.play('idle_look_around', 0.2, true, 1.5); c.posture = 'STAND';
    let t = 0; while (t < 1.1) t += yield;
    c.earsWant = 0; m.play('idle_stand', 0.25);
  }
  // the cursor whipped past close in front of its face
  flicked(t) {
    const c = this.c;
    if (!t || c.time - c.flickT > 0.35) return false;
    if (t.kind === 'air') return t.h < 0.7 && Math.abs(t.X - c.X) < 0.55;
    return Math.abs(wrap(c.headingTo(t) - c.yaw)) < 70 * DEG;
  }
  *swat(t) {
    const c = this.c, m = c.motor, T = c.tmp;
    if (c.time - (c.swatEnd ?? -9) > 3) c.swatN = 0;            // a fresh bout
    // the quick one-two is for a flick past its face, and not every time it sees one
    const dbl = this.flicked(t) && c.time - (c.oneTwoT ?? -9) > 2.5;
    // face it first: a swat at something behind or beside it reads wrong
    if (t.kind === 'ground' && c.distTo(t) > 0.12) {
      const dy = wrap(c.headingTo(t) - c.yaw);
      if (Math.abs(dy) > (dbl ? 80 : 50) * DEG) { yield* this.toStand(1.4); yield* this.turnBy(dy, 1.5); }
      const u = c.toy; if (u) t = u;
    }
    const p = c.toLocal(t.X, t.h, t.Z, T.v);
    c.earsWant = 0.25;
    // Fades of 0.16 s at the least: the paw comes up out of whatever it was doing (a crouch,
    // a stand) instead of snapping into the swat's first frame.
    if (dbl) {
      c.oneTwoT = c.time;
      // one paw, then the other before the first is down
      const a = p.x >= 0 ? 'swat_L' : 'swat_R', b = a === 'swat_L' ? 'swat_R' : 'swat_L';
      m.play(a, 0.16, true, 1.3); c.posture = 'STAND';
      while (m.time(a) < 0.55 * m.dur(a)) yield;
      yield* this.once(b, 0.16, null, 1.3);
    } else {
      const name = Math.abs(p.x) < 0.1 && t.h < 0.4 && chance(0.4) ? 'bat_play' : p.x >= 0 ? 'swat_L' : 'swat_R';
      m.play(name, 0.16, true, 1.1); c.posture = 'STAND';
      // a flick past its face while this paw is still going up turns it into a one-two
      let follow = false;
      while (!m.done(name)) {
        yield;
        if (!follow && name !== 'bat_play' && m.time(name) < 0.45 * m.dur(name) && this.flicked(c.toy) && c.time - (c.oneTwoT ?? -9) > 2.5) follow = true;
        if (follow && m.time(name) >= 0.55 * m.dur(name)) break;
      }
      if (follow) { c.oneTwoT = c.time; yield* this.once(name === 'swat_L' ? 'swat_R' : 'swat_L', 0.16, null, 1.3); }
    }
    c.earsWant = 0;
    m.play('idle_stand', 0.25); c.posture = 'STAND';
    c.interest = Math.max(0, c.interest - 0.1);
    // Then it watches for a beat before going again (longer as the bout goes on), instead of
    // swatting on a loop as long as the cursor moves. After four it has had enough for now.
    c.swatN = (c.swatN || 0) + 1;
    const beat = rnd(0.35, 0.7) + (c.swatN > 2 ? rnd(0.5, 1.2) : 0);
    for (let w = 0; w < beat && c.toy; ) w += yield;
    if (c.swatN >= 4) { c.interest *= 0.55; c.swatN = 0; }
    c.swatEnd = c.time;
  }
}

// ───────────────────────────── boot ─────────────────────────────
function waitFor(fn, ms) {
  return new Promise((res) => {
    const t0 = performance.now();
    (function poll() { const v = fn(); if (v) return res(v); if (performance.now() - t0 > ms) return res(null); setTimeout(poll, 150); })();
  });
}
const idle = (ms) => new Promise((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: ms }) : setTimeout(r, ms)));

async function start(hero) {
  const [THREE, { GLTFLoader }] = await Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js')]);
  const [gltf] = await Promise.all([
    new GLTFLoader().loadAsync(GLB),
    fetch(new URL('assets/cat/cat-motion.json', document.baseURI)).then((r) => (r.ok ? r.json() : null)).then(applyMotion).catch(() => {}),
  ]);
  // let the lane finish coming in out of the fog before the cat arrives
  await new Promise((r) => setTimeout(r, Math.max(0, 4300 - performance.now())));
  const lane = new Lane(hero);
  if (!lane.ok) return;
  const cat = new Cat(THREE, hero, gltf, lane);
  if (DEBUG) { window.__cat = cat; cat.POUNCE = POUNCE; cat.GAIT = GAIT_SPEED; if (/catdebug=lines/.test(location.search)) debugLayer(cat); }

  let visible = true, last = performance.now(), raf = 0;
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }, { threshold: 0.02 });
  io.observe(hero);
  const ro = new ResizeObserver(() => cat.remeasure()); ro.observe(hero);
  new MutationObserver((ms) => {
    for (const mu of ms) {
      const el = mu.target;
      if (!el.classList || !el.classList.contains('dhero-lamp')) continue;
      const lamp = cat.lane.lamps.find((l) => l.el === el); if (!lamp) continue;
      const was = lamp.lit; cat.lane.refreshLit();
      if (was === lamp.lit) continue;
      // something changed at a lamp: look at it, and move on if its light went out over our bed
      cat.glance = { X: lamp.X, h: LANTERN_M, Z: lamp.Z, until: cat.time + 2.5 };
      if (!lamp.lit && Math.hypot(lamp.X - cat.X, lamp.Z - cat.Z) < 2.4) cat.relocate = true;
    }
  }).observe(hero, { attributes: true, attributeFilter: ['class'], subtree: true });
  window.addEventListener('pointermove', (e) => cat.onPointer(e), { passive: true });
  window.addEventListener('pointerdown', (e) => cat.onPress(e), { passive: true });
  document.addEventListener('visibilitychange', kick);
  DESK.addEventListener('change', kick);

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    if (!running()) return;
    if (!cat.manual) cat.update(dt);   // ?catdebug tests can drive it frame by frame
    raf = requestAnimationFrame(frame);
  }
  function running() { return visible && !document.hidden && DESK.matches && cat.lane.ok; }
  function kick() {
    cat.canvas.style.display = DESK.matches ? '' : 'none';
    if (running() && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  kick();
  requestAnimationFrame(() => { cat.canvas.style.opacity = '1'; });
}

function debugLayer(cat) {
  const cv = document.createElement('canvas');
  Object.assign(cv.style, { position: 'absolute', inset: '0', zIndex: '20', pointerEvents: 'none' });
  cat.hero.appendChild(cv);
  const g = cv.getContext('2d');
  (function draw() {
    const L = cat.lane; cv.width = L.W; cv.height = L.H;
    g.clearRect(0, 0, L.W, L.H); g.lineWidth = 1;
    for (const r of L.rows) { g.strokeStyle = 'rgba(0,255,200,.6)'; g.beginPath(); g.moveTo(r.xl, r.y); g.lineTo(r.xr, r.y); g.stroke(); }
    g.strokeStyle = 'rgba(255,200,0,.5)'; g.beginPath();
    for (let Z = L.Zmin; Z <= L.Zmax; Z += 0.25) { const h = L.halfW(Z) - 0.45, a = L.toScreen(-h, Z); if (Z === L.Zmin) g.moveTo(a.x, a.y); else g.lineTo(a.x, a.y); }
    for (let Z = L.Zmax; Z >= L.Zmin; Z -= 0.25) { const h = L.halfW(Z) - 0.45, a = L.toScreen(h, Z); g.lineTo(a.x, a.y); }
    g.closePath(); g.stroke();
    for (const l of L.lamps) { const s = L.spot(l), p = L.toScreen(s.X, s.Z); g.fillStyle = l.lit ? '#fc0' : '#555'; g.fillRect(p.x - 3, p.y - 3, 6, 6); }
    const c = L.toScreen(cat.X, cat.Z); g.fillStyle = '#f0f'; g.fillRect(c.x - 3, c.y - 3, 6, 6);
    g.fillStyle = '#fff'; g.font = '12px monospace';
    g.fillText(`${cat.brain.mode} ${cat.posture} ${cat.motor.cur} X${cat.X.toFixed(2)} Z${cat.Z.toFixed(2)} int${cat.interest.toFixed(2)} ${cat.toy ? cat.toy.kind : '-'}`, 12, 20);
    requestAnimationFrame(draw);
  })();
}

async function boot() {
  if (CALM.matches) return;
  if (document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r, { once: true }));
  const hero = await waitFor(() => { const h = document.querySelector('.dhero'); return h && h.querySelector('.dhero-lamp.back.r') && h.querySelector('.dhero-veil.mid') ? h : null; }, 20000);
  if (!hero) return;
  if (!DESK.matches) {
    const go = (e) => { if (e.matches) { DESK.removeEventListener('change', go); start(hero).catch(() => {}); } };
    DESK.addEventListener('change', go);
    return;
  }
  await idle(1500);
  start(hero).catch((err) => { if (DEBUG) console.error('[scaffold-cat]', err); });
}
boot();
