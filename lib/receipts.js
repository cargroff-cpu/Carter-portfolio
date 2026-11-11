// lib/receipts.js — the short emails a client gets back the moment they do
// something on their project page: accept the proposal, pick a direction, ask
// for changes, approve the final, pay. Before these, the client pressed a
// button and heard nothing until Carter wrote by hand.
//
// They are receipts, not marketing: each one only confirms what the client
// just did and says what happens next, in the same frame as every other email
// (lib/mail.js). They go out only when RESEND_FROM is a verified sender, are
// logged on the job (who: system, meta.kind: receipt) so Mail > Sent shows
// them, and never throw: a receipt that fails must not undo the client's move.
//
// The wording lives in RECEIPTS below. The Hub's Mail tab previews each one
// (api/job.js 'preview' with kind "auto:<name>").

import { sb, sendEmail, NOTIFY_EMAIL, FROM_VERIFIED } from './server.js';
import { renderEmail, jobUrl } from './mail.js';

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const first = (n) => String(n || '').trim().split(/\s+/)[0] || 'there';
const rounds = (n) => `${n} round${n === 1 ? '' : 's'}`;

// Each returns { subject, heading, body, stage, eyebrow, panels?, button, note? }.
// c is the context the workflow hands over (see sendReceipt's callers).
export const RECEIPTS = {
  // Sent by api/design-brief.js the moment a brief lands. job is { name, token }.
  confirm: {
    label: 'Brief received', when: 'Right after they send a brief.',
    build: (job, c) => ({
      subject: `Got your brief — ${c.reference}`, stage: 0, eyebrow: 'Brief received', heading: 'Your brief made it in. The lamps are on.',
      preheader: `Got your brief, reference ${c.reference}`,
      body: `Hi ${first(job.name)},\n\nThanks. It's on my desk now, and I'll read it properly, not skim it.`,
      panels: [
        { type: 'ref', value: c.reference },
        { type: 'steps', title: 'What happens next', items: [
          'I read every word of it.',
          'You get a price and a delivery date, usually within one business day.',
          "If anything's missing, I'll ask for exactly that, nothing more.",
        ] },
        { type: 'facts', title: 'What you sent', rows: [
          ...((c.need || []).length ? [{ k: 'Needs', v: c.need.join(', ') }] : []),
          ...(c.budget ? [{ k: 'Budget', v: c.budget }] : []),
          ...(c.when_date ? [{ k: 'Needed by', v: c.when_date }] : []),
          ...(c.bat ? [{ k: "Bat's favour", v: '5% off your final price' }] : []),
        ] },
      ],
      // One link for the whole job, from the first email: the proposal, the
      // directions, the final and the invoices all appear on that page.
      button: 'Your project page',
      note: job.token ? 'Keep this link. Your proposal, drafts and files all show up on that page.' : undefined,
    }),
  },
  accepted: {
    label: 'Proposal accepted', when: 'Right after they accept. Asks for the deposit when the job is split 50/50.',
    build: (job, c) => {
      const dep = c.deposit ? Number(c.deposit.amount) : 0;
      const total = Number(c.total) || 0;
      return dep > 0 ? {
        subject: `You're in: ${job.title}`, stage: 2, eyebrow: 'Accepted', heading: 'Thank you. One small step, then the work begins.',
        body: `Hi ${first(job.name)},\n\nYour acceptance came through. The deposit is ready on your project page, and I start on your directions as soon as it lands.`,
        panels: [{ type: 'amount', label: 'Deposit due', value: money(dep), sub: c.deposit.label || 'Deposit (50%)', meta: [{ k: 'Pay by', v: 'Card or bank transfer' }, ...(total > dep ? [{ k: 'Balance after', v: `${money(total - dep)}, when you approve the final` }] : [])] }],
        button: 'Pay the deposit', note: 'Paid through Stripe. A receipt lands in your inbox right after.',
      } : {
        subject: `You're in: ${job.title}`, stage: 2, eyebrow: 'Accepted', heading: 'Thank you. The work starts now.',
        body: `Hi ${first(job.name)},\n\nYour acceptance came through, and I'm starting on your directions. Nothing to pay yet: the invoice comes when you approve the final.`,
        panels: [{ type: 'steps', title: 'What happens next', items: ['I make your first directions.', 'You pick the one you like best.', 'I finish it, and you approve the final.'] }],
        button: 'Open your project page',
      };
    },
  },
  picked: {
    label: 'Direction picked', when: 'Right after they pick a direction.',
    build: (job, c) => ({
      subject: `Got your pick: ${job.title}`, stage: 2, eyebrow: 'Direction picked', heading: 'Good choice. On to the final.',
      body: `Hi ${first(job.name)},\n\nI have your pick${c.label ? ` ("${c.label}")` : ''}${c.comment ? ', and your note with it' : ''}. I'm making the final from it now. You will get an email the moment it is ready to review.`,
      button: 'Open your project page', note: 'Changed your mind? You can pick again on your page until the final is ready.',
    }),
  },
  changes: {
    label: 'Changes received', when: 'Right after they ask for changes on the final.',
    build: (job, c) => {
      const left = Math.max(0, (c.included || 0) - (c.round || 0));
      const over = (c.round || 0) > (c.included || 0);
      return {
        subject: `Got your changes: ${job.title}`, stage: 3, eyebrow: 'Changes received', heading: 'Noted. I am on it.',
        body: over
          ? `Hi ${first(job.name)},\n\nI have your notes. This round goes past the ${rounds(c.included || 0)} of changes in your proposal, so I'll write to you about it before I start.`
          : `Hi ${first(job.name)},\n\nI have your notes and I'm working through them. You will get an email when the revised version is ready to review.`,
        panels: over ? [] : [{ type: 'pips', label: 'Rounds of changes left', on: left, total: c.included || left, text: `${rounds(left)} left` }],
        button: 'Open your project page',
      };
    },
  },
  approved: {
    label: 'Final approved', when: 'Right after they approve. Asks for the balance when there is one.',
    build: (job, c) => (Number(c.rest) > 0 ? {
      subject: `Approved, thank you: ${job.title}`, stage: 3, eyebrow: 'Approved', heading: 'Signed off. One step left.',
      body: `Hi ${first(job.name)},\n\nThat's the final approved, thank you. The last payment is ready on your project page.`,
      panels: [{ type: 'amount', label: 'Amount due', value: money(c.rest), sub: c.label || 'Final payment', meta: [{ k: 'Pay by', v: 'Card or bank transfer' }] }],
      button: 'Pay the balance', note: 'Paid through Stripe. A receipt lands in your inbox right after.',
    } : {
      subject: `Approved, thank you: ${job.title}`, stage: 4, eyebrow: 'Approved', heading: 'Signed off. That is us done.',
      body: `Hi ${first(job.name)},\n\nThat's the final approved, thank you, and everything is already paid. Your finished files are on your project page, yours to keep.`,
      button: 'Get your files',
    }),
  },
  paid: {
    label: 'Payment received', when: 'Right after Stripe confirms a payment. On the last one, it hands over the files.',
    build: (job, c) => {
      const amt = money(c.amount);
      if (c.done) return {
        subject: `Paid in full, thank you: ${job.title}`, stage: 4, eyebrow: 'Paid in full', heading: 'All settled. Thank you.',
        body: `Hi ${first(job.name)},\n\nYour payment of ${amt} came through, and that settles everything. Your finished files are on your project page, yours to keep.\n\nIt was a pleasure. When the next thing comes up, you know where I am.`,
        button: 'Get your files',
      };
      const starting = job.stage === 'drafts' && !c.directionsSent;
      return {
        subject: `Payment received: ${job.title}`, stage: starting ? 2 : c.stage ?? 2, eyebrow: 'Payment received', heading: 'Got it. Thank you.',
        body: `Hi ${first(job.name)},\n\nYour payment of ${amt} came through${c.label ? ` (${String(c.label).toLowerCase()})` : ''}.${starting ? " I'm starting on your directions now, and you will get an email when they are ready." : ''}`,
        panels: Number(c.toCome) > 0 ? [{ type: 'facts', rows: [{ k: 'Paid', v: amt }, { k: 'Still to come', v: `${money(c.toCome)}, when you approve the final` }] }] : [],
        button: 'Open your project page',
      };
    },
  },
};

// Made-up details, so the Hub can show each receipt without a real job.
export const RECEIPT_SAMPLES = {
  confirm: { reference: 'TS-261104-AB12', need: ['Scheduling and bookings'], budget: '$1,500–$5,000', when_date: '2026-12-01' },
  accepted: { total: 2000, deposit: { amount: 1000, label: 'Deposit (50%)' } },
  picked: { label: 'Direction B: warm', comment: 'x' },
  changes: { round: 1, included: 2 },
  approved: { rest: 1000, label: 'Final (50%)' },
  paid: { amount: 1000, label: 'Final (50%)', done: true, toCome: 0 },
};

export function renderReceipt(kind, job, c = {}) {
  const spec = RECEIPTS[kind];
  if (!spec) return null;
  const m = spec.build(job, c);
  const out = renderEmail({
    heading: m.heading, body: m.body, stage: m.stage, eyebrow: m.eyebrow, panels: m.panels || [], note: m.note,
    preheader: m.preheader || m.heading, button: job.token ? { label: m.button || 'Open your project page', url: jobUrl(job.token) } : null,
  });
  return { ...out, subject: m.subject, body: m.body };
}

// Send one. Resolves to true if it went out. Never throws.
export async function sendReceipt(kind, job, c = {}) {
  try {
    if (!FROM_VERIFIED || !job || !job.email) return false;
    const r = renderReceipt(kind, job, c);
    if (!r) return false;
    await sendEmail({ from: FROM_VERIFIED, to: job.email, replyTo: NOTIFY_EMAIL, subject: r.subject, html: r.html, text: r.text });
    await sb('job_events', { method: 'POST', body: { job_id: job.id, kind: 'email', who: 'system', body: `${r.subject}\n\n${r.body}`, meta: { kind: 'receipt', receipt: kind, auto: true } } }).catch(() => {});
    return true;
  } catch (e) {
    console.error('receipt', kind, e.message);
    return false;
  }
}
