// bat-mouse.js — an easter egg on the Scaffold page (Carter Groff Design.html).
//
// Bat, the black cat in the hero (scaffold-cat.js), has lost his toy mouse. It sits, small and
// dim, on the rule under the last of the "Short answers" questions. Click it and it goes into
// your inventory (a little slot under the nav) with a note: "I know someone who might like
// this." Click Bat while you have it (he has to be sitting) and you give it back: he looks at
// you, his ears flick, and an old-school video game dialog box opens: he thanks you and says
// he'll have his owner take 5% off your final price.
//
// How the discount reaches Carter:
//   - Giving it back is remembered in this browser (localStorage) and emails Carter at once
//     (POST /api/design-brief, action "bat-mouse"; rate limited).
//   - Any brief sent later from this browser says so (design.jsx reads it): "Bat's favour,
//     5% off" in the brief email, the client's confirmation and the job history.
//   Honour system: the email is the record.
//
// Only where Bat is (screens 900px and wider, reduced motion off: the same rule as
// scaffold-cat.js). It doesn't wait for the 3D model to load, though giving it back needs him.
// A mouse in your inventory stays there across visits until you give it to him. Once given,
// it is back in its spot on the next visit; giving it again just brings his dialog back (Carter
// is emailed only the first time). ?batreset forgets all of it, for testing.

const KEY = 'scaffold-bat-mouse';          // given back to Bat (the favour); design.jsx reads it
const HELD = 'scaffold-bat-mouse-held';    // in your inventory
const get = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const put = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: fine for this visit */ } };
if (/[?&]batreset\b/.test(location.search)) { put(KEY, null); put(HELD, null); }

// the toy: a plain grey mouse, side on, facing left, with a string tail (40 x 32)
const TOY = `<svg viewBox="0 0 40 32" width="40" height="32" aria-hidden="true" focusable="false">
  <path d="M31 22c3 1 5 3 5 6" fill="none" stroke="#a89a85" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M3 22c0-6 7-11 15-11 8 0 14 4 14 9 0 3-3 4-6 4H6c-2 0-3-1-3-2z" fill="#857b72"/>
  <circle cx="13" cy="12" r="3.5" fill="#857b72"/>
  <circle cx="7.6" cy="17.6" r="1" fill="#1a1410"/>
</svg>`;

const PIX = '"Press Start 2P", ui-monospace, Menlo, Consolas, monospace';
const CSS = `
.bm-toy { position: absolute; z-index: 3; width: 26px; height: 21px; padding: 0; border: 0; background: none; cursor: pointer;
  opacity: 0; transition: opacity 1.2s ease .6s, transform .25s ease; }
.bm-toy.bm-on { opacity: .62; }
.bm-toy:hover { opacity: .9; transform: translateY(-1px); }
.bm-toy svg, .bm-slot svg, .bm-fly svg { display: block; width: 100%; height: 100%; overflow: visible; }
.bm-toy:focus-visible { outline: 1px dashed rgba(233,223,198,.6); outline-offset: 3px; }
@media (max-width: 899px) { .bm-toy, .bm-inv { display: none; } }

.bm-fly { position: fixed; left: 0; top: 0; z-index: 2147483001; width: 26px; height: 21px; pointer-events: none; }
.bm-inv { position: fixed; left: 16px; top: 92px; z-index: 60; font: 9px/1 ${PIX}; color: #e8c46a; letter-spacing: .04em; }
.bm-inv-k { display: block; margin: 0 0 6px 2px; text-shadow: 0 1px 4px #000; }
.bm-slot { display: block; width: 56px; height: 56px; padding: 10px 8px; box-sizing: border-box; cursor: help;
  background: #0d0b16; border: 4px solid #f4ecd8; box-shadow: 3px 3px 0 #000; animation: bm-pop-in .3s steps(3, end) both; }
.bm-slot:focus-visible { outline: 2px solid #e8c46a; outline-offset: 3px; }
.bm-inv.bm-bye { animation: bm-out-k .25s steps(3, end) both; }
@keyframes bm-pop-in { from { transform: scale(.2); } to { transform: scale(1); } }
@keyframes bm-out-k { to { transform: scale(.2); opacity: 0; } }
.bm-note { position: fixed; z-index: 2147483001; max-width: 300px; padding: 12px 14px; box-sizing: border-box;
  background: #0d0b16; color: #f4ecd8; font: 10px/1.9 ${PIX}; border: 4px solid #f4ecd8; box-shadow: 3px 3px 0 #000;
  pointer-events: none; animation: bm-pop-in .25s steps(3, end) both; }
.bm-note.bm-bye { animation: bm-out-k .2s steps(3, end) both; }
.bm-cursor, .bm-cursor * { cursor: pointer !important; }
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
.bm-menu { display: flex; flex-wrap: wrap; gap: 14px; margin: 16px 0 0; padding: 0; list-style: none; }
.bm-menu button { cursor: pointer; padding: 12px 18px 11px; font: 12px/1 "Press Start 2P", ui-monospace, Menlo, Consolas, monospace; letter-spacing: .02em;
  border: 4px solid #f4ecd8; background: transparent; color: #f4ecd8; box-shadow: 4px 4px 0 #000; }
.bm-menu .bm-go { background: #e8c46a; border-color: #e8c46a; color: #0d0b16; }
.bm-menu button:hover, .bm-menu button:focus-visible { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; outline: none; }
.bm-menu button:focus-visible { outline: 2px solid #f4ecd8; outline-offset: 3px; }
.bm-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .bm-dlg { font-size: 11px; } }
`;

let toy = null, inv = null, note = null;

function waitFor(sel) {
  return new Promise((res) => {
    const t0 = Date.now();
    (function poll() {
      const el = document.querySelector(sel);
      if (el || Date.now() - t0 > 20000) return res(el);
      setTimeout(poll, 250);
    })();
  });
}

function loadFont() {
  if (document.getElementById('bm-font')) return;
  const l = document.createElement('link');
  l.id = 'bm-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  document.head.appendChild(l);
}

// ── where it hides: on the rule under the last question in "Short answers", near its right end ──
const SPOT = '#faq .dfaq details:last-of-type';
function place() {
  const at = document.querySelector(SPOT);
  if (!at) return;
  if (!toy) {
    toy = document.createElement('button');
    toy.type = 'button'; toy.className = 'bm-toy';
    toy.setAttribute('aria-label', 'A toy mouse');
    toy.innerHTML = TOY;
    toy.addEventListener('pointerenter', loadFont, { once: true });
    toy.addEventListener('click', pickUp);
    document.body.appendChild(toy);
  }
  const r = at.getBoundingClientRect(), shown = at.classList.contains('shown') && r.width > 0;
  toy.style.left = (r.right + scrollX - 64) + 'px';
  toy.style.top = (r.bottom + scrollY - 20) + 'px';
  toy.classList.toggle('bm-on', shown);
}
function watchSpot() {
  place();
  const again = () => { if (toy && toy.isConnected) place(); };
  addEventListener('resize', again, { passive: true });
  new ResizeObserver(again).observe(document.body);
  // the questions fade in as they scroll into view, and open and close
  new MutationObserver(again).observe(document.getElementById('faq') || document.body, { attributes: true, subtree: true, childList: true });
}

// a small pixel note next to something
function say(text, x, y, ms = 3800) {
  if (note) note.remove();
  const n = note = document.createElement('div');
  n.className = 'bm-note'; n.setAttribute('role', 'status'); n.textContent = text;
  n.style.left = x + 'px'; n.style.top = y + 'px';
  document.body.appendChild(n);
  setTimeout(() => { n.classList.add('bm-bye'); setTimeout(() => { n.remove(); if (note === n) note = null; }, 220); }, ms);
}

// ── picked up: into your inventory ──
function pickUp() {
  loadFont();
  const from = toy.getBoundingClientRect();
  toy.remove(); toy = null;
  put(HELD, { at: new Date().toISOString() });
  showInv(true);
  const to = inv.querySelector('.bm-slot').getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'bm-fly'; f.innerHTML = TOY; document.body.appendChild(f);
  const s = (to.width - 16) / 26, tx = to.left + 8, ty = to.top + 14;
  f.animate([
    { transform: `translate(${from.left}px, ${from.top}px)` },
    { transform: `translate(${(from.left + tx) / 2}px, ${Math.min(from.top, ty) - 60}px) scale(${(1 + s) / 2})`, offset: 0.5 },
    { transform: `translate(${tx}px, ${ty}px) scale(${s})` },
  ], { duration: 650, easing: 'cubic-bezier(.4, 0, .5, 1)', fill: 'forwards' }).onfinish = () => {
    f.remove(); inv.querySelector('.bm-slot').innerHTML = TOY;
    say('I know someone who might like this.', to.right + 12, to.top);
  };
}

function showInv(empty) {
  if (inv) return;
  inv = document.createElement('div');
  inv.className = 'bm-inv';
  inv.innerHTML = `<span class="bm-inv-k">ITEMS</span><button type="button" class="bm-slot" aria-label="Inventory: a toy mouse. Someone on this page might like it.">${empty ? '' : TOY}</button>`;
  inv.querySelector('.bm-slot').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    say('I know someone who might like this.', r.right + 12, r.top);
  });
  document.body.appendChild(inv);
  addEventListener('pointerdown', onDown, true);
  addEventListener('pointermove', onMove, { passive: true });
}
function hideInv() {
  removeEventListener('pointerdown', onDown, true);
  removeEventListener('pointermove', onMove);
  document.documentElement.classList.remove('bm-cursor');
  if (!inv) return;
  const el = inv; inv = null;
  el.classList.add('bm-bye'); setTimeout(() => el.remove(), 260);
}

// ── giving it back: click Bat while it's in your inventory ──
const cat = () => window.ScaffoldCat;
function onMove(e) {
  const c = cat();
  document.documentElement.classList.toggle('bm-cursor', !!(c && c.near(e.clientX, e.clientY)));
}
function onDown(e) {
  const c = cat();
  if (e.button !== 0 || !c || !c.near(e.clientX, e.clientY)) return;
  e.preventDefault(); e.stopPropagation();
  addEventListener('click', (k) => { k.preventDefault(); k.stopPropagation(); }, { capture: true, once: true });   // the click that follows isn't for what's under him
  give();
}
function give() {
  loadFont();
  put(HELD, null);
  hideInv();
  if (note) note.remove();
  cat().thank();
  const first = !get(KEY);
  put(KEY, { found: true, at: new Date().toISOString() });
  if (first) {
    try {
      fetch('/api/design-brief', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ action: 'bat-mouse' }),
      }).catch(() => {});
    } catch (e) { /* offline: fine */ }
  }
  setTimeout(dialog, 1100);   // he looks at you first
}

// ── the dialog box ──
function dialog() {
  const pages = [
    'You have my sincere gratitude.\nA cat does not forget a kindness.',
    `I shall have a word with my owner. He will take <b>5% off your final price</b>.\nHe is, I assure you, most obliging.`,
    'Consider it a favour from me, under my own seal.\nIt goes with any brief you send from this browser.\n\nYours, Bat.',
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
    const w = cat().where(), r = box.getBoundingClientRect();
    if (w && w.x > r.left - 60 && w.x < r.right + 60 && w.y > r.top - 0.9 * w.ppm) box.classList.add('bm-top');
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
    menu.innerHTML = '<li><button type="button" class="bm-go" data-go="brief">Write a brief</button></li><li><button type="button" data-go="close">Carry on</button></li>';
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
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !menu.hidden) {
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
  if (!matchMedia('(min-width: 900px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // no Bat here, so no mouse
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  if (get(HELD)) { showInv(false); return; }            // still in your inventory from an earlier visit
  if (!(await waitFor(SPOT))) return;
  watchSpot();
})();
