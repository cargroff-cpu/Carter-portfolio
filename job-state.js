// job-state.js — who has the ball on a job, and what happens next.
//
// One answer, used in three places so they can never disagree:
//   * the Business Hub (loaded as a module in Business Hub.html): the chip on
//     every board card, the "Next" line on a job's page, and Needs you;
//   * the morning digest email (api/design-brief.js, the daily cron);
//   * `npm test` (scripts/check-crm.mjs).
// Pure: no imports, no network, no DOM. It lives at the repo root (not lib/)
// so the browser can load it as a plain static file.
//
// jobState(job, { brief, proposal, invoices, events }) returns
//   who    'you' | 'client' | 'done'
//   what   one plain line: what is waiting
//   since  when the wait began (ISO string)
//   age    whole days since then
//   hot    it is yours and should not sit
//   stale  it is the client's and has sat long enough to nudge
//   act    which email or panel moves it on: reply | proposal | drafts | final
//          | revised | invoice | reminder | thanks | null

const DAY = 864e5;
// Days a client can sit on each thing before it becomes "nudge them".
export const NUDGE_AFTER = { accept: 5, pick: 5, review: 5, pay: 7 };
// The moves a client makes that hand the ball back. A payment is not one:
// paying the deposit must not hide "send the directions".
const DECISIONS = ['accepted', 'picked', 'changes', 'approved'];

export const STAGE_NAMES = { new: 'New', proposed: 'Proposed', drafts: 'Directions', final: 'Final', paid: 'Paid', closed: 'Closed' };

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const t = (s) => (s ? new Date(s).getTime() : 0);

export function jobState(job, { brief = null, proposal = null, invoices = [], events = [], now = Date.now() } = {}) {
  const mine = events.filter((e) => e.job_id === job.id).sort((a, b) => t(b.created_at) - t(a.created_at));
  const decision = mine.find((e) => e.who === 'client' && DECISIONS.includes(e.kind)) || null;
  const emailed = (kinds, after) => mine.find((e) => e.kind === 'email' && e.meta && kinds.includes(e.meta.kind) && (!after || t(e.created_at) > t(after))) || null;
  const unpaid = invoices.filter((i) => i.job_id === job.id && (i.status === 'sent' || i.status === 'overdue'));
  const out = (who, what, since, extra = {}) => {
    const age = since ? Math.max(0, Math.floor((now - t(since)) / DAY)) : 0;
    const limit = extra.nudge || 0;
    return { who, what, since: since || null, age, hot: !!extra.hot, stale: who === 'client' && limit > 0 && age >= limit, act: extra.act || null };
  };

  if (job.stage === 'closed') return out('done', job.close_reason ? `Closed: ${job.close_reason}` : 'Closed', job.closed_at || job.updated_at);
  if (job.stage === 'paid') return out('done', 'Paid in full', job.updated_at, { act: emailed(['thanks']) ? null : 'thanks' });

  const sentProposal = proposal && proposal.status === 'sent';

  if (job.stage === 'new' && !sentProposal) {
    if (brief && brief.status !== 'answered' && !proposal) return out('you', 'Reply to the brief, or go straight to the proposal', job.created_at, { hot: true, act: 'reply' });
    const age = Math.floor((now - t(job.created_at)) / DAY);
    return out('you', proposal ? 'Finish the proposal and send it' : 'Write and send the proposal', job.created_at, { hot: age >= 2, act: 'proposal' });
  }

  if (job.stage === 'new' || job.stage === 'proposed') {
    if (!sentProposal) return out('you', 'The proposal has not gone out: finish and send it', job.updated_at, { hot: true, act: 'proposal' });
    return out('client', 'Waiting on them to accept the proposal', proposal.sent_at, { nudge: NUDGE_AFTER.accept, act: 'reminder' });
  }

  if (job.stage === 'drafts') {
    const accepted = decision && decision.kind === 'accepted' ? decision : null;
    if (job.picked_file_id || (decision && decision.kind === 'picked')) {
      return out('you', 'Direction picked: make and send the final', decision ? decision.created_at : job.updated_at, { hot: true, act: 'final' });
    }
    const directions = emailed(['drafts'], accepted && accepted.created_at);
    if (directions) return out('client', 'Waiting on them to pick a direction', directions.created_at, { nudge: NUDGE_AFTER.pick, act: 'reminder' });
    if (unpaid.length) return out('client', `Waiting on the ${String(unpaid[0].label || 'deposit').toLowerCase()} (${money(unpaid[0].amount)})`, unpaid[0].sent_at, { nudge: NUDGE_AFTER.pay, act: 'invoice' });
    // The clock starts at the later of "accepted" and "deposit paid".
    const paid = mine.find((e) => e.kind === 'paid');
    const start = [accepted && accepted.created_at, paid && paid.created_at].filter(Boolean).sort().pop() || job.updated_at;
    return out('you', 'Make and send the directions', start, { hot: true, act: 'drafts' });
  }

  if (job.stage === 'final') {
    if (job.approved_at) {
      if (unpaid.length) return out('client', `Waiting on the ${String(unpaid[0].label || 'final payment').toLowerCase()} (${money(unpaid[0].amount)})`, unpaid[0].sent_at || job.approved_at, { nudge: NUDGE_AFTER.pay, act: 'invoice' });
      return out('you', 'Approved with nothing left to pay: move it to Paid', job.approved_at, { hot: true });
    }
    if (decision && decision.kind === 'changes' && !emailed(['final', 'revised'], decision.created_at)) {
      return out('you', 'Changes asked for: revise and resend', decision.created_at, { hot: true, act: 'revised' });
    }
    const sent = emailed(['final', 'revised']);
    return out('client', 'Waiting on them to review the final', sent ? sent.created_at : job.updated_at, { nudge: NUDGE_AFTER.review, act: 'reminder' });
  }

  return out('you', 'Check this job', job.updated_at);
}

// Every open job with its state, split by who holds it.
//   yours    needs Carter now (hot first, then oldest)
//   nudge    waiting on a client long enough to chase
//   waiting  waiting on a client, still fresh
export function summarize({ jobs = [], proposals = [], invoices = [], briefs = [], events = [] }, now = Date.now()) {
  const yours = [], nudge = [], waiting = [];
  for (const j of jobs) {
    if (j.stage === 'closed' || j.stage === 'paid') continue;
    const s = jobState(j, {
      brief: briefs.find((b) => b.id === j.brief_id) || null,
      proposal: proposals.find((p) => p.job_id === j.id) || null,
      invoices, events, now,
    });
    const row = { j, ...s };
    if (s.who === 'you') yours.push(row);
    else if (s.stale) nudge.push({ ...row, what: `${s.what.replace(/^Waiting on them to /, 'Still to ').replace(/^Waiting on the /, 'Unpaid: ')}, ${s.age} days: nudge them` });
    else if (s.who === 'client') waiting.push(row);
  }
  const order = (a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.age - a.age;
  return { yours: yours.sort(order), nudge: nudge.sort(order), waiting: waiting.sort(order) };
}
