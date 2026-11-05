// middleware.js — gates The Back Room (the private admin tools) and their
// APIs behind a signed session cookie set by api/login.js, redirecting
// anyone without a valid one to the themed login.html page. The cookie is a
// signed, expiring token (lib/session.js), not the password.
import { verifySessionToken, SESSION_COOKIE } from './lib/session.js';

export const config = {
  matcher: [
    '/Admin.html',
    '/scaffold',
    '/backroom',
    '/backroom/scaffold',
    '/Scaffold Admin.html',
    '/scaffold-admin.jsx',
    '/admin.jsx',
    '/admin-ui.jsx',
    '/admin-sections.jsx',
    '/api/save-content',
    '/command-center-data.jsx',
    '/api/scaffold-write',
    '/api/scaffold-read',
    '/docket',
    '/The Docket.html',
    '/docket.jsx',
    '/Scaffold Hub.html',
    '/scaffold-hub.jsx',
    '/api/pipedrive-goals',
    '/business',
    '/Business Hub.html',
    '/business-hub.jsx',
    '/api/create-invoice-link',
    '/api/brief-reply',
  ],
};

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function middleware(request) {
  if (await verifySessionToken(getCookie(request, SESSION_COOKIE))) return;

  const url = new URL(request.url);

  // API routes get a plain 401 — there's no page to redirect an API call to.
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const loginUrl = new URL('/login.html', request.url);
  loginUrl.searchParams.set('next', url.pathname);
  return Response.redirect(loginUrl, 302);
}
