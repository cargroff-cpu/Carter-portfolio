// api/logout.js — clears the admin session cookie. Called by the Back Room's
// Sign out button. (It used to be called on every page-leave, which signed
// you out on Back and refresh; the session cookie now ends with the browser.)
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
