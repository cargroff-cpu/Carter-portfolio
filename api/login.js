// api/login.js — checks the submitted password against ADMIN_PASSWORD and,
// if correct, sets an HttpOnly session cookie. middleware.js checks for this
// cookie on every admin/API request instead of the ugly native browser
// Basic Auth prompt.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const password = process.env.ADMIN_PASSWORD;
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const provided = body && body.password;

  if (!password || provided !== password) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  // Session-only cookie (no Max-Age) — cleared when the browser fully closes,
  // so the password prompt appears again on every new visit rather than
  // silently signing back in. Named cg_admin_s (not the old cg_admin) so any
  // previously-issued 30-day cookie is ignored rather than still working.
  // The cookie value is the password itself — HttpOnly so page scripts never
  // see it, Secure so it only travels over HTTPS.
  res.setHeader(
    'Set-Cookie',
    `cg_admin_s=${encodeURIComponent(password)}; HttpOnly; Secure; SameSite=Lax; Path=/`
  );
  res.status(200).json({ ok: true });
}
