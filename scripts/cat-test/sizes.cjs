// Screen-size sweep for the hero cat's entrance. For each desktop window size and each front
// post (near/mid, left/right) it plays the intro in the real page and checks:
//   - with pixels (the page with him vs the page without him): nothing of him shows at the
//     start, and he is plainly there once he has walked out
//   - how much of him is visible over time, counted through the page's live clip-path: he is
//     revealed a little at a time, not popped in
//   - he really travels across the screen while he walks out (not on the spot)
//   - he stays inside the hero, and ends up in the lane, clear of the post
//   node scripts/cat-test/sizes.cjs         (SIZES=1440x900,1920x1080 to pick sizes; ONLY=mid to pick rows)
const { open } = require('./harness.cjs');
const SIZES = (process.env.SIZES || '900x640,1024x768,1280x720,1440x900,1920x1080,2560x1440').split(',').map((s) => s.split('x').map(Number));
const ROWS = (process.env.ONLY || 'near').split(',');   // the scripted cat (the default) comes out from behind a front (near) post

(async () => {
  let fails = 0;
  for (const [W, H] of SIZES) {
    const { page, close } = await open({ viewport: { width: W, height: H } });
    for (const row of ROWS) for (const side of ['left', 'right']) {
      await page.evaluate(([row, side]) => {
        const c = window.__cat; c.manual = true; c.ptr.cx = -1; c.interest = 0; c.cool = 99; c.glance = null; c.gazeOverride = null; c.nextGlance = 999;
        document.getAnimations().forEach((a) => { try { if (a instanceof CSSTransition) a.finish(); else a.pause(); } catch (e) {} });   // the cat's fade-in completes; the fog and flicker hold still
        c.introPick = (pool) => pool.find((l) => l.row === row && (l.side < 0) === (side === 'left'));
        c.brain.swap('life', c.brain.life(true));
        c.update(1 / 30);
      }, [row, side]);
      // pixels of him in the real page: with him vs without him
      const pixelDiff = async () => {
        const box = await page.evaluate(() => { const r = window.__cat.canvas.getBoundingClientRect(), x = Math.max(0, r.left), y = Math.max(0, r.top);
          return { x, y, width: Math.min(innerWidth, r.right) - x, height: Math.min(innerHeight, r.bottom) - y }; });
        if (box.width < 4 || box.height < 4) return 0;
        const withCat = (await page.screenshot({ clip: box })).toString('base64');
        await page.evaluate(() => { window.__cat.canvas.style.visibility = 'hidden'; });
        const without = (await page.screenshot({ clip: box })).toString('base64');
        await page.evaluate(() => { window.__cat.canvas.style.visibility = ''; });
        return page.evaluate(async ([a, b]) => {
          const load = async (s) => { const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob()); const cv = new OffscreenCanvas(bm.width, bm.height), g = cv.getContext('2d'); g.drawImage(bm, 0, 0); return g.getImageData(0, 0, bm.width, bm.height).data; };
          const A = await load(a), B = await load(b); let n = 0;
          for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 45) n++;
          return n;
        }, [withCat, without]);
      };
      // run n frames, then count his pixels that survive the page's current clip-path
      const stepAndCount = (n) => page.evaluate((n) => {
        const c = window.__cat; for (let i = 0; i < n; i++) c.update(1 / 30);
        const cv = c.canvas, s = c.lane.toScreen(c.X, c.Z), hero = c.hero.getBoundingClientRect(), r = cv.getBoundingClientRect();
        const g = document.createElement('canvas'); g.width = cv.width; g.height = cv.height; const x = g.getContext('2d'); x.drawImage(cv, 0, 0);
        const d = x.getImageData(0, 0, g.width, g.height).data, k = g.width / c.cw;
        let poly = null; const m = /polygon\((.*)\)/.exec(cv.style.clipPath || '');
        if (m) poly = m[1].split(',').map((p) => p.trim().split(/\s+/).map((v) => parseFloat(v) * k));
        const inside = (px, py) => { let o = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) o = !o; } return o; };
        let n2 = 0; for (let py = 0; py < g.height; py += 2) for (let px = 0; px < g.width; px += 2) if (d[(py * g.width + px) * 4 + 3] > 40 && (!poly || inside(px, py))) n2++;
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
        return { n: n2 * 4 / (k * k), t: c.time, x: s.x, y: s.y, ppm: s.ppm, vis: c.vis, inHero: cx > hero.left - 2 && cx < hero.right + 2 && cy > hero.top - 2 && cy < hero.bottom + 2 };
      }, n);
      const problems = [];
      const first = await pixelDiff();
      if (first > 40) problems.push(`${first} px of him showing at the start, before he moves`);
      const s0 = await stepAndCount(0), t0 = s0.t, at = [];
      let leftHero = -1;
      for (let i = 0; i < 70; i++) { const st = await stepAndCount(3); at.push(st); if (!st.inHero && leftHero < 0) leftHero = st.t - t0; }   // a sample every tenth of a second
      if (leftHero >= 0) problems.push('left the hero at ' + leftHero.toFixed(1) + ' s');
      const area = at.map((a) => a.n), full = Math.max(...area), vis0 = area.findIndex((n) => n > 150);
      if (vis0 < 0) problems.push('never came into view');
      else {
        // a pop is a big share of him appearing within a frame or two; a stepped plinth uncovers him over about a second
        let worst = 0, worstAt = 0;
        for (let i = 1; i < area.length; i++) if (area[i - 1] < 0.9 * full && area[i] - area[i - 1] > worst) { worst = area[i] - area[i - 1]; worstAt = at[i].t - t0; }
        if (worst > 0.3 * full) problems.push(`popped in: ${(100 * worst / full).toFixed(0)}% of him appeared within a tenth of a second at ${worstAt.toFixed(1)} s`);
        const a = at[vis0], b = at[Math.min(at.length - 1, vis0 + 30)], len = 0.77 * a.ppm * a.vis;   // 3 s of walking after he first shows, in body lengths
        const bl = Math.hypot(b.x - a.x, b.y - a.y) / len / ((b.t - a.t) / 3);
        if (bl < 0.7) problems.push(`on the spot: only ${bl.toFixed(2)} body lengths across the screen in 3 s`);
        // and the page really does show him once he is out (not just in my count)
        await stepAndCount(30);
        const out = await pixelDiff(); if (out < 150) problems.push(`he is not visible in the page when out (${out} px)`);
      }
      const end = await page.evaluate(() => { const c = window.__cat; return { peek: !!c.peek, inside: c.lane.inside(c.X, c.Z, 0.0) }; });
      if (end.peek) problems.push('still hiding after 9 s'); if (!end.inside) problems.push('ended outside the lane');
      if (problems.length) fails++;
      console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${W}x${H} ${row}-${side}  start ${first}px, shows at ${vis0 < 0 ? '-' : (at[vis0].t - t0).toFixed(1) + 's'}${problems.length ? '  → ' + problems.join('; ') : ''}`);
    }
    await close();
  }
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
  process.exitCode = fails ? 1 : 0;
})();
