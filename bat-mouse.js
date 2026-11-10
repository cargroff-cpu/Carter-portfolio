// bat-mouse.js — an easter egg on the Scaffold page (Carter Groff Design.html).
//
// Bat, the black cat in the hero (scaffold-cat.js), has lost his toy mouse. It sits at the
// foot of Carter's portrait in the "Why" section. Click it and it's tucked away, and an
// old-school video game dialog box opens: Bat thanks the finder and says he'll have his
// owner take 5% off their final price. No game to play, nothing to carry.
//
// How the discount reaches Carter:
//   - Finding it is remembered in this browser (localStorage) and emails Carter at once
//     (POST /api/design-brief, action "bat-mouse"; rate limited).
//   - Any brief sent later from this browser says so (design.jsx reads it): "Bat's favour,
//     5% off" in the brief email, the client's confirmation and the job history.
//   Honour system: the find email is the record.
//
// It shows wherever Bat does (screens 900px and wider, reduced motion off: the same rule as
// scaffold-cat.js), without waiting for the 3D model to load, and comes back
// on every visit: clicking it again just brings Bat's dialog back. Carter is emailed only the
// first time a browser finds it. ?batreset forgets the find, for testing.

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
.bm-toy { position: absolute; z-index: 3; width: 40px; height: 32px; padding: 0; border: 0; background: none; cursor: pointer;
  opacity: 0; transition: opacity 1.2s ease .6s, transform .25s ease; }
.bm-toy.bm-on { opacity: .92; }
@media (max-width: 899px) { .bm-toy { display: none; } }
.bm-toy:hover { transform: translateY(-2px); }
.bm-toy svg { display: block; overflow: visible; }
.bm-toy:focus-visible { outline: 1px dashed rgba(233,223,198,.6); outline-offset: 3px; }
.bm-toy.bm-away { transition: opacity .35s ease, transform .35s ease; opacity: 0; transform: translateY(6px) scale(.6); pointer-events: none; }

.bm-dlg { position: fixed; left: 50%; bottom: 28px; z-index: 2147483002; width: min(760px, calc(100vw - 32px)); transform: translateX(-50%);
  padding: 24px 26px 22px; box-sizing: border-box;
  background: #0d0b16; color: #f4ecd8; font: 13px/2 "Press Start 2P", ui-monospace, Menlo, Consolas, monospace; letter-spacing: .02em;
  border: 4px solid #f4ecd8; box-shadow: 0 18px 50px rgba(0,0,0,.6);
  animation: bm-pop .32s steps(4, end) both; }
.bm-dlg:focus { outline: none; }
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

let toy = null;

// the page is React: wait until the portrait is on the page
function portrait() {
  return new Promise((res) => {
    const t0 = Date.now();
    (function poll() {
      const img = document.querySelector('.dwhyhead .dportrait');
      if (img || Date.now() - t0 > 20000) return res(img);
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

// ── where it sits: at the foot of the portrait, just past its bottom-right corner ──
function place() {
  const img = document.querySelector('.dwhyhead .dportrait');
  if (!img) return;
  if (!toy) {
    toy = document.createElement('button');
    toy.type = 'button'; toy.className = 'bm-toy';
    toy.setAttribute('aria-label', 'A toy mouse');
    toy.innerHTML = TOY;
    toy.addEventListener('pointerenter', loadFont, { once: true });
    toy.addEventListener('click', found);
    document.body.appendChild(toy);
  }
  const r = img.getBoundingClientRect(), shown = !!img.closest('.dwhyhead.shown') && r.width > 0;
  toy.style.left = (r.right + scrollX + 8) + 'px';
  toy.style.top = (r.bottom + scrollY - 32) + 'px';
  toy.classList.toggle('bm-on', shown);
}

function watchSpot() {
  place();
  const again = () => { if (toy && toy.isConnected && !toy.classList.contains('bm-away')) place(); };
  addEventListener('resize', again, { passive: true });
  new ResizeObserver(again).observe(document.body);
  // the portrait fades in when it scrolls into view; React may also re-render the section
  new MutationObserver(again).observe(document.getElementById('why') || document.body, { attributes: true, subtree: true, childList: true, attributeFilter: ['class'] });
}

// ── found: tucked away, Carter told, and Bat has a word ──
function found() {
  loadFont();
  toy.classList.add('bm-away');
  setTimeout(() => { toy.remove(); }, 400);
  if (read()) { setTimeout(dialog, 350); return; }   // found before: Bat says it again, Carter already knows
  write({ found: true, at: new Date().toISOString() });
  try {
    fetch('/api/design-brief', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ action: 'bat-mouse' }),
    }).catch(() => {});
  } catch (e) { /* offline: fine */ }
  setTimeout(dialog, 350);
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
  if (!(await portrait())) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  watchSpot();
})();
