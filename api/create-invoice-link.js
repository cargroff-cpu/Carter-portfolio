// api/create-invoice-link.js — turns a draft invoice into a real Stripe
// Payment Link and marks it sent. Reached only after middleware.js's cookie
// check (added to its matcher). Uses the service-role key to read/write the
// invoice row and STRIPE_SECRET_KEY to create the link — both server-side
// only. TODO(carter): set STRIPE_SECRET_KEY in Vercel before using this;
// there's no fallback, the button just errors until it's set.
const SCAFFOLD_SUPABASE_URL = 'https://kvgeimwitzdlstagqumw.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const serviceKey = process.env.SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }
  if (!stripeKey) {
    res.status(500).json({ error: 'Server is not configured (missing STRIPE_SECRET_KEY). Set it in Vercel to send real payment links.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }
  const invoiceId = body && body.invoiceId;
  if (!invoiceId) {
    res.status(400).json({ error: 'Missing invoiceId.' });
    return;
  }

  const sbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

  try {
    const invRes = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/invoices?id=eq.${encodeURIComponent(invoiceId)}&select=*`, { headers: sbHeaders });
    const [invoice] = await invRes.json();
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    const cents = Math.round(Number(invoice.amount) * 100);
    const priceParams = new URLSearchParams({
      'currency': 'usd',
      'unit_amount': String(cents),
      'product_data[name]': `Invoice — Carter Groff`,
    });
    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: priceParams,
    });
    if (!priceRes.ok) {
      const detail = await priceRes.text();
      res.status(502).json({ error: 'Stripe price creation failed', detail });
      return;
    }
    const price = await priceRes.json();

    const linkParams = new URLSearchParams({ 'line_items[0][price]': price.id, 'line_items[0][quantity]': '1' });
    const linkRes = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: linkParams,
    });
    if (!linkRes.ok) {
      const detail = await linkRes.text();
      res.status(502).json({ error: 'Stripe payment link creation failed', detail });
      return;
    }
    const link = await linkRes.json();

    await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/invoices?id=eq.${encodeURIComponent(invoiceId)}`, {
      method: 'PATCH', headers: sbHeaders,
      body: JSON.stringify({ status: 'sent', stripe_payment_link_id: link.id, sent_at: new Date().toISOString() }),
    });

    res.status(200).json({ ok: true, url: link.url });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error creating the payment link.' });
  }
}
