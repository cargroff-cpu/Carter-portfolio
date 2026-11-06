// api/brief-reply.js — the approve step for AI triage. Gated by
// middleware.js (Backroom session required). Nothing reaches a client
// without going through here, and only Carter can call it.
//
// POST { id, action }:
//   action 'triage'  — (re)run AI triage on the brief and save the result
//   action 'send'    — email { reply } (Carter's approved or edited text) to
//                      the client from the verified domain, mark the brief
//                      answered, log the reply on the lead's thread
//   action 'reject'  — mark the brief answered with triage status
//                      'rejected' and close its job (if it never got past
//                      New), so it leaves the board; sends nothing
// 'send' and 'reject' work with or without an AI triage (the Hub has a plain
// reply box for briefs that have none).
import { sb, sendEmail, parseBody, logEvent, NOTIFY_EMAIL, FROM_VERIFIED } from '../lib/server.js';
import { triageAndSave } from '../lib/brief-triage.js';
import { renderEmail, jobUrl } from '../lib/mail.js';

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
    if (brief.job_id) {
      try {
        const closed = await sb(`jobs?id=eq.${brief.job_id}&stage=eq.new`, {
          method: 'PATCH', prefer: 'return=representation', body: { stage: 'closed', updated_at: now, last_activity_at: now },
        });
        if (closed && closed.length) {
          await sb('job_events', { method: 'POST', body: { job_id: brief.job_id, kind: 'note', who: 'me', body: 'No reply needed. Job closed.' } });
        }
      } catch (e) {
        await logEvent({ kind: 'reject_close_job', ok: false, reference: brief.reference, detail: e.message.slice(0, 300) });
      }
    }
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
  // The brief's job (made at intake) gives the reply its project-page button.
  let job = null;
  if (brief.job_id) { try { [job] = await sb(`jobs?id=eq.${brief.job_id}&select=id,token`); } catch (e) { job = null; } }
  try {
    const { html, text } = renderEmail({
      heading: 'About your brief', body: reply, preheader: `Re: your brief ${brief.reference || ''}`.trim(),
      stage: 0, eyebrow: brief.reference ? `Re: your brief · ${brief.reference}` : 'Re: your brief',
      button: job ? { label: 'Open your project page', url: jobUrl(job.token) } : null,
    });
    await sendEmail({
      from: FROM_VERIFIED, to: brief.email, replyTo: NOTIFY_EMAIL,
      subject: `Re: your brief ${brief.reference || ''}`.trim(), text, html,
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
  if (job) {
    await sb('job_events', { method: 'POST', body: { job_id: job.id, kind: 'email', who: 'me', body: reply, meta: { kind: 'reply' } } }).catch(() => {});
    await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { last_activity_at: now } }).catch(() => {});
  }
  await logEvent({ kind: 'reply_sent', ok: true, reference: brief.reference });
  res.status(200).json({ ok: true });
}
