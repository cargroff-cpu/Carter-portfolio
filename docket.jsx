// docket.jsx — The Docket. Priority is placement: which of the four quadrant
// columns a task sits in IS its priority, no separate priority field. Tasks
// live in the Supabase table docket_tasks.
const { fetchDocketTasks, saveDocketTask } = window.CC;

const QUADS = [
  ['q1', 'Now', 'Urgent and important'],
  ['q2', 'Chores', 'Urgent, but small'],
  ['q3', 'Plan it', 'Important, not urgent'],
  ['q4', 'Someday', 'Neither'],
];
// docket_tasks still has a brand column from the old design; every task is 'me'.
const BRAND = 'me';

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

// The date label doubles as the due-date picker (a native date input laid
// over it), and on touch screens a small menu moves the task between
// columns, since phones don't do drag and drop. Neither clears the task.
function Task({ t, onDragStart, onDragEnd, onClear, onSetDue, onMove, dragging }) {
  const w = when(t);
  const stop = (e) => e.stopPropagation();
  return (
    <div className={'task' + (dragging ? ' dragging' : '')} draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); onDragStart(t.id); }}
      onDragEnd={onDragEnd}
      onClick={onClear}
      title="Click to clear, drag to reorder or move column">
      <span className="t">{t.t}</span>
      {t.job_id && <a className="tjob" href={'/business#job=' + t.job_id} onClick={stop} title="Open this job in the Business Hub">job</a>}
      <span className="side" onClick={stop}>
        <label className={'when ' + w.cls} title={t.due ? 'Change or clear the due date' : 'Set a due date'}>
          {t.due ? w.txt : <React.Fragment>{w.txt}<i className="setdue"> · due?</i></React.Fragment>}
          <input type="date" className="duepick" value={t.due || ''} aria-label={'Due date for ' + t.t}
            onChange={(e) => onSetDue(t.id, e.target.value || null)} />
        </label>
        <select className="mover" value={t.q} aria-label={'Move ' + t.t} onChange={(e) => onMove(t.id, e.target.value)}>
          {QUADS.map(([q, label]) => <option key={q} value={q}>{label}</option>)}
        </select>
      </span>
    </div>
  );
}

function Column({ q, label, axis, tasks, onAdd, onDragStart, onDragEnd, onDrop, draggingId }) {
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
              onClear={() => onAdd.clear(t.id)} onSetDue={onAdd.setDue} onMove={(id, qq) => onDrop(id, qq, null)} />
          </React.Fragment>
        ))}
        {gapIndex === tasks.length && <div className="gap" />}
        <div className="add">
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
  const [draggingId, setDraggingId] = React.useState(null);
  const [saveErr, setSaveErr] = React.useState('');
  // A task added a moment ago has a temporary id until Supabase answers;
  // writes to it wait for the real one.
  const pendingIds = React.useRef({});
  const realId = (id) => pendingIds.current[id] || Promise.resolve(id);

  React.useEffect(() => {
    fetchDocketTasks().then((rows) => setTasks(rows)).catch(() => setSaveErr('Could not load the Docket. Reload to try again.')).finally(() => setLoading(false));
  }, []);

  // Every write goes through here, so a failed save is visible, not silent.
  const persist = (id, changes) => realId(id)
    .then((rid) => saveDocketTask({ id: rid, ...changes }))
    .catch(() => setSaveErr('A change did not save. Reload to see what is stored.'));

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const patch = (id, changes) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const clearTask = (id, doneVal) => {
    patch(id, { done: doneVal });
    persist(id, { done: doneVal });
  };

  const reindex = (q, list) => {
    const inQ = list.filter((t) => t.q === q && !t.done).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const ranked = {};
    inQ.forEach((t, i) => { ranked[t.id] = i; });
    return list.map((t) => (ranked[t.id] != null ? { ...t, rank: ranked[t.id] } : t));
  };

  const addTask = (q, text) => {
    const newTask = {
      id: 'local-' + Math.random().toString(36).slice(2), brand: BRAND, q, t: text,
      due: null, made: todayStr(), rank: -1, done: false,
    };
    setTasks((prev) => reindex(q, [newTask, ...prev]));
    pendingIds.current[newTask.id] = saveDocketTask({ brand: BRAND, q, t: text, due: null, made: todayStr(), rank: -1, done: false })
      .then((res) => {
        // swap the optimistic local id for the real one from Supabase
        const rid = res && res.row && res.row.id;
        if (!rid) throw new Error('no id');
        setTasks((prev) => prev.map((t) => (t.id === newTask.id ? { ...t, id: rid } : t)));
        return rid;
      })
      .catch((e) => { setSaveErr('That task did not save. Reload to see what is stored.'); throw e; });
    pendingIds.current[newTask.id].catch(() => {});
  };
  addTask.clear = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (t) clearTask(id, !t.done);
  };
  addTask.setDue = (id, due) => {
    patch(id, { due });
    persist(id, { due });
  };

  // Moving one task re-ranks its whole column, so every task whose rank
  // changed is saved, not just the one that moved; otherwise the order
  // resets on reload.
  const onDrop = (id, q, gapIndex) => {
    const prev = tasks;
    const moving = prev.find((t) => t.id === id);
    if (!moving) return;
    let next = prev.map((t) => (t.id === id ? { ...t, q, done: false } : t));
    const inQ = next.filter((t) => t.q === q && !t.done && t.id !== id).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const idx = gapIndex == null ? inQ.length : Math.min(gapIndex, inQ.length);
    inQ.splice(idx, 0, { ...moving, q });
    const ranked = {};
    inQ.forEach((t, i) => { ranked[t.id] = i; });
    next = next.map((t) => (ranked[t.id] != null ? { ...t, rank: ranked[t.id] } : t));
    setTasks(next);
    persist(id, { q, done: false, rank: ranked[id] });
    for (const t of prev) {
      if (t.id !== id && ranked[t.id] != null && ranked[t.id] !== t.rank) persist(t.id, { rank: ranked[t.id] });
    }
  };

  return (
    <React.Fragment>
      <header className="top">
        <div className="topin">
          <a className="backlink" href="/backroom"><i aria-hidden="true">←</i> Backroom</a>
          <a className="mark" href="/backroom">
            <img src="assets/antler.png" alt="" />
            <div><b>The Docket</b><span>The Backroom</span></div>
          </a>
        </div>
      </header>
      <main>
        {saveErr && <p className="saveerr" role="alert">{saveErr} <button type="button" onClick={() => setSaveErr('')}>Dismiss</button></p>}
        <div className="filterbar">
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
                  onAdd={Object.assign((qq, text) => addTask(qq, text), { clear: addTask.clear, setDue: addTask.setDue })}
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
                    <span className="t">{t.t}</span>
                  </button>
                ))}
              </div>
            </section>
            <div className="legend">
              <span>Drag between columns to change what it is worth</span>
              <span>Drag up or down to rank it</span>
              <span>Click a line to clear it</span>
              <span>Click its date to set when it is due</span>
            </div>
          </React.Fragment>
        )}
      </main>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Docket />);
