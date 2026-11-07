// Hero cat interaction tests: drives the real page frame by frame at 30 fps with
// a scripted cursor and checks reaction times, what the cat does, that it doesn't
// chase far cursors, that play ends, and that the head never snaps.
//   node scripts/cat-test/suite.cjs            (RUNS=5 for more repeats, VERBOSE=1 for clip lists)
const { open } = require('./harness.cjs');
const RUNS = +process.env.RUNS || 3;   // behaviour has randomness: repeat each scenario

const SCEN = [
  { name: 'wiggle at medium distance (~1.9 m): notices, walks over, pounces', start: 'STAND', secs: 12,
    ptr: `(t, c, L) => { const a = c.anchor || (c.anchor = L.clampIn(c.X0 + (c.X0 > 0 ? -1.9 : 1.9), c.Z0 + 0.2, 0.8)); const s = L.toScreen(a.X + 0.2*Math.sin(t*7), a.Z + 0.12*Math.cos(t*5)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 1.5 || 'slow to notice: ' + r.firstPlay, r.clips.has('loco') || 'never went over', r.first('pounce') >= 0 && r.first('pounce') < 6.5 || 'no pounce by 6.5 s (' + r.first('pounce') + ')']` },
  { name: 'wiggle far away (~3.8 m) is ignored', start: 'STAND', secs: 10,
    ptr: `(t, c, L) => { const a = c.anchor || (c.anchor = L.clampIn(c.X0 + (c.X0 > 0 ? -3.8 : 3.8), c.Z0 + 1.2, 0.6)); const s = L.toScreen(a.X + 0.25*Math.sin(t*7), a.Z + 0.15*Math.cos(t*5)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay < 0 || 'got up for a far cursor at ' + r.firstPlay, !r.clips.has('loco') || 'walked toward it']` },
  { name: 'cursor waving high over the headline: watches, does not walk', start: 'STAND', secs: 10,
    ptr: `(t, c, L) => { const s = L.toScreen(c.X0 + 0.4*Math.sin(t*4), c.Z0); return [s.x + 200*Math.sin(t*3), s.y - 2.8*s.ppm]; }`,
    check: `r => [!r.clips.has('loco') || 'walked under an unreachable cursor']` },
  { name: 'wiggle on the ground just in front: crouch, wiggle, pounce', start: 'STAND', secs: 8,
    ptr: `(t, c, L) => { const a = c.ahead(0.75); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 0.6 || 'slow to react: ' + r.firstPlay, r.first('pounce') >= 0 && r.first('pounce') < 3.2 || 'no pounce by 3.2 s (' + r.first('pounce') + ')']` },
  { name: 'jiggle just over its head: swats', start: 'STAND', secs: 6,
    ptr: `(t, c, L) => { const s = L.toScreen(c.X, c.Z); return [s.x + 0.12*s.ppm*Math.sin(t*9), s.y - (0.48 + 0.05*Math.sin(t*7))*s.ppm]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 0.6 || 'slow to react: ' + r.firstPlay, r.firstAny(['swat_L','swat_R','bat_play']) >= 0 && r.firstAny(['swat_L','swat_R','bat_play']) < 1.5 || 'no swat by 1.5 s (' + r.firstAny(['swat_L','swat_R','bat_play']) + ')', !r.clips.has('loco') || 'walked']` },
  { name: 'moving right on its body: paws at it', start: 'STAND', secs: 6,
    ptr: `(t, c, L) => { const s = L.toScreen(c.X, c.Z); return [s.x + 0.15*s.ppm*Math.sin(t*8), s.y - 0.2*s.ppm]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 0.6 || 'slow: ' + r.firstPlay, r.firstAny(['swat_L','swat_R','bat_play']) >= 0 && r.firstAny(['swat_L','swat_R','bat_play']) < 1.5 || 'did not paw at it by 1.5 s', !r.clips.has('loco') || 'walked']` },
  { name: 'cursor behind it on the ground: turns, then pounces', start: 'STAND', secs: 8,
    ptr: `(t, c, L) => { const a = c.ahead(-0.75); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.06*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 0.8 || 'slow: ' + r.firstPlay, r.firstAny(['turn_L_90','turn_R_90','turn_180']) >= 0 || 'never turned', r.first('pounce') >= 0 && r.first('pounce') < 6 || 'no pounce by 6 s (' + r.first('pounce') + ')']` },
  { name: 'sitting cat gets up to play', start: 'SIT', secs: 7,
    ptr: `(t, c, L) => { const a = c.ahead(0.7); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 0.8 || 'slow: ' + r.firstPlay, r.firstAny(['pounce','swat_L','swat_R','bat_play']) >= 0 && r.firstAny(['pounce','swat_L','swat_R','bat_play']) < 3.8 || 'no play move by 3.8 s']` },
  { name: 'loafing cat is lazier but still plays', start: 'LOAF', secs: 9,
    ptr: `(t, c, L) => { const a = c.ahead(0.7); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 1.5 || 'slow: ' + r.firstPlay, r.firstAny(['pounce','swat_L','swat_R','bat_play']) >= 0 && r.firstAny(['pounce','swat_L','swat_R','bat_play']) < 5.5 || 'no play move by 5.5 s']` },
  { name: 'stops when the cursor goes still', start: 'STAND', secs: 14,
    ptr: `(t, c, L) => { const a = c.anchor || (c.anchor = c.ahead(0.7)); const k = t < 5 ? 1 : 0; const s = L.toScreen(a.X + k*0.12*Math.sin(t*8), a.Z + k*0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 || 'never played', r.playEnd >= 0 && r.playEnd < 5 + 5 || 'kept playing after cursor stopped (ended ' + r.playEnd + ')']` },
  { name: 'stops when the cursor leaves the hero', start: 'STAND', secs: 10,
    ptr: `(t, c, L) => { if (t >= 4) return [-500, -500]; const a = c.anchor || (c.anchor = c.ahead(0.7)); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 || 'never played', r.playEnd >= 0 && r.playEnd < 4 + 3.5 || 'kept playing after cursor left (ended ' + r.playEnd + ')']` },
  { name: 'cursor left still on its body does not trigger play', start: 'STAND', secs: 8,
    ptr: `(t, c, L) => { const s = L.toScreen(c.X0, c.Z0); return [s.x, s.y - 0.2*s.ppm]; }`,
    check: `r => [r.firstPlay < 0 || 'played with a still cursor']` },
];

(async () => {
  const { page, close } = await open({ query: '?catdebug' });
  let fails = 0;
  for (const sc of SCEN) {
    for (let run = 0; run < RUNS; run++) {
      const res = await page.evaluate(([sc, run]) => {
        const c = window.__cat, L = c.lane, T = c.T; c.manual = true;
        const fn = eval(sc.ptr), check = eval(sc.check);
        // fresh state
        c.brain.swap('life', (function* () { while (true) yield; })());
        const X0 = [-1.0, 0.6, 1.4][run % 3], Z0 = [1.6, 2.6, 4.5][run % 3];
        c.X = X0; c.Z = Z0; c.yaw = [0.4, -2.2, 1.3][run % 3]; c.outside = false; c.interest = 0; c.cool = 0; c.glance = null; c.nextGlance = 999;
        c.gazeOverride = null; c.gaze.w = 0; c.ptr.cx = -1; c.ptr.speed = 0; c.ptr.mps = 0; c.anchor = null; c.X0 = X0; c.Z0 = Z0;
        const pose = { STAND: 'idle_stand', SIT: 'sit_idle', LOAF: 'loaf' }[sc.start];
        c.posture = sc.start; c.motor.play(pose, 0);
        for (let i = 0; i < 10; i++) c.update(1 / 30);
        c.ahead = (d) => ({ X: c.X0 + Math.sin(c.yaw0) * d, Z: c.Z0 - Math.cos(c.yaw0) * d }); c.yaw0 = c.yaw;
        c.brain.swap('life', c.brain.life(false));
        const r = { firstPlay: -1, playEnd: -1, clips: new Set(), firsts: {}, maxGaze: 0, walkedToward: 0, dist: 0, headSpike: 0 };
        const rect = c.hero.getBoundingClientRect();
        let px = null, py = null, lx = c.X, lz = c.Z;
        const headBones = ['neck_01', 'neck_02', 'head'].map(n => c.model.getObjectByName(n));
        const prevQ = headBones.map(() => new T.Quaternion()), q = new T.Quaternion(), bq = new T.Quaternion();
        let firstFrame = true, d0 = null;
        for (let f = 0; f < sc.secs * 30; f++) {
          const t = f / 30;
          const [x, y] = fn(t, c, L);
          const sp = px == null ? 0 : Math.hypot(x - px, y - py) * 30; px = x; py = y;
          if (x < -100) { c.ptr.cx = -1; px = null; } else { c.ptr.cx = rect.left + x; c.ptr.cy = rect.top + y; c.ptr.speed = Math.max(c.ptr.speed, sp * 0.6); }
          c.update(1 / 30);
          const mode = c.brain.mode, cur = c.motor.cur;
          const playing = mode === 'play' && c.brain.note !== 'winddown';
          if (playing && r.firstPlay < 0) r.firstPlay = +t.toFixed(2);
          if (r.firstPlay >= 0 && !playing && r.playEnd < 0) r.playEnd = +t.toFixed(2);
          if (playing) { r.clips.add(cur); if (!(cur in r.firsts)) r.firsts[cur] = +t.toFixed(2); }
          r.maxGaze = Math.max(r.maxGaze, c.gaze.w);
          r.dist += Math.hypot(c.X - lx, c.Z - lz); lx = c.X; lz = c.Z;
          if (playing && c.toy && c.toy.kind === 'ground') { const d = Math.hypot(c.toy.X - c.X, c.toy.Z - c.Z); if (d0 == null) d0 = d; r.walkedToward = Math.max(r.walkedToward, d0 - d); }
          c.body.getWorldQuaternion(bq); bq.invert();
          headBones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (!firstFrame) r.headSpike = Math.max(r.headSpike, 2 * Math.acos(Math.min(1, Math.abs(q.dot(prevQ[i])))) * 57.3); prevQ[i].copy(q); });
          firstFrame = false;
        }
        r.first = (n) => (n in r.firsts ? r.firsts[n] : -1);
        r.firstAny = (ns) => { const v = ns.map(r.first).filter(x => x >= 0); return v.length ? Math.min(...v) : -1; };
        const problems = check(r).filter(x => x !== true);
        if (r.headSpike > 30) problems.push('head snapped ' + r.headSpike.toFixed(0) + '°/frame');
        return { problems, firstPlay: r.firstPlay, playEnd: r.playEnd, clips: [...r.clips].join(','), dist: r.dist.toFixed(2), head: r.headSpike.toFixed(0) };
      }, [sc, run]);
      const ok = res.problems.length === 0; if (!ok) fails++;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${sc.name} [run ${run + 1}]  play@${res.firstPlay} end@${res.playEnd} dist ${res.dist} head ${res.head}°  ${ok ? '' : '→ ' + res.problems.join('; ')}`);
      if (!ok || process.env.VERBOSE) console.log('      clips: ' + res.clips);
    }
  }
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
  await close();
  process.exitCode = fails ? 1 : 0;
})();
