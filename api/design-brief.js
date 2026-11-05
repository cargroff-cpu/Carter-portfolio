// api/design-brief.js — receives a submission from the /design brief form
// (design.jsx). Public, unauthenticated endpoint (not gated by middleware.js:
// a prospective client has no Back Room session).
//
// Order matters, and is built so a database outage can never silently eat a
// lead:
//   1. Spam checks: hidden honeypot field + per-IP rate limit.
//   2. Email Carter the FULL brief first (with its reference number).
//   3. Save the brief + a matching lead to Supabase, then any attached files.
//   4. AI triage (lib/brief-triage.js): prepares a summary and draft reply
//      for approval in the Business Hub. Never sends anything itself.
//   5. Confirmation email to the client (only once RESEND_FROM is a verified
//      domain; Resend's test sender can't reach clients).
//   6. Every attempt, success or failure, is logged to brief_events, and a
//      failed save sends Carter an alert email.
// The client sees success if the brief reached Carter by email OR database.
//
// GET /api/design-brief (also /api/health via vercel.json) is the daily
// keep-alive: one tiny query so the free-tier Supabase project never sits
// idle long enough to pause. Hit by the Vercel Cron in vercel.json.
import { sb, sbHeaders, sendEmail, esc, parseBody, logEvent, SUPABASE_URL, BRAND, BRAND_FULL, NOTIFY_EMAIL, FROM_VERIFIED } from '../lib/server.js';
import { clientIp, hit } from '../lib/rate-limit.js';
import { triageAndSave } from '../lib/brief-triage.js';

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

const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

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

async function healthCheck(res) {
  try {
    await sb('site_content?select=id&limit=1');
    res.status(200).json({ ok: true, db: 'up', at: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'down', error: e.message.slice(0, 200) });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return healthCheck(res);
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
  const brief = {
    reference: makeReference(),
    lane, name, email, about,
    need: Array.isArray(body.need) ? body.need.filter((n) => allowedNeeds.includes(n)) : [],
    business: text(body.business, 200),
    where: text(body.where, 500),
    when_date: typeof body.when === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.when) ? body.when : null,
    flexible: !!body.flexible,
    assets: ASSETS.includes(body.assets) ? body.assets : null,
    copy: text(body.copy),
    refs: text(body.refs, 2000),
    notes: text(body.notes),
    budget: BUDGETS.includes(body.budget) ? body.budget : null,
    auto_slow: lane === 'automation' ? text(body.auto_slow) : null,
    auto_tools: lane === 'automation' ? text(body.auto_tools, 1000) : null,
    auto_who: lane === 'automation' ? text(body.auto_who, 1000) : null,
  };
  const lines = briefLines(brief);
  if (files.length) lines.push(`Files: ${files.map((f) => f.filename).join(', ')}`);

  // 1. Email Carter first — the email alone is enough to act on the lead.
  let emailed = false;
  try {
    await sendEmail({
      to: NOTIFY_EMAIL, replyTo: email,
      subject: `New ${lane} brief ${brief.reference}: ${brief.business || name}`,
      text: lines.join('\n'),
      html: `<div style="font-family: Georgia, serif; max-width: 560px;">${lines.map((l) => (l ? `<p style="margin:0 0 6px">${esc(l)}</p>` : '<br>')).join('')}</div>`,
    });
    emailed = true;
  } catch (e) {
    await logEvent({ kind: 'notify_email', ok: false, reference: brief.reference, detail: e.message.slice(0, 500), ip });
  }

  // 2. Save to the database.
  let saved = null;
  let saveError = null;
  try {
    [saved] = await sb('design_briefs', {
      method: 'POST', prefer: 'return=representation',
      body: { ...brief, attachment_count: files.length },
    });
    try {
      const [lead] = await sb('leads', {
        method: 'POST', prefer: 'return=representation',
        body: {
          name: brief.business || name, contact: name, email,
          source: lane === 'automation' ? 'Automation brief' : 'Design page',
          ask: brief.need.length ? brief.need.join(', ') : about.slice(0, 140), status: 'New',
        },
      });
      await sb(`design_briefs?id=eq.${saved.id}`, { method: 'PATCH', body: { converted_lead_id: lead.id } });
    } catch (e) {
      await logEvent({ kind: 'lead_create', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
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
    const t = await triageAndSave({ ...brief, id: saved.id, attachment_count: files.length }, { timeoutMs: 12000 });
    if (!t.ok) await logEvent({ kind: 'triage', ok: false, reference: brief.reference, detail: String(t.error).slice(0, 500) });
  }

  // 5. Client confirmation (verified domain only).
  if (FROM_VERIFIED) {
    try {
      await sendEmail({
        from: FROM_VERIFIED, to: email, replyTo: NOTIFY_EMAIL,
        subject: `Got your brief — ${brief.reference}`,
        text: `Hi ${name},\n\nThanks, your brief reached me. Your reference is ${brief.reference}.\n\nWhat happens next: I read it properly and reply with a price and a delivery date, usually within one business day. If anything's missing, I'll ask for exactly that.\n\nHere's what you sent:\n\n${lines.slice(3).join('\n')}\n\nCarter\n${BRAND_FULL}`,
        html: `<div style="font-family: Georgia, serif; max-width: 520px; color:#2a1c11">
          <p>Hi ${esc(name)},</p>
          <p>Thanks, your brief reached me. Your reference is <strong>${esc(brief.reference)}</strong>.</p>
          <p><strong>What happens next:</strong> I read it properly and reply with a price and a delivery date, usually within one business day. If anything's missing, I'll ask for exactly that.</p>
          <p style="color:#666;font-size:13px">${lines.slice(3).map(esc).join('<br>')}</p>
          <p>Carter<br><span style="color:#666">${esc(BRAND_FULL)}</span></p>
        </div>`,
      });
    } catch (e) {
      await logEvent({ kind: 'client_confirmation', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
    }
  }

  await logEvent({ kind: 'brief', ok: true, reference: brief.reference, detail: saveError ? 'email only (db save failed)' : null, ip });
  res.status(200).json({ ok: true, reference: brief.reference, confirmation: !!FROM_VERIFIED, brand: BRAND });
}
