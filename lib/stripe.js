// lib/stripe.js — one Stripe call the workflow needs: a Payment Link for an
// invoice, made when the client presses Pay (not before), so there is never a
// pile of unused links. The Idempotency-Key is built from the invoice and its
// amount, so a double-click or a retry returns the same link instead of a
// second one; a changed amount gets a fresh key. No card fee.
// Needs STRIPE_SECRET_KEY. The webhook (api/stripe-webhook.js) marks it paid.

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
  };
  if (returnUrl) { params['after_completion[type]'] = 'redirect'; params['after_completion[redirect][url]'] = returnUrl; }
  const link = await stripe('payment_links', params, key, idem + '-link');
  return { id: link.id, url: link.url };
}
