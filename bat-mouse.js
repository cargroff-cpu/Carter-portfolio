// bat-mouse.js — an easter egg on the Scaffold page (Carter Groff Design.html).
//
// Bat, the black cat in the hero (scaffold-cat.js), has lost his toy mouse. In the "I'm Carter"
// section it peeks out from behind the right edge of Carter's portrait, low down: just its
// nose, an eye and an ear, small and dim. It gives one small budge the first time you scroll
// onto it, and leans out when you hover. Click it and it ducks back behind the photo and is
// stowed, while a card slides up: the whole mouse, "Found: a toy mouse", and in handwriting "I
// know someone who might like this.", which fades away on its own. Click Bat while you have it
// (he has to be sitting; the cursor turns to a pointer over him) and you give it back: it drops
// down in front of him and stays there, he looks at it, then at you and slow-blinks, and a card
// in the site's own style opens: he thanks you and says he'll have his owner take 5% off your
// final price, and he looks at you the whole time he's talking.
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
/* the one small budge, the first time you scroll onto it: a twitch out and back, a little tilt */
.bm-peek.bm-budge .bm-toy { animation: bm-budge 1.1s cubic-bezier(.3, .7, .4, 1) both; }
@keyframes bm-budge { 0% { left: -20px; } 30% { left: -15px; transform: scaleX(-1) rotate(-4deg); } 52% { left: -17px; transform: scaleX(-1) rotate(2deg); } 100% { left: -20px; transform: scaleX(-1); } }

.bm-cursor, .bm-cursor * { cursor: pointer !important; }

/* cards: the same dark wood, brass hairline and serif as the rest of the page */
.bm-card { position: fixed; left: 50%; bottom: 34px; z-index: 2147483002; width: min(640px, calc(100vw - 32px)); transform: translateX(-50%);
  box-sizing: border-box; color: var(--ink, #ecd9b2); background: linear-gradient(180deg, var(--bg-warm, #2a1c11), var(--bg-deep, #0f0a06));
  border: 1px solid var(--brass-edge, rgba(194,164,106,.45)); box-shadow: 0 26px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.4);
  animation: bm-rise .55s cubic-bezier(.16, 1, .3, 1) both; }
.bm-card::before { content: ""; position: absolute; inset: 6px; border: 1px solid var(--rule, rgba(236,217,178,.16)); pointer-events: none; }
.bm-card:focus { outline: none; }
.bm-card.bm-top { bottom: auto; top: 104px; }
.bm-card.bm-bye { animation: bm-fall .35s ease both; }
@keyframes bm-rise { from { opacity: 0; transform: translateX(-50%) translateY(18px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes bm-fall { to { opacity: 0; transform: translateX(-50%) translateY(10px); } }

.bm-dlg { padding: 34px 38px 28px; }
.bm-name { display: flex; align-items: center; gap: 14px; margin: 0 0 14px; font: 600 11px/1 var(--ui, "Karla", system-ui, sans-serif); letter-spacing: .26em; text-transform: uppercase; color: var(--amber, #d99a3d); }
.bm-name::after { content: ""; flex: 1; height: 1px; background: var(--rule-strong, rgba(236,217,178,.32)); }
.bm-text { min-height: 3.9em; margin: 0; white-space: pre-wrap; font: italic 400 25px/1.45 var(--display, "Cormorant Garamond", Georgia, serif); color: var(--ink, #ecd9b2); }
.bm-text b { font-style: normal; font-weight: 600; color: var(--amber-lit, #f5cd6a); }
.bm-w { animation: bm-word .55s ease both; animation-delay: calc(var(--i) * 70ms); }
.bm-text.bm-all .bm-w { animation: none; }
@keyframes bm-word { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.bm-next { position: absolute; right: 30px; bottom: 20px; font: 500 12px/1 var(--ui, "Karla", system-ui, sans-serif); letter-spacing: .14em; text-transform: uppercase; color: var(--amber, #d99a3d); animation: bm-nudge 1.6s ease-in-out infinite; }
@keyframes bm-nudge { 50% { transform: translateX(4px); opacity: .6; } }
.bm-menu { display: flex; flex-wrap: wrap; gap: 12px; margin: 18px 0 0; padding: 0; list-style: none; }
.bm-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .bm-dlg { padding: 28px 24px 24px; } .bm-text { font-size: 21px; } }

/* the "found" card: the whole mouse, what it is, and a line in handwriting. It fades away on its own */
.bm-found { display: flex; align-items: center; gap: 22px; padding: 20px 30px 20px 24px; width: min(460px, calc(100vw - 32px)); pointer-events: none;
  animation: bm-rise .55s cubic-bezier(.16, 1, .3, 1) both, bm-fall .6s ease 4.8s forwards; }
.bm-found-art { flex: none; width: 84px; height: 66px; display: grid; place-items: center; border: 1px solid var(--rule, rgba(236,217,178,.16)); background: var(--well, rgba(15,10,6,.6)); }
.bm-found-art svg { width: 56px; height: 45px; overflow: visible; filter: drop-shadow(0 3px 3px rgba(0,0,0,.55)); animation: bm-pop 1s cubic-bezier(.3, 1.4, .5, 1) .25s both; }
@keyframes bm-pop { from { transform: translateY(-14px) scale(.5) rotate(-12deg); opacity: 0; } 60% { opacity: 1; } to { transform: none; opacity: 1; } }
.bm-found-k { display: block; margin: 0 0 4px; font: 600 10px/1 var(--ui, "Karla", system-ui, sans-serif); letter-spacing: .26em; text-transform: uppercase; color: var(--amber, #d99a3d); }
.bm-found-n { display: block; margin: 0 0 6px; font: 500 22px/1.1 var(--display, "Cormorant Garamond", Georgia, serif); color: var(--ink, #ecd9b2); }
.bm-found-h { display: block; font: 400 25px/1.15 "Caveat", "Segoe Print", "Bradley Hand", cursive; color: var(--ink-soft, #c9b48a); transform: rotate(-1.5deg); transform-origin: left center; }
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
  l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400&display=swap';
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
    budgeOnce(peek);
  }
  const r = img.getBoundingClientRect(), shown = !!img.closest('.dwhyhead.shown') && r.width > 0;
  peek.style.left = (r.right + scrollX) + 'px';
  peek.style.top = (r.bottom + scrollY - 24 - Math.round(r.height * 0.06)) + 'px';
  peek.classList.toggle('bm-on', shown);
}
// the first time it scrolls into view (and has faded in) it gives one small budge, as if it
// had been nudged: easy to miss, and it only happens once per visit
let budged = false;
function budgeOnce(el) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => {
    if (budged || !es[0].isIntersecting) return;
    budged = true; io.disconnect();
    setTimeout(() => { if (el.isConnected && !el.classList.contains('bm-away')) { el.classList.add('bm-budge'); el.addEventListener('animationend', () => el.classList.remove('bm-budge'), { once: true }); } }, 1800);
  }, { threshold: 0.9 });
  io.observe(el);
}
function watchSpot() {
  place();
  const again = () => { if (peek && peek.isConnected && !peek.classList.contains('bm-away')) place(); };
  addEventListener('resize', again, { passive: true });
  new ResizeObserver(again).observe(document.body);
  // the portrait fades in as it scrolls into view; React may also re-render the section
  new MutationObserver(again).observe(document.getElementById('why') || document.body, { attributes: true, subtree: true, childList: true, attributeFilter: ['class'] });
}

// the "found an item" card: the whole mouse, what it is, and a line of handwriting. Nothing to
// click away: it fades by itself after a few seconds
function foundCard() {
  const c = document.createElement('div');
  c.className = 'bm-card bm-found'; c.setAttribute('role', 'status');
  c.innerHTML = `<span class="bm-found-art">${TOY}</span><span><span class="bm-found-k">Found</span><span class="bm-found-n">A toy mouse</span><span class="bm-found-h">I know someone who might like this.</span></span>`;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 5500);
}

// ── picked up: it ducks back behind the photo, and is stowed ──
function pickUp() {
  loadFont();
  peek.classList.add('bm-away');
  const el = peek; peek = null; setTimeout(() => el.remove(), 300);
  put(HELD, { at: new Date().toISOString() });
  arm();
  foundCard();
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
  document.querySelectorAll('.bm-found').forEach((f) => f.remove());
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
// Bat's dialog: a card in the page's own style. His name, then what he says a word at a time,
// then the two buttons. He looks at you the whole time it's open.
function dialog(pages) {
  const box = document.createElement('div');
  box.className = 'bm-card bm-dlg'; box.tabIndex = -1;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Bat says');
  box.innerHTML = `<p class="bm-name">Bat</p>
    <p class="bm-text" aria-hidden="true"></p><p class="bm-sr" aria-live="polite"></p><ul class="bm-menu" hidden></ul>
    <span class="bm-next" aria-hidden="true">Continue &rsaquo;</span>`;
  document.body.appendChild(box);
  cat().speak(true);
  // the bottom of the screen, unless that would cover him
  try {
    const w = cat().where(), r = box.getBoundingClientRect();
    if (w && w.x > r.left - 60 && w.x < r.right + 60 && w.y > r.top - 0.9 * w.ppm) box.classList.add('bm-top');
  } catch (e) { /* no cat: stays put */ }
  const text = box.querySelector('.bm-text'), sr = box.querySelector('.bm-sr'), menu = box.querySelector('.bm-menu'), nxt = box.querySelector('.bm-next');
  let page = -1, timer = 0, typing = false;
  const plain = (h) => h.replace(/<[^>]+>/g, '');
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // each word fades in a beat after the last (markup such as <b> is kept as it is)
  function show(i) {
    page = i; typing = true; nxt.hidden = true; text.classList.remove('bm-all');
    sr.textContent = plain(pages[i]).replace(/\n/g, ' ');
    let n = 0;
    text.innerHTML = pages[i].split(/(<[^>]+>)/).map((part) => part.startsWith('<') ? part
      : part.split(/(\s+)/).map((t) => (/\S/.test(t) ? `<span class="bm-w" style="--i:${n++}">${esc(t)}</span>` : t)).join('')).join('');
    clearTimeout(timer);
    timer = setTimeout(done, n * 70 + 550);
  }
  function done() {
    clearTimeout(timer); typing = false; text.classList.add('bm-all');
    if (page < pages.length - 1) { nxt.hidden = false; return; }
    nxt.hidden = true; menu.hidden = false;
    menu.innerHTML = '<li><button type="button" class="p-btn" data-go="brief">Write a brief</button></li><li><button type="button" class="p-btn ghost" data-go="close">Carry on</button></li>';
    menu.querySelector('button').focus({ preventScroll: true });
  }
  function advance() {
    if (typing) return done();
    if (page < pages.length - 1) show(page + 1);
  }
  function close(go) {
    if (closeOpen === close) closeOpen = null;
    clearTimeout(timer);
    cat() && cat().speak(false);
    removeEventListener('keydown', key, true);
    box.classList.add('bm-bye');
    setTimeout(() => box.remove(), 360);
    if (go === 'brief') { const b = document.getElementById('brief'); if (b) b.scrollIntoView({ behavior: 'smooth' }); }
  }
  function key(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if ((e.key === 'Enter' || e.key === ' ') && menu.hidden) { e.preventDefault(); advance(); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !menu.hidden) {
      const bs = [...menu.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
      bs[(i + 1) % bs.length].focus({ preventScroll: true }); e.preventDefault();
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
