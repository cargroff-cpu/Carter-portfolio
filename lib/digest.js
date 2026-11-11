// lib/digest.js — the morning digest: one email to Carter listing what needs
// him today, what is worth a nudge, and what is waiting on clients. It is how
// the Backroom stays in view on a day he never opens it.
//
// Runs from the daily Vercel Cron (GET /api/design-brief, vercel.json), at
// most once a day (a "digest" row in brief_events marks the day done), and
// sends nothing on a day with nothing to do. The lists come from
// job-state.js, the same answer the Business Hub shows.

import { sb, sendEmail, logEvent, NOTIFY_EMAIL } from './server.js';
import { renderEmail } from './mail.js';
import { summarize } from '../job-state.js';

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const who = (j) => j.business || j.name;
// Carter's day, not UTC's: a task due "today" is due on his calendar.
const localDay = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

export async function morningDigest() {
  const start = new Date(); start.setUTCHours(0, 0, 0, 0);
  const already = await sb(`brief_events?kind=eq.digest&created_at=gte.${start.toISOString()}&select=id&limit=1`);
  if (already.length) return { sent: false, why: 'already ran today' };

  const jobs = await sb('jobs?stage=not.in.(paid,closed)&select=*');
  const ids = jobs.map((j) => j.id);
  const inJobs = ids.length ? `job_id=in.(${ids.join(',')})` : null;
  const [proposals, invoices, events, briefs] = inJobs ? await Promise.all([
    sb(`proposals?${inJobs}&select=job_id,status,total,sent_at`),
    sb(`invoices?${inJobs}&select=job_id,label,amount,status,sent_at`),
    sb(`job_events?${inJobs}&select=job_id,kind,who,meta,created_at&order=created_at.desc&limit=1000`),
    sb(`design_briefs?${inJobs}&select=id,status`),
  ]) : [[], [], [], []];
  // Follow-ups due today or earlier. crm_tasks may not exist yet; that is fine.
  const tasks = await sb(`crm_tasks?done_at=is.null&due_on=lte.${localDay()}&select=*&order=due_on.asc`).catch(() => []);

  const s = summarize({ jobs, proposals, invoices, briefs, events });
  // A job already listed says what to do; its automatic follow-up would repeat it.
  const listed = new Set([...s.yours, ...s.nudge].map((r) => r.j.id));
  const due = tasks.filter((x) => !(x.auto_key && listed.has(x.job_id)));
  const count = s.yours.length + s.nudge.length + due.length;
  if (!count) {
    await logEvent({ kind: 'digest', ok: true, detail: 'nothing to do' });
    return { sent: false, why: 'nothing to do' };
  }

  const owed = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((a, i) => a + Number(i.amount || 0), 0);
  const out = proposals.filter((p) => p.status === 'sent').reduce((a, p) => a + Number(p.total || 0), 0);
  const jobOf = (id) => jobs.find((j) => j.id === id);
  const panels = [
    { type: 'stats', items: [{ k: 'Open jobs', v: String(jobs.length) }, { k: 'Proposals out', v: money(out) }, { k: 'Owed to you', v: money(owed), ok: owed > 0 }] },
  ];
  if (s.yours.length) panels.push({ type: 'steps', title: 'Your move', items: s.yours.slice(0, 12).map((r) => ({ t: `${r.j.title} (${who(r.j)})`, s: `${r.what}${r.age ? ` · ${r.age}d` : ''}` })) });
  if (s.nudge.length) panels.push({ type: 'steps', title: 'Worth a nudge', items: s.nudge.slice(0, 12).map((r) => ({ t: `${r.j.title} (${who(r.j)})`, s: r.what })) });
  if (due.length) panels.push({ type: 'steps', title: 'Follow-ups due', items: due.slice(0, 12).map((x) => ({ t: x.title, s: `${x.due_on < localDay() ? 'Overdue since' : 'Due'} ${x.due_on}${jobOf(x.job_id) ? ` · ${jobOf(x.job_id).title}` : ''}` })) });
  if (s.waiting.length) panels.push({ type: 'facts', title: 'With your clients', rows: s.waiting.slice(0, 12).map((r) => ({ k: who(r.j), v: `${r.what.replace(/^Waiting on (them to |the )/, '')}${r.age ? ` · ${r.age}d` : ''}` })) });

  const { html, text } = renderEmail({
    tone: 'internal', eyebrow: 'This morning', heading: `${count} thing${count === 1 ? '' : 's'} for you today.`,
    body: s.yours.length ? `First: ${s.yours[0].j.title}. ${s.yours[0].what}.` : 'Nothing is blocked on you. A couple of things are worth a nudge.',
    panels, button: { label: 'Open the Business Hub', url: 'https://scaffold.cargroff.com/business' },
  });
  await sendEmail({ to: NOTIFY_EMAIL, subject: `Backroom: ${count} thing${count === 1 ? '' : 's'} for you today`, html, text });
  await logEvent({ kind: 'digest', ok: true, detail: `${s.yours.length} yours, ${s.nudge.length} nudge, ${due.length} tasks` });
  return { sent: true, count };
}
