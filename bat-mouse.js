// bat-mouse.js — an easter egg on the Scaffold page (Carter Groff Design.html).
//
// Bat, the black cat in the hero (scaffold-cat.js), has lost his toy mouse. In the "I'm Carter"
// section it peeks out from behind the right edge of Carter's portrait, low down: just its
// nose, an eye and an ear, small and dim. Hover and it leans out a little; click and it ducks
// back behind the photo and is stowed away (nothing on screen), and a line of handwriting fades
// in beside it and away again: "I know someone who might like this." Click Bat while you have
// it (he has to be sitting; the cursor turns to a pointer over him) and you give it back: it
// drops down in front of him and stays there, he looks at it, then at you and slow-blinks, and
// his old-school dialog box opens: he thanks you and says he'll have his owner take 5% off your
// final price.
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
// A stowed mouse stays stowed across visits until you give it to him. Once given, he has it:
// on later visits it is waiting where he sits, and the portrait has no mouse. Carter is
// emailed once per browser. ?batreset forgets all of it, for testing.

const KEY = 'scaffold-bat-mouse';          // given back to Bat (the favour); design.jsx reads it
const HELD = 'scaffold-bat-mouse-held';    // stowed away, not given back yet
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
.bm-peek { position: absolute; z-index: 3; width: 22px; height: 24px; overflow: hidden; pointer-events: none; opacity: 0; transition: opacity 1.2s ease .8s; }
.bm-peek.bm-on { opacity: .72; }
@media (max-width: 899px) { .bm-peek { display: none; } }
.bm-toy { position: absolute; left: -20px; bottom: 0; width: 34px; height: 27px; padding: 0; border: 0; background: none; cursor: pointer; pointer-events: auto;
  transform: scaleX(-1); transition: left .35s cubic-bezier(.3, .7, .4, 1); }
.bm-toy svg { display: block; width: 100%; height: 100%; overflow: visible; }
.bm-peek:hover .bm-toy, .bm-toy:focus-visible { left: -15px; }
.bm-toy:focus-visible { outline: 1px dashed rgba(233,223,198,.6); outline-offset: -2px; }
.bm-peek.bm-away .bm-toy { left: -40px; transition: left .25s ease-in; }
.bm-hand { position: absolute; z-index: 3; pointer-events: none; white-space: nowrap; color: #e9dfc6; opacity: 0;
  font: 400 26px/1 "Caveat", "Segoe Print", "Bradley Hand", cursive; transform: rotate(-3deg); transform-origin: left center;
  animation: bm-hand 5.2s ease both; }
@keyframes bm-hand { 0% { opacity: 0; transform: rotate(-3deg) translateY(4px); } 14% { opacity: .82; transform: rotate(-3deg) translateY(0); }
  62% { opacity: .82; } 100% { opacity: 0; transform: rotate(-3deg) translateY(-6px); } }

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

let peek = null, armed = false, closeOpen = null;   // closeOpen: closes whichever dialog is up

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
  l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400&family=Press+Start+2P&display=swap';
  document.head.appendChild(l);
}

// ── where it hides: peeking out from behind the right edge of the portrait, low down ──
// A box sits just outside the photo's edge with overflow hidden; the mouse (facing out) is
// mostly to the left of it, so its body is "behind" the photo and only the face shows.
const SPOT = '.dwhyhead .dportrait';
function place() {
  const img = document.querySelector(SPOT);
  if (!img) return;
  if (!peek) {
    peek = document.createElement('div');
    peek.className = 'bm-peek';
    peek.innerHTML = `<button type="button" class="bm-toy" aria-label="A toy mouse, peeking out from behind the photo">${TOY}</button>`;
    const b = peek.querySelector('.bm-toy');
    b.addEventListener('pointerenter', loadFont, { once: true });
    b.addEventListener('click', pickUp, { once: true });
    document.body.appendChild(peek);
  }
  const r = img.getBoundingClientRect(), shown = !!img.closest('.dwhyhead.shown') && r.width > 0;
  peek.style.left = (r.right + scrollX) + 'px';
  peek.style.top = (r.bottom + scrollY - 24 - Math.round(r.height * 0.06)) + 'px';
  peek.classList.toggle('bm-on', shown);
}
function watchSpot() {
  place();
  const again = () => { if (peek && peek.isConnected && !peek.classList.contains('bm-away')) place(); };
  addEventListener('resize', again, { passive: true });
  new ResizeObserver(again).observe(document.body);
  // the portrait fades in as it scrolls into view; React may also re-render the section
  new MutationObserver(again).observe(document.getElementById('why') || document.body, { attributes: true, subtree: true, childList: true, attributeFilter: ['class'] });
}

// a line of handwriting that fades in beside something and away again (not a box to dismiss)
function scribble(text, x, y) {
  const h = document.createElement('div');
  h.className = 'bm-hand'; h.setAttribute('role', 'status'); h.textContent = text;
  h.style.left = x + 'px'; h.style.top = y + 'px';
  document.body.appendChild(h);
  h.addEventListener('animationend', () => h.remove());
}

// ── picked up: it ducks back behind the photo, and is stowed ──
function pickUp() {
  loadFont();
  const r = peek.getBoundingClientRect();
  peek.classList.add('bm-away');
  const el = peek; peek = null; setTimeout(() => el.remove(), 300);
  put(HELD, { at: new Date().toISOString() });
  arm();
  scribble('I know someone who might like this.', r.left + scrollX - 250, r.bottom + scrollY + 26);   // in the space just under the photo's corner
}
function arm() {
  if (armed) return; armed = true;
  addEventListener('pointerdown', onDown, true);
  addEventListener('pointermove', onMove, { passive: true });
}
function disarm() {
  armed = false;
  removeEventListener('pointerdown', onDown, true);
  removeEventListener('pointermove', onMove);
  document.documentElement.classList.remove('bm-cursor');
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
  disarm();
  if (closeOpen) closeOpen();
  cat().give(toyEl());     // it drops down in front of him and stays
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
  setTimeout(() => dialog(BAT_SAYS), 2400);   // it lands, he looks at it, then at you
}

// the mouse as it lies on the ground by Bat (scaffold-cat.js places it every frame)
function toyEl() {
  const el = document.createElement('div');
  el.className = 'bm-had'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = TOY;
  el.firstElementChild.style.cssText = 'display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))';
  return el;
}

// ── the dialog box ──
const BAT_SAYS = [
  'You have my sincere gratitude.\nA cat does not forget a kindness.',
  `I shall have a word with my owner. He will take <b>5% off your final price</b>.\nHe is, I assure you, most obliging.`,
  'Consider it a favour from me, under my own seal.\nIt goes with any brief you send from this browser.\n\nYours, Bat.',
];
// Bat's dialog: a name tag, pages typed out, then the two buttons
function dialog(pages) {
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
    if (closeOpen === close) closeOpen = null;
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
  if (closeOpen) closeOpen();
  closeOpen = close;
  addEventListener('keydown', key, true);
  box.focus({ preventScroll: true });
  show(0);
}

(async function boot() {
  if (!matchMedia('(min-width: 900px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // no Bat here, so no mouse
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  if (get(KEY)) {                                        // he already has it: it waits where he sits
    const keep = () => cat() && cat().keep(toyEl());
    if (cat()) keep(); else addEventListener('scaffoldcat:ready', keep, { once: true });
    return;
  }
  if (get(HELD)) { arm(); return; }                     // still stowed from an earlier visit
  if (!(await waitFor(SPOT))) return;
  watchSpot();
})();
