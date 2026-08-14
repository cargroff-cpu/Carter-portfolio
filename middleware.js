// middleware.js — HTTP Basic Auth gate for the admin route and its assets.
// Runs on Vercel's Edge Runtime, in front of every matched request, so an
// unauthenticated visitor never even receives the admin HTML/JS. The public
// portfolio (Carter Portfolio.html and its own scripts) is untouched — it's
// not in the matcher below.
export const config = {
  matcher: [
    '/Admin.html',
    '/admin.jsx',
    '/admin-ui.jsx',
    '/admin-sections.jsx',
    '/api/save-content',
  ],
};

export default function middleware(request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get('authorization');
  const expected = password ? 'Basic ' + btoa(`admin:${password}`) : null;

  if (expected && auth === expected) return;

  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Carter Groff Admin"' },
  });
}
