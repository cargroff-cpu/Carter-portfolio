// middleware.js — gates The Back Room (the private admin side) and its
// assets/APIs behind a signed session cookie set by api/login.js, redirecting
// anyone without one to the themed login.html page. See lib/session.js.
import { verifySessionToken, readCookie, SESSION_COOKIE } from './lib/session.js';

export const config = {
  matcher: [
    '/Admin.html',
    '/back-room',
    '/admin.jsx',
    '/admin-ui.jsx',
    '/admin-sections.jsx',
    '/api/save-content',
    '/command-center-data.jsx',
    '/wick-dock.js',
    '/api/scaffold-write',
    '/api/back-room-read',
    '/api/brief-triage',
    '/docket',
    '/The Docket.html',
    '/docket.jsx',
    '/Back Room.html',
    '/back-room.jsx',
    '/api/pipedrive-goals',
    '/wick',
    '/Wick.html',
    '/wick.jsx',
    '/api/wick-chat',
    '/api/wick-memory',
    '/api/content-generate',
    '/business',
    '/Business Hub.html',
    '/business-hub.jsx',
    '/api/create-invoice-link',
  ],
};

export default async function middleware(request) {
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (await verifySessionToken(token)) return;

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
