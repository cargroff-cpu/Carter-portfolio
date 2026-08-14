// app.jsx — Render Portfolio full-bleed, once saved data has loaded.
const Portfolio = window.CG_Portfolio;
const __mount = () => ReactDOM.createRoot(document.getElementById('root')).render(<Portfolio />);
(window.CG_READY || Promise.resolve()).then(__mount, __mount);
