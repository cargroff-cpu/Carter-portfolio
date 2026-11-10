// bat-mouse.js — an easter egg on the Scaffold page (Carter Groff Design.html).
//
// Bat, the black cat in the hero (scaffold-cat.js), has lost his toy mouse. It is hidden
// behind Carter's portrait in the "Why" section, with only its back end and string tail
// poking out. Click it to pick it up, carry it back up to Bat and click on him to give it
// to him. He looks down at it, looks up at you and slow-blinks, and an old-school video
// game dialog box opens: he says thanks and that he'll tell his owner to take 5% off the
// finder's final price.
//
// How the discount reaches Carter:
//   - Finding it gives a code (BAT-XXXXXX), kept in this browser (localStorage), and emails
//     Carter at once (POST /api/design-brief, action "bat-mouse"; rate limited).
//   - Any brief sent later from this browser carries the code (design.jsx reads it), and the
//     brief email, the Backroom job history and the client's confirmation all show it.
//   The code is made in the browser, so it is honour-system: the find email is the record.
//
// Only where Bat is (desktop, motion allowed, the 3D cat loaded): the toy waits for
// scaffold-cat.js to announce itself. Found once, it stays found in that browser.
// ?batreset clears it, for testing.

const KEY = 'scaffold-bat-mouse';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: the find email still went */ } };
if (/[?&]batreset\b/.test(location.search)) { try { localStorage.removeItem(KEY); } catch (e) {} }

// the toy: a plain grey mouse, side on, facing left, with a string tail (40 x 32)
const TOY = `<svg viewBox="0 0 40 32" width="40" height="32" aria-hidden="true" focusable="false">
  <path d="M31 22c3 1 5 3 5 6" fill="none" stroke="#a89a85" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M3 22c0-6 7-11 15-11 8 0 14 4 14 9 0 3-3 4-6 4H6c-2 0-3-1-3-2z" fill="#857b72"/>
  <circle cx="13" cy="12" r="3.5" fill="#857b72"/>
  <circle cx="7.6" cy="17.6" r="1" fill="#1a1410"/>
</svg>`;

const CSS = `
.bm-toy { position: absolute; z-index: 3; width: 40px; height: 32px; padding: 0; border: 0; background: none; cursor: grab;
  opacity: 0; transition: opacity 1.2s ease 0.6s, clip-path .35s ease; clip-path: inset(0 0 0 18px); -webkit-clip-path: inset(0 0 0 18px); }
.bm-toy.bm-on { opacity: .92; }
.bm-toy svg { display: block; overflow: visible; }
.bm-toy:hover, .bm-toy:focus-visible { clip-path: inset(0 0 0 12px); -webkit-clip-path: inset(0 0 0 12px); }
.bm-toy:focus-visible { outline: 1px dashed rgba(233,223,198,.6); outline-offset: 3px; }
.bm-held { position: fixed; left: 0; top: 0; z-index: 2147483000; pointer-events: none; width: 40px; height: 32px; transform-origin: 20px 4px; }
.bm-held svg { display: block; overflow: visible; filter: drop-shadow(0 6px 6px rgba(0,0,0,.45)); }
.bm-hint { position: fixed; z-index: 2147483001; pointer-events: none; font: italic 500 17px/1.3 "Cormorant Garamond", Georgia, serif; color: #f1e6cc;
  text-shadow: 0 1px 8px #000, 0 0 2px #000; white-space: nowrap; opacity: 0; transition: opacity .5s ease; }
.bm-hint.bm-on { opacity: 1; }
.bm-ground svg { display: block; overflow: visible; filter: drop-shadow(0 2px 2px rgba(0,0,0,.5)); }

.bm-dlg { position: fixed; left: 50%; bottom: 28px; z-index: 2147483002; width: min(760px, calc(100vw - 32px)); transform: translateX(-50%);
  padding: 24px 26px 22px; box-sizing: border-box;
  background: #0d0b16; color: #f4ecd8; font: 13px/2 "Press Start 2P", ui-monospace, Menlo, Consolas, monospace; letter-spacing: .02em;
  border: 4px solid #f4ecd8; box-shadow: 0 18px 50px rgba(0,0,0,.6);
  animation: bm-pop .32s steps(4, end) both; }
.bm-dlg:focus { outline: none; }
.bm-dlg.bm-top { bottom: auto; top: 104px; }
.bm-dlg.bm-bye { animation: bm-out .2s steps(3, end) both; }
@keyframes bm-pop { from { transform: translateX(-50%) scaleY(.05); } to { transform: translateX(-50%) scaleY(1); } }
@keyframes bm-out { to { transform: translateX(-50%) scaleY(.05); opacity: 0; } }
.bm-name { position: absolute; left: 18px; top: -19px; padding: 6px 12px 5px; background: #0d0b16; border: 4px solid #f4ecd8; font-size: 11px; line-height: 1; color: #e8c46a; }
.bm-text { min-height: 4em; margin: 0; padding-top: 2px; white-space: pre-wrap; word-break: break-word; }
.bm-text b { color: #e8c46a; font-weight: inherit; }
.bm-next { position: absolute; right: 16px; bottom: 10px; color: #e8c46a; animation: bm-blink .8s steps(1, end) infinite; }
@keyframes bm-blink { 50% { opacity: 0; } }
.bm-menu { display: flex; flex-wrap: wrap; gap: 6px 28px; margin: 10px 0 0; padding: 0; list-style: none; }
.bm-menu button { all: unset; cursor: pointer; padding: 2px 0 2px 22px; position: relative; color: #f4ecd8; font: inherit; }
.bm-menu button:hover, .bm-menu button:focus-visible { color: #e8c46a; }
.bm-menu button:hover::before, .bm-menu button:focus-visible::before { content: '\\25B6'; position: absolute; left: 0; }
.bm-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .bm-dlg { font-size: 11px; } }
`;

let toy = null, held = null, hint = null, carrying = false, last = null;

function ready() {
  return new Promise((res) => {
    if (window.ScaffoldCat) return res(window.ScaffoldCat);
    window.addEventListener('scaffoldcat:ready', () => res(window.ScaffoldCat), { once: true });
  });
}

function makeCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return 'BAT-' + [...b].map((n) => A[n % A.length]).join('');
}

function loadFont() {
  if (document.getElementById('bm-font')) return;
  const l = document.createElement('link');
  l.id = 'bm-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  document.head.appendChild(l);
}

// ── hiding: behind the bottom-right corner of the portrait, tail and back end showing ──
function hide() {
  const img = document.querySelector('.dwhyhead .dportrait');
  if (!img) return;
  if (!toy) {
    toy = document.createElement('button');
    toy.type = 'button'; toy.className = 'bm-toy';
    toy.setAttribute('aria-label', 'A toy mouse, half hidden behind the photo');
    toy.innerHTML = TOY;
    toy.addEventListener('click', (e) => pickUp(e));
    document.body.appendChild(toy);
  }
  const r = img.getBoundingClientRect(), shown = !!img.closest('.dwhyhead.shown') && r.width > 0;
  toy.style.left = (r.right + scrollX - 18) + 'px';
  toy.style.top = (r.bottom + scrollY - 30) + 'px';
  toy.classList.toggle('bm-on', shown);
}

function watchSpot() {
  hide();
  const again = () => { if (toy && !carrying && toy.isConnected) hide(); };
  addEventListener('resize', again, { passive: true });
  new ResizeObserver(again).observe(document.body);
  // the portrait fades in when it scrolls into view; React may also re-render the section
  new MutationObserver(again).observe(document.getElementById('why') || document.body, { attributes: true, subtree: true, childList: true, attributeFilter: ['class'] });
}

// ── carrying ──
function pickUp(e) {
  if (carrying) return;
  carrying = true; loadFont();
  toy.remove(); toy = null;
  held = document.createElement('div');
  held.className = 'bm-held'; held.innerHTML = TOY;
  document.body.appendChild(held);
  const keyboard = e && e.detail === 0;   // Enter / Space: no pointer to follow, so it goes to him by itself
  const x = e && e.clientX ? e.clientX : innerWidth / 2, y = e && e.clientY ? e.clientY : innerHeight / 2;
  last = { x, y, vx: 0, a: 0, flip: 1, t: performance.now() };
  move(x, y);
  window.ScaffoldCat.lure(true);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown, true);
  addEventListener('keydown', onKey);
  say(keyboard ? 'Bat lost this. Taking it to him…' : 'Someone in the lamplight lost this.', x, y);
  if (keyboard) autoDeliver();
}

function onMove(e) { move(e.clientX, e.clientY); }
function move(x, y) {
  const now = performance.now(), dt = Math.max(1, now - last.t) / 1000;
  last.vx = last.vx * 0.8 + ((x - last.x) / dt) * 0.2;
  if (Math.abs(last.vx) > 60) last.flip = last.vx > 0 ? -1 : 1;   // it faces the way it's carried
  last.a = Math.max(-28, Math.min(28, -last.vx * 0.03));          // swings on its string
  last.x = x; last.y = y; last.t = now;
  held.style.transform = `translate3d(${x - 20}px, ${y - 2}px, 0) rotate(${last.a.toFixed(1)}deg) scaleX(${last.flip})`;
  if (hint) { hint.style.left = (x + 26) + 'px'; hint.style.top = (y + 22) + 'px'; }
}

function say(text, x, y) {
  if (hint) hint.remove();
  const h = hint = document.createElement('div');
  h.className = 'bm-hint'; h.textContent = text; h.setAttribute('role', 'status');
  h.style.left = (x + 26) + 'px'; h.style.top = (y + 22) + 'px';
  document.body.appendChild(h);
  requestAnimationFrame(() => h.classList.add('bm-on'));
  setTimeout(() => { h.classList.remove('bm-on'); setTimeout(() => { h.remove(); if (hint === h) hint = null; }, 600); }, 3200);
}

function onKey(e) { if (e.key === 'Escape' && carrying) putBack(); }
function onDown(e) {
  if (!carrying || e.button !== 0) return;
  if (window.ScaffoldCat.near(e.clientX, e.clientY)) {
    e.preventDefault(); e.stopPropagation();
    addEventListener('click', (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true });   // the click that follows isn't for what's under him
    deliver();
  }
}
function stopCarrying() {
  carrying = false;
  removeEventListener('pointermove', onMove);
  removeEventListener('pointerdown', onDown, true);
  removeEventListener('keydown', onKey);
  window.ScaffoldCat.lure(false);
}
function putBack() {
  stopCarrying();
  held.remove(); held = null;
  hide();
}

async function autoDeliver() {
  scrollTo({ top: 0, behavior: 'smooth' });
  for (let i = 0; i < 80; i++) {   // up to 8 s: the hero in view, and him sitting
    await new Promise((r) => setTimeout(r, 100));
    const s = window.ScaffoldCat.spot();
    if (scrollY < 4 && s.y > 0 && s.y < innerHeight && window.ScaffoldCat.near(s.x, s.y - 0.3 * s.ppm)) break;
  }
  const s = window.ScaffoldCat.spot();
  move(innerWidth / 2, innerHeight - 60);
  deliver();
}

// ── giving it to him ──
function deliver() {
  stopCarrying();
  const s = window.ScaffoldCat.spot(), k = (s.ppm * 0.16) / 40;
  const from = held.style.transform, x0 = last.x, y0 = last.y;
  const mx = (x0 + s.x) / 2, my = Math.min(y0, s.y) - 70;
  const anim = held.animate([
    { transform: from },
    { transform: `translate3d(${mx - 20}px, ${my - 2}px, 0) rotate(${last.flip * -20}deg) scaleX(${last.flip})`, offset: 0.45 },
    { transform: `translate3d(${s.x - 20}px, ${s.y - 16}px, 0) rotate(0deg) scale(${k}, ${k})` },
  ], { duration: 520, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'forwards' });
  anim.onfinish = () => {
    held.remove(); held = null;
    const g = document.createElement('div');
    g.className = 'bm-ground'; g.innerHTML = TOY; g.setAttribute('aria-hidden', 'true');
    window.ScaffoldCat.give(g);
    found();
  };
}

function found() {
  const prev = read(), code = (prev && prev.code) || makeCode();
  write({ code, at: new Date().toISOString() });
  // tell Carter (best effort; the brief carries the code too)
  try {
    fetch('/api/design-brief', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ action: 'bat-mouse', code }),
    }).catch(() => {});
  } catch (e) { /* offline: fine */ }
  // let him look at it and blink at you first
  setTimeout(() => dialog(code), 2100);
}

// ── the dialog box ──
function dialog(code) {
  const pages = [
    'My mouse! Thank you, friend.',
    `I'll tell my owner to take <b>5% off your final price</b>.`,
    `Your code is <b>${code}</b>. It comes with any brief you send from this browser.`,
  ];
  const box = document.createElement('div');
  box.className = 'bm-dlg'; box.tabIndex = -1;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Bat says');
  box.innerHTML = `<span class="bm-name">BAT</span>
    <div><p class="bm-text" aria-hidden="true"></p><p class="bm-sr" aria-live="polite"></p><ul class="bm-menu" hidden></ul></div>
    <span class="bm-next" aria-hidden="true">▼</span>`;
  document.body.appendChild(box);
  // classic spot is the bottom of the screen, unless that would cover him
  try {
    const s = window.ScaffoldCat.spot(), r = box.getBoundingClientRect();
    if (s.x > r.left - 0.4 * s.ppm && s.x < r.right + 0.4 * s.ppm && s.y > r.top - 0.9 * s.ppm) box.classList.add('bm-top');
  } catch (e) { /* no cat: stays put */ }
  const text = box.querySelector('.bm-text'), sr = box.querySelector('.bm-sr'), menu = box.querySelector('.bm-menu'), nxt = box.querySelector('.bm-next');
  let page = -1, timer = 0, typing = false, full = '';
  const plain = (h) => h.replace(/<[^>]+>/g, '');

  // types the page out a character at a time; markup (<b>) goes in whole
  function show(i) {
    page = i; full = pages[i]; typing = true; nxt.hidden = true;
    sr.textContent = plain(full).replace(/\n/g, ' ');
    const parts = full.split(/(<[^>]+>)/);
    let pi = 0, ci = 0, out = '';
    clearInterval(timer);
    timer = setInterval(() => {
      while (pi < parts.length && (parts[pi].startsWith('<') || ci >= parts[pi].length)) { if (parts[pi].startsWith('<')) out += parts[pi]; pi++; ci = 0; }
      if (pi >= parts.length) return done();
      out += parts[pi][ci++].replace('&', '&amp;');
      text.innerHTML = out;
    }, 34);
  }
  function done() {
    clearInterval(timer); typing = false; text.innerHTML = full;
    if (page < pages.length - 1) { nxt.hidden = false; return; }
    nxt.hidden = true; menu.hidden = false;
    menu.innerHTML = '<li><button type="button" data-go="brief">Write a brief</button></li><li><button type="button" data-go="close">Keep exploring</button></li>';
    menu.querySelector('button').focus();
  }
  function advance() {
    if (typing) return done();
    if (page < pages.length - 1) show(page + 1);
  }
  function close(go) {
    clearInterval(timer);
    removeEventListener('keydown', key, true);
    box.classList.add('bm-bye');
    setTimeout(() => box.remove(), 220);
    if (go === 'brief') { const b = document.getElementById('brief'); if (b) b.scrollIntoView({ behavior: 'smooth' }); }
  }
  function key(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if ((e.key === 'Enter' || e.key === ' ') && menu.hidden) { e.preventDefault(); advance(); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') && !menu.hidden) {
      const bs = [...menu.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
      bs[(i + 1) % bs.length].focus(); e.preventDefault();
    }
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-go]');
    if (b) return close(b.dataset.go);
    if (menu.hidden) advance();
  });
  addEventListener('keydown', key, true);
  box.focus({ preventScroll: true });
  show(0);
}

(async function boot() {
  if (read()) return;                                  // already found in this browser
  const cat = await ready();
  if (!cat) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  watchSpot();
})();
