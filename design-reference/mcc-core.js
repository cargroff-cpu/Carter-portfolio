/* mcc-core.js, the screens I use daily: Home, Campaign List, Campaign Detail,
   Quick-Add, UTM Builder. Mobile-first markup; CSS in the shell widens them. */
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bdot = b => `<span class="dot ${b}"></span>`;
const btag = b => `<span class="tag">${bdot(b)}${BRANDS[b].short}</span>`;
const statusPill = c => c.status === 'draft' ? '<span class="pill mute">Draft</span>'
  : checklistDone(c) ? '<span class="pill ok">Tracked</span>' : '<span class="pill bad">Missing info</span>';

/* ── Home ─────────────────────────────────────────────────────────── */
function goalCard(b, zero) {
  const B = BRANDS[b], leads = zero ? 0 : B.leads, hasGoal = B.goal != null;
  const pct = hasGoal ? Math.round(leads / B.goal * 100) : 0;
  const pace = !hasGoal ? '' : zero ? 'Month just opened' : pct >= 74 ? 'On pace' : 'Behind pace';
  return `<div class="card pad goal">
    <div class="between"><div class="row">${bdot(b)}<span class="lbl">${esc(B.name)}</span></div>
      ${hasGoal ? `<span class="pill ${zero ? 'mute' : pct >= 74 ? 'ok' : 'warn'}">${pace}</span>` : ''}</div>
    ${hasGoal ? `<div class="bignum mono">${leads}<span>/ ${B.goal}</span></div>
    <div class="lbl" style="margin-bottom:10px">Leads vs. goal <span style="color:var(--text-4)">· from Pipedrive</span></div>
    <div class="bar"><i class="${b}" style="width:${Math.min(pct,100)}%"></i></div>
    <div class="between" style="margin-top:9px"><span class="sub mono">${zero ? '·' : pct + '%'}</span><span class="sub mono">${zero ? B.goal + ' to go' : (B.goal - leads) + ' to go'}</span></div>
    <div class="lbl" style="margin-top:14px;color:var(--text-4)">Synced ${esc(B.goalSynced || '')}</div>`
    : `<div class="bignum mono">${leads}</div>
    <div class="lbl" style="margin-bottom:12px">Leads this month</div>
    <div class="nogoal">No goal set in Pipedrive for ${esc(B.short)}. Set one there and it appears here.</div>`}
  </div>`;
}
/* ── Addition 2: spend and cost per lead, from cost fields already captured ── */
function spendPanel(brand, zero) {
  const brands = brand === 'both' ? ['ltw','sq'] : [brand];
  const block = b => {
    const B = BRANDS[b], mine = CAMPAIGNS.filter(x => x.brand === b && x.status !== 'draft');
    const spend = mine.reduce((a,x) => a + (x.cost || 0), 0);
    const missing = mine.filter(x => x.cost == null).length;
    const leads = zero ? 0 : B.leads;
    const cpl = leads && spend ? Math.round(spend / leads) : null;
    return `<div class="spendcol">
      <div class="row" style="gap:8px">${bdot(b)}<span class="lbl">${esc(B.short)}</span></div>
      <div class="spendrow"><span class="lbl">Spent</span><span class="mono spendnum">${zero && !spend ? '·' : money(spend)}</span></div>
      <div class="spendrow"><span class="lbl">Per lead</span><span class="mono spendnum">${cpl ? money(cpl) : '·'}</span></div>
      ${missing ? `<div class="spendnote">${missing} campaign${missing > 1 ? 's' : ''} logged without cost, so this is a floor, not the real figure.</div>` : ''}
    </div>`;
  };
  return `<section class="card"><div class="pad between" style="border-bottom:1px solid var(--line)"><h2 class="h2">Spend this month</h2><span class="lbl">From logged costs</span></div>
    <div class="pad spendgrid">${brands.map(block).join('')}</div></section>`;
}
function channelRows(brand, zero) {
  const rows = inBrand(CAMPAIGNS.filter(c => c.status !== 'draft'), brand);
  const by = {};
  rows.forEach(c => { by[c.channel] = by[c.channel] || { leads:0, cost:0, n:0, brands:new Set() };
    by[c.channel].leads += c.leads; by[c.channel].cost += c.cost || 0; by[c.channel].n++; by[c.channel].brands.add(c.brand); });
  const list = Object.entries(by).sort((a,b) => b[1].leads - a[1].leads);
  const max = Math.max(1, ...list.map(([,v]) => v.leads));
  if (zero) return `<p class="sub" style="padding:4px 0">No leads attributed yet this month. Channels appear as touches come in.</p>`;
  return list.map(([ch, v]) => `<div class="chrow">
    <div class="between"><div class="row" style="gap:8px">${[...v.brands].map(bdot).join('')}<span style="font-size:13.5px">${esc(ch)}</span></div>
      <span class="mono" style="font-size:13px;color:var(--text-2)">${v.leads} · ${v.cost ? money(Math.round(v.cost / Math.max(v.leads,1))) + '/lead' : 'no spend'}</span></div>
    <div class="bar" style="margin-top:7px;height:5px"><i style="width:${v.leads / max * 100}%"></i></div>
  </div>`).join('');
}
function recentRow(c) {
  return `<button class="reclist" data-go="detail" data-id="${c.id}">
    <div class="between"><div class="row" style="gap:8px">${bdot(c.brand)}<span style="font-size:13.5px;font-weight:500">${esc(c.name)}</span></div>${statusPill(c)}</div>
    <div class="row" style="gap:14px;margin-top:6px"><span class="sub mono">${fmtDate(c.date)}</span><span class="sub">${esc(c.channel)}</span><span class="sub mono">${c.cost == null ? '·' : money(c.cost)}</span><span class="sub mono">${c.leads} leads</span></div>
  </button>`;
}
function screenHome(s) {
  const zero = s.state === 'zero';
  const brands = s.brand === 'both' ? ['ltw','sq'] : [s.brand];
  const flagged = inBrand(CAMPAIGNS.filter(c => c.status === 'flagged'), s.brand);
  return `<div class="stack">
    ${flagged.length ? `<div class="flagbox">
      <div class="row" style="gap:10px;align-items:flex-start">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" style="flex:none;margin-top:1px"><path d="M10 2.5l8 15H2z"/><path d="M10 8v4M10 14.5v.5"/></svg>
        <div style="flex:1">
          <div class="h2">${flagged.length} campaign${flagged.length > 1 ? 's' : ''} went out untracked</div>
          <p class="sub" style="margin-top:5px;color:#e8c79b">${flagged.map(c => esc(c.name)).join(' · ')}, missing attribution, so any leads they produced land nowhere.</p>
          <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">${flagged.map(c => `<button class="btn ghost sm" data-go="detail" data-id="${c.id}">Fix ${esc(BRANDS[c.brand].short)} · ${esc(c.channel)}</button>`).join('')}</div>
        </div>
      </div></div>` : ''}
    <div class="goals ${brands.length > 1 ? 'two' : ''}">${brands.map(b => goalCard(b, zero)).join('')}</div>
    ${spendPanel(s.brand, zero)}
    <section class="card">
      <div class="pad between" style="border-bottom:1px solid var(--line)"><h2 class="h2">Channel breakdown</h2><span class="lbl">August</span></div>
      <div class="pad" style="display:flex;flex-direction:column;gap:14px">${channelRows(s.brand, zero)}</div>
    </section>
    <section class="card">
      <div class="pad between" style="border-bottom:1px solid var(--line)"><h2 class="h2">Recent campaigns</h2>
        <button class="btn quiet sm" data-go="campaigns">All campaigns →</button></div>
      <div class="reclistwrap">${inBrand(CAMPAIGNS, s.brand).slice(0, 6).map(recentRow).join('')}</div>
    </section>
  </div>`;
}

/* ── Campaign list ────────────────────────────────────────────────── */
function screenCampaigns(s) {
  if (s.state === 'empty') return emptyState();
  const rows = inBrand(CAMPAIGNS, s.brand).filter(c => (!s.ch || c.channel === s.ch) && (!s.type || c.type === s.type));
  return `<div class="stack">
    <div class="filters">
      <select class="select" data-filter="ch"><option value="">All channels</option>${CHANNELS.map(c => `<option ${s.ch === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select class="select" data-filter="type"><option value="">All types</option>${TYPES.map(c => `<option ${s.type === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select class="select"><option>This month</option><option>Last 30 days</option><option>Quarter to date</option><option>Year to date</option><option>Custom range…</option></select>
      <span class="lbl" style="margin-left:auto;white-space:nowrap">${rows.length} campaigns · ${money(rows.reduce((a,c) => a + (c.cost || 0), 0))} spent</span>
    </div>
    <div class="card scroll-x desktop-only">
      <table><thead><tr><th>Date</th><th>Brand</th><th>Campaign</th><th>Channel</th><th>Type</th><th>Cost</th><th>Qty</th><th>Leads</th><th>Status</th></tr></thead>
      <tbody>${rows.map(c => `<tr data-go="detail" data-id="${c.id}">
        <td class="mono" style="color:var(--text-2)">${fmtDate(c.date)}</td><td>${bdot(c.brand)}</td>
        <td style="font-weight:500">${esc(c.name)}</td><td style="color:var(--text-2)">${esc(c.channel)}</td>
        <td><span class="tag">${esc(c.type)}</span></td><td class="mono">${c.cost == null ? '·' : money(c.cost)}</td>
        <td class="mono" style="color:var(--text-2)">${c.qty == null ? '·' : c.qty.toLocaleString()}</td>
        <td class="mono">${c.leads || '·'}</td><td>${statusPill(c)}</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="mobile-only reclistwrap card">${rows.map(recentRow).join('')}</div>
  </div>`;
}
function emptyState() {
  return `<div class="card pad empty">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.3"><path d="M3 6h18M3 12h18M3 18h11"/></svg>
    <h2 class="h1" style="margin-top:16px">Nothing logged yet</h2>
    <p class="sub" style="max-width:340px;margin:8px auto 0">The first campaign you log sets the baseline. Thirty seconds now beats reconstructing it in November.</p>
    <div class="row" style="justify-content:center;gap:10px;margin-top:20px;flex-wrap:wrap">
      <button class="btn" data-sheet="quickadd">Log a campaign</button>
      <button class="btn ghost" data-go="links">Build a UTM link first</button>
    </div>
  </div>`;
}

/* ── Campaign detail ──────────────────────────────────────────────── */
const field = (l, v, mono) => `<div class="fld"><div class="lbl">${l}</div><div ${mono ? 'class="mono"' : ''} style="margin-top:5px;font-size:14.5px">${v == null || v === '' ? '<span style="color:var(--text-3)">·</span>' : v}</div></div>`;
function screenDetail(s) {
  const c = CAMPAIGNS.find(x => x.id === s.id) || CAMPAIGNS[0];
  const done = checklistDone(c), items = [['cost','Cost entered'],['attr','Attribution mechanism assigned'],['qty','Audience quantity logged']];
  return `<div class="stack">
    <div class="between detailhead">
      <div>
        <button class="btn quiet sm" data-go="campaigns" style="margin-left:-12px">← All campaigns</button>
        <h1 class="h1" style="font-size:24px;margin-top:6px">${esc(c.name)}</h1>
        <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">${btag(c.brand)}<span class="tag">${esc(c.channel)}</span><span class="tag">${esc(c.type)}</span><span class="tag mono">${fmtDate(c.date)}</span></div>
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn ghost">Edit</button>
        <button class="btn">Clone this campaign</button>
      </div>
    </div>
    ${done ? '' : `<div class="flagbox slim"><b>Checklist incomplete.</b> This campaign can't be marked <em>Sent</em> until every item below is cleared.</div>`}
    <div class="cols">
      <div class="stack">
        <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><h2 class="h2">The record</h2></div>
          <div class="pad fldgrid">
            ${field('Date', fmtDate(c.date), 1)}${field('Brand', esc(BRANDS[c.brand].name))}
            ${field('Channel', esc(c.channel))}${field('Campaign type', esc(c.type))}
            ${field('Audience', esc(c.audience))}${field('Quantity', c.qty == null ? null : c.qty.toLocaleString(), 1)}
            ${field('Total cost', c.cost == null ? null : money(c.cost), 1)}${field('Cost per lead', c.leads && c.cost ? money(Math.round(c.cost / c.leads)) : null, 1)}
            ${field('Creative reference', c.creative ? `<a href="#">${esc(c.creative)}</a>` : null)}
          </div>
          ${c.channel === 'Direct Mail' ? `<div class="pad mailblock">
            <div class="lbl" style="margin-bottom:16px">Piece economics · direct mail only</div>
            <div class="fldgrid">${field('Piece count', c.pieces.toLocaleString(), 1)}${field('Print / piece', '$' + c.cpp.toFixed(2), 1)}${field('Postage / piece', '$' + c.postage.toFixed(2), 1)}${field('List + mail house', money(c.listCost) + ' · ' + esc(c.mailHouse), 1)}</div>
          </div>` : ''}
          <div class="pad" style="border-top:1px solid var(--line)">${field('Notes / post-mortem', c.notes ? esc(c.notes) : null)}</div>
        </section>
        <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><div class="between"><h2 class="h2">Linked leads</h2><span class="pill mute">Pipedrive not connected</span></div></div>
          <div class="pad empty" style="padding:34px 18px">
            <p class="sub" style="max-width:330px;margin:0 auto">Once Pipedrive is connected, every lead carrying this campaign's UTM, tracked number, or promo code lists here with its stage and value.</p>
            <button class="btn ghost sm" data-go="connections" style="margin-top:16px">Open channel connections</button>
          </div>
        </section>
      </div>
      <div class="stack">
        <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><h2 class="h2">Pre-send checklist</h2></div>
          <div class="pad" style="display:flex;flex-direction:column;gap:2px">
            ${items.map(([k, label]) => `<div class="chk ${c.checklist[k] ? 'on' : 'off'}">
              <span class="box">${c.checklist[k] ? '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1.5 6.5l3 3 6-7"/></svg>' : ''}</span>
              <span>${label}</span>${c.checklist[k] ? '' : '<span class="pill bad" style="margin-left:auto">Needed</span>'}</div>`).join('')}
          </div>
          <div class="pad" style="border-top:1px solid var(--line)">
            <button class="btn" style="width:100%" ${done ? '' : 'disabled style="width:100%;opacity:.45;cursor:not-allowed"'}>${done ? 'Marked as sent' : 'Mark as sent'}</button>
          </div>
        </section>
        <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><h2 class="h2">Attribution mechanism</h2></div>
          <div class="pad">
            ${c.attribution ? `<div class="attr">${esc(c.attribution)}</div>` : `<div class="attr missing">Nothing assigned, leads from this send can't be traced back</div>`}
            ${c.utm ? `<div class="urlbox mono">${esc(c.utm)}</div>` : ''}
            <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">
              <button class="btn ghost sm" data-go="links">${c.attribution ? 'Build another link' : 'Assign a mechanism'}</button>
              ${c.utm ? '<button class="btn ghost sm" data-copy="1">Copy link</button>' : ''}
            </div>
          </div>
        </section>
        <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><h2 class="h2">Result</h2></div>
          <div class="pad fldgrid">${field('Leads attributed', c.leads || '0', 1)}${field('Closed revenue', '<span style="color:var(--text-3)">Awaiting Pipedrive</span>')}</div>
        </section>
      </div>
    </div>
  </div>`;
}

/* ── Quick-add ────────────────────────────────────────────────────── */
function sheetQuickAdd(s) {
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Log a campaign">
    <div class="sheethead between"><div><h2 class="h1">Log a campaign</h2><p class="sub" style="margin-top:3px">Three fields saves it. The rest can wait.</p></div>
      <button class="btn quiet" data-sheet="">Close</button></div>
    <div class="sheetbody">
      <div class="req">
        <div class="lbl" style="color:var(--accent)">Required</div>
        <div class="qgrid" style="margin-top:12px">
          <div><div class="lbl">Brand</div><div class="seg" style="margin-top:7px;width:100%">
            <button aria-pressed="true" style="flex:1"><span class="dot ltw"></span>LTW</button><button aria-pressed="false" style="flex:1"><span class="dot sq"></span>Squeeky</button></div></div>
          <div><div class="lbl">Channel</div><select class="select" style="margin-top:7px">${CHANNELS.map(c => `<option>${c}</option>`).join('')}</select></div>
          <div><div class="lbl">Date sent</div><input class="input" type="date" value="2026-08-17" style="margin-top:7px"></div>
        </div>
      </div>
      <div class="opt">
        <div class="between"><div class="lbl">Fill now or later</div><span class="pill mute">Optional</span></div>
        <div class="qgrid" style="margin-top:12px">
          <div><div class="lbl">Campaign name</div><input class="input" placeholder="Bee season postcard" style="margin-top:7px"></div>
          <div><div class="lbl">Cost</div><input class="input" placeholder="$" inputmode="decimal" style="margin-top:7px"></div>
          <div><div class="lbl">Quantity / audience size</div><input class="input" placeholder="1,850" inputmode="numeric" style="margin-top:7px"></div>
          <div><div class="lbl">Campaign type</div><select class="select" style="margin-top:7px">${TYPES.map(c => `<option>${c}</option>`).join('')}</select></div>
          <div><div class="lbl">Attribution mechanism</div><select class="select" style="margin-top:7px"><option>Assign later</option><option>New UTM link</option><option>CallRail number</option><option>QR code</option><option>Promo code</option></select></div>
          <div><div class="lbl">Notes</div><input class="input" placeholder="Anything you'll forget by Friday" style="margin-top:7px"></div>
        </div>
      </div>
    </div>
    <div class="sheetfoot">
      <button class="btn ghost" data-sheet="">Save as draft, finish later</button>
      <button class="btn" data-sheet="">Save campaign</button>
    </div>
  </div>`;
}

/* ── UTM builder ──────────────────────────────────────────────────── */
function screenLinks(s) {
  return `<div class="stack">
    <div class="cols links">
      <section class="card"><div class="pad" style="border-bottom:1px solid var(--line)"><h2 class="h2">Build a link</h2><p class="sub" style="margin-top:4px">Naming convention is enforced: brand-yymm-slug.</p></div>
        <div class="pad" style="display:flex;flex-direction:column;gap:14px">
          <div><div class="lbl">Brand</div><div class="seg" style="margin-top:7px;width:100%">
            <button aria-pressed="true" data-utm-brand="ltw" style="flex:1"><span class="dot ltw"></span>LTW</button>
            <button aria-pressed="false" data-utm-brand="sq" style="flex:1"><span class="dot sq"></span>Squeeky</button></div></div>
          <div><div class="lbl">Channel</div><select class="select" id="utm-ch" style="margin-top:7px">${CHANNELS.map(c => `<option>${c}</option>`).join('')}</select></div>
          <div><div class="lbl">Campaign name</div><input class="input" id="utm-name" placeholder="Bee season postcard" style="margin-top:7px"></div>
          <div><div class="lbl">Landing path</div><input class="input" id="utm-path" placeholder="/ (home)" style="margin-top:7px"></div>
        </div>
        <div class="pad" style="border-top:1px solid var(--line)">
          <div class="lbl">Generated link</div>
          <div class="urlbox mono" id="utm-out" style="margin-top:9px"></div>
          <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn sm" id="utm-copy">Copy link</button>
            <button class="btn ghost sm">Save &amp; attach to a campaign</button>
          </div>
        </div>
      </section>
      <section class="card"><div class="pad between" style="border-bottom:1px solid var(--line)"><h2 class="h2">Every link ever built</h2>
        <input class="input" placeholder="Search links…" style="max-width:200px;min-height:38px"></div>
        <div class="scroll-x"><table><thead><tr><th>Campaign</th><th>Brand</th><th>Channel</th><th>Date</th><th>URL</th></tr></thead>
        <tbody>${LINKS.map(l => `<tr><td class="mono" style="font-size:12.5px">${esc(l.name)}</td><td>${bdot(l.brand)}</td>
          <td style="color:var(--text-2)">${esc(l.channel)}</td><td class="mono" style="color:var(--text-2)">${fmtDate(l.date)}</td>
          <td><span class="urlcell mono">${esc(l.url)}</span></td></tr>`).join('')}</tbody></table></div>
      </section>
    </div>
  </div>`;
}
function wireLinks(root) {
  const out = root.querySelector('#utm-out'); if (!out) return;
  let brand = 'ltw';
  const slug = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const med = { 'Direct Mail':'postcard','Email':'constant-contact','Instagram':'social','Facebook':'social','Google Ads':'cpc','Referral Program':'referral','Trade Show':'event','Yard Sign':'print' };
  const src = { 'Direct Mail':'directmail','Email':'email','Instagram':'instagram','Facebook':'facebook','Google Ads':'google','Referral Program':'partner','Trade Show':'tradeshow','Yard Sign':'yardsign' };
  const build = () => {
    const ch = root.querySelector('#utm-ch').value, nm = root.querySelector('#utm-name').value || 'campaign-name';
    const path = (root.querySelector('#utm-path').value || '').replace(/^\/?/,'/').replace(/^\/$/,'');
    const host = brand === 'ltw' ? 'logandtimberworx.com' : 'squeekycleanva.com';
    const camp = `${brand === 'ltw' ? 'ltw' : 'squeeky'}-2608-${slug(nm)}`;
    out.textContent = `https://${host}${path}?utm_source=${src[ch]}&utm_medium=${med[ch]}&utm_campaign=${camp}`;
  };
  root.querySelectorAll('[data-utm-brand]').forEach(b => b.onclick = () => {
    root.querySelectorAll('[data-utm-brand]').forEach(x => x.setAttribute('aria-pressed', x === b));
    brand = b.dataset.utmBrand; build();
  });
  ['#utm-ch','#utm-name','#utm-path'].forEach(sel => root.querySelector(sel).addEventListener('input', build));
  root.querySelector('#utm-copy').onclick = e => { navigator.clipboard?.writeText(out.textContent); e.target.textContent = 'Copied'; setTimeout(() => e.target.textContent = 'Copy link', 1400); };
  build();
}
Object.assign(window, { esc, bdot, btag, statusPill, field, screenHome, spendPanel, screenCampaigns, screenDetail, sheetQuickAdd, screenLinks, wireLinks, emptyState });
