// api/job.js — the job workflow's one endpoint.
//
// Two kinds of caller:
//
//   The client, from their private link (/j/<token>). The token IS the key:
//   no login, same model as a "pay" or "pick your colors" link. Loading the
//   page (GET) never changes anything, because mail scanners open links; only
//   a button press (POST) does. Client actions: accept the proposal, pick a
//   direction, ask for changes, approve the final, pay an invoice. Each one
//   is recorded on the job and emailed to Carter.
//
//   Carter, from the Back Room (needs the Back Room session cookie): send a
//   branded email to the client (which also moves the job to its next stage),
//   get an upload URL for a draft or final file, and record a file or link.
//
// Billing per job: 'split' = 50% deposit on accept, 50% on approval;
// 'end' = one invoice on approval. Payment links are made when the client
// presses Pay (lib/stripe.js). Tables and buckets: supabase/migrations/
// 20261106_workflow.sql. Kept to one function so the site stays well under
// Vercel's function limit.

import { sb, SUPABASE_URL, sbHeaders, sendEmail, parseBody, NOTIFY_EMAIL, FROM_VERIFIED, FROM_INTERNAL } from '../lib/server.js';
import { verifySessionToken, SESSION_COOKIE } from '../lib/session.js';
import { renderEmail, jobUrl } from '../lib/mail.js';
import { paymentLinkFor } from '../lib/stripe.js';
import { clientIp, hit } from '../lib/rate-limit.js';

const FILES_BUCKET = 'job-files';
const RATE = { limit: 30, windowMs: 10 * 60 * 1000 };
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const now = () => new Date().toISOString();
const str = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isToken = (t) => typeof t === 'string' && /^[a-f0-9]{24,64}$/.test(t);
const isId = (t) => typeof t === 'string' && /^[0-9a-f-]{36}$/.test(t);

function cookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function storageSign(path, body) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/${path}`, { method: 'POST', headers: sbHeaders(), body: JSON.stringify(body || {}) });
  const text = await r.text();
  if (!r.ok) throw new Error(`Storage ${r.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}
async function signedDownload(path) {
  const j = await storageSign(`object/sign/${FILES_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`, { expiresIn: 60 * 60 * 6 });
  return `${SUPABASE_URL}/storage/v1${j.signedURL}`;
}

async function loadJob(where) {
  const [job] = await sb(`jobs?${where}&select=*&limit=1`);
  return job || null;
}
async function event(job, kind, who, body, meta) {
  await sb('job_events', { method: 'POST', body: { job_id: job.id, kind, who, body: body || null, meta: meta || null } }).catch(() => {});
  await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { last_activity_at: now(), updated_at: now() } }).catch(() => {});
}
async function tellCarter(job, subject, lines) {
  const { html, text } = renderEmail({
    heading: subject,
    body: [...lines, '', `Job: ${job.title} (${job.name}${job.business ? ', ' + job.business : ''})`, `Open it in the Back Room: https://scaffold.cargroff.com/business#job=${job.id}`].join('\n'),
  });
  await sendEmail({ to: NOTIFY_EMAIL, from: FROM_INTERNAL, replyTo: job.email || undefined, subject: `${subject}: ${job.title}`, text, html }).catch(() => {});
}

// What the client's page shows. Nothing secret: no notes, no history, only
// what was sent to them.
async function clientView(job) {
  const [proposal] = await sb(`proposals?job_id=eq.${job.id}&select=summary,items,timeline,terms,total,billing,status,sent_at,accepted_at`);
  const files = await sb(`job_files?job_id=eq.${job.id}&select=id,kind,round,label,url,storage_path,filename,content_type,created_at&order=created_at.asc`);
  const invoices = await sb(`invoices?job_id=eq.${job.id}&status=neq.draft&select=id,label,amount,status,paid_at&order=created_at.asc`);
  const withLinks = [];
  for (const f of files) {
    let href = f.url || null;
    if (!href && f.storage_path) { try { href = await signedDownload(f.storage_path); } catch (e) { href = null; } }
    withLinks.push({ id: f.id, kind: f.kind, round: f.round, label: f.label || f.filename || 'File', href, type: f.content_type || '', linked: !!f.url });
  }
  const showProposal = proposal && proposal.status !== 'draft';
  // Drafts show once the job is past "proposed"; finals once it is at "final".
  const stageIdx = ['new', 'proposed', 'drafts', 'final', 'paid'].indexOf(job.stage);
  const drafts = stageIdx >= 2 ? withLinks.filter((f) => f.kind === 'draft') : [];
  const finals = stageIdx >= 3 ? withLinks.filter((f) => f.kind === 'final') : [];
  const lastFinalRound = finals.reduce((m, f) => Math.max(m, f.round), 0);
  return {
    job: {
      title: job.title, name: job.name, business: job.business, stage: job.stage, billing: job.billing,
      revisions_included: job.revisions_included, revisions_used: job.revisions_used,
      picked_file_id: job.picked_file_id, approved: !!job.approved_at,
    },
    proposal: showProposal ? proposal : null,
    drafts,
    finals: finals.filter((f) => f.round === lastFinalRound),
    invoices,
  };
}

async function clientAction(req, res, body) {
  if (!hit('job', clientIp(req), RATE)) return res.status(429).json({ error: 'Too many requests. Wait a minute and try again.' });
  if (!isToken(body.t)) return res.status(404).json({ error: 'This link is not valid.' });
  const job = await loadJob(`token=eq.${body.t}`);
  if (!job || job.stage === 'closed') return res.status(404).json({ error: 'This link is not valid.' });
  const comment = str(body.comment, 2000);
  const a = body.action;

  if (a === 'accept') {
    const [p] = await sb(`proposals?job_id=eq.${job.id}&select=*`);
    if (!p || p.status !== 'sent') return res.status(409).json({ error: 'There is no proposal waiting to be accepted.' });
    await sb(`proposals?id=eq.${p.id}`, { method: 'PATCH', body: { status: 'accepted', accepted_at: now(), updated_at: now() } });
    const patch = { stage: 'drafts', billing: p.billing, updated_at: now() };
    await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: patch });
    if (p.billing === 'split' && Number(p.total) > 0) {
      const deposit = Math.round(Number(p.total) * 50) / 100;
      await sb('invoices', { method: 'POST', body: { job_id: job.id, client_id: job.client_id, amount: deposit, label: 'Deposit (50%)', status: 'sent', sent_at: now() } });
    }
    await event(job, 'accepted', 'client', comment || 'Accepted the proposal.');
    await tellCarter(job, 'Proposal accepted', [`${job.name} accepted the proposal (${money(p.total)}, ${p.billing === 'split' ? '50% deposit now, 50% on approval' : 'paid at the end'}).`, comment ? `They wrote: ${comment}` : '']);
    return res.status(200).json({ ok: true });
  }

  if (a === 'pick') {
    if (job.stage !== 'drafts') return res.status(409).json({ error: 'There is nothing to pick right now.' });
    if (!isId(body.file_id)) return res.status(400).json({ error: 'Pick one of the directions.' });
    const [f] = await sb(`job_files?id=eq.${body.file_id}&job_id=eq.${job.id}&kind=eq.draft&select=id,label,filename`);
    if (!f) return res.status(400).json({ error: 'Pick one of the directions.' });
    await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { picked_file_id: f.id, updated_at: now() } });
    await event(job, 'picked', 'client', comment || null, { file_id: f.id, label: f.label || f.filename });
    await tellCarter(job, 'Direction picked', [`${job.name} picked "${f.label || f.filename}".`, comment ? `They wrote: ${comment}` : '']);
    return res.status(200).json({ ok: true });
  }

  if (a === 'changes') {
    if (job.stage !== 'final' || job.approved_at) return res.status(409).json({ error: 'There is nothing to review right now.' });
    if (!comment) return res.status(400).json({ error: 'Say what you would like changed.' });
    await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { revisions_used: job.revisions_used + 1, updated_at: now() } });
    await event(job, 'changes', 'client', comment, { round: job.revisions_used + 1 });
    const over = job.revisions_used + 1 > job.revisions_included;
    await tellCarter(job, 'Changes requested', [`${job.name} asked for changes (round ${job.revisions_used + 1} of ${job.revisions_included} included${over ? ', past what is included' : ''}):`, comment]);
    return res.status(200).json({ ok: true });
  }

  if (a === 'approve') {
    if (job.stage !== 'final' || job.approved_at) return res.status(409).json({ error: 'There is nothing to approve right now.' });
    const [p] = await sb(`proposals?job_id=eq.${job.id}&select=total,billing`);
    const total = p ? Number(p.total) : 0;
    const billed = (await sb(`invoices?job_id=eq.${job.id}&select=amount`)).reduce((s, i) => s + Number(i.amount || 0), 0);
    const rest = Math.round((total - billed) * 100) / 100;
    await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { approved_at: now(), updated_at: now() } });
    if (rest > 0) {
      await sb('invoices', { method: 'POST', body: { job_id: job.id, client_id: job.client_id, amount: rest, label: billed > 0 ? 'Final (50%)' : 'Full payment', status: 'sent', sent_at: now() } });
    }
    await event(job, 'approved', 'client', comment || 'Approved the final.');
    await tellCarter(job, 'Final approved', [`${job.name} approved the final.${rest > 0 ? ` The final invoice (${money(rest)}) is now on their page.` : ''}`, comment ? `They wrote: ${comment}` : '']);
    return res.status(200).json({ ok: true });
  }

  if (a === 'pay') {
    if (!isId(body.invoice_id)) return res.status(400).json({ error: 'Choose an invoice to pay.' });
    const [inv] = await sb(`invoices?id=eq.${body.invoice_id}&job_id=eq.${job.id}&select=*`);
    if (!inv || inv.status === 'draft') return res.status(404).json({ error: 'That invoice is not ready.' });
    if (inv.status === 'paid') return res.status(409).json({ error: 'That invoice is already paid. Thank you.' });
    if (inv.stripe_url) return res.status(200).json({ ok: true, url: inv.stripe_url });
    try {
      const link = await paymentLinkFor(inv, { title: job.title, returnUrl: jobUrl(job.token) + '?paid=1' });
      await sb(`invoices?id=eq.${inv.id}`, { method: 'PATCH', body: { stripe_payment_link_id: link.id, stripe_url: link.url, updated_at: now() } });
      return res.status(200).json({ ok: true, url: link.url });
    } catch (e) {
      await tellCarter(job, 'Payment link failed', [`${job.name} pressed Pay on "${inv.label}" (${money(inv.amount)}) but the link could not be made:`, e.message]);
      return res.status(502).json({ error: 'Payment is not available right now. Carter has been told and will send you a link.' });
    }
  }

  return res.status(400).json({ error: 'Unknown action.' });
}

// Which stage a sent email moves the job to (never backwards).
const STAGE_FOR = { proposal: 'proposed', drafts: 'drafts', final: 'final' };
const ORDER = ['new', 'proposed', 'drafts', 'final', 'paid'];

async function adminAction(req, res, body) {
  if (!(await verifySessionToken(cookie(req, SESSION_COOKIE)))) return res.status(401).json({ error: 'Not authenticated' });
  if (!isId(body.job_id)) return res.status(400).json({ error: 'Missing job.' });
  const job = await loadJob(`id=eq.${body.job_id}`);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  const a = body.action;

  if (a === 'send') {
    const kind = ['reply', 'proposal', 'drafts', 'final', 'invoice', 'reminder', 'note'].includes(body.kind) ? body.kind : 'note';
    const subject = str(body.subject, 200), heading = str(body.heading, 200), text = str(body.body, 8000);
    if (!subject || !text) return res.status(400).json({ error: 'A subject and a message are needed.' });
    const test = !!body.test;
    if (!test && !job.email) return res.status(400).json({ error: 'This job has no client email.' });
    if (!test && !FROM_VERIFIED) return res.status(409).json({ error: 'Client email is off until RESEND_FROM is set to an address on your verified domain. Use "Send a test to me" meanwhile.' });
    if (kind === 'proposal') {
      const [p] = await sb(`proposals?job_id=eq.${job.id}&select=id,total`);
      if (!p || !(Number(p.total) > 0)) return res.status(409).json({ error: 'Write the proposal (with a price) before sending it.' });
    }
    const button = body.button === false ? null : { label: str(body.button_label, 60) || 'Open your project page', url: jobUrl(job.token) };
    const { html, text: plain } = renderEmail({ heading, body: text, button, preheader: str(body.preheader, 140) || heading });
    await sendEmail({
      from: test ? FROM_INTERNAL : FROM_VERIFIED, to: test ? NOTIFY_EMAIL : job.email, replyTo: NOTIFY_EMAIL,
      subject: test ? `[Test] ${subject}` : subject, html, text: plain,
    });
    if (test) return res.status(200).json({ ok: true, test: true });
    if (kind === 'proposal') await sb(`proposals?job_id=eq.${job.id}`, { method: 'PATCH', body: { status: 'sent', sent_at: now(), updated_at: now() } });
    const to = STAGE_FOR[kind];
    if (to && ORDER.indexOf(to) > ORDER.indexOf(job.stage)) await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { stage: to, updated_at: now() } });
    await event(job, 'email', 'me', `${subject}\n\n${text}`, { kind });
    return res.status(200).json({ ok: true });
  }

  if (a === 'upload-url') {
    const name = str(body.filename, 120).replace(/[^\w.\- ]+/g, '_') || 'file';
    const path = `${job.id}/${Date.now()}-${name}`;
    const j = await storageSign(`object/upload/sign/${FILES_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`);
    return res.status(200).json({ ok: true, path, url: `${SUPABASE_URL}/storage/v1${j.url}` });
  }

  if (a === 'add-file') {
    const kind = body.kind === 'final' ? 'final' : 'draft';
    const url = str(body.url, 1000);
    const storage_path = str(body.storage_path, 400);
    if (url && !/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Links must start with http:// or https://.' });
    if (storage_path && !storage_path.startsWith(job.id + '/')) return res.status(400).json({ error: 'That upload does not belong to this job.' });
    if (!url && !storage_path) return res.status(400).json({ error: 'Add a file or a link.' });
    const [row] = await sb('job_files', {
      method: 'POST', prefer: 'return=representation',
      body: { job_id: job.id, kind, round: Math.max(1, parseInt(body.round, 10) || 1), label: str(body.label, 120) || null, url: url || null, storage_path: storage_path || null, filename: str(body.filename, 160) || null, content_type: str(body.content_type, 120) || null },
    });
    await event(job, 'file', 'me', `${kind === 'final' ? 'Final' : 'Draft'} added: ${row.label || row.filename || row.url}`);
    return res.status(200).json({ ok: true, row });
  }

  if (a === 'brief-file') {
    if (!isId(body.attachment_id) || !job.brief_id) return res.status(400).json({ error: 'Missing file.' });
    const [att] = await sb(`design_brief_attachments?id=eq.${body.attachment_id}&design_brief_id=eq.${job.brief_id}&select=*`);
    if (!att) return res.status(404).json({ error: 'File not found.' });
    const bucket = att.bucket === 'brief-plans' ? 'brief-plans' : 'brief-uploads';
    const j = await storageSign(`object/sign/${bucket}/${att.storage_path.split('/').map(encodeURIComponent).join('/')}`, { expiresIn: 60 * 10 });
    return res.status(200).json({ ok: true, url: `${SUPABASE_URL}/storage/v1${j.signedURL}` });
  }

  if (a === 'remove-file') {
    if (!isId(body.file_id)) return res.status(400).json({ error: 'Missing file.' });
    await sb(`job_files?id=eq.${body.file_id}&job_id=eq.${job.id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action.' });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const t = typeof req.query.t === 'string' ? req.query.t : '';
      if (!isToken(t)) return res.status(404).json({ error: 'This link is not valid.' });
      const job = await loadJob(`token=eq.${t}`);
      if (!job || job.stage === 'closed') return res.status(404).json({ error: 'This link is not valid.' });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(await clientView(job));
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid JSON body.' });
    return body.job_id ? adminAction(req, res, body) : clientAction(req, res, body);
  } catch (e) {
    console.error('job api', e.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again, or reply to Carter’s email.' });
  }
}
