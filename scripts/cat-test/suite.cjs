// Hero cat interaction tests: drives the real page frame by frame at 30 fps with
// a scripted cursor and checks reaction times, what the cat does, that it doesn't
// chase far cursors, that play ends, and that the head never snaps.
//   node scripts/cat-test/suite.cjs            (RUNS=5 for more repeats, VERBOSE=1 for clip lists)
const { open } = require('./harness.cjs');
const RUNS = +process.env.RUNS || 3;   // behaviour has randomness: repeat each scenario
const ONLY = process.env.ONLY || '';     // run only scenarios whose name contains this

const SCEN = [
  { name: 'wiggle at medium distance (~1.9 m): notices, walks over, pounces', start: 'STAND', secs: 12,
    ptr: `(t, c, L) => { const a = c.anchor || (c.anchor = L.clampIn(c.X0 + (c.X0 > 0 ? -1.9 : 1.9), c.Z0 + 0.2, 0.8)); const s = L.toScreen(a.X + 0.2*Math.sin(t*7), a.Z + 0.12*Math.cos(t*5)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 && r.firstPlay < 1.5 || 'slow to notice: ' + r.firstPlay, r.clips.has('loco') || 'never went over', r.first('pounce') >= 0 && r.first('pounce') < 6.5 || 'no pounce by 6.5 s (' + r.first('pounce') + ')']` },
  { name: 'wiggle far away (~3.8 m) is ignored', start: 'STAND', secs: 10,
    ptr: `(t, c, L) => { const a = c.anchor || (c.anchor = L.clampIn(c.X0 + (c.X0 > 0 ? -3.8 : 3.8), c.Z0 + 1.2, 0.6)); const s = L.toScreen(a.X + 0.25*Math.sin(t*7), a.Z + 0.15*Math.cos(t*5)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay < 0 || r.dmAtPlay <= 2.9 || 'got up for a far cursor at ' + r.firstPlay + ' (it was ' + r.dmAtPlay.toFixed(1) + ' m away)', r.firstPlay < 0 || r.dmAtPlay <= 2.9 || !r.clips.has('loco') || 'walked toward it']` },   // a cat that wandered into range by itself may play
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
  // ── newer behaviours ──
  { name: 'locks on: ears and tail flick before the pounce', start: 'STAND', secs: 6,
    ptr: `(t, c, L) => { const a = c.ahead(0.75); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.locks.length > 0 || 'never locked on', r.first('pounce') < 0 || r.locks[0] <= r.first('pounce') || 'locked on only after pouncing']` },
  { name: 'cursor gliding past in front: pounce leads it', start: 'STAND', secs: 12,
    ptr: `(t, c, L) => { const u = -0.7 + ((t * 0.5) % 2.8 < 1.4 ? (t * 0.5) % 2.8 : 2.8 - (t * 0.5) % 2.8); const a = c.ahead(0.8), px = Math.cos(c.yaw0), pz = Math.sin(c.yaw0); const p = L.clampIn(a.X + px*u, a.Z + pz*u, 0.5); const s = L.toScreen(p.X, p.Z); return [s.x, s.y]; }`,
    check: `r => [r.misses.length > 0 || 'never pounced', !r.misses.length || r.misses[0] < 0.25 || 'landed ' + r.misses[0].toFixed(2) + ' m off the cursor']` },
  { name: 'pounce dodged: a quick "missed it" look around', start: 'STAND', secs: 8,
    ptr: `(t, c, L) => { const st = c.anchor || (c.anchor = { a: c.ahead(0.75) }); if (!st.jump && c.motor.cur === 'pounce' && c.motor.time('pounce') > 0.2) st.jump = L.clampIn(st.a.X + Math.cos(c.yaw0)*0.9, st.a.Z + Math.sin(c.yaw0)*0.9, 0.5); const a = st.jump || st.a; const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.first('pounce') >= 0 || 'never pounced', r.first('idle_look_around') > r.first('pounce') && r.first('idle_look_around') - r.first('pounce') < 2 || 'no look-around after the dodge (' + r.first('idle_look_around') + ')']` },
  { name: 'cursor flicked past its face: quick one-two swat', start: 'STAND', secs: 5,
    ptr: `(t, c, L) => { const k = Math.floor(t), f = t - k, dir = k % 2 ? -1 : 1; const u = dir * (f < 0.22 ? -0.45 + 0.9 * (f / 0.22) : 0.45); const a = c.ahead(0.3), p = { X: a.X + Math.cos(c.yaw0)*u, Z: a.Z + Math.sin(c.yaw0)*u }; const s = L.toScreen(p.X, p.Z); return [s.x, s.y]; }`,
    check: `r => { const sw = r.starts.filter(([n]) => /^swat_/.test(n)).map(([, t]) => t); let one2 = -1; for (let i = 1; i < sw.length; i++) if (sw[i] - sw[i-1] < 0.6) { one2 = sw[i-1]; break; } return [one2 >= 0 && one2 < 3 || 'no one-two swat by 3 s (' + sw.join(',') + ')', !r.clips.has('loco') || 'walked']; }` },
  { name: 'woken from a loaf: a beat of looking, then plays', start: 'LOAF', secs: 8,
    ptr: `(t, c, L) => { const a = c.ahead(0.7); const s = L.toScreen(a.X + 0.12*Math.sin(t*8), a.Z + 0.08*Math.cos(t*6)); return [s.x, s.y]; }`,
    check: `r => [r.firstPlay >= 0 || 'never played', r.first('loaf_to_sit') - r.firstPlay >= 0.4 || 'got up with no hesitation', r.firstAny(['pounce','swat_L','swat_R','bat_play']) >= 0 && r.firstAny(['pounce','swat_L','swat_R','bat_play']) < 5.5 || 'no play move by 5.5 s']` },
  { name: 'jiggle over its head for 8 s: swats come with a beat between them, not on a loop', start: 'STAND', secs: 8,
    ptr: `(t, c, L) => { const s = L.toScreen(c.X, c.Z); return [s.x + 0.12*s.ppm*Math.sin(t*9), s.y - (0.48 + 0.05*Math.sin(t*7))*s.ppm]; }`,
    check: `r => { const sw = r.starts.filter(([n]) => /^(swat_|bat_)/.test(n)).map(([, t]) => t); return [sw.length >= 2 || 'hardly swatted (' + sw.join(',') + ')', sw.length <= 7 || 'swatted ' + sw.length + ' times in 8 s']; }` },
  // ── the posts ──
  { name: 'life, no cursor, 15 min: every post gets a visit and he is never drawn over a nearer post', start: 'STAND', secs: 900, fast: true, runs: 2,
    ptr: `(t, c, L) => [-500, -500]`,
    check: `r => { const miss = r.lampNames.filter((n, i) => r.lampStay[i] < 2.4); return [miss.length === 0 || 'never settled at: ' + miss.join(', ') + ' (' + r.lampStay.map(v => v.toFixed(0)).join('/') + ' s)', r.hidden === 0 || 'drawn over a nearer post for ' + r.hidden + ' frames']; }` },
];

(async () => {
  const { page, close } = await open({ query: '?catdebug' });
  let fails = 0;
  for (const sc of SCEN) {
    if (ONLY && !sc.name.includes(ONLY)) continue;
    if (process.env.TRACE) sc.trace = +process.env.TRACE;   // TRACE=<secs>: per-frame state dump
    for (let run = 0; run < Math.min(RUNS, sc.runs || RUNS); run++) {
      const res = await page.evaluate(([sc, run]) => {
        const c = window.__cat, L = c.lane, T = c.T; c.manual = true; c.scripted = false;   // these scenarios are the free-roaming cat
        const fn = eval(sc.ptr), check = eval(sc.check);
        // fresh state
        c.brain.swap('life', (function* () { while (true) yield; })());
        const X0 = [-1.0, 0.6, 1.4][run % 3], Z0 = [1.6, 2.6, 4.5][run % 3];
        c.X = X0; c.Z = Z0; c.yaw = [0.4, -2.2, 1.3][run % 3]; c.outside = false; c.interest = 0; c.cool = 0; c.glance = null; c.nextGlance = 999;
        c.gazeOverride = null; c.gaze.w = 0; c.ptr.cx = -1; c.ptr.speed = 0; c.ptr.mps = 0; c.anchor = null; c.X0 = X0; c.Z0 = Z0;
        c.lampSeen = new Map(); c.atLamp = null; c.lockT = -9; c.flickT = -9; c.toyV = { X: 0, Z: 0, sp: 0 }; c.toyPrev = null; c.lastMiss = -1; c.oneTwoT = -9; c.swatN = 0; c.swatEnd = -9; c.peek = null;
        const pose = { STAND: 'idle_stand', SIT: 'sit_idle', LOAF: 'loaf' }[sc.start];
        c.posture = sc.start; c.motor.play(pose, 0);
        for (let i = 0; i < 10; i++) c.update(1 / 30);
        c.ahead = (d) => ({ X: c.X0 + Math.sin(c.yaw0) * d, Z: c.Z0 - Math.cos(c.yaw0) * d }); c.yaw0 = c.yaw;
        c.brain.swap('life', c.brain.life(false));
        const lampNames = L.lamps.map((l) => l.row + (l.side < 0 ? '-left' : '-right')), lampStay = L.lamps.map(() => 0);
        const render0 = c.renderer.render; if (sc.fast) c.renderer.render = () => {};   // no drawing for the long runs
        const r = { lampNames, lampStay, hidden: 0, dmAtPlay: 99, firstPlay: -1, playEnd: -1, clips: new Set(), firsts: {}, seq: [], trace: [], starts: [], misses: [], locks: [], maxGaze: 0, boneSpike: 0, boneSpikeAt: '', walkedToward: 0, dist: 0, headSpike: 0 };
        const rect = c.hero.getBoundingClientRect();
        let px = null, py = null, lx = c.X, lz = c.Z;
        const headBones = ['neck_01', 'neck_02', 'head'].map(n => c.model.getObjectByName(n));
        const allBones = []; c.model.traverse(o => { if (o.isBone) allBones.push(o); });
        const prevAll = allBones.map(() => new T.Quaternion());
        const prevQ = headBones.map(() => new T.Quaternion()), q = new T.Quaternion(), bq = new T.Quaternion();
        const trace = sc.trace || 0;
        let firstFrame = true, d0 = null, lastCur = null, lastLock = c.lockT, pt = 0;
        for (let f = 0; f < sc.secs * 30; f++) {
          const t = f / 30;
          const [x, y] = fn(t, c, L);
          const sp = px == null ? 0 : Math.hypot(x - px, y - py) * 30; px = x; py = y;
          if (x < -100) { c.ptr.cx = -1; px = null; } else { c.ptr.cx = rect.left + x; c.ptr.cy = rect.top + y; c.ptr.speed = Math.max(c.ptr.speed, sp * 0.6); }
          c.update(1 / 30);
          const mode = c.brain.mode, cur = c.motor.cur;
          const playing = mode === 'play' && c.brain.note !== 'winddown';
          if (playing && r.firstPlay < 0) { r.firstPlay = +t.toFixed(2); r.dmAtPlay = c.toy ? c.toy.dm : 99; }
          if (r.firstPlay >= 0 && !playing && r.playEnd < 0) r.playEnd = +t.toFixed(2);
          const tag = cur + (c.brain.note ? '/' + c.brain.note : '');
          if (!r.seq.length || r.seq[r.seq.length - 1][0] !== tag) r.seq.push([tag, +t.toFixed(2)]);
          if (trace && f % 3 === 0 && t < trace) r.trace.push(`${t.toFixed(2)} ${mode}/${c.brain.note} ${cur} ${c.posture} toy=${c.toy ? c.toy.kind + ' dm' + c.toy.dm.toFixed(2) + ' h' + c.toy.h.toFixed(2) + (c.toy.moving ? ' mv' : '') : '-'} d=${c.toy ? Math.hypot(c.toy.X - c.X, c.toy.Z - c.Z).toFixed(2) : '-'} err=${c.toy ? (((Math.atan2(c.toy.X - c.X, -(c.toy.Z - c.Z)) - c.yaw + 9 * Math.PI) % (2 * Math.PI) - Math.PI) * 57.3).toFixed(0) : '-'} mps=${(c.ptr.mps || 0).toFixed(2)} int=${c.interest.toFixed(2)} flick=${(c.time - c.flickT).toFixed(2)}`);
          if (playing && cur !== lastCur) r.starts.push([cur, +t.toFixed(2)]);
          lastCur = cur;
          if (c.lockT !== lastLock) { lastLock = c.lockT; if (playing) r.locks.push(+t.toFixed(2)); }
          // where a pounce lands: the paws' spot (just ahead of the body) to the cursor on the ground
          const ptm = cur === 'pounce' ? c.motor.time('pounce') : 0;
          if (cur === 'pounce' && pt < c.POUNCE.end && ptm >= c.POUNCE.end && c.toy && c.toy.kind === 'ground')
            r.misses.push(Math.hypot(c.toy.X - (c.X + Math.sin(c.yaw) * 0.14), c.toy.Z - (c.Z - Math.cos(c.yaw) * 0.14)));
          pt = ptm;
          if (playing) { r.clips.add(cur); if (!(cur in r.firsts)) r.firsts[cur] = +t.toFixed(2); }
          r.maxGaze = Math.max(r.maxGaze, c.gaze.w);
          // time spent settled beside each post, and frames where a post nearer than he is would be hidden by his sprite
          { const s0 = L.toScreen(c.X, c.Z), cw = 0.2 * s0.ppm * c.vis;
            L.lamps.forEach((l, i) => { const sp = L.spot(l); if (c.posture !== 'WALK' && Math.hypot(sp.X - c.X, sp.Z - c.Z) < 1.0) r.lampStay[i] += 1 / 30; });
            for (const l of L.lamps) { if (l.row === 'near' || c.Z <= l.Z + 0.1) continue; const ls = L.toScreen(l.X, l.Z); if (Math.abs(s0.x - ls.x) < cw + 0.4 * ls.ppm) { r.hidden++; break; } } }
          r.dist += Math.hypot(c.X - lx, c.Z - lz); lx = c.X; lz = c.Z;
          if (playing && c.toy && c.toy.kind === 'ground') { const d = Math.hypot(c.toy.X - c.X, c.toy.Z - c.Z); if (d0 == null) d0 = d; r.walkedToward = Math.max(r.walkedToward, d0 - d); }
          c.body.getWorldQuaternion(bq); bq.invert();
          if (!sc.fast) allBones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (!firstFrame) { const a = 2 * Math.acos(Math.min(1, Math.abs(q.dot(prevAll[i])))) * 57.3; if (a > r.boneSpike) { r.boneSpike = a; r.boneSpikeAt = cur + ':' + b.name + '@' + t.toFixed(2); } } prevAll[i].copy(q); });
          headBones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (!firstFrame) r.headSpike = Math.max(r.headSpike, 2 * Math.acos(Math.min(1, Math.abs(q.dot(prevQ[i])))) * 57.3); prevQ[i].copy(q); });
          firstFrame = false;
        }
        c.renderer.render = render0;
        r.first = (n) => (n in r.firsts ? r.firsts[n] : -1);
        r.firstAny = (ns) => { const v = ns.map(r.first).filter(x => x >= 0); return v.length ? Math.min(...v) : -1; };
        const problems = check(r).filter(x => x !== true);
        if (r.headSpike > 30) problems.push('head snapped ' + r.headSpike.toFixed(0) + '°/frame');
        // any bone: a clip restarting on itself or a too-short fade shows up as a jump; the
        // biggest real move is the pounce launch (~67°)
        if (r.boneSpike > 70) problems.push('pose popped ' + r.boneSpike.toFixed(0) + '°/frame at ' + r.boneSpikeAt);
        return { problems, firstPlay: r.firstPlay, playEnd: r.playEnd, clips: [...r.clips].join(','), trace: r.trace.join('\n'), misses: r.misses.map(m => m.toFixed(2)).join(','), seq: r.seq.map(([n, t]) => n + '@' + t).join(' '), dist: r.dist.toFixed(2), head: r.headSpike.toFixed(0) };
      }, [sc, run]);
      const ok = res.problems.length === 0; if (!ok) fails++;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${sc.name} [run ${run + 1}]  play@${res.firstPlay} end@${res.playEnd} dist ${res.dist} head ${res.head}°  ${ok ? '' : '→ ' + res.problems.join('; ')}`);
      if (!ok || process.env.VERBOSE) console.log('      clips: ' + res.clips);
      if (res.trace) console.log(res.trace);
      if (process.env.VERBOSE) console.log('      seq: ' + res.seq + (res.misses ? '  pounce misses: ' + res.misses : ''));
    }
  }
  // ── the model: eyes show when he faces the viewer and never through the back of his head ──
  if (!ONLY || 'eyes'.includes(ONLY) || ONLY === 'eyes') {
    const res = await page.evaluate(() => {
      const c = window.__cat; c.manual = true;
      c.brain.swap('life', (function* () { while (true) yield; })());
      c.glance = null; c.gazeOverride = null; c.nextGlance = 999; c.interest = 0; c.ptr.cx = -1; c.gaze.w = 0;
      c.X = 0; c.Z = 1.5; c.posture = 'STAND'; c.motor.play('idle_stand', 0);
      const bright = (yaw) => {
        c.yaw = yaw; for (let i = 0; i < 6; i++) c.update(1 / 30);
        const g = document.createElement('canvas'); g.width = c.canvas.width; g.height = c.canvas.height;
        const x = g.getContext('2d'); x.drawImage(c.canvas, 0, 0);
        const d = x.getImageData(0, 0, g.width, g.height).data; let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] + d[i + 1] > 180) n++;
        return n;
      };
      return { front: bright(0.3), back: bright(Math.PI), backL: bright(Math.PI - 0.5), backR: bright(Math.PI + 0.5) };
    });
    const ok = res.front > 0 && res.back === 0 && res.backL === 0 && res.backR === 0;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  eyes: lit facing the viewer, dark facing away  (eye pixels front ${res.front}, back ${res.back}/${res.backL}/${res.backR})`);
  }
  // ── the intro: out of sight behind a front post, walks out along the lane, looks at you (the sweep over screen sizes is scripts/cat-test/sizes.cjs) ──
  if (!ONLY || 'intro peek'.includes(ONLY)) {
    for (let run = 0; run < Math.min(RUNS, 4); run++) {
      const res = await page.evaluate(() => {
        const c = window.__cat, L = c.lane, T = c.T; c.manual = true; c.scripted = false; c.introPick = null;
        c.ptr.cx = -1; c.interest = 0; c.cool = 0; c.glance = null; c.gazeOverride = null; c.nextGlance = 999;
        c.brain.swap('life', c.brain.life(true));
        const post = c.peek && c.peek.lamp, r = { post: post ? post.row + (post.side < 0 ? '-left' : '-right') : 'none', hiddenStart: false, looked: -1, out: -1, pop: 0 };
        if (!post) return r;
        // at the start he is side-on to us and his nose is still inside the post's outline
        const inward = -post.side, s0 = L.toScreen(c.X, c.Z);
        r.hiddenStart = Math.abs(Math.sin(c.yaw)) > 0.95 && (s0.x + inward * 0.34 * s0.ppm - c.postEdgeX(post, 0.3)) * inward < 1;
        r.x0 = s0.x; r.xMax = 0;
        const bones = []; c.model.traverse(o => { if (o.isBone) bones.push(o); });
        const prev = bones.map(() => new T.Quaternion()), q = new T.Quaternion(), bq = new T.Quaternion();
        for (let f = 0; f < 16 * 30; f++) {
          c.update(1 / 30); const t = f / 30;
          if (r.looked < 0 && c.gazeOverride && c.gazeOverride.kind === 'viewer') r.looked = +t.toFixed(2);
          if (r.out < 0 && !c.peek) r.out = +t.toFixed(2);
          r.inLane = L.inside(c.X, c.Z, 0.4); r.xMax = Math.max(r.xMax, Math.abs(L.toScreen(c.X, c.Z).x - r.x0));
          c.body.getWorldQuaternion(bq); bq.invert();
          bones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (f) r.pop = Math.max(r.pop, 2 * Math.acos(Math.min(1, Math.abs(q.dot(prev[i])))) * 57.3); prev[i].copy(q); });
        }
        return r;
      });
      const problems = [];
      if (res.post === 'none' || !/^(mid|near)/.test(res.post)) problems.push('did not start behind a front post (' + res.post + ')');
      if (!res.hiddenStart) problems.push('not tucked side-on behind the post at the start');
      if (!(res.looked > 1.5 && res.looked < 6)) problems.push('never looked at the viewer as he came out (' + res.looked + ')');
      if (!(res.out > 0 && res.out < 12)) problems.push('still hiding after 12 s (' + res.out + ')');
      else if (!res.inLane) problems.push('ended outside the lane');
      if (res.xMax < 150) problems.push('hardly crossed the screen (' + res.xMax.toFixed(0) + ' px)');
      if (res.pop > 70) problems.push('pose popped ' + res.pop.toFixed(0) + '°/frame');
      if (problems.length) fails++;
      console.log(`${problems.length ? 'FAIL' : 'PASS'}  intro: out of sight behind a post, walks out along the lane, looks at you [run ${run + 1}]  ${res.post} looked@${res.looked} out@${res.out}  ${problems.length ? '→ ' + problems.join('; ') : ''}`);
    }
  }
  // ── the pre-scripted cat (the default): runs in from the side of the screen, sits beside the front post, watches a close cursor ──
  if (!ONLY || 'scripted'.includes(ONLY)) {
    for (let run = 0; run < Math.min(RUNS, 4); run++) {
      const res = await page.evaluate((run) => {
        const c = window.__cat, L = c.lane, T = c.T; c.manual = true; c.scripted = true;
        c.ptr.cx = -1; c.glance = null; c.gazeOverride = null; c.peek = null; c.seatPost = null;
        c.introPick = (pool) => pool[run % pool.length];
        c.brain.swap('life', c.brain.life(true));
        const post = c.seatPost, rect = c.hero.getBoundingClientRect(), st0 = L.toScreen(c.X, c.Z);
        const r = { post: post ? post.row + (post.side < 0 ? '-left' : '-right') : 'none', sat: -1, ran: 0, pop: 0, stood: 0, moves: [], gazeNear: 0, gazeFar: 1, aim: 180 };
        // he starts off the edge of the hero (which clips him) on the post's side, nose and all
        r.offscreen = st0.x + 0.36 * st0.ppm < 0 || st0.x - 0.36 * st0.ppm > L.W;
        r.sameSide = post && (st0.x < L.W / 2) === (post.side < 0);
        const bones = []; c.model.traverse(o => { if (o.isBone) bones.push(o); });
        const prev = bones.map(() => new T.Quaternion()), q = new T.Quaternion(), bq = new T.Quaternion();
        const head = c.model.getObjectByName('head'), hp = new T.Vector3(), hf = new T.Vector3(), tp = new T.Vector3();
        let px = null, py = null;
        for (let f = 0; f < 30 * 30; f++) {
          const t = f / 30;
          // cursor: away for 9 s, then a wiggle close in front of him for 7 s, then a wiggle far off
          let cur = null;
          if (t >= 9 && t < 16) { const s = L.toScreen(c.X + 0.5 * Math.sin(c.yaw), c.Z - 0.5 * Math.cos(c.yaw)); cur = [s.x + 0.15 * s.ppm * Math.sin(t * 6), s.y - (0.4 + 0.1 * Math.sin(t * 5)) * s.ppm]; }
          else if (t >= 16 && t < 22) { const s = L.toScreen(c.X > 0 ? -2.5 : 2.5, 4.5); cur = [s.x + 0.2 * s.ppm * Math.sin(t * 6), s.y]; }
          if (cur) { const sp = px == null ? 0 : Math.hypot(cur[0] - px, cur[1] - py) * 30; px = cur[0]; py = cur[1]; c.ptr.cx = rect.left + cur[0]; c.ptr.cy = rect.top + cur[1]; c.ptr.speed = Math.max(c.ptr.speed, sp * 0.6); }
          else { c.ptr.cx = -1; px = null; }
          const bx = c.X, bz = c.Z, byaw = c.yaw;
          c.update(1 / 30);
          if (c.motor.cur === 'loco' && c.motor.loco.v > r.ran) r.ran = c.motor.loco.v;
          // one fluid move: before he sits, he never stands still, never turns on the spot, never swings round sharply
          if (r.sat < 0 && t > 1.2) {
            if (Math.hypot(c.X - bx, c.Z - bz) < 0.0005 && !/sit/.test(c.motor.cur)) r.still = (r.still || 0) + 1;
            if (/^turn_/.test(c.motor.cur)) r.turned = true;
            r.yawRate = Math.max(r.yawRate || 0, Math.abs(((c.yaw - byaw) * 57.3 + 540) % 360 - 180) * 30);
          }
          if (r.sat < 0 && c.posture === 'SIT') r.sat = +t.toFixed(2);
          if (r.sat >= 0 && c.posture !== 'SIT') r.stood++;
          if (r.sat >= 0 && !/^sit/.test(c.motor.cur) && c.motor.cur !== 'stand_to_sit') r.moves.push(c.motor.cur);
          if (t > 14 && t < 16) {      // looking at the close cursor: gaze weight, and the head's nose pointing at it
            r.gazeNear = Math.max(r.gazeNear, c.gaze.w);
            head.getWorldPosition(hp); c.body.worldToLocal(hp);
            hf.set(0, 1, 0).applyQuaternion(head.getWorldQuaternion(q)).applyQuaternion(c.body.getWorldQuaternion(bq).invert());
            const toy = c.toy; if (toy) { c.toLocal(toy.X, toy.kind === 'ground' ? 0.03 : toy.h, toy.kind === 'ground' ? toy.Z : toy.Z - 0.25, tp); tp.sub(hp);
              const a1 = Math.atan2(hf.x, hf.z), a2 = Math.atan2(tp.x, tp.z); r.aim = Math.min(r.aim, Math.abs(((a1 - a2) * 57.3 + 540) % 360 - 180)); }
          }
          if (t > 21 && t < 22) r.gazeFar = Math.min(r.gazeFar, c.watch.w);   // watching the cursor (he may still glance about)
          c.body.getWorldQuaternion(bq); bq.invert();
          bones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (f) r.pop = Math.max(r.pop, 2 * Math.acos(Math.min(1, Math.abs(q.dot(prev[i])))) * 57.3); prev[i].copy(q); });
        }
        r.inLane = L.inside(c.X, c.Z, 0.0); r.peek = !!c.peek; r.moves = [...new Set(r.moves)].join(',');
        if (post) { const s = L.toScreen(c.X, c.Z); let ex = post.side > 0 ? Infinity : -Infinity; for (const [x] of c.postEdge(post)) ex = post.side > 0 ? Math.min(ex, x) : Math.max(ex, x); r.gapM = ((s.x - ex) * -post.side) / s.ppm; }
        c.introPick = null;
        return r;
      }, run);
      const problems = [];
      if (!/^near/.test(res.post)) problems.push('did not head for a front post (' + res.post + ')');
      if (!res.offscreen || !res.sameSide) problems.push('did not start off the edge of the screen on the post\'s side');
      if (!(res.ran > 0.45)) problems.push('walked out instead of running (' + res.ran.toFixed(2) + ' m/s)');
      if (!(res.sat > 2 && res.sat < 9)) problems.push('not sitting by 9 s (' + res.sat + ')');
      if (!(res.gapM > 0.15 && res.gapM < 0.9)) problems.push('not sitting beside the post (' + (res.gapM || 0).toFixed(2) + ' m off its edge)');
      if (res.stood) problems.push('got up again (' + res.stood + ' frames)');
      if ((res.still || 0) > 2) problems.push('stood still before sitting (' + res.still + ' frames)');
      if (res.turned) problems.push('turned on the spot before sitting');
      if ((res.yawRate || 0) > 160) problems.push('swung round at ' + res.yawRate.toFixed(0) + '°/s');
      if (res.moves) problems.push('did more than sit: ' + res.moves);
      if (res.gazeNear < 0.6 || res.aim > 30) problems.push(`didn't look at a close cursor (gaze ${res.gazeNear.toFixed(2)}, head ${res.aim.toFixed(0)}° off)`);
      if (res.gazeFar > 0.2) problems.push('kept looking at a far cursor (' + res.gazeFar.toFixed(2) + ')');
      if (res.peek || !res.inLane) problems.push('not in the lane, clear of the post');
      if (res.pop > 70) problems.push('pose popped ' + res.pop.toFixed(0) + '°/frame');
      if (problems.length) fails++;
      console.log(`${problems.length ? 'FAIL' : 'PASS'}  scripted: runs in from the side of the screen, sits beside the front post, looks at a close cursor [run ${run + 1}]  ${res.post} sat@${res.sat} ${(res.gapM || 0).toFixed(2)} m off the post, head ${res.aim.toFixed(0)}° off the cursor  ${problems.length ? '→ ' + problems.join('; ') : ''}`);
    }
  }
  // ── the scripted run-in: seen side-on while he runs across the screen, and eyes on where he's going ──
  if (!ONLY || 'run-in side-on'.includes(ONLY)) {
    for (let run = 0; run < 2; run++) {
      const res = await page.evaluate((run) => {
        const c = window.__cat, L = c.lane; c.manual = true; c.scripted = true;
        c.ptr.cx = -1; c.glance = null; c.gazeOverride = null; c.peek = null; c.seatPost = null;
        c.introPick = (pool) => pool[run % pool.length];
        c.brain.swap('life', c.brain.life(true));
        const rect = c.hero.getBoundingClientRect(), r = { phi: 0, gaze: 0, across: 0 };
        for (let f = 0; f < 30 * 9 && c.posture !== 'SIT'; f++) {
          // a cursor wiggling just ahead of him the whole way in
          const s = L.toScreen(c.X + 0.5 * Math.sin(c.yaw), c.Z - 0.5 * Math.cos(c.yaw));
          c.ptr.cx = rect.left + s.x + 20 * Math.sin(f / 3); c.ptr.cy = rect.top + s.y - 0.3 * s.ppm; c.ptr.speed = 400;
          c.update(1 / 30);
          if (c.posture === 'WALK' && Math.abs(Math.sin(c.yaw)) > 0.97 && f > 15) { r.across++; r.phi = Math.max(r.phi, Math.abs(c.camPhi) * 57.3); }
          if (c.posture === 'WALK' && c.motor.loco.v > 0.4) r.gaze = Math.max(r.gaze, c.watch.w);   // tracking the cursor (a glance at you is fine)
          if (c.posture === 'WALK' && c.motor.loco.v > 0.4) r.tailUp = Math.max(r.tailUp || 0, c.tailWalk || 0);
        }
        c.ptr.cx = -1; c.introPick = null;
        return r;
      }, run);
      const problems = [];
      if (res.across < 20) problems.push('hardly ran across the screen (' + res.across + ' frames)');
      if (res.phi > 6) problems.push(`seen ${res.phi.toFixed(0)}° off side-on while running straight across (looks like running at an angle)`);
      if (res.gaze > 0.15) problems.push(`head followed the cursor mid-run (gaze ${res.gaze.toFixed(2)})`);
      if (!(res.tailUp > 0.6)) problems.push(`tail not up as he trots in (${(res.tailUp || 0).toFixed(2)})`);
      if (problems.length) fails++;
      console.log(`${problems.length ? 'FAIL' : 'PASS'}  run-in side-on: profile while crossing, eyes ahead [run ${run + 1}]  camera ${res.phi.toFixed(1)}°, gaze ${res.gaze.toFixed(2)}  ${problems.length ? '→ ' + problems.join('; ') : ''}`);
    }
  }
  // ── the scripted cat, seated with nobody about: his tail keeps moving and he looks around a little ──
  if (!ONLY || 'seated life'.includes(ONLY)) {
    const res = await page.evaluate(() => {
      const c = window.__cat, T = c.T; c.manual = true; c.scripted = true;
      c.ptr.cx = -1; c.glance = null; c.gazeOverride = null; c.peek = null; c.seatPost = null; c.introPick = null;
      c.brain.swap('life', c.brain.life(true));
      for (let f = 0; f < 30 * 12 && c.posture !== 'SIT'; f++) c.update(1 / 30);
      for (let f = 0; f < 30 * 2; f++) c.update(1 / 30);
      c.nextGlance = 2;   // other scenarios park it
      const tip = c.tail[c.tail.length - 1], q = new T.Quaternion(), q0 = new T.Quaternion(), bq = new T.Quaternion();
      const r = { tail: 0, glances: 0, glanceW: 0, pop: 0, stood: 0 };
      const bones = []; c.model.traverse(o => { if (o.isBone) bones.push(o); });
      const prev = bones.map(() => new T.Quaternion());
      let was = false;
      for (let f = 0; f < 30 * 20; f++) {
        c.update(1 / 30);
        c.body.getWorldQuaternion(bq); bq.invert();
        tip.getWorldQuaternion(q); q.premultiply(bq);
        if (f === 0) q0.copy(q); else r.tail = Math.max(r.tail, 2 * Math.acos(Math.min(1, Math.abs(q.dot(q0)))) * 57.3);
        const on = !!(c.glance && c.glance.until > c.time); if (on && !was) r.glances++; was = on;
        r.glanceW = Math.max(r.glanceW, on ? c.gaze.w : 0);
        if (c.posture !== 'SIT') r.stood++;
        bones.forEach((b, i) => { b.getWorldQuaternion(q); q.premultiply(bq); if (f) r.pop = Math.max(r.pop, 2 * Math.acos(Math.min(1, Math.abs(q.dot(prev[i])))) * 57.3); prev[i].copy(q); });
      }
      return r;
    });
    const problems = [];
    if (res.tail < 8) problems.push(`tail barely moved (${res.tail.toFixed(1)}°)`);
    if (res.glances < 2 || res.glanceW < 0.4) problems.push(`hardly looked around (${res.glances} glances in 20 s)`);
    if (res.glances > 7) problems.push(`too restless (${res.glances} glances in 20 s)`);
    if (res.stood) problems.push('got up');
    if (res.pop > 70) problems.push('pose popped ' + res.pop.toFixed(0) + '°/frame');
    if (problems.length) fails++;
    console.log(`${problems.length ? 'FAIL' : 'PASS'}  seated life: tail moves, looks around a little  tail ${res.tail.toFixed(0)}°, ${res.glances} glances  ${problems.length ? '→ ' + problems.join('; ') : ''}`);
  }
  // ── perspective: on screen he moves the way his body points (no crab walk at the lane's sides) ──
  if (!ONLY || 'crab walk'.includes(ONLY)) {
    const res = await page.evaluate(() => {
      const c = window.__cat, L = c.lane, T = c.T; c.manual = true;
      c.brain.swap('life', (function* () { while (true) yield; })());
      c.glance = null; c.gazeOverride = null; c.nextGlance = 999; c.interest = 0; c.ptr.cx = -1; c.peek = null; c.scripted = false;
      let worst = 0, at = '';
      for (const [X, Z] of [[-2.2, 1.2], [2.2, 1.5], [-1.2, 2.2], [1.8, 3.5]]) for (const yd of [0, 45, 135, 180, 225, 315]) {
        c.X = X; c.Z = Z; c.yaw = yd * Math.PI / 180; c.outside = true; c.motor.loco.v = 0.27; c.motor.play('loco', 0); c.posture = 'WALK';
        for (let i = 0; i < 30; i++) { c.motor.loco.v = 0.27; c.update(1 / 30); }
        const s0 = L.toScreen(c.X, c.Z);
        const o = new T.Vector3().project(c.camera), f = new T.Vector3(Math.sin(c.yaw) * 0.3, 0, Math.cos(c.yaw) * 0.3).project(c.camera);
        for (let i = 0; i < 6; i++) { c.motor.loco.v = 0.27; c.update(1 / 30); }
        const s1 = L.toScreen(c.X, c.Z);
        const d = Math.abs(((Math.atan2(s1.y - s0.y, s1.x - s0.x) - Math.atan2(-(f.y - o.y) * c.ch, (f.x - o.x) * c.cw)) * 57.3 + 540) % 360 - 180);
        if (d > worst) { worst = d; at = `X${X} Z${Z} heading ${yd}°`; }
      }
      c.outside = false;
      return { worst, at };
    });
    const ok = res.worst < 12;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  crab walk: moves on screen the way he faces (worst ${res.worst.toFixed(1)}° at ${res.at})`);
  }
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
  await close();
  process.exitCode = fails ? 1 : 0;
})();
