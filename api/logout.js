// api/logout.js — clears the admin session cookie. Called via
// navigator.sendBeacon on pagehide (see Admin.html) so leaving or
// refreshing the admin page logs it out immediately, rather than
// relying on the cookie surviving until the browser itself closes.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader(
    'Set-Cookie',
    'cg_admin_s=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  );
  res.status(200).json({ ok: true });
}
