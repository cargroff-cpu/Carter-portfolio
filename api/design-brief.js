// api/design-brief.js — receives a submission from The Scaffold's brief form
// (design.jsx, served at /design). Public and unauthenticated (a prospective
// client has no Back Room session), so it validates hard, drops bot
// submissions, rate-limits by IP, and never trusts the text it receives.
//
// Order matters: it tries to save the brief (and a matching lead) first, then
// ALWAYS emails Carter the full brief, flagging in the subject if the save
// failed. A database outage can no longer silently eat a lead. If
// RESEND_FROM is set (a sender on a domain verified in Resend), the client
// also gets a confirmation email.
//
// AI triage does not run here: the Back Room triggers it (api/brief-triage.js)
// so the public endpoint can't be used to run up model costs.
import crypto from 'node:crypto';

const SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const NOTIFY_TO = 'car.groff@gmail.com';
const FROM = process.env.RESEND_FROM || 'The Scaffold <onboarding@resend.dev>';

export const DESIGN_NEEDS = ['Social graphics', 'Business card or print', 'Flyer or one-pager',
  'Document or report', 'Presentation or deck', 'Brand basics', 'Monthly content plan', 'Something else'];
export const AUTOMATION_NEEDS = ['Lead and inquiry handling', 'Content pipeline', 'Dashboard or tracker',
  'Custom AI assistant', 'Something else'];
const BUDGETS = ['Under $250', '$250–$750', '$750–$2,000', '$2,000+', 'Not sure yet'];

const str = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendEmail(resendKey, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify(payload),
  });
  return r.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }
  body = body || {};

  // Honeypot: a field real visitors never see. Bots fill it; pretend success.
  if (str(body.website)) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const about = str(body.about);
  if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || about.length < 2) {
    res.status(400).json({ error: 'A name, a working email, and a sentence about the job are required.' });
    return;
  }

  const lane = body.lane === 'automation' ? 'automation' : 'design';
  const allowed = lane === 'automation' ? AUTOMATION_NEEDS : DESIGN_NEEDS;
  const need = Array.isArray(body.need) ? body.need.filter((n) => allowed.includes(n)).slice(0, 8) : [];
  const details = lane === 'automation'
    ? { slow: str(body.slow, 2000) || null, tools: str(body.tools, 1000) || null, who: str(body.who, 500) || null }
    : {};
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ipHash = ip ? crypto.createHash('sha256').update('cg-brief:' + ip).digest('hex').slice(0, 32) : null;

  const brief = {
    name, email, about, need, lane, details,
    business: str(body.business, 200) || null,
    where: str(body.where, 300) || null,
    when_date: /^\d{4}-\d{2}-\d{2}$/.test(str(body.when)) ? str(body.when) : null,
    flexible: !!body.flexible,
    assets: ['Yes', 'Some', 'No'].includes(body.assets) ? body.assets : null,
    copy: str(body.copy) || null,
    refs: str(body.refs, 2000) || null,
    notes: str(body.notes, 2000) || null,
    budget: BUDGETS.includes(body.budget) ? body.budget : null,
    ip_hash: ipHash,
  };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sbHeaders = serviceKey ? {
    'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=representation',
  } : null;

  // Rate limit: at most 3 briefs per IP per 10 minutes. Skipped if the
  // database can't be reached, so an outage never blocks a real client.
  if (sbHeaders && ipHash) {
    try {
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/design_briefs?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}`, { headers: sbHeaders });
      if (r.ok && (await r.json()).length >= 3) {
        res.status(429).json({ error: "That's a few briefs in a row. Give it ten minutes, or email me directly." });
        return;
      }
    } catch (e) { /* fall through */ }
  }

  // 1. Save the brief and a matching lead (best effort).
  let saved = false;
  if (sbHeaders) {
    try {
      const briefRes = await fetch(`${SUPABASE_URL}/rest/v1/design_briefs`, { method: 'POST', headers: sbHeaders, body: JSON.stringify(brief) });
      if (briefRes.ok) {
        saved = true;
        const [savedBrief] = await briefRes.json();
        const leadRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST', headers: sbHeaders,
          body: JSON.stringify({
            name: brief.business || name, contact: name, email,
            source: lane === 'automation' ? 'Scaffold · automation brief' : 'Scaffold · design brief',
            ask: need.length ? need.join(', ') : about.slice(0, 140), status: 'New',
          }),
        });
        if (leadRes.ok) {
          const [savedLead] = await leadRes.json();
          await fetch(`${SUPABASE_URL}/rest/v1/design_briefs?id=eq.${savedBrief.id}`, {
            method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ converted_lead_id: savedLead.id }),
          });
        }
      }
    } catch (e) { saved = false; }
  }

  // 2. Always email Carter the full brief.
  const resendKey = process.env.RESEND_API_KEY;
  let notified = false;
  if (resendKey) {
    const laneLabel = lane === 'automation' ? 'Automation' : 'Design';
    const lines = [
      `${name} <${email}>${brief.business ? ' · ' + brief.business : ''}`,
      `Lane: ${laneLabel}`,
      `Needs: ${need.join(', ') || '—'}`,
      '', about, '',
      ...(lane === 'automation'
        ? [`What's slow: ${details.slow || '—'}`, `Tools they use: ${details.tools || '—'}`, `Who does it now: ${details.who || '—'}`]
        : [`Where: ${brief.where || '—'}`, `Assets: ${brief.assets || '—'}`, `Copy: ${brief.copy || '—'}`, `Refs: ${brief.refs || '—'}`]),
      `When: ${brief.when_date || (brief.flexible ? 'Flexible' : '—')}`,
      `Budget: ${brief.budget || '—'}`,
      `Notes: ${brief.notes || '—'}`,
      '', saved ? 'Saved to the Back Room.' : 'NOT saved to the Back Room (database error). This email is the only copy.',
    ];
    try {
      notified = await sendEmail(resendKey, {
        from: FROM, to: [NOTIFY_TO], reply_to: email,
        subject: `${saved ? '' : '[NOT SAVED] '}New ${laneLabel.toLowerCase()} brief: ${brief.business || name}`,
        text: lines.join('\n'),
        html: `<div style="font-family: Georgia, serif; max-width: 560px;">${lines.map((l) => (l ? `<p style="margin:0 0 6px">${esc(l)}</p>` : '<br>')).join('')}</div>`,
      });
    } catch (e) { notified = false; }

    // 3. Confirmation to the client, only from a verified sender domain.
    if (process.env.RESEND_FROM && (saved || notified)) {
      sendEmail(resendKey, {
        from: FROM, to: [email], reply_to: NOTIFY_TO,
        subject: 'Your brief reached The Scaffold',
        text: `Hi ${name.split(' ')[0]},\n\nThanks for the brief. I'll read it properly and reply with a price and a timeline, usually within one business day. If anything's missing I'll ask.\n\nWhat you sent:\n${need.join(', ') || laneLabel}\n${about}\n\nCarter Groff\nThe Scaffold · cargroff.com/design`,
      }).catch(() => {});
    }
  }

  if (!saved && !notified) {
    res.status(502).json({ error: `Something went wrong on my end. Email me at ${NOTIFY_TO} and I'll take it from there.` });
    return;
  }
  res.status(200).json({ ok: true });
}
