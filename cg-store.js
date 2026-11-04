// cg-store.js — tiny IndexedDB key→value store for large binary assets
// (PDFs, full-res images). Keeps localStorage small so publishing never
// hits the ~5MB quota. Shared by Admin.html and Carter Portfolio.html.
(function () {
  const DB_NAME = 'cg_assets';
  const STORE = 'files';
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open(DB_NAME, 1); }
      catch (e) { reject(e); return; }
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function putAsset(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(key);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAsset(key) {
    if (!key) return '';
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const rq = tx.objectStore(STORE).get(key);
      rq.onsuccess = () => resolve(rq.result || '');
      rq.onerror = () => reject(rq.error);
    });
  }

  async function delAsset(key) {
    if (!key) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── Whole-site data (the CMS payload) ────────────────────────────
  // Stored in IndexedDB (effectively unlimited) instead of localStorage
  // (~5MB and silently lossy). localStorage is kept only as a small
  // legacy/fallback mirror so first-run / older saves still load.
  const SITE_DATA_KEY = '__cg_site_data__';
  const LS_KEY = 'cg_site_data';

  async function saveSite(data) {
    const json = JSON.stringify(data);
    let ok = false;
    try { await putAsset(SITE_DATA_KEY, json); ok = true; } catch (e) { /* IDB unavailable */ }
    // best-effort mirror; ignore quota errors — IndexedDB is the source of truth
    try { localStorage.setItem(LS_KEY, json); }
    catch (e) { if (!ok) throw e; }
    return ok;
  }

  async function loadSite() {
    // prefer IndexedDB, fall back to the legacy localStorage mirror
    try { const v = await getAsset(SITE_DATA_KEY); if (v) return JSON.parse(v); } catch (e) {}
    try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }

  async function listAssetKeys() {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE, 'readonly');
        const rq = tx.objectStore(STORE).getAllKeys();
        rq.onsuccess = () => resolve(rq.result || []);
        rq.onerror = () => resolve([]);
      } catch (e) { resolve([]); }
    });
  }

  // ── Content fixes applied on load ───────────────────────────────
  // Sept 2026 promotion at Log & Timber Worx. A résumé saved from the admin
  // before then still says "Marketing Assistant, Oct 2025 to Present" and
  // would override data.jsx. If so, close out that role and add the new one
  // above it. Idempotent: does nothing once the Lead role is present, and
  // leaves every other entry (and any later admin edit) alone.
  const LTW_LEAD = {
    role: 'Marketing and Automation Lead', company: 'Log & Timber Worx', dates: 'Sep 2026 to Present',
    city: 'Harrisonburg, VA', promoted: 'Promoted from Marketing Assistant',
    bullets: [
      'Lead marketing for a log-home restoration company across social, email, paid search, and direct mail.',
      'Build the operations tools the office and field crews run on, from scheduling to customer calls to job checklists.',
    ],
  };
  function migrateResume(resume) {
    if (!Array.isArray(resume)) return resume;
    if (resume.some((r) => r && /marketing and automation lead/i.test(r.role || ''))) return resume;
    const i = resume.findIndex((r) => r && /log\s*&\s*timber/i.test(r.company || '') && /marketing assistant/i.test(r.role || ''));
    if (i === -1) return resume;
    const out = resume.slice();
    out[i] = { ...out[i], dates: String(out[i].dates || '').replace(/present/i, 'Sep 2026') };
    out.splice(i, 0, { ...LTW_LEAD, bullets: LTW_LEAD.bullets.slice() });
    return out;
  }

  window.CGStore = { putAsset, getAsset, delAsset, saveSite, loadSite, listAssetKeys, migrateResume };
})();
