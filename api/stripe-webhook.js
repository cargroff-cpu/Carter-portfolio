// api/stripe-webhook.js — Stripe calls this when a Payment Link's checkout
// completes. Verifies the signature by hand (no Stripe SDK — this repo has
// no build step or node_modules) using STRIPE_WEBHOOK_SECRET, then marks the
// matching invoice paid. Not gated by middleware.js: Stripe isn't logged
// into the Scaffold, its signature is the auth. TODO(carter): after setting
// STRIPE_SECRET_KEY (see lib/stripe.js), add a webhook
// endpoint in the Stripe dashboard pointed at /api/stripe-webhook for the
// checkout.session.completed event, and set STRIPE_WEBHOOK_SECRET in Vercel
// to the signing secret it gives you.
//
// Once an invoice is marked paid, its Payment Link is switched off
// (lib/stripe.js) so it can't be paid a second time.
import crypto from 'node:crypto';
import { sb, sendEmail, NOTIFY_EMAIL, SUPABASE_URL } from '../lib/server.js';
import { renderEmail } from '../lib/mail.js';
import { deactivateLink } from '../lib/stripe.js';
import { closeTasks, closeJobTasks, KEYS } from '../lib/crm.js';

export const config = { api: { bodyParser: false } };

// Reject signatures older than this, so a captured request can't be replayed later.
const TOLERANCE_S = 5 * 60;

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Stripe's signature scheme: header is "t=<timestamp>,v1=<hex hmac>". The
// signed payload is "<timestamp>.<raw body>", HMAC-SHA256 with the webhook
// secret, compared with a constant-time check. Stripe may send several v1
// signatures (while a secret is being rolled); any one matching is enough.
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const pairs = sigHeader.split(',').map((p) => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)]; });
  const t = (pairs.find(([k]) => k === 't') || [])[1];
  const sigs = pairs.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !/^\d+$/.test(t) || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false;
  const a = Buffer.from(crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex'), 'hex');
  return sigs.some((v) => { const b = Buffer.from(v, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!webhookSecret || !serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing STRIPE_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  const rawBody = await readRawBody(req);
  if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], webhookSecret)) {
    res.status(400).json({ error: 'Invalid signature.' });
    return;
  }

  let event;
  try { event = JSON.parse(rawBody.toString('utf8')); } catch (e) {
    res.status(400).json({ error: 'Invalid JSON.' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentLinkId = session.payment_link;
    if (paymentLinkId) {
      let paid = [];
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/invoices?stripe_payment_link_id=eq.${encodeURIComponent(paymentLinkId)}&status=neq.paid`, {
          method: 'PATCH',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString(), stripe_payment_intent_id: session.payment_intent || null }),
        });
        if (!r.ok) throw new Error(await r.text());
        paid = await r.json();
      } catch (e) {
        res.status(500).json({ error: 'Webhook received but the Supabase update failed.' });
        return;
      }
      // Workflow: note the payment on the job, tell Carter, and move the job
      // to "paid" once it is approved and nothing is left unpaid. Best effort:
      // the invoice is already marked paid above.
      await deactivateLink(paymentLinkId);
      for (const inv of paid) {
        await closeTasks(KEYS.invoice(inv.id));
        if (!inv.job_id) continue;
        try {
          const [job] = await sb(`jobs?id=eq.${inv.job_id}&select=*`);
          if (!job) continue;
          const amount = '$' + Number(inv.amount).toFixed(2);
          await sb('job_events', { method: 'POST', body: { job_id: job.id, kind: 'paid', who: 'client', body: `Paid ${inv.label || 'invoice'}: ${amount}` } });
          // Drafts were never sent, so they don't hold a job open.
          const open = await sb(`invoices?job_id=eq.${job.id}&status=in.(sent,overdue)&select=id`);
          const done = !!job.approved_at && open.length === 0;
          await sb(`jobs?id=eq.${job.id}`, { method: 'PATCH', body: { last_activity_at: new Date().toISOString(), ...(done ? { stage: 'paid' } : {}) } });
          if (done) await closeJobTasks(job.id);
          const all = await sb(`invoices?job_id=eq.${job.id}&select=amount,status`).catch(() => []);
          const money0 = (n) => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
          const paidSoFar = all.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0);
          const toCome = all.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Number(i.amount || 0), 0);
          const first = String(job.name || 'Your client').split(' ')[0];
          const { html, text } = renderEmail({
            tone: 'internal', eyebrow: done ? 'Paid in full' : 'Payment received',
            heading: `${first} paid ${money0(inv.amount)}.`,
            body: `${job.name} paid ${inv.label || 'an invoice'}.${done ? ' Nothing is left to pay; the job is marked paid.' : ''}`,
            panels: [
              { type: 'stats', items: [{ k: 'This payment', v: money0(inv.amount), ok: true }, { k: 'Paid so far', v: money0(paidSoFar) }, { k: 'Still to come', v: money0(toCome) }] },
              { type: 'facts', rows: [{ k: 'Invoice', v: inv.label || 'Invoice' }, { k: 'Job', v: job.title }, { k: 'Client', v: `${job.name}${job.business ? ', ' + job.business : ''}` }] },
            ],
            button: { label: 'Open the job in the Backroom', url: `https://scaffold.cargroff.com/business#job=${job.id}` },
          });
          await sendEmail({ to: NOTIFY_EMAIL, subject: `${done ? 'Paid in full' : 'Payment received'}: ${job.title}`, html, text });
        } catch (e) {
          console.error('webhook job update', e.message);
        }
      }
    }
  }

  res.status(200).json({ received: true });
}
