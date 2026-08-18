// docket.jsx — The Docket, recreated in React from design-reference/The
// Docket.html. Priority is placement: which of the four quadrant columns a
// task sits in IS its priority, no separate priority field. Real Supabase
// table (docket_tasks) instead of the prototype's localStorage.
const { fetchDocketTasks, saveDocketTask } = window.CC;

const QUADS = [
  ['q1', 'Now', 'Urgent and important'],
  ['q2', 'Chores', 'Urgent, but small'],
  ['q3', 'Plan it', 'Important, not urgent'],
  ['q4', 'Someday', 'Neither'],
];
const BR = { ltw: 'LTW', sq: 'Squeeky', me: 'Personal' };

const ymd = (s) => { const [y, m, d] = String(s).split('-'); return new Date(+y, +m - 1, +d); };
const days = (a, b) => Math.round(((b instanceof Date ? b : ymd(b)) - (a instanceof Date ? a : ymd(a))) / 864e5);
const today = () => new Date();
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function when(t) {
  if (t.due) {
    const d = days(today(), t.due);
    if (d < 0) return { txt: Math.abs(d) + 'd late', cls: 'late' };
    if (d === 0) return { txt: 'today', cls: 'late' };
    if (d <= 4) return { txt: 'in ' + d + 'd', cls: 'soon' };
    return { txt: ymd(t.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cls: '' };
  }
  return { txt: days(t.made, today()) + 'd old', cls: '' };
}

function Task({ t, onDragStart, onDragEnd, onClear, dragging }) {
  const w = when(t);
  return (
    <div className={'task' + (dragging ? ' dragging' : '')} draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); onDragStart(t.id); }}
      onDragEnd={onDragEnd}
      onClick={onClear}
      title="Click to clear, drag to reorder or move column">
      <span className={'dot ' + t.brand} title={BR[t.brand]} />
      <span className="t">{t.t}</span>
      <span className={'when ' + w.cls}>{w.txt}</span>
    </div>
  );
}

function Column({ q, label, axis, tasks, addBrand, setAddBrand, onAdd, onDragStart, onDragEnd, onDrop, draggingId }) {
  const [over, setOver] = React.useState(false);
  const [gapIndex, setGapIndex] = React.useState(null);
  const listRef = React.useRef(null);
  const [val, setVal] = React.useState('');

  const onDragOver = (e) => {
    e.preventDefault();
    setOver(true);
    const rows = Array.from(listRef.current.querySelectorAll('.task:not(.dragging)'));
    let idx = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const b = rows[i].getBoundingClientRect();
      if (e.clientY < b.top + b.height / 2) { idx = i; break; }
    }
    setGapIndex(idx);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) { setOver(false); setGapIndex(null); }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData('text/plain');
    onDrop(id, q, gapIndex);
    setGapIndex(null);
  };

  const submit = (e) => {
    if (e.key !== 'Enter') return;
    const v = val.trim(); if (!v) return;
    onAdd(q, v);
    setVal('');
  };

  return (
    <section className={'col ' + q + (over ? ' over' : '')}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={handleDrop}>
      <div className="colhead">
        <div className="colline"><h2>{label}</h2><span className="n">{tasks.length}</span><span className="hint">Drop here</span></div>
        <span className="axis">{axis}</span>
      </div>
      <div className="rail" />
      <div className="list" ref={listRef}>
        {tasks.length === 0 && gapIndex == null && <p className="empty">Nothing here.</p>}
        {tasks.map((t, i) => (
          <React.Fragment key={t.id}>
            {gapIndex === i && <div className="gap" />}
            <Task t={t} dragging={draggingId === t.id}
              onDragStart={onDragStart} onDragEnd={onDragEnd}
              onClear={() => onAdd.clear(t.id)} />
          </React.Fragment>
        ))}
        {gapIndex === tasks.length && <div className="gap" />}
        <div className="add">
          <span className="pick">
            {Object.keys(BR).map((k) => (
              <button key={k} type="button" aria-pressed={addBrand === k} title={BR[k]} onClick={() => setAddBrand(k)}>
                <span className={'dot ' + k} />
              </button>
            ))}
          </span>
          <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={submit}
            placeholder={'Add' + (q === 'q1' ? ' something urgent' : q === 'q4' ? ' for later' : '') + '…'}
            aria-label={'New task in ' + label} />
        </div>
      </div>
    </section>
  );
}

function Docket() {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [show, setShow] = React.useState({ ltw: true, sq: true, me: true });
  const [addBrand, setAddBrand] = React.useState('ltw');
  const [draggingId, setDraggingId] = React.useState(null);

  React.useEffect(() => {
    fetchDocketTasks().then((rows) => setTasks(rows)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const vis = tasks.filter((t) => show[t.brand]);
  const open = vis.filter((t) => !t.done);
  const done = vis.filter((t) => t.done);

  const patch = (id, changes) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const clearTask = (id, doneVal) => {
    patch(id, { done: doneVal });
    saveDocketTask({ id, done: doneVal }).catch(() => {});
  };

  const reindex = (q, list) => {
    const inQ = list.filter((t) => t.q === q && !t.done).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const ranked = {};
    inQ.forEach((t, i) => { ranked[t.id] = i; });
    return list.map((t) => (ranked[t.id] != null ? { ...t, rank: ranked[t.id] } : t));
  };

  const addTask = (q, text) => {
    const newTask = {
      id: 'local-' + Math.random().toString(36).slice(2), brand: addBrand, q, t: text,
      due: null, made: todayStr(), rank: -1, done: false,
    };
    setTasks((prev) => reindex(q, [newTask, ...prev]));
    saveDocketTask({ brand: addBrand, q, t: text, due: null, made: todayStr(), rank: -1, done: false })
      .then((res) => {
        // swap the optimistic local id for the real one from Supabase
        if (res && res.row && res.row.id) {
          setTasks((prev) => prev.map((t) => (t.id === newTask.id ? { ...t, id: res.row.id } : t)));
        }
      })
      .catch(() => {});
  };
  addTask.clear = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (t) clearTask(id, !t.done);
  };

  const onDrop = (id, q, gapIndex) => {
    setTasks((prev) => {
      const moving = prev.find((t) => t.id === id);
      if (!moving) return prev;
      let next = prev.map((t) => (t.id === id ? { ...t, q, done: false } : t));
      const inQ = next.filter((t) => t.q === q && !t.done && t.id !== id).sort((a, b) => (a.rank || 0) - (b.rank || 0));
      const idx = gapIndex == null ? inQ.length : Math.min(gapIndex, inQ.length);
      inQ.splice(idx, 0, { ...moving, q });
      const ranked = {};
      inQ.forEach((t, i) => { ranked[t.id] = i; });
      next = next.map((t) => (ranked[t.id] != null ? { ...t, rank: ranked[t.id] } : t));
      const movedFinal = next.find((t) => t.id === id);
      saveDocketTask({ id, q, done: false, rank: movedFinal.rank }).catch(() => {});
      return next;
    });
  };

  return (
    <React.Fragment>
      <header className="top">
        <div className="topin">
          <a className="mark" href="/scaffold">
            <img src="assets/antler.png" alt="" />
            <div><b>The Docket</b><span>The Scaffold</span></div>
          </a>
          <nav className="topnav">
            <a href="/wick">Wick</a>
            <a href="/scaffold">Hub</a>
          </nav>
        </div>
      </header>
      <main>
        <div className="filterbar">
          <span className="lbl">Showing</span>
          <div className="seg">
            {Object.keys(BR).map((b) => (
              <button key={b} type="button" aria-pressed={show[b]} onClick={() => setShow((s) => ({ ...s, [b]: !s[b] }))}>
                <span className={'dot ' + b} />{BR[b]}
              </button>
            ))}
          </div>
          <div className="tally">
            <span>Now<b className="hot">{open.filter((t) => t.q === 'q1').length}</b></span>
            <span>Open<b>{open.length}</b></span>
            <span>Late<b>{open.filter((t) => t.due && days(today(), t.due) < 0).length}</b></span>
          </div>
        </div>
        {loading ? (
          <p className="empty" style={{ padding: '20px 2px' }}>Loading…</p>
        ) : (
          <React.Fragment>
            <div className="board">
              {QUADS.map(([q, label, axis]) => (
                <Column key={q} q={q} label={label} axis={axis}
                  tasks={open.filter((t) => t.q === q).sort((a, b) => (a.rank || 0) - (b.rank || 0))}
                  addBrand={addBrand} setAddBrand={setAddBrand}
                  onAdd={Object.assign((qq, text) => addTask(qq, text), { clear: addTask.clear })}
                  onDragStart={setDraggingId} onDragEnd={() => setDraggingId(null)}
                  onDrop={onDrop} draggingId={draggingId} />
              ))}
            </div>
            <section className="cleared">
              <div className="between"><h2>Cleared</h2><span className="lbl">{done.length ? done.length + ' this month' : ''}</span></div>
              <div className="clist">
                {done.length === 0 && <p className="empty">Nothing cleared yet.</p>}
                {done.map((t) => (
                  <button key={t.id} title="Put it back" onClick={() => clearTask(t.id, false)}>
                    <span className={'dot ' + t.brand} /><span className="t">{t.t}</span>
                  </button>
                ))}
              </div>
            </section>
            <div className="legend">
              <span>Drag between columns to change what it is worth</span>
              <span>Drag up or down to rank it</span>
              <span>Click a line to clear it</span>
            </div>
          </React.Fragment>
        )}
      </main>
      <wick-assistant screen="docket"></wick-assistant>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Docket />);
