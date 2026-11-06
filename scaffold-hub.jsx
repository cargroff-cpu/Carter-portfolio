// scaffold-hub.jsx — The Scaffold's entry point, recreated in React from
// the Scaffold Hub mock. The sconce stays as the room's light
// (Wick itself is retired, so it is decoration only) and the page routes to the Business Hub first, one Website Backends door that asks
// which site (Portfolio: Admin.html, Scaffold: /backroom/scaffold), and the Docket.
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

// Ends the session (clears the cookie) and returns to the sign-in page.
function signOut() {
  fetch('/api/logout', { method: 'POST' }).catch(() => {}).finally(() => { location.href = '/login.html'; });
}

function ScaffoldHub() {
  const [picking, setPicking] = React.useState(false);
  const [locked, setLocked] = React.useState(() => new URLSearchParams(location.search).get('lock') === '1');
  const [docketLine, setDocketLine] = React.useState('Open the board');

  React.useEffect(() => {
    fetchDocketTasks().then((rows) => {
      const open = rows.filter((r) => !r.done);
      const now = open.filter((r) => r.q === 'q1').length;
      if (open.length) setDocketLine(open.length + ' open' + (now ? ', ' + now + ' now' : ''));
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!picking) return;
    const onKey = (e) => { if (e.key === 'Escape') setPicking(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picking]);

  React.useEffect(() => {
    if (!locked) return;
    const onKey = (e) => { if (e.key === 'Escape') setLocked(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked]);

  return (
    <React.Fragment>
      <div className="stage" style={locked ? { filter: 'blur(9px) brightness(.4)' } : undefined}>
        <div className="fog" />
        <div className="antler"><img src="assets/antler.png" alt="Carter Groff" /></div>

        {/* The sconce: the room's light. Wick is retired, so it is decoration
            only (no link, no label, no hover). */}
        <div className="sconce" aria-hidden="true">
          <span className="tube">
            <span className="core" />
            <span className="wall" />
            <span className="embers">
              <i style={{ left: '14%', '--dx': '-16px', animationDelay: '0s' }} />
              <i style={{ left: '38%', '--dx': '12px', animationDelay: '.7s' }} />
              <i style={{ left: '56%', '--dx': '-9px', animationDelay: '1.5s' }} />
              <i style={{ left: '76%', '--dx': '18px', animationDelay: '2.3s' }} />
              <i style={{ left: '48%', '--dx': '4px', animationDelay: '3.1s' }} />
            </span>
          </span>
        </div>

        <div className="plaque">The Backroom</div>
        <h1 className="greet">{hail()}, <em>Carter</em>.</h1>

        <div className="pair">
          <a className="door" href="/business">
            <span className="no">01</span>
            <h2>Business<br />Hub</h2>
            <p>Clients, leads, projects, invoices, notes, and the Design-briefs inbox.</p>
            <span className="arrow">→</span>
          </a>
          <button type="button" className="door" onClick={() => setPicking(true)} aria-haspopup="dialog">
            <span className="no">02</span>
            <h2>Website<br />Backends</h2>
            <p>Edit the copy and content for cargroff.com or scaffold.cargroff.com.</p>
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="aside">
          <a href="/docket"><span className="k">The Docket</span><span className="n">{docketLine}</span></a>
        </div>

        <div className="foot">
          <a href="/">← Portfolio</a>
          <button onClick={() => setLocked(true)}>Lock screen</button>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
      {picking && !locked && (
        <div className="pick" role="dialog" aria-modal="true" aria-label="Which website?" onMouseDown={(e) => { if (e.target === e.currentTarget) setPicking(false); }}>
          <div className="pickbox">
            <div className="plaque" style={{ margin: 0, animation: 'none' }}>Which website?</div>
            <div className="pickpair">
              <a className="door" href="Admin.html" autoFocus>
                <span className="no">cargroff.com</span>
                <h2>Portfolio</h2>
                <p>Copy, work, resume and travel pins.</p>
                <span className="arrow">→</span>
              </a>
              <a className="door" href="/backroom/scaffold">
                <span className="no">scaffold.cargroff.com</span>
                <h2>Scaffold</h2>
                <p>Services, prices, How it works, questions and copy.</p>
                <span className="arrow">→</span>
              </a>
            </div>
            <button type="button" className="pickx" onClick={() => setPicking(false)}>Close</button>
          </div>
        </div>
      )}
      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ScaffoldHub />);
