// lib/rate-limit.js — a small in-memory, per-key sliding-window limiter.
//
// Best effort only: each warm serverless instance keeps its own counts, and a
// cold start resets them. That's enough to blunt a single script hammering
// /api/login or /api/design-brief; it is not a distributed limit. If abuse
// ever gets past it, move the counts into a Supabase table or Vercel KV.

const buckets = new Map();

export function clientIp(req) {
  const fwd = (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || '';
  return String(fwd).split(',')[0].trim() || 'unknown';
}

// Returns true if this hit is allowed, false if the key is over its limit.
export function hit(scope, key, { limit, windowMs }) {
  const now = Date.now();
  const id = `${scope}:${key}`;
  const recent = (buckets.get(id) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { buckets.set(id, recent); return false; }
  recent.push(now);
  buckets.set(id, recent);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  }
  return true;
}

// Clears a key's count (e.g. after a successful login).
export function reset(scope, key) {
  buckets.delete(`${scope}:${key}`);
}
