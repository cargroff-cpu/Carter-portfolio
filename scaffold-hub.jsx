// scaffold-hub.jsx — The Scaffold's entry point, recreated in React from
// design-reference/Scaffold Hub.html. Establishes Wick's presence (the
// sconce) and routes to the existing Website Backend (Admin.html) and the
// Docket.
const { fetchDocketTasks } = window.CC;

function hail() {
  const h = new Date().getHours();
  return h < 5 ? 'Late one' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

function LockScreen({ onUnlock }) {
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { setTimeout(() => inputRef.current && inputRef.current.focus(), 80); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true); setErr('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) { onUnlock(); return; }
      setErr('Wrong password.');
    } catch (e2) {
      setErr('Something went wrong — try again.');
    }
    setChecking(false);
  };

  return (
    <div className="lock" role="dialog" aria-modal="true" aria-label="Locked">
      <div className="lockbox">
        <img src="assets/antler.png" alt="" />
        <h2>The Scaffold</h2>
        <div className="sub">Private</div>
        <form className="lockrow" onSubmit={submit}>
          <input ref={inputRef} className="p-field" type="password" placeholder="Password"
            autoComplete="current-password" aria-label="Password"
            value={pw} onChange={(e) => setPw(e.target.value)} />
          {err && <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--terracotta, #b8643f)' }}>{err}</div>}
          <button className="p-btn" type="submit" disabled={checking}>{checking ? 'Checking…' : 'Unlock'}</button>
        </form>
      </div>
    </div>
  );
}

function ScaffoldHub() {
  const [locked, setLocked] = React.useState(() => new URLSearchParams(location.search).get('lock') === '1');
  const [docketLine, setDocketLine] = React.useState('Open the board');
  const [wickNear, setWickNear] = React.useState(false);

  React.useEffect(() => {
    fetchDocketTasks().then((rows) => {
      const open = rows.filter((r) => !r.done);
      const now = open.filter((r) => r.q === 'q1').length;
      if (open.length) setDocketLine(open.length + ' open' + (now ? ', ' + now + ' now' : ''));
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!locked) return;
    const onKey = (e) => { if (e.key === 'Escape') setLocked(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked]);

  return (
    <React.Fragment>
      <div className={'stage' + (wickNear ? ' wick-near' : '')} style={locked ? { filter: 'blur(9px) brightness(.4)' } : undefined}>
        <div className="fog" />
        <div className="antler"><img src="assets/antler.png" alt="Carter Groff" /></div>

        <a className="sconce" href="/wick" aria-label="Talk to Wick"
          onMouseEnter={() => setWickNear(true)} onMouseLeave={() => setWickNear(false)}>
          <span className="tag">Wick</span>
          <span className="tube">
            <span className="core" />
            <span className="wall" />
            <span className="embers" aria-hidden="true">
              <i style={{ left: '14%', '--dx': '-16px', animationDelay: '0s' }} />
              <i style={{ left: '38%', '--dx': '12px', animationDelay: '.7s' }} />
              <i style={{ left: '56%', '--dx': '-9px', animationDelay: '1.5s' }} />
              <i style={{ left: '76%', '--dx': '18px', animationDelay: '2.3s' }} />
              <i style={{ left: '48%', '--dx': '4px', animationDelay: '3.1s' }} />
            </span>
          </span>
        </a>

        <div className="plaque">The Scaffold</div>
        <h1 className="greet">{hail()}, <em>Carter</em>.</h1>

        <div className="pair">
          <a className="door" href="Admin.html">
            <span className="no">01</span>
            <h2>Website<br />Backend</h2>
            <p>Copy, work, resume, travel pins, everything the public side reads from.</p>
            <span className="arrow">→</span>
          </a>
        </div>

        <div className="aside">
          <a href="/docket"><span className="k">The Docket</span><span className="n">{docketLine}</span></a>
        </div>

        <div className="foot">
          <a href="/">← Portfolio</a>
          <button onClick={() => setLocked(true)}>Lock screen</button>
        </div>
      </div>
      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ScaffoldHub />);
