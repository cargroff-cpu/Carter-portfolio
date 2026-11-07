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
const SINP = Math.sin(PITCH), COSP = Math.cos(PITCH);
const DEG = Math.PI / 180;
const ORG_Y = 0.74;            // where the cat's feet sit inside its canvas
const HAZE_K = 0.6;            // share of each fog bank's haze laid on the cat

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
const GAIT_SPEED = [0.2692, 0.6, 1.2857]; // walk, trot, run (m/s at 1x)
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

// speed bands follow the clips' own speeds, so each gait stays within ~0.65-1.35x
function gaitWeights(v) {
  const [w, t, r] = GAIT_SPEED;
  const a0 = w * 1.22, a1 = Math.max(a0 + 0.04, t * 0.75), b0 = t * 1.3, b1 = Math.max(b0 + 0.05, r * 0.78);
  if (v <= a0) return [1, 0, 0];
  if (v < a1) { const k = sm((v - a0) / (a1 - a0)); return [1 - k, k, 0]; }
  if (v <= b0) return [0, 1, 0];
  if (v < b1) { const k = sm((v - b0) / (b1 - b0)); return [0, 1 - k, k]; }
  return [0, 0, 1];
}

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
  // a spot beside a post, a little in front of it and inward of the plinth
  spot(lamp) {
    const Z = clamp(lamp.Z - 0.35, this.Zmin, this.Zmax);
    return { X: lamp.side * Math.max(0.3, this.halfW(Z) - 0.8), Z, lamp };
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
    for (const c of clips) {
      const act = this.mixer.clipAction(c);
      const loop = LOOPS.has(c.name);
      act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      act.clampWhenFinished = true;
      act.play(); act.enabled = false;
      const root = ROOT[c.name] || null;
      const endSlope = root ? (root[root.length - 1] - root[root.length - 2]) * 30 : 0;
      this.s.set(c.name, { name: c.name, act, dur: c.duration, loop, w: 0, e: 0, target: 0, rate: 4, prev: 0, root, endSlope });
    }
    this.gaits = ['walk', 'trot', 'run'].map((n) => this.s.get(n));
    for (const g of this.gaits) { g.act.timeScale = 0; g.gait = true; }
    this.loco = { name: 'loco', w: 0, e: 0, target: 0, rate: 4, p: 0, v: 0.27, k: 1, speed: 0.27, wrapped: false };
    this.slots = [...this.s.values()].filter((x) => !x.gait).concat([this.loco]);
    this.cur = null;
    this.pounceTravel = 0.45;
    this.step = 0;
  }
  has(name) { return this.s.has(name); }
  play(name, fade = 0.25, restart = true) {
    const x = name === 'loco' ? this.loco : this.s.get(name);
    if (!x) return;
    if (this.cur === name && !restart) return;
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
    this.X = 0; this.Z = 2; this.yaw = 0; this.creep = 0; this.vis = 1;
    this.posture = 'STAND'; this.outside = false;
    this.interest = 0; this.cool = 4; this.playStreak = 0;
    this.time = 0; this.relocate = false;
    this.ptr = { cx: -1, cy: -1, x: 0, y: 0, inside: false, speed: 0, lastT: 0, moved: 0 };
    this.toy = null;
    this.glance = null; this.nextGlance = rnd(3, 6);
    this.gazeOverride = null;
    this.blink = { next: rnd(1.5, 4), t: -1, dbl: false, gap: 0 };
    this.chatter = 0; this.earsBack = 0;

    // ── model ──
    for (const c of gltf.animations) {                   // GLB keys start at Blender frame 1
      let first = Infinity, last = 0;
      for (const t of c.tracks) { first = Math.min(first, t.times[0]); last = Math.max(last, t.times[t.times.length - 1]); }
      for (const t of c.tracks) { t.times = t.times.slice(); t.shift(-first); }   // times arrays are shared between tracks
      c.duration = last - first;
    }
    this.model = gltf.scene;
    this.morphs = [];
    this.model.traverse((o) => {
      if (o.isMesh) { o.frustumCulled = false; if (o.morphTargetInfluences) this.morphs.push(o); }
      // tuned in the page's light: matte near-black fur, eyes that stay amber instead of blowing out
      const m = o.material;
      if (m && m.name === 'cat_fur') { m.color.set(0x141219); m.roughness = 0.78; if ('specularIntensity' in m) m.specularIntensity = 0.5; }
      if (m && m.name === 'cat_eye') m.emissiveIntensity = 1.4;
      if (o.isBone) o.matrixAutoUpdate = true;
    });
    this.bones = { neck_01: null, neck_02: null, head: null };
    for (const n of Object.keys(this.bones)) this.bones[n] = this.model.getObjectByName(n);
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
    this.rim = new THREE.DirectionalLight(0xd8c9f0, 2.8); this.rim.position.set(-1.3, 1.5, -2.2); scene.add(this.rim);
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

    this.motor = new Motor(THREE, this.model, gltf.animations);
    this.motor.play('idle_stand', 0);
    this.brain = new Brain(this);
    this.sizeCanvas();
    this.tmp = { v: new THREE.Vector3(), v2: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(),
      q3: new THREE.Quaternion(), qy: new THREE.Quaternion(), qp: new THREE.Quaternion(), e: new THREE.Euler() };
    this.style = { z: '', f: '', t: '' };
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
    const moving = this.ptr.speed > 70;
    const yc = this.lane.yOfZ(this.Z), ppm = this.lane.ppmAtY(yc) * this.vis;
    const ax = (hp.x - this.lane.cAtY(yc)) / ppm, ah = (yc - hp.y) / (ppm * COSP);
    // hovering just over the cat means "over the cat", not a spot on the ground behind it
    const keepGround = this.toy && this.toy.kind === 'ground' && (this.posture === 'CROUCH' || this.brain.note === 'chase');
    const overCat = Math.abs(ax - this.X) < 0.5 && ah > (keepGround ? 0.55 : 0.3) * this.vis && ah < 0.95;
    const g = overCat ? null : this.lane.fromScreen(hp.x, hp.y);
    if (g && g.Z <= this.lane.Zmax + 0.6) {
      const c = this.lane.clampIn(g.X, g.Z, 0.5);
      return { kind: 'ground', X: c.X, Z: c.Z, h: 0.02, moving };
    }
    return { kind: 'air', X: ax, Z: this.Z, h: ah, moving };
  }

  updateAttention(dt) {
    const p = this.ptr, toy = this.toy;
    p.speed = damp(p.speed, 0, 5, dt);
    if (!toy) { this.interest = Math.max(0, this.interest - dt * 0.5); return; }
    const s = this.lane.toScreen(this.X, this.Z), catH = 0.33 * s.ppm * this.vis;
    const d = Math.hypot(p.x - s.x, p.y - (s.y - catH));
    const prox = Math.exp(-d / (catH * 6));
    const act = clamp(p.speed / 260, 0, 1);
    this.interest += dt * 1.4 * act * (0.2 + prox);
    if (act < 0.12) this.interest -= dt * (this.brain.mode === 'play' ? 0.22 : 0.35);
    this.interest = clamp(this.interest, 0, 3);
  }

  // ── per-frame ──
  update(dt) {
    this.time += dt;
    this.cool = Math.max(0, this.cool - dt);
    this.toy = this.readToy();
    this.updateAttention(dt);
    this.brain.tick(dt);
    this.unlayer();
    this.motor.update(dt);

    // move
    const step = this.motor.step + this.creep * dt;
    this.X += Math.sin(this.yaw) * step; this.Z -= Math.cos(this.yaw) * step;
    const L = this.lane;
    if (this.outside) { if (L.inside(this.X, this.Z, 0.6)) this.outside = false; }
    else { const c = L.clampIn(this.X, this.Z, 0.45); this.X = c.X; this.Z = c.Z; }

    const zMid = L.rows[1].Z, zBack = L.rows[3].Z;
    this.vis = lerp(1, 1.18, sm((this.Z - zMid) / (zBack - zMid)));   // a touch larger far away so it still reads
    this.body.rotation.y = this.yaw;
    this.body.scale.setScalar(this.vis);
    this.body.updateMatrixWorld(true);
    this.applyGaze(dt);
    this.applyFace(dt);
    this.light(dt);
    this.place();
    this.renderer.render(this.scene, this.camera);
  }

  gazeTarget(out) {
    const T = this.tmp;
    if (this.gazeOverride && this.gazeOverride.until > this.time) {
      const o = this.gazeOverride;
      if (o.kind === 'viewer') return { p: out.set(0, 3.2, 14).applyAxisAngle(T.v2.set(0, 1, 0), -this.yaw), w: 1 };
      return { p: this.toLocal(o.X, o.h, o.Z, out), w: 1 };
    }
    if (this.toy && this.interest > 0.12) {
      const t = this.toy;
      const p = t.kind === 'ground' ? this.toLocal(t.X, 0.03, t.Z, out) : this.toLocal(t.X, t.h, t.Z + -0.25, out);
      return { p, w: sm(this.interest / 0.55) };
    }
    if (this.glance && this.glance.until > this.time) {
      const g = this.glance;
      if (g.kind === 'viewer') return { p: out.set(0, 3.2, 14).applyAxisAngle(T.v2.set(0, 1, 0), -this.yaw), w: 0.9 };
      return { p: this.toLocal(g.X, g.h, g.Z, out), w: 0.85 };
    }
    return null;
  }

  // three's mixer only writes a bone or morph when the clip's value changes, so
  // anything layered on top (head turn, blinks) must be taken back off before the
  // next mixer update, or it piles up frame after frame (the head would spin).
  unlayer() {
    for (const b of Object.values(this.bones)) if (b && b.userData.animQ) b.quaternion.copy(b.userData.animQ);
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
    G.w = damp(G.w, want ? want.w * allow : 0, 3.2, dt);

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
      const ty = clamp(Math.atan2(d.x, d.z), -90 * DEG, 90 * DEG);
      const tp = clamp(Math.atan2(-d.y, Math.hypot(d.x, d.z)), -52 * DEG, 47 * DEG);
      G.yaw = clamp(wrap(ty - G.ay), -95 * DEG, 95 * DEG);
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
    const ch = this.chatter > 0 ? 0.22 * (0.5 + 0.5 * Math.sin(this.time * 52)) * this.chatter : 0;
    for (const m of this.morphs) {
      const inf = m.morphTargetInfluences;
      (m.userData.animInf || (m.userData.animInf = [0, 0, 0])).splice(0, 3, inf[0], inf[1], inf[2]);
      inf[0] = Math.min(1, inf[0] + blink);
      inf[1] = Math.min(1, inf[1] + this.earsBack);
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

  place() {
    const L = this.lane, s = L.toScreen(this.X, this.Z), ppm = s.ppm;
    const cam = this.camera, cw = this.cw, ch = this.ch;
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
    this.rim.intensity = 2.8 * (1 + 1.2 * a);          // the cool rim holds the silhouette in the fog
    const f = L.filterAt(this.Z);
    const zs = String(z), fs = `brightness(${f.bright.toFixed(3)}) blur(${f.blur.toFixed(2)}px)`;
    const ts = `translate3d(${(s.x - cw / 2).toFixed(1)}px, ${(s.y - ORG_Y * ch).toFixed(1)}px, 0)`;
    const st = this.canvas.style;
    if (this.style.z !== zs) { st.zIndex = zs; this.style.z = zs; }
    if (this.style.f !== fs) { st.filter = fs; this.style.f = fs; }
    if (this.style.t !== ts) { st.transform = ts; this.style.t = ts; }
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
      if (this.mode !== 'play' && c.posture !== 'WALK') this.swap('pet', this.pet());
    }
    if (this.mode === 'life' && c.cool <= 0) {
      const need = { STAND: 0.9, WALK: 1.1, SIT: 1.4, LOAF: 2.0, CROUCH: 0.9 }[c.posture] || 1;
      if (c.interest > need && c.toy) this.swap('play', this.play());
    }
    const r = this.gen.next(dt);
    if (r.done) this.swap('life', this.life(false));
  }
  swap(mode, gen) { this.gen.return(); this.mode = mode; this.note = ''; this.gen = gen; this.gen.next(); }

  // ── primitives ──
  *wait(sec) { let t = 0; while (t < sec) t += yield; }
  *once(name, fade = 0.2, each) {
    const c = this.c, m = c.motor; if (!m.has(name)) return;
    m.play(name, fade, true);
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
  *toStand() {
    const c = this.c, m = c.motor;
    yield* this.settle();
    switch (c.posture) {
      case 'WALK': yield* this.stopWalk(); break;
      case 'LOAF': yield* this.once('loaf_to_sit', 0.2); // falls through: then stand
      case 'SIT': yield* this.once('sit_to_stand', 0.2); break;
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
        L.v = Math.max(0.27, L.v - 0.9 * dt);
        if ((L.wrapped && L.v < 0.36) || t > 3) break;
      }
    }
    yield* this.once('walk_to_idle', 0.12);
    m.play('idle_stand', 0.15); c.posture = 'STAND';
  }
  *turnBy(d) {
    d = wrap(d);
    if (Math.abs(d) < 15 * DEG) return;
    if (d > 135 * DEG) yield* this.turnClip('turn_180', d);
    else if (d < -135 * DEG) { yield* this.turnClip('turn_R_90', d / 2); yield* this.turnClip('turn_R_90', d / 2); }
    else yield* this.turnClip(d > 0 ? 'turn_L_90' : 'turn_R_90', d);
    this.c.motor.play('idle_stand', 0.2);
  }
  *turnClip(name, d) {
    const c = this.c, y0 = c.yaw;
    yield* this.once(name, 0.2, (dt, t, T) => { c.yaw = wrap(y0 + d * sm(t / T)); });
    c.yaw = wrap(y0 + d);
  }
  // walk (or trot) to a moving or fixed target, then stop on the walk's phase 0
  *walkTo(getT, o = {}) {
    const c = this.c, m = c.motor, L = m.loco;
    const speed = o.speed || 0.27, stop = o.stop ?? 0.12;
    let t = getT(); if (!t) return;
    if (c.posture !== 'WALK') {
      yield* this.toStand();
      t = getT(); if (!t || c.distTo(t) <= stop + 0.06) return;
      const dy = wrap(c.headingTo(t) - c.yaw);
      if (Math.abs(dy) > 40 * DEG) yield* this.turnBy(dy);
      t = getT(); if (!t) return;
      L.v = 0.27;
      yield* this.once(o.bored ? 'bored_walkaway_start' : 'idle_to_walk', 0.15, (dt) => c.steer(t, 45 * DEG, dt));
      m.play('loco', 0.2); L.p = 0;
    } else if (m.cur !== 'loco') {
      yield* this.settle(); m.play('loco', 0.2); L.p = 0;
    }
    c.posture = 'WALK';
    let elapsed = 0, stopping = false;
    while (true) {
      const dt = yield; elapsed += dt;
      t = getT();
      const d = t ? c.distTo(t) : 0;
      if (!t || (o.until && o.until(d)) || elapsed > 45) stopping = true;
      let vT = stopping ? 0.27 : speed;
      if (t && !stopping) vT = Math.min(vT, Math.max(0.2, Math.sqrt(2 * 0.45 * Math.max(0, d - stop))));
      L.v += clamp(vT - L.v, -0.9 * dt, 0.6 * dt);
      if (t) c.steer(t, L.v < 0.36 ? 80 * DEG : L.v < 0.8 ? 115 * DEG : 150 * DEG, dt);
      if (t && !stopping && d <= stop + 0.2) stopping = true;
      if (stopping && L.wrapped && L.v < 0.36) break;
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
  *enter() {
    const c = this.c, L = c.lane, m = c.motor;
    const side = chance(0.5) ? -1 : 1;
    const Z = lerp(L.Zmin + 0.3, L.rows[1].Z - 0.35, Math.random());
    const y = L.yOfZ(Z), ppm = L.ppmAtY(y);
    const xs = side < 0 ? -0.7 * ppm : L.W + 0.7 * ppm;
    c.X = (xs - L.cAtY(y)) / ppm; c.Z = Z; c.yaw = side < 0 ? 90 * DEG : -90 * DEG; c.outside = true;
    m.loco.v = 0.27; m.play('loco', 0); m.loco.p = 0; c.posture = 'WALK';
    const lamps = L.lamps.filter((l) => l.side === side && (l.row === 'mid' || l.row === 'near') && l.lit);   // settle by the first lit post it reaches
    const dest = lamps.length ? L.spot(lamps[Math.floor(Math.random() * lamps.length)]) : L.randomPoint();
    yield* this.walkTo(() => dest, { speed: 0.27, stop: 0.12 });
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
      const want = rnd(-55, 55) * DEG, d = wrap(want - c.yaw);   // sit facing out into the room
      if (Math.abs(d) > 40 * DEG) yield* this.turnBy(d);
      yield* this.once('stand_to_sit', 0.2);
    }
    c.relocate = false;
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
    const opts = [];
    for (const l of L.lamps) {
      const s = L.spot(l);
      if (c.distTo(s) < 1.5) continue;
      opts.push({ w: (l.lit ? 1.6 : 0.5) * (l.row === 'back' ? 0.9 : 1), t: s });
    }
    for (let i = 0; i < 4; i++) { const p = L.randomPoint(); if (c.distTo(p) > 1.5) opts.push({ w: 0.45, t: p }); }
    if (o.away && c.toy) {   // walk off away from the toy that bored it
      for (const op of opts) if (Math.hypot(op.t.X - c.toy.X, op.t.Z - c.toy.Z) < 2) op.w *= 0.1;
    }
    if (!opts.length) { yield* this.wait(1); return; }
    const dest = pick(opts).t, d = c.distTo(dest);
    yield* this.walkTo(() => dest, { speed: d > 5 && chance(0.35) ? 0.5 : 0.27, stop: 0.12, bored: o.bored });
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
  *play() {
    const c = this.c, m = c.motor;
    const started = c.time, maxT = rnd(25, 45);
    let calm = 0, sideT = 0;
    try {
      yield* this.toStand();
      if (c.interest > 0.6) yield* this.once('notice', 0.15);
      while (true) {
        yield;
        const t = c.toy;
        calm = c.interest < 0.28 ? calm + 1 / 60 : 0;
        if (!t || calm > 1.5 || c.time - started > maxT) break;
        if (t.kind === 'ground') {
          const d = c.distTo(t);
          if (d > 1.25) {
            this.note = 'chase';
            yield* this.walkTo(() => {
              const u = c.toy; if (!u || u.kind !== 'ground') return null;
              const dd = c.distTo(u), k = Math.max(0, dd - 0.9) / (dd || 1);
              return { X: c.X + (u.X - c.X) * k, Z: c.Z + (u.Z - c.Z) * k };
            }, { speed: d > 4 ? 0.75 : d > 2.2 ? 0.45 : 0.27, stop: 0.08, until: () => !c.toy || c.toy.kind !== 'ground' || c.distTo(c.toy) < 1.05 || c.interest < 0.25 });
          } else if (d > 0.32) { this.note = 'stalk'; yield* this.stalk(); }
          else if (t.moving) { this.note = 'swat'; yield* this.swat(t); }
          else { this.note = 'sniff'; yield* this.hold('idle_stand', 0.3, 0.25); }
        } else {
          const dx = t.X - c.X, lat = Math.abs(dx);
          // turn the body only when it stays well off to one side; the head does the rest
          const dy = lat > 0.25 ? wrap(c.headingTo({ X: t.X, Z: c.Z }) - c.yaw) : 0;
          sideT = Math.abs(dy) > (t.h > 1.2 ? 100 : 70) * DEG ? sideT + 1 / 30 : 0;
          if (sideT > (t.h > 1.2 ? 1.2 : 0.35) && c.posture !== 'WALK') { sideT = 0; yield* this.turnBy(dy); }
          this.note = 'air';
          if (t.h < 0.62 && lat < 0.5) {
            c.chatter = 0;
            if (t.moving || chance(0.02)) yield* this.swat(t); else yield* this.hold('idle_stand', 0.25, 0.25);
          } else if (lat > 0.9 && t.h < 1.8) {
            yield* this.walkTo(() => {
              const u = c.toy; if (!u || u.kind !== 'air') return null;
              return c.lane.clampIn(u.X, c.Z, 0.55);
            }, { speed: 0.45, stop: 0.35, until: () => !c.toy || c.toy.kind !== 'air' || c.interest < 0.25 });
          } else {
            c.chatter = t.moving && t.h > 0.62 ? 1 : 0;   // can't reach it: chatter at it
            yield* this.hold('idle_stand', 0.3, 0.25);
          }
        }
      }
      c.chatter = 0;
      // wind down the way cats do: pretend nothing happened
      const r = Math.random();
      if (r < 0.4) { yield* this.toSit(); yield* this.hold('groom', rnd(3, 5), 0.3); c.motor.play('sit_idle', 0.3); c.posture = 'SIT'; }
      else if (r < 0.7) { yield* this.toStand(); yield* this.wander({ bored: true, away: true }); }
      else { yield* this.toStand(); yield* this.once('tail_flick', 0.2); m.play('idle_stand', 0.2); }
    } finally {
      c.chatter = 0; c.creep = 0; c.earsWant = 0;
      c.cool = rnd(6, 11); c.interest = Math.min(c.interest, 0.2);
    }
  }
  *stalk() {
    const c = this.c, m = c.motor;
    let t = c.toy; if (!t) return;
    yield* this.toStand();
    t = c.toy; if (!t || t.kind !== 'ground') return;
    const dy = wrap(c.headingTo(t) - c.yaw);
    if (Math.abs(dy) > 45 * DEG) yield* this.turnBy(dy);
    m.play('stalk_crouch', 0.32); c.posture = 'CROUCH';
    let still = 0, tt = 0;
    while (true) {
      const dt = yield; tt += dt;
      t = c.toy;
      if (!t || t.kind !== 'ground' || c.interest < 0.2) { c.creep = 0; yield* this.toStand(); return; }
      const d = c.distTo(t), err = wrap(c.headingTo(t) - c.yaw);
      c.yaw = wrap(c.yaw + clamp(err * 2, -35 * DEG, 35 * DEG) * dt);
      if (d > 1.8) { c.creep = 0; yield* this.toStand(); return; }
      c.creep = d > 0.62 && Math.abs(err) < 30 * DEG ? 0.06 : 0;
      still = t.moving ? 0 : still + dt;
      if (still > 4 && chance(dt * 0.4)) { c.creep = 0; c.interest *= 0.5; yield* this.toStand(); return; }
      if (d <= 0.64 && Math.abs(err) < 20 * DEG && tt > 0.9) break;
    }
    c.creep = 0;
    yield* this.once('butt_wiggle', 0.15, (dt) => {
      const u = c.toy; if (u && u.kind === 'ground') c.yaw = wrap(c.yaw + clamp(wrap(c.headingTo(u) - c.yaw) * 2, -30 * DEG, 30 * DEG) * dt);
    });
    const u = c.toy && c.toy.kind === 'ground' ? c.toy : t;
    m.pounceTravel = clamp(c.distTo(u) - 0.14, 0.28, 0.62);
    yield* this.once('pounce', 0.1);
    m.play('idle_stand', 0.2); c.posture = 'STAND';
    c.interest = Math.max(0, c.interest - 0.35);
    const v = c.toy;
    if (v && v.kind === 'ground' && c.distTo(v) < 0.55 && v.moving && chance(0.6)) yield* this.swat(v);
  }
  *swat(t) {
    const c = this.c, m = c.motor, T = c.tmp;
    // face it first: a swat at something behind or beside it reads wrong
    if (t.kind === 'ground' && c.distTo(t) > 0.12) {
      const dy = wrap(c.headingTo(t) - c.yaw);
      if (Math.abs(dy) > 50 * DEG) { yield* this.toStand(); yield* this.turnBy(dy); }
      const u = c.toy; if (u) t = u;
    }
    const p = c.toLocal(t.X, t.h, t.Z, T.v);
    const name = Math.abs(p.x) < 0.08 && t.h < 0.35 && chance(0.45) ? 'bat_play' : p.x >= 0 ? 'swat_L' : 'swat_R';
    c.earsWant = 0.25;
    yield* this.once(name, 0.12);
    c.earsWant = 0;
    m.play('idle_stand', 0.2); c.posture = 'STAND';
    c.interest = Math.max(0, c.interest - 0.12);
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
  if (DEBUG) { window.__cat = cat; if (/catdebug=lines/.test(location.search)) debugLayer(cat); }

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
