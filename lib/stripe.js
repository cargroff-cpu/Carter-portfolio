// lib/stripe.js — the Stripe calls the workflow needs: a Payment Link for an
// invoice, made when the client presses Pay (not before), so there is never a
// pile of unused links; and switching a link off once its invoice is paid.
// The Idempotency-Key is built from the invoice and its amount, so a
// double-click or a retry returns the same link instead of a second one; a
// changed amount gets a fresh key. No card fee.
//
// Each link takes one payment only (restrictions.completed_sessions.limit =
// 1), and is deactivated when the invoice is marked paid — by the webhook
// (api/stripe-webhook.js) or by hand (api/job.js 'mark-paid') — so an
// invoice can't be paid twice.
// Needs STRIPE_SECRET_KEY.

const form = (o) => new URLSearchParams(o);

async function stripe(path, params, key, idem) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded', ...(idem ? { 'Idempotency-Key': idem } : {}) },
    body: form(params),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Stripe ${path} ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

export async function paymentLinkFor(invoice, { title, returnUrl }) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  const cents = Math.round(Number(invoice.amount) * 100);
  if (!(cents > 0)) throw new Error('Invoice amount must be above zero');
  const idem = `scaffold-inv-${invoice.id}-${cents}`;
  const price = await stripe('prices', {
    currency: 'usd', unit_amount: String(cents),
    'product_data[name]': `${title} (${invoice.label || 'Invoice'})`.slice(0, 250),
  }, key, idem + '-price');
  const params = {
    'line_items[0][price]': price.id, 'line_items[0][quantity]': '1',
    'metadata[invoice_id]': invoice.id,
    'restrictions[completed_sessions][limit]': '1',
  };
  if (returnUrl) { params['after_completion[type]'] = 'redirect'; params['after_completion[redirect][url]'] = returnUrl; }
  const link = await stripe('payment_links', params, key, idem + '-link-once');
  return { id: link.id, url: link.url };
}

// Best effort: switch a Payment Link off. Never throws — a link that stays on
// is still capped at one payment by the restriction above.
export async function deactivateLink(linkId) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !linkId) return false;
  try {
    await stripe(`payment_links/${encodeURIComponent(linkId)}`, { active: 'false' }, key);
    return true;
  } catch (e) {
    console.error('deactivate payment link', e.message);
    return false;
  }
}
