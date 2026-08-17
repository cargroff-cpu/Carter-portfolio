/* mcc-data.js, stand-in records for the design pass. Shapes match the real
   campaign/touch table so the build can swap in Supabase/Pipedrive later. */
const BRANDS = {
  ltw: { key:'ltw', name:'Log & Timber Worx', short:'LTW', goal:57, leads:42, goalSource:'pipedrive', goalSynced:'today, 6:12a' },
  sq:  { key:'sq',  name:'Squeeky Clean',     short:'Squeeky', goal:40, leads:31, goalSource:'pipedrive', goalSynced:'today, 6:12a' },
};
// Brand constants, taken from brand/Brand Guide - *.md. Two separate brands:
// never mix palettes, fonts or voice between them.
const BRAND_KIT = {
  ltw: {
    name:'Log & Timber Worx', short:'LTW', owner:'Dan Link',
    position:'Wood Restoration Specialists', tagline:'Plan Ahead with Confidence',
    colors:[['Brick','#b33624'],['Gold','#ffc20e'],['Charcoal','#231f1e'],['Cream','#f6f1e6']],
    ink:'#231f1e', body:'#3a3634', muted:'#4f4e4f', canvas:'#f6f1e6', backdrop:'#dcd6c8', rule:'#4a423f', onDark:'#ded8cc',
    display:'Oswald', accent:'DM Serif Display', bodyFace:'Inter',
    typeNote:'Oswald uppercase for all display, DM Serif italic for the greeting only, Inter for body',
    opener:'Howdy,', signoff:'Dan Link',
    voice:'Plainspoken contractor to a homeowner. Short declarative sentences, concrete nouns, second person. Two clipped sentences in headlines, often a contrast.',
    rules:['No em dashes in prose','No emoji, no urgency theater','Never "formerly Shenandoah Log Homes"','Gold is a band and highlight color, never a fill behind body copy','Buttons in email: filled brick primary, outlined charcoal secondary'],
    ctaStyle:'buttons', signature:'9px gold band over a 3px charcoal hairline',
    logo:'assets/ltw-logo.png', site:'logandtimberworx.com', phone:'(844) STAINER',
    address:'2867 W Mosby Road, Harrisonburg, VA 22801',
    sales:'Steve, steve@logandtimberworx.com', states:'VA, WV, MD, PA, TN, DE',
    modules:['Three Threats','Clean / Dry / Sound','60 Month Maintenance Program','5-Year Maintenance Guide'],
    photos:'photos/ — real crew and job photography, dark bottom-weighted gradient under type',
  },
  sq: {
    name:'Squeeky Clean', short:'Squeeky', owner:null,
    position:'Exterior cleaning, route based', tagline:'We Fight Dirty',
    colors:[['Green','#9bcf36'],['Navy','#0e3c56'],['Light blue','#55b0d9'],['Blue','#176b8d']],
    ink:'#0e3c56', body:'#43687c', muted:'#176b8d', canvas:'#eef6fb', backdrop:'#dfeef7', rule:'#a9c0cd', onDark:'#eef6fb',
    display:'Archivo', accent:'Archivo', bodyFace:'Open Sans',
    typeNote:'Archivo 800 to 900 uppercase display, italic for punch, Open Sans body at 600 to 700. No serif, no condensed',
    opener:null, signoff:null,
    voice:'Upbeat, punchy, neighborly. Verbs first, rhythmic pairs and rhymes, offers stated plainly. Louder than LTW.',
    rules:['No buttons in email: text CTA, big phone, green rule','Every send structurally different from the last','No LTW colors, fonts, or timber language','Do not oversaturate the green field','Deep navy footer with a green hairline','Mascot and bubbles as accents, never wallpaper'],
    ctaStyle:'text', signature:'Light blue band, structural variation send to send',
    logo:'assets/squeeky-logo.png', site:'besqueekyclean.com', phone:'(540) 339-3432',
    address:'2867 W Mosby Road, Harrisonburg, VA 22801', sales:null, states:'Shenandoah Valley',
    modules:['Green highlight bar','Checklist badges','Dashed tear-off tabs','QR block','Mascot accent'],
    photos:'squeeky-assets/ — real crew photography, bubbles and sparkles at low density',
  },
};
const CHANNELS = ['Direct Mail','Email','Instagram','Google Ads','Referral Program','Facebook','Trade Show','Yard Sign'];
const TYPES = ['Seasonal','Reactivation','Always-On','Launch','Event','Retargeting'];
const money = n => '$' + n.toLocaleString('en-US');
const CAMPAIGNS = [
  { id:'c-101', brand:'ltw', date:'2026-08-12', channel:'Direct Mail', type:'Reactivation', name:'August reactivation postcard', audience:'Past estimates, 2023–2025', qty:1850, cost:1642, pieces:1850, cpp:0.53, postage:0.36, listCost:190, mailHouse:'Send Jim', attribution:'CallRail · (540) 555-0142', utm:null, leads:14, status:'sent', checklist:{cost:true,attr:true,qty:true}, creative:'ltw-reactivation-aug26.pdf', notes:'Third run of this piece. Best responder segment is still 2024 estimates.' },
  { id:'c-102', brand:'sq',  date:'2026-08-09', channel:'Email', type:'Seasonal', name:'Pre-fall gutter clean push', audience:'Constant Contact · full list', qty:3120, cost:96, attribution:'UTM · squeeky-email-prefall-gutters', utm:'https://squeekycleanva.com/?utm_source=email&utm_medium=constant-contact&utm_campaign=squeeky-2608-prefall-gutters', leads:9, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-103', brand:'ltw', date:'2026-08-06', channel:'Instagram', type:'Always-On', name:'Restoration reel, Rockingham cabin', audience:'Organic + $75 boost', qty:1, cost:75, attribution:'UTM · ltw-ig-rockingham-reel', utm:'https://logandtimberworx.com/?utm_source=instagram&utm_medium=social&utm_campaign=ltw-2608-rockingham-reel', leads:6, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-104', brand:'sq',  date:'2026-08-04', channel:'Google Ads', type:'Always-On', name:'House wash, Harrisonburg', audience:'25mi radius, exact match', qty:1, cost:480, attribution:'UTM · squeeky-gads-housewash', leads:11, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-105', brand:'ltw', date:'2026-08-02', channel:'Email', type:'Always-On', name:'Monthly restoration letter', audience:'Owners list · 1,410', qty:1410, cost:0, attribution:null, leads:3, status:'flagged', checklist:{cost:true,attr:false,qty:true} },
  { id:'c-106', brand:'sq',  date:'2026-07-28', channel:'Yard Sign', type:'Always-On', name:'Job-site signs, summer batch', audience:'Active job sites', qty:40, cost:388, attribution:'QR · squeeky-yardsign-q3', leads:4, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-107', brand:'ltw', date:'2026-07-24', channel:'Direct Mail', type:'Seasonal', name:'Chink & seal season mailer', audience:'Log home owners, 3 counties', qty:2400, cost:2136, pieces:2400, cpp:0.53, postage:0.36, listCost:265, mailHouse:'Send Jim', attribution:'CallRail · (540) 555-0177', leads:19, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-108', brand:'sq',  date:'2026-07-21', channel:'Facebook', type:'Retargeting', name:'Roof wash before/after set', audience:'Site visitors, 30d', qty:1, cost:210, attribution:null, leads:2, status:'flagged', checklist:{cost:true,attr:false,qty:false} },
  { id:'c-109', brand:'ltw', date:'2026-07-16', channel:'Referral Program', type:'Always-On', name:'Contractor referral cards', audience:'12 partner builders', qty:300, cost:145, attribution:'Promo · TIMBER10', leads:5, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-110', brand:'sq',  date:'2026-07-11', channel:'Trade Show', type:'Event', name:'Rockingham County Fair booth', audience:'Fair traffic', qty:1, cost:1250, attribution:'Promo · FAIR26', leads:16, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-111', brand:'ltw', date:'2026-07-08', channel:'Instagram', type:'Launch', name:'Second Act series, ep. 1', audience:'Organic', qty:1, cost:0, attribution:'UTM · ltw-ig-second-act-1', leads:4, status:'sent', checklist:{cost:true,attr:true,qty:true} },
  { id:'c-112', brand:'sq',  date:'2026-08-15', channel:'Direct Mail', type:'Seasonal', name:'Carpenter bee season, draft', audience:'TBD', qty:null, cost:null, attribution:null, leads:0, status:'draft', checklist:{cost:false,attr:false,qty:false} },
];
const LINKS = [
  { name:'squeeky-2608-prefall-gutters', brand:'sq', channel:'Email', date:'2026-08-09', url:'https://squeekycleanva.com/?utm_source=email&utm_medium=constant-contact&utm_campaign=squeeky-2608-prefall-gutters' },
  { name:'ltw-2608-rockingham-reel', brand:'ltw', channel:'Instagram', date:'2026-08-06', url:'https://logandtimberworx.com/?utm_source=instagram&utm_medium=social&utm_campaign=ltw-2608-rockingham-reel' },
  { name:'squeeky-2607-housewash-gads', brand:'sq', channel:'Google Ads', date:'2026-07-30', url:'https://squeekycleanva.com/?utm_source=google&utm_medium=cpc&utm_campaign=squeeky-2607-housewash-gads' },
  { name:'ltw-2607-second-act-1', brand:'ltw', channel:'Instagram', date:'2026-07-08', url:'https://logandtimberworx.com/?utm_source=instagram&utm_medium=social&utm_campaign=ltw-2607-second-act-1' },
  { name:'ltw-2606-chink-season', brand:'ltw', channel:'Direct Mail', date:'2026-06-24', url:'https://logandtimberworx.com/chinking?utm_source=directmail&utm_medium=postcard&utm_campaign=ltw-2606-chink-season' },
];
const CONNECTIONS = [
  { name:'Pipedrive', role:'Leads & deal value, the spine of attribution', status:'not' },
  { name:'CallRail', role:'Tracked numbers per campaign', status:'manual' },
  { name:'Constant Contact', role:'Email sends, opens, clicks', status:'manual' },
  { name:'Send Jim', role:'Direct mail drops, piece counts, cost', status:'manual' },
  { name:'Meta / Instagram', role:'Paid + organic social reach and spend', status:'not' },
  { name:'Google Ads', role:'Spend and conversions by campaign', status:'not' },
  { name:'ISN', role:'Job records for close-rate context', status:'not' },
  { name:'NiceJob', role:'Reviews and referral traffic', status:'not' },
];
const CALENDAR = [
  { d:3, brand:'ltw', channel:'Email', name:'Monthly letter' },
  { d:4, brand:'sq', channel:'Google Ads', name:'House wash refresh' },
  { d:6, brand:'ltw', channel:'Instagram', name:'Rockingham reel' },
  { d:9, brand:'sq', channel:'Email', name:'Pre-fall gutters' },
  { d:12, brand:'ltw', channel:'Direct Mail', name:'Reactivation postcard' },
  { d:15, brand:'sq', channel:'Direct Mail', name:'Bee season (draft)' },
  { d:19, brand:'ltw', channel:'Instagram', name:'Second Act ep. 2' },
  { d:21, brand:'sq', channel:'Facebook', name:'Roof wash retarget' },
  { d:26, brand:'ltw', channel:'Referral Program', name:'Builder card drop' },
  { d:28, brand:'sq', channel:'Yard Sign', name:'Fall sign batch' },
];
const REVENUE = [
  { channel:'Direct Mail', brand:'ltw', cost:3778, leads:33, closed:6, revenue:78400 },
  { channel:'Referral Program', brand:'ltw', cost:145, leads:5, closed:2, revenue:31200 },
  { channel:'Instagram', brand:'ltw', cost:75, leads:10, closed:1, revenue:9800 },
  { channel:'Email', brand:'ltw', cost:0, leads:3, closed:0, revenue:0 },
  { channel:'Google Ads', brand:'sq', cost:480, leads:11, closed:5, revenue:6400 },
  { channel:'Trade Show', brand:'sq', cost:1250, leads:16, closed:6, revenue:8900 },
  { channel:'Email', brand:'sq', cost:96, leads:9, closed:3, revenue:3750 },
  { channel:'Yard Sign', brand:'sq', cost:388, leads:4, closed:2, revenue:2600 },
];
// Rows Wick logs from conversation land in the same lists.
try {
  const extraC = JSON.parse(localStorage.getItem('cg_mcc_campaigns')) || [];
  const extraL = JSON.parse(localStorage.getItem('cg_mcc_links')) || [];
  extraC.forEach(c => CAMPAIGNS.unshift(c));
  extraL.forEach(l => LINKS.unshift(l));
} catch (e) {}
const fmtDate = s => { const [y,m,d] = s.split('-'); return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'}); };
const inBrand = (rows, brand) => brand === 'both' ? rows : rows.filter(r => r.brand === brand);
const checklistDone = c => c.checklist.cost && c.checklist.attr && c.checklist.qty;
Object.assign(window, { BRANDS, BRAND_KIT, CHANNELS, TYPES, CAMPAIGNS, LINKS, CONNECTIONS, CALENDAR, REVENUE, money, fmtDate, inBrand, checklistDone });
