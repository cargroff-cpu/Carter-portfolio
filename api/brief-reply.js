// api/brief-reply.js — the approve step for AI triage. Gated by
// middleware.js (Back Room session required). Nothing reaches a client
// without going through here, and only Carter can call it.
//
// POST { id, action }:
//   action 'triage'  — (re)run AI triage on the brief and save the result
//   action 'send'    — email { reply } (Carter's approved or edited text) to
//                      the client from the verified domain, mark the brief
//                      answered, log the reply on the lead's thread
//   action 'reject'  — mark the brief answered with triage status
//                      'rejected'; sends nothing
import { sb, sendEmail, esc, parseBody, logEvent, NOTIFY_EMAIL, FROM_VERIFIED, BRAND_FULL } from '../lib/server.js';
import { triageAndSave } from '../lib/brief-triage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }
  const body = parseBody(req) || {};
  const { id, action } = body;
  if (typeof id !== 'string' || !['triage', 'send', 'reject'].includes(action)) {
    res.status(400).json({ error: 'Missing id or invalid action.' });
    return;
  }

  let brief;
  try {
    [brief] = await sb(`design_briefs?id=eq.${encodeURIComponent(id)}&select=*`);
  } catch (e) {
    res.status(502).json({ error: 'Could not load the brief.', detail: e.message });
    return;
  }
  if (!brief) {
    res.status(404).json({ error: 'No such brief.' });
    return;
  }

  if (action === 'triage') {
    const t = await triageAndSave(brief, { timeoutMs: 25000, skipCap: true });
    if (!t.ok) {
      res.status(502).json({ error: t.error });
      return;
    }
    res.status(200).json({ ok: true, triage: t.triage });
    return;
  }

  const now = new Date().toISOString();
  const triage = brief.triage && typeof brief.triage === 'object' ? brief.triage : {};

  if (action === 'reject') {
    await sb(`design_briefs?id=eq.${brief.id}`, {
      method: 'PATCH', body: { status: 'answered', answered_at: now, triage: { ...triage, status: 'rejected', decided_at: now } },
    });
    await logEvent({ kind: 'reply_rejected', ok: true, reference: brief.reference });
    res.status(200).json({ ok: true });
    return;
  }

  // action === 'send'
  const reply = typeof body.reply === 'string' ? body.reply.trim() : '';
  if (reply.length < 10) {
    res.status(400).json({ error: 'The reply is empty.' });
    return;
  }
  if (!FROM_VERIFIED) {
    res.status(409).json({ error: 'Client email is off until RESEND_FROM is set to an address on a domain verified in Resend. Copy the reply and send it from your inbox for now.' });
    return;
  }
  try {
    await sendEmail({
      from: FROM_VERIFIED, to: brief.email, replyTo: NOTIFY_EMAIL,
      subject: `Re: your brief ${brief.reference || ''}`.trim(),
      text: reply,
      html: `<div style="font-family: Georgia, serif; max-width: 520px; color:#2a1c11">${esc(reply).replace(/\n/g, '<br>')}<p style="color:#666;font-size:13px;margin-top:18px">${esc(BRAND_FULL)}</p></div>`,
    });
  } catch (e) {
    await logEvent({ kind: 'reply_send', ok: false, reference: brief.reference, detail: e.message.slice(0, 500) });
    res.status(502).json({ error: 'The email did not send.', detail: e.message });
    return;
  }

  await sb(`design_briefs?id=eq.${brief.id}`, {
    method: 'PATCH',
    body: { status: 'answered', answered_at: now, triage: { ...triage, status: 'sent', sent_reply: reply, decided_at: now } },
  }).catch(() => {});
  if (brief.converted_lead_id) {
    await sb('lead_messages', { method: 'POST', body: { lead_id: brief.converted_lead_id, from: 'me', body: reply, sent_at: now } }).catch(() => {});
    await sb(`leads?id=eq.${brief.converted_lead_id}`, { method: 'PATCH', body: { status: 'Awaiting Response', last_activity_at: now } }).catch(() => {});
  }
  await logEvent({ kind: 'reply_sent', ok: true, reference: brief.reference });
  res.status(200).json({ ok: true });
}
