// lib/gmail.js — sends mail through Carter's own Gmail account (SMTP over TLS
// with an app password), so it lands in his Sent folder and replies come back
// to his inbox. No dependency: a small SMTP client on node:tls.
//
// Needs two env vars: GMAIL_USER (the address) and GMAIL_APP_PASSWORD (a
// 16-character app password from Google Account > Security > 2-Step
// Verification > App passwords; never the normal password).

import tls from 'node:tls';
import crypto from 'node:crypto';

const b64 = (s) => Buffer.from(String(s), 'utf8').toString('base64');
const wrap = (s) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();
// A header value with anything outside ASCII becomes an RFC 2047 word.
const word = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const noBreaks = (s) => String(s || '').replace(/[\r\n]+/g, ' ').trim();
// "Name <a@b.c>" -> { name, addr }
export function parseAddress(s) {
  const m = /^\s*(?:"?([^"<]*?)"?\s*)?<([^<>\s]+)>\s*$/.exec(String(s || ''));
  return m ? { name: noBreaks(m[1]), addr: m[2] } : { name: '', addr: noBreaks(s) };
}
const fmt = ({ name, addr }) => (name ? `${word(name)} <${addr}>` : addr);

export function buildMessage({ from, to, replyTo, subject, text, html }) {
  const f = parseAddress(from), t = (Array.isArray(to) ? to : [to]).map(parseAddress);
  const id = `<${crypto.randomBytes(12).toString('hex')}@${f.addr.split('@')[1] || 'localhost'}>`;
  const boundary = '=_scaffold_' + crypto.randomBytes(9).toString('hex');
  const head = [
    `From: ${fmt(f)}`,
    `To: ${t.map(fmt).join(', ')}`,
    replyTo ? `Reply-To: ${fmt(parseAddress(replyTo))}` : null,
    `Subject: ${word(noBreaks(subject))}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${id}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean).join('\r\n');
  const part = (type, body) => `--${boundary}\r\nContent-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(b64(body))}\r\n`;
  const body = part('text/plain', text || '') + (html ? part('text/html', html) : '') + `--${boundary}--\r\n`;
  return { raw: head + '\r\n\r\n' + body, from: f.addr, rcpt: t.map((x) => x.addr) };
}

// One SMTP conversation. Resolves when the server accepts the message.
export function sendViaGmail(msg, { user, pass, host = 'smtp.gmail.com', port = 465, rejectUnauthorized = true, timeoutMs = 20000 } = {}) {
  if (!user || !pass) return Promise.reject(new Error('Gmail is not connected: set GMAIL_USER and GMAIL_APP_PASSWORD.'));
  const { raw, rcpt } = buildMessage({ ...msg, from: msg.from || user });
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host, port, servername: host, rejectUnauthorized });
    let buf = '', waiter = null, done = false;
    const finish = (err) => { if (done) return; done = true; clearTimeout(timer); try { sock.destroy(); } catch (e) { /* closed */ } err ? reject(err) : resolve({ ok: true }); };
    const timer = setTimeout(() => finish(new Error('Gmail did not answer in time.')), timeoutMs);
    sock.setEncoding('utf8');
    sock.on('error', (e) => finish(new Error('Could not reach Gmail: ' + e.message)));
    sock.on('close', () => finish(new Error('Gmail closed the connection.')));
    sock.on('data', (d) => {
      buf += d;
      // A reply is complete when its last line has a space after the code.
      const lines = buf.split('\r\n');
      const last = lines.length > 1 ? lines[lines.length - 2] : '';
      if (waiter && buf.endsWith('\r\n') && /^\d{3} /.test(last)) { const w = waiter; waiter = null; const reply = buf; buf = ''; w(reply); }
    });
    const reply = () => new Promise((r) => { waiter = r; });
    const cmd = async (line, ok) => {
      if (line != null) sock.write(line + '\r\n');
      const r = await reply();
      const code = parseInt(r.trim().split('\r\n').pop().slice(0, 3), 10);
      if (!ok.includes(code)) {
        if (code === 535 || code === 534) throw new Error('Gmail refused the sign-in. Check GMAIL_USER and that GMAIL_APP_PASSWORD is a Google app password.');
        throw new Error('Gmail said: ' + r.trim().split('\r\n').pop().slice(0, 200));
      }
    };
    (async () => {
      await cmd(null, [220]);
      await cmd('EHLO scaffold.cargroff.com', [250]);
      await cmd('AUTH PLAIN ' + b64(`\0${user}\0${pass}`), [235]);
      await cmd(`MAIL FROM:<${user}>`, [250]);
      for (const r of rcpt) await cmd(`RCPT TO:<${r}>`, [250, 251]);
      await cmd('DATA', [354]);
      await cmd(raw.replace(/\r\n\./g, '\r\n..') + '\r\n.', [250]);
      sock.write('QUIT\r\n');
      finish();
    })().catch(finish);
  });
}
