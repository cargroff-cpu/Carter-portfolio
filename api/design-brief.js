// api/design-brief.js — receives a submission from the /design brief form
// (design.jsx). Public, unauthenticated endpoint (not gated by
// middleware.js — a prospective client has no Scaffold session), but the
// only thing it does with that trust is validate and insert. Writes to the
// Scaffold's Supabase project with the service-role key (same pattern as
// api/scaffold-write.js) so the brief shows up in the Business Hub's
// Design-briefs inbox, and auto-creates a matching lead so it also shows up
// in the Leads inbox immediately. The v2 form ships no file input, so
// design_brief_attachments (in freelance-schema.sql) isn't written here —
// nothing to attach yet.
const SCAFFOLD_SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const SERVICES = ['Social graphics', 'Business card or print', 'Flyer or one-pager',
  'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).' });
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const about = typeof body.about === 'string' ? body.about.trim() : '';
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || about.length < 2) {
    res.status(400).json({ error: 'A name, a working email, and a sentence about the job are required.' });
    return;
  }

  const need = Array.isArray(body.need) ? body.need.filter((n) => SERVICES.includes(n)) : [];
  const brief = {
    name, email, about, need,
    business: typeof body.business === 'string' ? body.business.trim() || null : null,
    where: typeof body.where === 'string' ? body.where.trim() || null : null,
    when_date: typeof body.when === 'string' && body.when ? body.when : null,
    flexible: !!body.flexible,
    assets: typeof body.assets === 'string' ? body.assets || null : null,
    copy: typeof body.copy === 'string' ? body.copy.trim() || null : null,
    refs: typeof body.refs === 'string' ? body.refs.trim() || null : null,
    notes: typeof body.notes === 'string' ? body.notes.trim() || null : null,
    budget: typeof body.budget === 'string' ? body.budget.trim() || null : null,
  };

  const sbHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=representation',
  };

  try {
    const briefRes = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/design_briefs`, {
      method: 'POST', headers: sbHeaders, body: JSON.stringify(brief),
    });
    if (!briefRes.ok) {
      const detail = await briefRes.text();
      res.status(502).json({ error: 'Could not save the brief.', detail });
      return;
    }
    const [savedBrief] = await briefRes.json();

    const leadRes = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST', headers: sbHeaders,
      body: JSON.stringify({
        name: brief.business || name, contact: name, email, source: 'Design page',
        ask: need.length ? need.join(', ') : about.slice(0, 140), status: 'New',
      }),
    });
    if (leadRes.ok) {
      const [savedLead] = await leadRes.json();
      await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/design_briefs?id=eq.${savedBrief.id}`, {
        method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ converted_lead_id: savedLead.id }),
      });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Cargroff Design <onboarding@resend.dev>',
          to: ['car.groff@gmail.com'],
          reply_to: email,
          subject: `New brief: ${brief.business || name}`,
          text: `${name} <${email}>\n${brief.business || ''}\n\nNeeds: ${need.join(', ') || '—'}\n\n${about}\n\nWhere: ${brief.where || '—'}\nWhen: ${brief.when_date || (brief.flexible ? 'Flexible' : '—')}\nBudget: ${brief.budget || '—'}\nAssets: ${brief.assets || '—'}\nCopy: ${brief.copy || '—'}\nRefs: ${brief.refs || '—'}\nNotes: ${brief.notes || '—'}`,
          html: `<div style="font-family: Georgia, serif; max-width: 520px;">
            <p><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;${brief.business ? ' · ' + esc(brief.business) : ''}</p>
            ${need.length ? `<p><strong>Needs:</strong> ${esc(need.join(', '))}</p>` : ''}
            <p>${esc(about).replace(/\n/g, '<br>')}</p>
            <p style="color:#666;font-size:13px">Where: ${esc(brief.where) || '—'} · When: ${esc(brief.when_date) || (brief.flexible ? 'Flexible' : '—')} · Budget: ${esc(brief.budget) || '—'}</p>
          </div>`,
        }),
      }).catch(() => {});
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error saving the brief.' });
  }
}
