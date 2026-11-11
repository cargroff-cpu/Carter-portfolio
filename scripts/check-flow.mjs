// scripts/check-flow.mjs — part of `npm test`. Walks one job the whole way,
// brief to paid, through the real API handlers against an in-memory backend
// (scripts/fake-backend.mjs): no network, no keys, no database. At each step
// it checks the three things that have to stay true for the workflow to feel
// effortless: the job is in the right stage, job-state.js says the right
// person has the ball, and the right emails went out.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';

process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';
process.env.RESEND_API_KEY = 'test';
process.env.RESEND_FROM = 'The Scaffold <studio@example.com>';
process.env.NOTIFY_EMAIL = 'carter@example.com';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

const { install } = await import('./fake-backend.mjs');
const { db, emails, call } = install();
const brief = (await import('../api/design-brief.js')).default;
const job = (await import('../api/job.js')).default;
const write = (await import('../api/scaffold-write.js')).default;
const reply = (await import('../api/brief-reply.js')).default;
const webhook = (await import('../api/stripe-webhook.js')).default;
const { createSessionToken, SESSION_COOKIE } = await import('../lib/session.js');
const { jobState, summarize } = await import('../job-state.js');
const { morningDigest } = await import('../lib/digest.js');

const cookie = { cookie: `${SESSION_COOKIE}=${await createSessionToken()}` };
const J = () => db.jobs[0];
const state = (j = J()) => jobState(j, { brief: db.design_briefs.find((b) => b.id === j.brief_id), proposal: db.proposals.find((p) => p.job_id === j.id), invoices: db.invoices, events: db.job_events });
const admin = async (action, extra = {}) => { const r = await call(job, { body: { job_id: J().id, action, ...extra }, headers: cookie }); assert.equal(r.status, 200, `${action}: ${JSON.stringify(r.body)}`); return r.body; };
const client = async (action, extra = {}) => { const r = await call(job, { body: { t: J().token, action, ...extra } }); assert.equal(r.status, 200, `${action}: ${JSON.stringify(r.body)}`); return r.body; };
const toClient = () => emails.filter((e) => e.to === 'dana@example.com');
const toCarter = () => emails.filter((e) => e.to === 'carter@example.com');
const lastTo = (list) => list[list.length - 1];
const openTasks = () => db.crm_tasks.filter((t) => !t.done_at).map((t) => t.auto_key.split(':')[0]).sort();
async function stripe(type, session) {
  const raw = JSON.stringify({ type, data: { object: session } });
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${raw}`).digest('hex');
  const req = Object.assign(Readable.from([Buffer.from(raw)]), { method: 'POST', headers: { 'stripe-signature': `t=${t},v1=${sig}` } });
  const out = { status: 200 };
  const res = { status(c) { out.status = c; return res; }, json(b) { out.body = b; return res; } };
  await webhook(req, res);
  assert.equal(out.status, 200, JSON.stringify(out.body));
}

// 1. A brief comes in ─────────────────────────────────────────────────
let r = await call(brief, { body: { lane: 'design', name: 'Dana Reyes', email: 'Dana@Example.com'.toLowerCase(), business: 'Reyes Plumbing', need: ['Social graphics', 'Brand basics', 'Not a real one'], about: 'A five-post series for spring.', where: 'Instagram', when: '2026-12-01', budget: '$500–$1,500', bat: true } });
assert.equal(r.status, 200); assert.match(r.body.reference, /^TS-\d{6}-[A-Z0-9]{4}$/);
assert.equal(db.design_briefs.length, 1); assert.equal(db.jobs.length, 1);
assert.deepEqual(db.design_briefs[0].need, ['Social graphics', 'Brand basics'], 'only real options are kept');
assert.equal(J().title, 'Social graphics, Brand basics for Reyes Plumbing');
assert.equal(db.design_briefs[0].job_id, J().id);
assert.match(toCarter()[0].html, new RegExp(`business#brief=${r.body.reference}`), 'the notification links to this brief');
assert.match(toClient()[0].html, new RegExp(`/j/${J().token}`), 'the confirmation carries the project page link');
assert.match(toClient()[0].subject, /Got your brief/);
assert.deepEqual(openTasks(), ['brief']);
assert.ok(db.job_events.some((e) => e.meta && e.meta.bat), "Bat's favour is on the job");
assert.equal(state().who, 'you'); assert.equal(state().act, 'reply');
// The triage script has already drafted the reply: no AI, no outside call.
const tri = db.design_briefs[0].triage;
assert.equal(tri.model, 'rules'); assert.equal(tri.scope, 'medium'); assert.equal(tri.suggested_price, 'starts from $475');
assert.deepEqual(tri.missing, ['the exact wording', 'brand assets']);
assert.match(tri.summary, /^Dana Reyes at Reyes Plumbing wants social graphics, brand basics: A five-post series for spring\. Needed by 2026-12-01, budget \$500–\$1,500, found Bat's mouse/);
assert.match(tri.draft_reply, /^Hi Dana,/); assert.match(tri.draft_reply, /- The exact wording/); assert.match(tri.draft_reply, /Bat's favour stands/);
assert.doesNotMatch(tri.draft_reply, /\$\d/, 'the draft never names a price');

// A tools brief drops design-only answers left over from the other lane.
r = await call(brief, { body: { lane: 'automation', name: 'Sam Okafor', email: 'sam@example.com', about: 'Stop copying inquiries by hand.', where: 'Instagram', copy: 'Old copy', assets: 'Yes', when: '2026-12-15', auto_slow: 'Replying' } });
assert.equal(r.status, 200);
const tools = db.design_briefs[1];
assert.equal(tools.where, null); assert.equal(tools.copy, null); assert.equal(tools.assets, null);
assert.equal(tools.when_date, '2026-12-15', 'a tools brief keeps its deadline'); assert.equal(tools.auto_slow, 'Replying');
assert.equal(tools.triage.scope, 'large'); assert.deepEqual(tools.triage.missing, ['what exactly to make', 'the tools they use', 'who does it now', 'a budget range']);
{
  const { triageBrief } = await import('../lib/brief-triage.js');
  const now = new Date('2026-11-11T15:00:00Z'); // a Wednesday
  const t1 = triageBrief({ lane: 'design', name: 'Al', need: ['Document or report', 'Presentation or deck'], about: 'A 24 page annual report and a deck to match it, for our board.', copy: 'x', where: 'print', assets: 'Yes', when_date: '2026-11-13', budget: '$150–$500' }, { now }).triage;
  assert.deepEqual(t1.red_flags, ['Rush: needed in 2 business days', 'Budget ($150–$500) is under the starting price ($800)']);
  assert.equal(t1.scope, 'large'); assert.deepEqual(t1.missing, []); assert.match(t1.draft_reply, /I have what I need/); assert.match(t1.draft_reply, /That date is close/);
  const t2 = triageBrief({ lane: 'design', name: 'Bo', need: ['Social graphics'], about: 'One post announcing our new opening hours next month.', copy: 'Open 9 to 5', where: 'Instagram', assets: 'Yes', flexible: true }, { now }).triage;
  assert.equal(t2.scope, 'small'); assert.deepEqual(t2.missing, ['a budget range']); assert.deepEqual(t2.red_flags, []);
  assert.match(t2.draft_reply, /I have what I need/, 'a missing budget alone is not worth a round trip');
  assert.deepEqual(triageBrief({ lane: 'automation', name: 'Cy', need: ['AI assistants'], about: 'x', budget: 'Under $150', when_date: '2026-11-01' }, { now }).triage.red_flags, ['The date they gave has already passed', 'Budget (Under $150) is low for a custom tool']);
}

// The honeypot looks like success and saves nothing.
r = await call(brief, { body: { name: 'Bot', email: 'b@b.co', about: 'spam', website: 'http://spam' } });
assert.equal(r.status, 200); assert.equal(db.design_briefs.length, 2);

// 2. Carter writes the proposal and emails it ─────────────────────────
r = await call(write, { body: { table: 'proposals', row: { job_id: J().id, summary: 'Five posts.', items: [{ label: 'Five posts', amount: 1200 }], billing: 'split' } }, headers: cookie });
assert.equal(r.status, 200, JSON.stringify(r.body)); assert.equal(r.body.row.total, 1200);
assert.equal(state().what, 'Finish the proposal and send it');
r = await call(job, { body: { job_id: J().id, action: 'send', kind: 'proposal', subject: 'Your proposal', body: 'Hi Dana' } });
assert.equal(r.status, 401, 'sending needs the Backroom session');
await admin('send', { kind: 'proposal', subject: 'Your proposal', heading: 'The plan', body: 'Hi Dana,\n\nHere it is.' });
assert.equal(J().stage, 'proposed'); assert.equal(db.proposals[0].status, 'sent');
assert.equal(db.design_briefs[0].status, 'answered', 'sending the proposal answers the brief');
assert.deepEqual(openTasks(), ['brief', 'prop'], 'this brief is answered (the tools brief still waits) and the proposal has a follow-up');
assert.equal(state().who, 'client'); assert.match(state().what, /accept the proposal/);

// 3. The client accepts ───────────────────────────────────────────────
await client('accept', { comment: 'Looks good' });
assert.equal(J().stage, 'drafts');
assert.equal(db.clients.length, 1, 'accepting makes them a client'); assert.equal(J().client_id, db.clients[0].id); assert.equal(db.clients[0].source, 'brief');
assert.equal(db.invoices.length, 1); assert.equal(db.invoices[0].amount, 600); assert.equal(db.invoices[0].client_id, db.clients[0].id);
assert.match(lastTo(toClient()).subject, /You're in/); assert.match(lastTo(toClient()).text, /Deposit due: \$600/);
assert.match(lastTo(toCarter()).subject, /Proposal accepted/);
assert.equal(state().who, 'client'); assert.match(state().what, /deposit \(50%\) \(\$600\)/);

// 4. They pay the deposit by card ─────────────────────────────────────
const pay = await client('pay', { invoice_id: db.invoices[0].id });
assert.match(pay.url, /^https:\/\/buy\.stripe\.com\//);
await stripe('checkout.session.completed', { payment_link: db.invoices[0].stripe_payment_link_id, payment_status: 'paid', payment_intent: 'pi_1' });
assert.equal(db.invoices[0].status, 'paid'); assert.equal(J().stage, 'drafts');
assert.match(lastTo(toClient()).subject, /Payment received/); assert.match(lastTo(toClient()).text, /starting on your directions/);
assert.equal(state().who, 'you', 'a paid deposit hands the ball to Carter'); assert.equal(state().act, 'drafts');

// 5. Directions go out, the client picks ──────────────────────────────
const a = await admin('add-file', { kind: 'draft', label: 'Direction A', url: 'https://example.com/a' });
await admin('add-file', { kind: 'draft', label: 'Direction B', url: 'https://example.com/b' });
await admin('send', { kind: 'drafts', subject: 'Directions', body: 'Have a look.' });
assert.equal(state().who, 'client'); assert.match(state().what, /pick a direction/);
await client('pick', { file_id: a.row.id, comment: 'A, warmer' });
assert.match(lastTo(toClient()).subject, /Got your pick/);
assert.equal(state().who, 'you'); assert.equal(state().act, 'final');
const picks = toClient().length;
await client('pick', { file_id: a.row.id });
assert.equal(toClient().length, picks, 'changing the pick does not send a second receipt');

// 6. The final, one round of changes, approval ────────────────────────
await admin('add-file', { kind: 'final', label: 'Final', url: 'https://example.com/final' });
await admin('send', { kind: 'final', subject: 'Final', body: 'It is ready.' });
assert.equal(J().stage, 'final'); assert.equal(state().who, 'client');
await client('changes', { comment: 'Make the logo bigger' });
assert.equal(J().revisions_used, 1); assert.match(lastTo(toClient()).text, /1 round left/);
assert.equal(state().who, 'you'); assert.equal(state().act, 'revised');
await admin('send', { kind: 'revised', subject: 'Revised', body: 'Done.' });
assert.equal(J().stage, 'final'); assert.equal(state().who, 'client'); assert.match(state().what, /review the final/);
await client('approve');
assert.ok(J().approved_at); assert.equal(db.invoices.length, 2); assert.equal(db.invoices[1].amount, 600); assert.equal(db.invoices[1].label, 'Final (50%)');
assert.match(lastTo(toClient()).subject, /Approved, thank you/); assert.match(lastTo(toClient()).text, /Amount due: \$600/);
assert.equal(state().who, 'client'); assert.match(state().what, /final \(50%\) \(\$600\)/);

// 7. The balance, paid by bank: pending first, money later ────────────
await client('pay', { invoice_id: db.invoices[1].id });
const link = db.invoices[1].stripe_payment_link_id;
await stripe('checkout.session.completed', { payment_link: link, payment_status: 'unpaid' });
assert.equal(db.invoices[1].status, 'sent', 'a bank payment that has not cleared is not paid'); assert.equal(J().stage, 'final');
assert.match(lastTo(toCarter()).subject, /Bank payment clearing/);
await stripe('checkout.session.async_payment_succeeded', { payment_link: link, payment_status: 'paid' });
assert.equal(db.invoices[1].status, 'paid'); assert.equal(J().stage, 'paid');
assert.match(lastTo(toClient()).subject, /Paid in full/); assert.match(lastTo(toCarter()).subject, /Paid in full/);
assert.equal(state().who, 'done'); assert.equal(state().act, 'thanks');
assert.deepEqual(db.crm_tasks.filter((t) => !t.done_at && t.job_id === J().id), [], 'a paid job leaves no follow-ups open');
await admin('send', { kind: 'thanks', subject: 'Thank you', body: 'Thanks.' });
assert.equal(state().act, null);

// Every automatic email to the client is on the job's history.
assert.deepEqual(db.job_events.filter((e) => e.meta && e.meta.auto).map((e) => e.meta.receipt), ['accepted', 'paid', 'picked', 'changes', 'approved', 'paid']);

// 8. Declining a brief closes its job ─────────────────────────────────
r = await call(reply, { body: { id: tools.id, action: 'reject' } });
assert.equal(r.status, 200); assert.equal(db.jobs[1].stage, 'closed'); assert.equal(db.jobs[1].close_reason, 'Brief declined');
assert.equal(db.crm_tasks.filter((t) => !t.done_at).length, 0);

// 9. The morning digest ───────────────────────────────────────────────
let d = await morningDigest();
assert.deepEqual(d, { sent: false, why: 'nothing to do' }, 'a quiet day sends nothing');
db.brief_events.length = 0;
await call(brief, { body: { lane: 'design', name: 'Lee Park', email: 'lee@example.com', about: 'A menu.' } });
const before = toCarter().length;
d = await morningDigest();
assert.equal(d.sent, true); assert.equal(toCarter().length, before + 1);
assert.match(lastTo(toCarter()).subject, /1 thing for you today/); assert.match(lastTo(toCarter()).text, /Reply to the brief/);
d = await morningDigest();
assert.equal(d.why, 'already ran today');
const s = summarize({ jobs: db.jobs, proposals: db.proposals, invoices: db.invoices, briefs: db.design_briefs, events: db.job_events });
assert.equal(s.yours.length, 1); assert.equal(s.waiting.length, 0);

// A proposal that sits becomes a nudge after five days.
const j = { id: 'x', stage: 'proposed', updated_at: new Date().toISOString() };
const old = new Date(Date.now() - 6 * 864e5).toISOString();
assert.equal(jobState(j, { proposal: { status: 'sent', sent_at: old } }).stale, true);
assert.equal(jobState(j, { proposal: { status: 'sent', sent_at: new Date().toISOString() } }).stale, false);

console.log('check-flow: brief to paid, all good');
