// api/stripe-webhook.js — Stripe calls this when a Payment Link's checkout
// completes. Verifies the signature by hand (no Stripe SDK — this repo has
// no build step or node_modules) using STRIPE_WEBHOOK_SECRET, then marks the
// matching invoice paid. Not gated by middleware.js: Stripe isn't logged
// into the Scaffold, its signature is the auth. TODO(carter): after setting
// STRIPE_SECRET_KEY (see api/create-invoice-link.js), add a webhook
// endpoint in the Stripe dashboard pointed at /api/stripe-webhook for the
// checkout.session.completed event, and set STRIPE_WEBHOOK_SECRET in Vercel
// to the signing secret it gives you.
import crypto from 'node:crypto';

export const config = { api: { bodyParser: false } };

const SCAFFOLD_SUPABASE_URL = 'https://kvgeimwitzdlstagqumw.supabase.co';

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
// secret, compared with a constant-time check.
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=')));
  if (!parts.t || !parts.v1) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceKey = process.env.SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY;
  if (!webhookSecret || !serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing STRIPE_WEBHOOK_SECRET or SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY).' });
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
      try {
        await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/invoices?stripe_payment_link_id=eq.${encodeURIComponent(paymentLinkId)}`, {
          method: 'PATCH',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString(), stripe_payment_intent_id: session.payment_intent || null }),
        });
      } catch (e) {
        res.status(500).json({ error: 'Webhook received but the Supabase update failed.' });
        return;
      }
    }
  }

  res.status(200).json({ received: true });
}
