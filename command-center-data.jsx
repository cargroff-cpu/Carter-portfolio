// command-center-data.jsx — the Backroom's data layer: reads through
// /api/scaffold-read and plain writes through /api/scaffold-write (both
// server-side, behind the session; the browser holds no Supabase key), plus
// the workflow actions in /api/job.js and the brief triage in
// /api/brief-reply.js. Used by the Backroom hub, the Docket and the
// Business Hub. (The old marketing board's brand kits, campaigns, links and
// Pipedrive goals were removed with the 2026-11-06 workflow.)

async function ccFetch(path) {
  const res = await fetch(`/api/scaffold-read?q=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Read failed: ${path.split('?')[0]} (${res.status})`);
  return res.json();
}
function ccWrite(table, row) {
  return fetch('/api/scaffold-write', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, row }),
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Could not save ${table}`);
    return data;
  });
}
function ccDelete(table, id) {
  return fetch('/api/scaffold-write', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, deleteId: id }),
  }).then((res) => { if (!res.ok) throw new Error(`Could not delete from ${table}`); return res.json(); });
}
function post(url, body) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    });
}

// ── Docket ───────────────────────────────────────────────────────────
const fetchDocketTasks = () => ccFetch('docket_tasks?select=*&order=rank.asc');
const saveDocketTask = (row) => ccWrite('docket_tasks', row);

// ── Clients and money ────────────────────────────────────────────────
const fetchClients = () => ccFetch('clients?select=*&order=name.asc');
const saveClient = (row) => ccWrite('clients', row);
const deleteClient = (id) => ccDelete('clients', id);
// Fold one client into another on the server (api/scaffold-write.js): jobs,
// invoices, history and tasks move across, then the old client goes. Emails
// are unique, so this has to happen server-side in the right order.
const mergeClientsOnServer = (from, into) => post('/api/scaffold-write', { mergeClients: { from, into } });
const fetchInvoices = () => ccFetch('invoices?select=*&order=created_at.desc');
const saveInvoice = (row) => ccWrite('invoices', row);

// ── Jobs: brief to paid ──────────────────────────────────────────────
const fetchJobs = () => ccFetch('jobs?select=*&order=last_activity_at.desc');
const saveJob = (row) => ccWrite('jobs', row);
const fetchProposals = () => ccFetch('proposals?select=*&order=updated_at.desc');
const saveProposal = (row) => ccWrite('proposals', row);
const fetchJobFiles = (jobId) => ccFetch(`job_files?select=*&job_id=eq.${jobId}&order=created_at.asc`);
const fetchJobEvents = (jobId) => ccFetch(`job_events?select=*&job_id=eq.${jobId}&order=created_at.desc`);
const fetchAllEvents = (limit = 200) => ccFetch(`job_events?select=*&order=created_at.desc&limit=${limit}`);
const saveJobEvent = (row) => ccWrite('job_events', row);
const jobAction = (jobId, action, extra = {}) => post('/api/job', { job_id: jobId, action, ...extra });

// Upload a draft or final straight to private storage, then record it.
async function uploadJobFile(jobId, file, { kind, round, label }) {
  const { path, url } = await jobAction(jobId, 'upload-url', { filename: file.name });
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' }, body: file });
  if (!put.ok) throw new Error('The upload failed.');
  return jobAction(jobId, 'add-file', { kind, round, label: label || file.name, storage_path: path, filename: file.name, content_type: file.type });
}

// ── Follow-up tasks ──────────────────────────────────────────────────
// crm_tasks comes from supabase/migrations/20261108_crm_tasks_fields.sql. Until
// that is run the read fails; this hands back an empty list flagged notReady
// so the Hub shows a setup note and not an error.
const fetchTasks = () => ccFetch('crm_tasks?select=*&order=due_on.asc.nullslast,created_at.desc')
  .catch(() => { const a = []; a.notReady = true; return a; });
const saveTask = (row) => ccWrite('crm_tasks', row);
const deleteTask = (id) => ccDelete('crm_tasks', id);

// ── Briefs ───────────────────────────────────────────────────────────
const fetchDesignBriefs = () => ccFetch('design_briefs?select=*&order=created_at.desc');
const saveDesignBrief = (row) => ccWrite('design_briefs', row);
const fetchDesignBriefAttachments = (briefId) => ccFetch(`design_brief_attachments?select=*&design_brief_id=eq.${briefId}`);
// AI triage on a brief (api/brief-reply.js): 'triage' re-runs it, 'send'
// emails the (edited) reply and marks it answered, 'reject' marks it answered.
const briefAction = (id, action, extra = {}) => post('/api/brief-reply', { id, action, ...extra });

window.CC = {
  fetchDocketTasks, saveDocketTask,
  fetchClients, saveClient, deleteClient, mergeClientsOnServer, fetchInvoices, saveInvoice,
  fetchJobs, saveJob, fetchProposals, saveProposal, fetchJobFiles, fetchJobEvents, fetchAllEvents, saveJobEvent,
  jobAction, uploadJobFile,
  fetchTasks, saveTask, deleteTask,
  fetchDesignBriefs, saveDesignBrief, fetchDesignBriefAttachments, briefAction,
};
