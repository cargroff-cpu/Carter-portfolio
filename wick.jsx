// wick.jsx — Wick's room, recreated in React from design-reference/Wick.html
// + wick-brain.js. The design prototype's window.claude.complete was a
// design-canvas stand-in; the real model call happens server-side in
// api/wick-chat.js (system prompt, brand guides, live data, tool-use loop),
// this component just renders the thread and sends turns.
const { fetchCampaigns } = window.CC;

const SEEN_KEY = 'wick_last_seen';

function greeting() {
  const h = new Date().getHours();
  const hour = h < 5 ? 'Late one' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  let last = null;
  try { last = localStorage.getItem(SEEN_KEY); localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (e) {}
  if (!last) return `${hour}. I'm Wick.`;
  const gap = Math.round((Date.now() - +last) / 864e5);
  if (gap >= 7) return `${hour}. It has been a week.`;
  if (gap >= 2) return `${hour}. Been a few days.`;
  if (gap === 0 && h >= 5) return 'Back again.';
  return hour + '.';
}
async function opener() {
  try {
    const campaigns = await fetchCampaigns();
    const flagged = campaigns.filter((c) => c.status === 'flagged');
    if (flagged.length) {
      const c = flagged[0];
      return `${c.name} went out with no attribution on it, so whatever it pulled is landing nowhere${flagged.length > 1 ? `, and it isn't the only one, there are ${flagged.length} sitting like that` : ''}. Fix that before anything else.`;
    }
    const drafts = campaigns.filter((c) => c.status === 'draft');
    if (drafts.length) return `Nothing's flagged. The loose end is ${drafts[0].name}, still a draft with nothing costed. Want to finish it or kill it?`;
    if (!campaigns.length) return `Nothing logged yet. Once a few campaigns are in I'll have something sharper to say than good morning.`;
    return `Nothing untracked and nothing sitting as a draft. Good week to work on something that isn't urgent.`;
  } catch (e) {
    return `I couldn't reach the campaign data just now, so I've got nothing sharp to open with.`;
  }
}

function paras(text) {
  return String(text || '').trim().split(/\n{2,}/).map((p, i) => <p key={i}>{p.split('\n').map((line, j) => (j ? [<br key={j} />, line] : line))}</p>);
}

function Motes() {
  const motes = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 26; i++) {
      const near = i % 4 === 0;
      const x = near ? 74 + Math.random() * 16 : 52 + Math.random() * 44;
      const y = near ? 46 + Math.random() * 34 : 20 + Math.random() * 58;
      const d = 16 + Math.random() * 22;
      arr.push({ x, y, d, delay: -(Math.random() * d), op: 0.25 + Math.random() * 0.5 });
    }
    return arr;
  }, []);
  return (
    <div className="motes" aria-hidden="true">
      {motes.map((m, i) => (
        <span key={i} className="mote" style={{ left: m.x + '%', top: m.y + '%', animationDuration: m.d + 's', animationDelay: m.delay.toFixed(1) + 's', opacity: m.op }} />
      ))}
    </div>
  );
}

function MemoryDrawer({ onClose }) {
  const [rows, setRows] = React.useState(null);
  React.useEffect(() => {
    fetch('/api/wick-memory').then((r) => r.json()).then((d) => setRows(d.rows || [])).catch(() => setRows([]));
  }, []);
  return (
    <div className="mem" role="dialog" aria-modal="true" aria-label="What Wick keeps" style={{ display: 'block' }}>
      <div className="memin">
        <h2>What he keeps</h2>
        <p className="note">Filed at the end of each session, decisions, preferences, results, and the arguments you didn't win. Not transcripts.</p>
        <div>
          {rows == null && <div className="memrow"><div className="s">Loading…</div></div>}
          {rows && rows.length === 0 && <div className="memrow"><div className="s">Nothing filed yet. Talk to him, then close the session.</div></div>}
          {rows && rows.map((r) => (
            <div className="memrow" key={r.id}>
              <div className="t">{r.topic}{r.related_brand ? ' · ' + (r.related_brand === 'ltw' ? 'LTW' : 'Squeeky') : ''} · {r.date}</div>
              <div className="s">{r.summary}</div>
            </div>
          ))}
        </div>
        <button className="p-btn ghost" style={{ marginTop: 24 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function Wick() {
  const [history, setHistory] = React.useState([]);
  const [state, setState] = React.useState('');
  const [pulsing, setPulsing] = React.useState(false);
  const [memOpen, setMemOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [input, setInput] = React.useState('');
  const threadRef = React.useRef(null);
  const sessionIdRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    let alive = true;
    opener().then((observation) => {
      if (!alive) return;
      setHistory([{ role: 'assistant', greet: true, text: [greeting(), observation].filter(Boolean).join('\n\n') }]);
      // Arrived from the docked mini-presence's quick-question field --
      // ask it for them instead of making them retype it.
      const ask = new URLSearchParams(location.search).get('ask');
      if (ask) {
        window.history.replaceState(null, '', '/wick');
        setTimeout(() => turn(ask), 50);
      }
    });
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [history, pulsing]);

  React.useEffect(() => {
    document.body.classList.toggle('thinking', state === 'thinking');
    document.body.classList.toggle('answering', state === 'answering');
  }, [state]);

  React.useEffect(() => {
    document.body.classList.toggle('mem-open', memOpen);
  }, [memOpen]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMemOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeSession = React.useCallback((h) => {
    if (h.filter((m) => m.role === 'user').length < 2) return;
    fetch('/api/wick-close-session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: h }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  // Same-origin link clicks (the header's "The Scaffold" link) shouldn't
  // count as "leaving" -- only a real tab-close or refresh should log out,
  // so those clicks are marked and pagehide skips the logout beacon for
  // them.
  React.useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (a && a.origin === location.origin) window.__skipLogout = true;
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);

  React.useEffect(() => {
    const onPageHide = () => {
      if (history.length > 3) closeSession(history);
      if (!window.__skipLogout && navigator.sendBeacon) navigator.sendBeacon('/api/logout');
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [history, closeSession]);

  const turn = async (text) => {
    const next = [...history, { role: 'user', text }];
    setHistory(next);
    setState('thinking'); setPulsing(true);
    try {
      const res = await fetch('/api/wick-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: next, sessionId: sessionIdRef.current }),
      });
      const data = await res.json();
      setState('answering'); setPulsing(false);
      setHistory((h) => [...h, { role: 'assistant', text: data.reply || "That call didn't come back with anything.", did: data.did || '' }]);
    } catch (e) {
      setPulsing(false);
      setHistory((h) => [...h, { role: 'assistant', text: "That call failed and I'm not going to guess at numbers. Try again in a moment." }]);
    }
    setTimeout(() => setState(''), 900);
  };

  const send = () => {
    const t = input.trim(); if (!t) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    turn(t);
  };

  const fileAndClear = async () => {
    setClosing(true);
    await closeSession(history);
    setHistory([]);
    setTimeout(async () => {
      setClosing(false);
      const observation = await opener();
      setHistory([{ role: 'assistant', greet: true, text: [greeting(), observation].filter(Boolean).join('\n\n') }]);
    }, 1000);
  };

  return (
    <React.Fragment>
      <div className="room">
        <div className="wall" />
        <div className="pool" /><div className="spill" />
        <Motes /><div className="vig" />

        <div className="head">
          <span className="who">Wick</span>
          <span className="state">{state === 'thinking' ? 'Thinking' : state === 'answering' ? 'Answering' : ''}</span>
          <span className="spacer" />
          <a href="/scaffold">← The Scaffold</a>
          <button onClick={() => setMemOpen(true)}>What he keeps</button>
          <button onClick={fileAndClear}>{closing ? 'Filing…' : 'File notes & clear'}</button>
        </div>

        <div className="sconce" aria-hidden="true">
          <span className="tag">Wick</span>
          <span className="mount"><span className="tube"><span className="core" /><span className="halo" /></span></span>
        </div>

        <div className="thread" ref={threadRef}>
          {history.map((m, i) => (
            <div key={i} className={'turn ' + (m.role === 'user' ? 'me' : 'him') + (m.greet ? ' greet' : '')}>
              {paras(m.text)}
              {m.did && <div className="did">{m.did}</div>}
            </div>
          ))}
          {pulsing && <div className="turn him"><span className="pulse">·</span></div>}
        </div>

        <div className="say">
          <div className="sayrow">
            <textarea ref={textareaRef} rows={1} placeholder="Say it however it comes out…" aria-label="Talk to Wick"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button onClick={send}>Send</button>
          </div>
        </div>
      </div>
      {memOpen && <MemoryDrawer onClose={() => setMemOpen(false)} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Wick />);
