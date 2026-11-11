// api/design-brief.js — receives a submission from the /design brief form
// (design.jsx). Public, unauthenticated endpoint (not gated by middleware.js:
// a prospective client has no Backroom session).
//
// Order matters, and is built so a database outage can never silently eat a
// lead:
//   1. Spam checks: hidden honeypot field + per-IP rate limit.
//   2. Email Carter the FULL brief first (with its reference number).
//   3. Save the brief + a job at "new" to Supabase, then any attached files.
//   4. Triage (lib/brief-triage.js, a script, no AI): a summary and draft reply
//      for approval in the Business Hub. Never sends anything itself.
//   5. Confirmation email to the client (only once RESEND_FROM is a verified
//      domain; Resend's test sender can't reach clients).
//   6. Every attempt, success or failure, is logged to brief_events, and a
//      failed save sends Carter an alert email.
// The client sees success if the brief reached Carter by email OR database.
//
// GET /api/design-brief (also /api/health via vercel.json) is the daily
// keep-alive: one tiny query so the free-tier Supabase project never sits
// idle long enough to pause. Hit by the Vercel Cron in vercel.json. When it is
// the cron calling, it also sends the morning digest (lib/digest.js).
import { openTask, dueIn, findClientByEmail, KEYS } from '../lib/crm.js';
import { sb, sbHeaders, sendEmail, parseBody, logEvent, SUPABASE_URL, BRAND, NOTIFY_EMAIL, FROM_VERIFIED } from '../lib/server.js';
import { renderEmail } from '../lib/mail.js';
import { renderReceipt } from '../lib/receipts.js';
import { morningDigest } from '../lib/digest.js';
import { clientIp, hit } from '../lib/rate-limit.js';
import { triageAndSave } from '../lib/brief-triage.js';
import { randomUUID } from 'node:crypto';

// Keep these lists in sync with design.jsx (the form's chips and choices).
const DESIGN_SERVICES = ['Website', 'Social graphics', 'Business card or print', 'Flyer or one-pager',
  'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_SERVICES = ['Inquiries and leads', 'Quotes and invoices', 'Scheduling and bookings', 'Dashboards and reports', 'Reminders and follow-ups', 'AI assistants', 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];
const ASSETS = ['Yes', 'Some', 'No'];

const FILE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']);
const MAX_FILES = 3;
const MAX_FILE_BYTES = 2.5 * 1024 * 1024; // Vercel caps the whole request at 4.5 MB
const BUCKET = 'brief-uploads';

// The optional large plan (tools lane): the browser asks for a one-time
// upload URL, sends the file straight to private storage (Vercel caps a
// request at 4.5 MB, so it can't come through here), then submits the brief
// with the path. Up to 25 MB; documents, spreadsheets, slides, PDFs, images,
// zip.
const PLAN_BUCKET = 'brief-plans';
const PLAN_MAX_BYTES = 25 * 1024 * 1024;
const PLAN_TYPES = new Set([
  'application/pdf', 'application/zip', 'text/plain', 'text/csv', 'image/png', 'image/jpeg',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');

async function planUploadUrl(req, res, body) {
  if (!hit('plan', clientIp(req), RATE)) {
    res.status(429).json({ error: 'Too many uploads in a few minutes. Wait a bit and try again.' });
    return;
  }
  const type = typeof body.type === 'string' ? body.type : '';
  const size = Number(body.size);
  if (!PLAN_TYPES.has(type)) { res.status(400).json({ error: 'That file type is not accepted. Use a PDF, Word, Excel, PowerPoint, text, image or zip file.' }); return; }
  if (!(size > 0) || size > PLAN_MAX_BYTES) { res.status(400).json({ error: 'The plan must be 25 MB or smaller.' }); return; }
  const name = String(body.filename || 'plan').replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'plan';
  const path = `plans/${randomUUID()}-${name}`;
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${PLAN_BUCKET}/${encPath(path)}`, { method: 'POST', headers: sbHeaders(), body: '{}' });
    const j = await r.json();
    if (!r.ok || !j.url) throw new Error(JSON.stringify(j).slice(0, 200));
    res.status(200).json({ ok: true, path, url: `${SUPABASE_URL}/storage/v1${j.url}` });
  } catch (e) {
    await logEvent({ kind: 'plan_upload_url', ok: false, detail: e.message.slice(0, 300) });
    res.status(502).json({ error: 'The upload could not start. Send the brief without it and email the plan to car.groff@gmail.com.' });
  }
}

// A plan the browser says it uploaded: the path must be one of ours and the
// object must really be there.
async function validPlan(raw) {
  if (!raw || typeof raw.path !== 'string' || !/^plans\/[0-9a-f-]{36}-[\w.\- ]{1,120}$/.test(raw.path)) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/info/${PLAN_BUCKET}/${encPath(raw.path)}`, { headers: sbHeaders() });
    if (!r.ok) return null;
  } catch (e) { return null; }
  return { path: raw.path, filename: String(raw.filename || raw.path.split('/').pop()).slice(0, 160), type: PLAN_TYPES.has(raw.type) ? raw.type : null };
}

const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

// Bat's toy mouse (bat-mouse.js): a visitor found the easter egg, and Bat promised them 5% off
// their final price. This email is the record of it.
async function batMouse(req, res) {
  const ip = clientIp(req);
  if (!hit('bat', ip, { limit: 3, windowMs: 60 * 60 * 1000 })) { res.status(429).json({ error: 'Bat is napping.' }); return; }
  try {
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Someone found Bat's mouse: 5% off, on Bat's word",
      text: "A visitor found Bat's toy mouse on the Scaffold page, and Bat promised them 5% off their final price.\n\nIf they send a brief from the same browser, it will say so. If they mention it another way, this email is the record.",
      html: renderEmail({
        tone: 'internal', eyebrow: 'Easter egg', heading: "Someone found Bat's mouse",
        body: "A visitor found Bat's toy mouse on the Scaffold page, and Bat promised them 5% off their final price.\n\nIf they send a brief from the same browser, it will say so. If they mention it another way, this email is the record.",
      }).html,
    });
  } catch (e) {
    await logEvent({ kind: 'bat_mouse', ok: false, detail: e.message.slice(0, 500), ip });
    res.status(200).json({ ok: true });
    return;
  }
  await logEvent({ kind: 'bat_mouse', ok: true, ip });
  res.status(200).json({ ok: true });
}

const text = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) || null : null);

function makeReference() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TS-${ymd}-${rand}`;
}

function briefLines(b) {
  const lines = [
    `Reference: ${b.reference}`,
    `Lane: ${b.lane === 'automation' ? 'Automation' : 'Design'}`,
    `${b.name} <${b.email}>${b.business ? ' · ' + b.business : ''}`,
    `Needs: ${b.need.join(', ') || '—'}`,
    '',
    b.about,
    '',
  ];
  if (b.lane === 'automation') {
    lines.push(`What's slow today: ${b.auto_slow || '—'}`, `Tools they use: ${b.auto_tools || '—'}`, `Who does it now: ${b.auto_who || '—'}`);
  } else {
    lines.push(`Where: ${b.where || '—'}`, `Assets: ${b.assets || '—'}`, `Copy: ${b.copy || '—'}`, `Refs: ${b.refs || '—'}`);
  }
  lines.push(`When: ${b.when_date || (b.flexible ? 'Flexible' : '—')}`, `Budget: ${b.budget || '—'}`, `Notes: ${b.notes || '—'}`);
  return lines;
}

function validFiles(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_FILES).map((f) => {
    if (!f || typeof f.data !== 'string' || !FILE_TYPES.has(f.type)) return null;
    const bytes = Buffer.from(f.data, 'base64');
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) return null;
    const filename = String(f.name || 'file').replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'file';
    return { filename, type: f.type, bytes };
  }).filter(Boolean);
}

async function uploadFiles(briefId, files) {
  let saved = 0;
  for (const f of files) {
    const path = `${briefId}/${Date.now()}-${f.filename}`;
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(path)}`, {
      method: 'POST',
      headers: sbHeaders({ 'Content-Type': f.type, 'x-upsert': 'false' }),
      body: f.bytes,
    });
    if (!r.ok) throw new Error(`Upload ${r.status}: ${(await r.text()).slice(0, 200)}`);
    await sb('design_brief_attachments', {
      method: 'POST',
      body: { design_brief_id: briefId, storage_path: path, filename: f.filename, content_type: f.type },
    });
    saved++;
  }
  return saved;
}

// The cron's own request: Vercel sends "Authorization: Bearer <CRON_SECRET>"
// when that variable is set, and a vercel-cron user agent either way. Anyone
// can fake the user agent, so the digest also refuses to run twice in a day.
function fromCron(req) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.authorization === `Bearer ${secret}`;
  return /vercel-cron/i.test(req.headers['user-agent'] || '');
}

async function healthCheck(req, res) {
  try {
    await sb('site_content?select=id&limit=1');
    let digest;
    if (fromCron(req)) {
      try { digest = await morningDigest(); } catch (e) {
        digest = { sent: false, why: 'failed' };
        await logEvent({ kind: 'digest', ok: false, detail: e.message.slice(0, 500) });
      }
    }
    res.status(200).json({ ok: true, db: 'up', at: new Date().toISOString(), ...(digest ? { digest } : {}) });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'down', error: e.message.slice(0, 200) });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return healthCheck(req, res);
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = parseBody(req);
  if (!body) {
    res.status(400).json({ error: 'Invalid JSON body.' });
    return;
  }
  const ip = clientIp(req);
  if (body.action === 'plan-upload') return planUploadUrl(req, res, body);
  if (body.action === 'bat-mouse') return batMouse(req, res);

  // Honeypot: a hidden "website" field people never see. Bots fill it in.
  // Answer as if it worked so they don't learn to skip it.
  if (typeof body.website === 'string' && body.website.trim()) {
    await logEvent({ kind: 'spam', ok: false, detail: 'honeypot', ip });
    res.status(200).json({ ok: true, reference: makeReference() });
    return;
  }
  if (!hit('brief', ip, RATE)) {
    await logEvent({ kind: 'rate_limited', ok: false, ip });
    res.status(429).json({ error: "That's a lot of briefs in a few minutes. Wait a bit and try again, or email car.groff@gmail.com." });
    return;
  }

  const lane = body.lane === 'automation' ? 'automation' : 'design';
  const name = text(body.name, 200) || '';
  const email = text(body.email, 320) || '';
  const about = text(body.about) || '';
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || about.length < 2) {
    res.status(400).json({ error: 'A name, a working email, and a sentence about the job are required.' });
    return;
  }

  const allowedNeeds = lane === 'automation' ? AUTOMATION_SERVICES : DESIGN_SERVICES;
  const files = validFiles(body.files);
  const plan = lane === 'automation' ? await validPlan(body.plan) : null;
  const brief = {
    reference: makeReference(),
    lane, name, email, about,
    need: Array.isArray(body.need) ? body.need.filter((n) => allowedNeeds.includes(n)) : [],
    business: text(body.business, 200),
    // The design-only answers are dropped on a tools brief: someone who filled
    // them in and then switched lanes should not send stale answers along.
    where: lane === 'design' ? text(body.where, 500) : null,
    when_date: typeof body.when === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.when) ? body.when : null,
    flexible: !!body.flexible,
    assets: lane === 'design' && ASSETS.includes(body.assets) ? body.assets : null,
    copy: lane === 'design' ? text(body.copy) : null,
    refs: lane === 'design' ? text(body.refs, 2000) : null,
    notes: text(body.notes),
    budget: BUDGETS.includes(body.budget) ? body.budget : null,
    auto_slow: lane === 'automation' ? text(body.auto_slow) : null,
    auto_tools: lane === 'automation' ? text(body.auto_tools, 1000) : null,
    auto_who: lane === 'automation' ? text(body.auto_who, 1000) : null,
  };
  const lines = briefLines(brief);
  const bat = body.bat === true || (typeof body.bat === 'string' && /^BAT-/.test(body.bat));   // found Bat's mouse (older finds sent a code)
  if (bat) lines.push("Bat's favour: 5% off the final price (found Bat's mouse)");
  if (files.length) lines.push(`Files: ${files.map((f) => f.filename).join(', ')}`);
  if (plan) lines.push(`Plan uploaded: ${plan.filename} (in the Backroom)`);

  // 1. Email Carter first — the email alone is enough to act on the lead.
  let emailed = false;
  try {
    await sendEmail({
      to: NOTIFY_EMAIL, replyTo: email,
      subject: `New ${lane} brief ${brief.reference}: ${brief.business || name}`,
      text: lines.join('\n'),
      html: renderEmail({
        tone: 'internal', eyebrow: `New ${lane} brief`, heading: brief.business || name, body: brief.about,
        panels: [{ type: 'facts', rows: [
          { k: 'Reference', v: brief.reference }, { k: 'From', v: `${name} <${email}>` },
          ...(brief.need.length ? [{ k: 'Needs', v: brief.need.join(', ') }] : []),
          ...(brief.budget ? [{ k: 'Budget', v: brief.budget }] : []),
          ...(brief.when_date ? [{ k: 'Needed by', v: brief.when_date }] : brief.flexible ? [{ k: 'Needed by', v: 'Flexible' }] : []),
          ...(files.length || plan ? [{ k: 'Files', v: String(files.length + (plan ? 1 : 0)) }] : []),
          ...(bat ? [{ k: "Bat's favour", v: '5% off the final price' }] : []),
        ] }],
        // Straight to this brief's job (the Hub finds it by its reference).
        button: { label: 'Open it in the Backroom', url: `https://scaffold.cargroff.com/business#brief=${brief.reference}` },
      }).html,
    });
    emailed = true;
  } catch (e) {
    await logEvent({ kind: 'notify_email', ok: false, reference: brief.reference, detail: e.message.slice(0, 500), ip });
  }

  // 2. Save to the database.
  let saved = null;
  let saveError = null;
  let jobToken = null;
  try {
    [saved] = await sb('design_briefs', {
      method: 'POST', prefer: 'return=representation',
      body: { ...brief, attachment_count: files.length + (plan ? 1 : 0) },
    });
    // Every brief starts a job at "new"; the Backroom's Jobs board takes it
    // from there (see api/job.js).
    try {
      const [job] = await sb('jobs', {
        method: 'POST', prefer: 'return=representation',
        body: {
          brief_id: saved.id, lane, name, email, business: brief.business,
          title: (brief.need.length ? brief.need.join(', ') : about.slice(0, 80)) + (brief.business ? ` for ${brief.business}` : ''),
        },
      });
      jobToken = job.token;
      await sb(`design_briefs?id=eq.${saved.id}`, { method: 'PATCH', body: { job_id: job.id } });
      // A returning client: attach the job to the client already on the books
      // (matched by email), and put "reply to the brief" on the Docket.
      const known = await findClientByEmail(email);
      if (known) await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { client_id: known.id } }).catch(() => {});
      await openTask(KEYS.brief(job.id), { t: `Reply to the brief: ${job.title}`.slice(0, 200), due: dueIn(1), job_id: job.id, client_id: known ? known.id : null });
      await sb('job_events', { method: 'POST', body: { job_id: job.id, kind: 'brief', who: 'client', body: `Brief ${brief.reference} received.` } });
      if (bat) await sb('job_events', { method: 'POST', body: { job_id: job.id, kind: 'note', who: 'system', body: "Found Bat's mouse on the site. Bat's favour: 5% off the final price.", meta: { bat: true } } }).catch(() => {});
    } catch (e) {
      await logEvent({ kind: 'job_create', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
    }
  } catch (e) {
    saveError = e.message;
  }

  if (saveError) {
    await logEvent({ kind: 'brief_save', ok: false, reference: brief.reference, detail: saveError.slice(0, 500), ip });
    // Alert, separate from the notification, so a DB outage is impossible to miss.
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: `⚠ Brief ${brief.reference} did NOT save to the database`,
      text: `The brief route could not write to Supabase. ${emailed ? 'The full brief is in the email just before this one.' : 'The notification email ALSO failed, so here is the brief:\n\n' + lines.join('\n')}\n\nError: ${saveError}\n\nIf the Supabase project is paused, restore it in the Supabase dashboard.`,
    }).catch(() => {});
    if (!emailed) {
      res.status(502).json({ error: 'Your brief could not be sent right now. Please email it to car.groff@gmail.com and I’ll take it from there.' });
      return;
    }
  }

  // 3. Files, 4. triage — both need the saved row; both are non-fatal.
  if (saved) {
    if (files.length) {
      try { await uploadFiles(saved.id, files); } catch (e) {
        await logEvent({ kind: 'upload', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
      }
    }
    if (plan) {
      await sb('design_brief_attachments', {
        method: 'POST',
        body: { design_brief_id: saved.id, bucket: PLAN_BUCKET, storage_path: plan.path, filename: plan.filename, content_type: plan.type },
      }).catch((e) => logEvent({ kind: 'plan_attach', ok: false, reference: brief.reference, detail: e.message.slice(0, 300) }));
    }
    const t = await triageAndSave({ ...brief, id: saved.id, attachment_count: files.length + (plan ? 1 : 0), bat });
    if (!t.ok) await logEvent({ kind: 'triage', ok: false, reference: brief.reference, detail: String(t.error).slice(0, 500) });
  }

  // 5. Client confirmation (verified domain only). The wording is in
  // lib/receipts.js with the other automatic emails.
  if (FROM_VERIFIED) {
    try {
      const r = renderReceipt('confirm', { name, token: jobToken }, { reference: brief.reference, need: brief.need, budget: brief.budget, when_date: brief.when_date, bat });
      await sendEmail({ from: FROM_VERIFIED, to: email, replyTo: NOTIFY_EMAIL, subject: r.subject, text: r.text, html: r.html });
    } catch (e) {
      await logEvent({ kind: 'client_confirmation', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
    }
  }

  await logEvent({ kind: 'brief', ok: true, reference: brief.reference, detail: saveError ? 'email only (db save failed)' : null, ip });
  res.status(200).json({ ok: true, reference: brief.reference, confirmation: !!FROM_VERIFIED, brand: BRAND });
}
