// design.js — GENERATED from design.jsx by scripts/build-design.mjs. Do not edit; edit design.jsx and run `npm run build:design`.
const SHOW_PRICES = false;
const DESIGN_SERVICES = [{
  title: 'Social graphics',
  desc: 'One post or a series with one look.',
  need: 'Social graphics',
  from: '$75',
  turn: '2 business days'
}, {
  title: 'Cards and print',
  desc: 'Print-ready, correct bleed.',
  need: 'Business card or print',
  from: '$150',
  turn: '3 business days'
}, {
  title: 'Flyers and one-pagers',
  desc: 'For print or screen.',
  need: 'Flyer or one-pager',
  from: '$175',
  turn: '3 business days'
}, {
  title: 'Documents and reports',
  desc: 'Proposals, menus, multi-page layouts.',
  need: 'Document or report',
  from: '$400',
  turn: '5–7 business days'
}, {
  title: 'Presentations',
  desc: 'Designed slides, not a template.',
  need: 'Presentation or deck',
  from: '$400',
  turn: '5–7 business days'
}, {
  title: 'Brand basics',
  desc: 'Logo refinement, colors, type.',
  need: 'Brand basics',
  from: '$400',
  turn: 'Quoted'
}];
const TOOL_SERVICES = [{
  title: 'Inquiries and leads',
  desc: 'Every inquiry in one place, answered fast.',
  need: 'Inquiries and leads'
}, {
  title: 'Quotes and invoices',
  desc: 'From job details to a priced quote and a payment link.',
  need: 'Quotes and invoices'
}, {
  title: 'Scheduling and bookings',
  desc: 'Fewer back-and-forth messages.',
  need: 'Scheduling and bookings'
}, {
  title: 'Dashboards and reports',
  desc: 'The numbers that matter, on one screen.',
  need: 'Dashboards and reports'
}, {
  title: 'Reminders and follow-ups',
  desc: 'The right message at the right time.',
  need: 'Reminders and follow-ups'
}, {
  title: 'AI assistants',
  desc: 'Drafts replies using your prices and tone.',
  need: 'AI assistants'
}];
const DESIGN_CHIPS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = [...TOOL_SERVICES.map(t => t.need), 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];
const WORK = [];
const TESTIMONIALS = [];
const FAQ = [['Do you use AI?', 'Yes. AI does the drafting and the first pass of the build. I make the decisions, check everything and finish it.'], ['What does it cost?', 'Design is priced per piece. Tools are quoted after a short brief. Either way, you see the price before anything starts.'], ['Will I need new software?', 'Not usually. Where I can, I build on what you already use.'], ['How fast is it?', 'Most design pieces: three directions within two business days of a complete brief. Tools: a plan within a few days, then a first working version.'], ['What if something breaks?', 'I fix it. Ongoing care is available as a monthly plan.'], ['Who owns the work?', 'You do, once it’s paid.'], ['Do we need a call?', 'No. The brief covers it. If a call would help, I’ll say so.']];
const STEPS = [['I', "Who's asking"], ['II', 'What you need'], ['III', 'Details that save time']];
function Rings() {
  return React.createElement("div", {
    className: "rings",
    "aria-hidden": "true"
  }, React.createElement("span", {
    className: "r1"
  }), React.createElement("span", {
    className: "r2"
  }), React.createElement("span", {
    className: "r3"
  }), React.createElement("span", {
    className: "t1"
  }), React.createElement("span", {
    className: "t2"
  }), React.createElement("span", {
    className: "t3"
  }));
}
function Nav() {
  return React.createElement("nav", {
    className: "dnav"
  }, React.createElement("div", {
    className: "dnavin"
  }, React.createElement("a", {
    className: "dbrand",
    href: "#top"
  }, React.createElement("img", {
    src: "assets/antler.png",
    alt: ""
  }), React.createElement("span", null, React.createElement("b", null, "The ", React.createElement("i", null, "Scaffold")), React.createElement("span", {
    className: "dsub"
  }, "by Carter Groff"))), React.createElement("div", {
    className: "dnavlinks"
  }, React.createElement("a", {
    href: "#make"
  }, "What I make"), React.createElement("a", {
    href: "#how"
  }, "How it works"), React.createElement("a", {
    href: "#faq"
  }, "FAQ"), React.createElement("a", {
    href: "/"
  }, "Portfolio \u2197")), React.createElement("a", {
    className: "p-btn",
    href: "#brief"
  }, "Start a brief")));
}
function HeroVisual() {
  return React.createElement("div", {
    className: "dduo dhero-duo up"
  }, React.createElement("figure", {
    className: "dhalf"
  }, React.createElement("span", {
    className: "dhalf-k"
  }, "Design"), React.createElement("div", {
    className: "dhv-drafts"
  }, React.createElement("div", {
    className: "dhv-d d1"
  }, React.createElement("span", null, "Spring", React.createElement("br", null), "menu."), React.createElement("i", null, "From March 4th")), React.createElement("div", {
    className: "dhv-d d2"
  }, React.createElement("span", null, "SPRING MENU"), React.createElement("i", null, "from march 4th")), React.createElement("div", {
    className: "dhv-d d3"
  }, React.createElement("span", null, "spring", React.createElement("br", null), React.createElement("b", null, "menu")), React.createElement("i", null, "Mar 4 \u2192"))), React.createElement("figcaption", null, "One brief, three real directions. You pick one.")), React.createElement("figure", {
    className: "dhalf"
  }, React.createElement("span", {
    className: "dhalf-k"
  }, "Tools"), React.createElement("div", {
    className: "dpipe",
    "aria-label": "Example: an inquiry comes in, gets an auto-reply, becomes a quote, then a follow-up"
  }, ['Inquiry in', 'Auto-reply', 'Quote', 'Follow-up'].map((s, i) => React.createElement("span", {
    className: "dpipe-step",
    key: s
  }, React.createElement("b", null, String(i + 1).padStart(2, '0')), s))), React.createElement("figcaption", null, "One brief, a working tool. A person approves what customers see.")));
}
function Hero({
  onAddNeed
}) {
  return React.createElement("header", {
    className: "dhero",
    id: "top"
  }, React.createElement(Rings, null), React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dcrest"
  }, React.createElement("img", {
    src: "assets/antler.png",
    alt: "The Scaffold, by Carter Groff"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "Design and tools for small businesses"), React.createElement("h1", {
    className: "ddisplay"
  }, "Design that looks right.", React.createElement("br", null), React.createElement("em", null, "Tools that work right.")), React.createElement("p", {
    className: "ddeck"
  }, "Graphics, print and documents. And the small tools that take busywork off your plate."), React.createElement("div", {
    className: "dacts"
  }, React.createElement("a", {
    className: "p-btn",
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed('design');
    }
  }, "Start a design brief \u2192"), React.createElement("a", {
    className: "p-btn",
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed('automation');
    }
  }, "Start a tools brief \u2192")), React.createElement(HeroVisual, null)));
}
function Proofline() {
  return React.createElement("div", {
    className: "dproofline"
  }, React.createElement("span", null, "AI drafts, I finish"), React.createElement("span", null, "A person approves what customers see"), React.createElement("span", null, "Replies within a day"), React.createElement("span", null, "No call needed"));
}
function Price({
  s
}) {
  if (!SHOW_PRICES || !s.from) return null;
  return React.createElement("span", {
    className: "dprice"
  }, "From ", s.from, " \xB7 ", s.turn);
}
function Half({
  lane,
  eyebrow,
  title,
  blurb,
  items,
  cta,
  onAddNeed
}) {
  return React.createElement("section", {
    className: 'dhalf-sec up' + (lane === 'automation' ? ' dauto' : '')
  }, React.createElement("span", {
    className: "p-eyebrow"
  }, eyebrow), React.createElement("h3", {
    className: "ddisplay"
  }, title), React.createElement("p", {
    className: "dp"
  }, blurb), React.createElement("ul", {
    className: "dlist"
  }, items.map(s => React.createElement("li", {
    key: s.title
  }, React.createElement("a", {
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed(lane, s.need);
    }
  }, React.createElement("b", null, s.title), React.createElement("span", null, s.desc), React.createElement(Price, {
    s: s
  }))))), React.createElement("p", {
    style: {
      marginTop: 24
    }
  }, React.createElement("a", {
    className: 'p-btn' + (lane === 'design' ? ' ghost' : ' ghost'),
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed(lane);
    }
  }, cta)));
}
function Make({
  onAddNeed
}) {
  return React.createElement("section", {
    id: "make",
    className: "dsection"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("div", {
    className: "didxrow"
  }, React.createElement("span", {
    className: "didx"
  }, "01 / 04"), React.createElement("span", {
    className: "dln"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "What I make"), React.createElement("h2", {
    className: "ddisplay"
  }, "Two kinds of work, one person.")), React.createElement("div", {
    className: "dduo dmake"
  }, React.createElement(Half, {
    lane: "design",
    eyebrow: "Design",
    title: "What your customers see",
    blurb: "AI drafts three directions. I finish the one you pick. Two revision rounds included.",
    items: DESIGN_SERVICES,
    cta: "Start a design brief \u2192",
    onAddNeed: onAddNeed
  }), React.createElement(Half, {
    lane: "automation",
    eyebrow: "Tools",
    title: "What runs behind the scenes",
    blurb: "Small, specific tools for businesses without a developer. Proven by hand first, then automated.",
    items: TOOL_SERVICES,
    cta: "Start a tools brief \u2192",
    onAddNeed: onAddNeed
  })), WORK.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "dworkhead"
  }, React.createElement("h3", null, "Recent work")), React.createElement("div", {
    className: "dsamples"
  }, WORK.map(w => React.createElement("figure", {
    className: "dslot",
    key: w.title
  }, React.createElement("img", {
    src: w.src,
    alt: w.alt,
    loading: "lazy"
  }), React.createElement("figcaption", null, React.createElement("b", null, w.title), " \xB7 ", w.kind)))))));
}
function How() {
  const steps = [['1', 'Send a brief', 'A short form: what you need, and what it has to do.'], ['2', 'Get options', 'Design: three directions. Tools: a one-page plan and a fixed quote.'], ['3', 'I finish it', 'Design: refined by hand. Tools: built small, tested on real work.'], ['4', 'You get it', 'Design: print-ready files. Tools: a working build, handed over and explained.']];
  return React.createElement("section", {
    id: "how",
    className: "dsection dwood"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("div", {
    className: "didxrow"
  }, React.createElement("span", {
    className: "didx"
  }, "02 / 04"), React.createElement("span", {
    className: "dln"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "How it works"), React.createElement("h2", {
    className: "ddisplay"
  }, "Four steps. No surprises.")), React.createElement("div", {
    className: "dsteps"
  }, steps.map(([n, title, body]) => React.createElement("div", {
    className: "dstp up",
    key: n
  }, React.createElement("span", {
    className: "dcardn"
  }, n), React.createElement("h3", null, title), React.createElement("p", null, body))))));
}
function Why() {
  return React.createElement("section", {
    id: "why",
    className: "dsection"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dwhyhead up"
  }, React.createElement("img", {
    className: "dportrait",
    src: "assets/portrait.jpg",
    alt: "Carter Groff",
    loading: "lazy"
  }), React.createElement("div", null, React.createElement("div", {
    className: "didxrow"
  }, React.createElement("span", {
    className: "didx"
  }, "03 / 04"), React.createElement("span", {
    className: "dln"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "Who you're working with"), React.createElement("h2", {
    className: "ddisplay"
  }, "I\u2019m Carter."), React.createElement("p", {
    className: "dp"
  }, "A marketer, designer and builder in Harrisonburg, Virginia. By day I lead marketing and automation at a local company, so I know what small teams actually need."), React.createElement("p", {
    className: "dp"
  }, "My rules: prove it by hand before automating it. Automate the bottleneck, not everything. A person approves anything that reaches a customer."))), TESTIMONIALS.length > 0 && React.createElement("div", {
    className: "dquotes"
  }, TESTIMONIALS.map(t => React.createElement("blockquote", {
    className: "up",
    key: t.name
  }, React.createElement("p", null, "\u201C", t.quote, "\u201D"), React.createElement("cite", null, t.name, t.business ? ', ' + t.business : ''))))));
}
function Faq() {
  return React.createElement("section", {
    id: "faq",
    className: "dsection"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("div", {
    className: "didxrow"
  }, React.createElement("span", {
    className: "didx"
  }, "04 / 04"), React.createElement("span", {
    className: "dln"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "Questions"), React.createElement("h2", {
    className: "ddisplay"
  }, "Short answers.")), React.createElement("div", {
    className: "dfaq"
  }, FAQ.map(([q, a]) => React.createElement("details", {
    className: "up",
    key: q
  }, React.createElement("summary", null, q), React.createElement("p", null, a))))));
}
const FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const MAX_FILE_BYTES = 2.5 * 1024 * 1024;
function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({
      name: file.name,
      type: file.type,
      data: String(r.result).split(',')[1] || ''
    });
    r.onerror = () => reject(new Error('Could not read ' + file.name));
    r.readAsDataURL(file);
  });
}
const Brief = React.forwardRef(function Brief(props, ref) {
  const [step, setStep] = React.useState(0);
  const [sent, setSent] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [f, setF] = React.useState({
    lane: 'design',
    name: '',
    email: '',
    business: '',
    need: [],
    about: '',
    where: '',
    when: '',
    flexible: false,
    assets: '',
    copy: '',
    refs: '',
    notes: '',
    budget: '',
    auto_slow: '',
    auto_tools: '',
    auto_who: '',
    website: ''
  });
  const auto = f.lane === 'automation';
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }));
  const toggleNeed = v => setF(s => ({
    ...s,
    need: s.need.includes(v) ? s.need.filter(x => x !== v) : [...s.need, v]
  }));
  const setLane = lane => setF(s => s.lane === lane ? s : {
    ...s,
    lane,
    need: []
  });
  React.useImperativeHandle(ref, () => ({
    addNeed: (lane, v) => {
      setStep(0);
      setF(s => {
        const need = s.lane === lane ? s.need : [];
        return {
          ...s,
          lane,
          need: v && !need.includes(v) ? [...need, v] : need
        };
      });
    }
  }));
  const onFiles = e => {
    setError('');
    const chosen = Array.from(e.target.files || []).slice(0, 3);
    const bad = chosen.find(x => !FILE_TYPES.includes(x.type) || x.size > MAX_FILE_BYTES);
    if (bad) {
      setError(`${bad.name}: images or PDFs only, up to 2.5 MB each.`);
      e.target.value = '';
      setFiles([]);
      return;
    }
    setFiles(chosen);
  };
  const stepValid = i => {
    if (i === 0) return f.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
    if (i === 1) return f.about.trim().length > 1;
    return true;
  };
  const next = () => {
    if (!stepValid(step)) return;
    if (step < 2) setStep(step + 1);else submit();
  };
  const back = () => setStep(s => Math.max(0, s - 1));
  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...f,
        files: await Promise.all(files.map(readFile))
      };
      const r = await fetch('/api/design-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.error) {
        setError(data.error || 'Something went wrong. Try again, or email car.groff@gmail.com.');
        return;
      }
      setSent(data);
    } catch (e) {
      setError('Something went wrong. Try again, or email car.groff@gmail.com.');
    } finally {
      setBusy(false);
    }
  };
  if (sent) {
    return React.createElement("section", {
      id: "brief",
      className: "dsection ddeep"
    }, React.createElement(Rings, null), React.createElement("div", {
      className: "dwrap"
    }, React.createElement("div", {
      className: "dsent"
    }, React.createElement("h3", {
      className: "ddisplay"
    }, "Brief received."), sent.reference && React.createElement("p", {
      className: "dref"
    }, "Reference ", sent.reference), React.createElement("p", {
      className: "dp"
    }, sent.confirmation ? 'A copy is on its way to your inbox. ' : '', "I'll read it properly and come back with a price and a delivery date, usually within one business day. If anything's missing I'll ask for exactly that."))));
  }
  const chips = auto ? AUTOMATION_CHIPS : DESIGN_CHIPS;
  return React.createElement("section", {
    id: "brief",
    className: "dsection ddeep"
  }, React.createElement(Rings, null), React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dbriefhead up"
  }, React.createElement("div", {
    className: "didxrow",
    style: {
      justifyContent: 'center'
    }
  }, React.createElement("span", {
    className: "dln"
  }), React.createElement("span", {
    className: "didx"
  }, "Start here"), React.createElement("span", {
    className: "dln"
  })), React.createElement("span", {
    className: "p-eyebrow"
  }, "The brief"), React.createElement("h2", {
    className: "ddisplay"
  }, "Write me a ", React.createElement("em", null, "brief"), "."), React.createElement("p", {
    className: "ddeck"
  }, "Three short steps. The more you tell me, the sooner you get a price."), React.createElement("div", {
    className: "dbriefmeta"
  }, React.createElement("span", null, "About three minutes"), React.createElement("span", null, "No account"), React.createElement("span", null, "No call"))), React.createElement("div", {
    className: "dlanes",
    role: "radiogroup",
    "aria-label": "What kind of project"
  }, [['design', 'Design'], ['automation', 'Tools']].map(([v, label]) => React.createElement("button", {
    key: v,
    type: "button",
    role: "radio",
    "aria-checked": f.lane === v,
    className: 'dlane' + (f.lane === v ? ' on' : '') + (v === 'automation' ? ' auto' : ''),
    onClick: () => setLane(v)
  }, label))), React.createElement("div", {
    className: "dprog"
  }, React.createElement("div", {
    className: "dprogrow"
  }, React.createElement("span", null, "Step ", step + 1, " of 3 \xB7 ", STEPS[step][1]), React.createElement("span", null, step === 2 ? 'Last step' : step === 1 ? 'One left' : 'Two left')), React.createElement("div", {
    className: "dprogbars"
  }, [0, 1, 2].map(i => React.createElement("i", {
    key: i,
    className: i <= step ? 'done' : ''
  })))), React.createElement("form", {
    className: "dform",
    onSubmit: e => {
      e.preventDefault();
      next();
    }
  }, React.createElement("div", {
    className: "dhp",
    "aria-hidden": "true"
  }, React.createElement("label", null, "Website", React.createElement("input", {
    tabIndex: -1,
    autoComplete: "off",
    value: f.website,
    onChange: set('website')
  }))), step === 0 && React.createElement("div", {
    className: "dmv"
  }, React.createElement("div", {
    className: "dfields two"
  }, React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Your name ", React.createElement("i", null, "required")), React.createElement("input", {
    value: f.name,
    onChange: set('name'),
    placeholder: "Jane Carter",
    autoComplete: "name"
  })), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Where do I reply ", React.createElement("i", null, "required")), React.createElement("input", {
    type: "email",
    value: f.email,
    onChange: set('email'),
    placeholder: "jane@business.com",
    autoComplete: "email"
  }))), React.createElement("div", {
    className: "dfields"
  }, React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "The business or project name"), React.createElement("input", {
    value: f.business,
    onChange: set('business'),
    placeholder: "Carter & Co.",
    autoComplete: "organization"
  })))), step === 1 && React.createElement("div", {
    className: "dmv"
  }, React.createElement("div", {
    className: "dfields"
  }, React.createElement("div", null, React.createElement("span", {
    className: "dqlb"
  }, auto ? 'What should it do?' : 'What are we making?'), React.createElement("div", {
    className: "dchips"
  }, chips.map(c => React.createElement("label", {
    key: c,
    className: 'dchip' + (f.need.includes(c) ? ' on' : '')
  }, React.createElement("input", {
    type: "checkbox",
    checked: f.need.includes(c),
    onChange: () => toggleNeed(c)
  }), c)))), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Tell me about it ", React.createElement("i", null, "required")), React.createElement("span", {
    className: "dhint"
  }, auto ? 'What you want to stop doing by hand.' : "Who it's for and what it has to do."), React.createElement("textarea", {
    rows: 3,
    value: f.about,
    onChange: set('about'),
    placeholder: auto ? 'Every website inquiry gets copied into a spreadsheet by hand…' : 'A five-post series announcing our spring menu…'
  }))), auto ? React.createElement("div", {
    className: "dfields two"
  }, React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "What's slow today"), React.createElement("span", {
    className: "dhint"
  }, "The step that eats the most time."), React.createElement("textarea", {
    rows: 2,
    value: f.auto_slow,
    onChange: set('auto_slow'),
    placeholder: "Replying to quote requests"
  })), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Tools you already use"), React.createElement("span", {
    className: "dhint"
  }, "Email, a CRM, spreadsheets, booking software."), React.createElement("textarea", {
    rows: 2,
    value: f.auto_tools,
    onChange: set('auto_tools'),
    placeholder: "Gmail, Google Sheets, Square"
  })), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Who does it now"), React.createElement("input", {
    value: f.auto_who,
    onChange: set('auto_who'),
    placeholder: "Me, after hours"
  }))) : React.createElement("div", {
    className: "dfields two"
  }, React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Where will it run"), React.createElement("span", {
    className: "dhint"
  }, "Instagram, a printed handout, a website, an email."), React.createElement("input", {
    value: f.where,
    onChange: set('where'),
    placeholder: "Instagram feed"
  })), React.createElement("div", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "When do you need it"), React.createElement("span", {
    className: "dhint"
  }, "A date, or tell me it can move."), React.createElement("div", {
    className: "ddatewrap"
  }, React.createElement("input", {
    type: "date",
    value: f.when,
    onChange: set('when')
  }), React.createElement("label", {
    className: "dflex"
  }, React.createElement("input", {
    type: "checkbox",
    checked: f.flexible,
    onChange: set('flexible')
  }), "Flexible"))))), step === 2 && React.createElement("div", {
    className: "dmv"
  }, React.createElement("div", {
    className: "dfields"
  }, !auto && React.createElement("div", null, React.createElement("span", {
    className: "dqlb"
  }, "Do you have brand assets?"), React.createElement("div", {
    className: "dchoices"
  }, ['Yes — logo, colors, fonts', 'Some of them', 'No — help me figure it out'].map((label, i) => {
    const value = ['Yes', 'Some', 'No'][i];
    return React.createElement("label", {
      key: value,
      className: 'dchoice' + (f.assets === value ? ' on' : '')
    }, React.createElement("input", {
      type: "radio",
      name: "assets",
      checked: f.assets === value,
      onChange: () => setF(s => ({
        ...s,
        assets: value
      }))
    }), label);
  }))), !auto && React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Exact copy that must appear"), React.createElement("span", {
    className: "dhint"
  }, "Paste it verbatim. Wording that changes later is the most common cause of extra rounds."), React.createElement("textarea", {
    rows: 3,
    value: f.copy,
    onChange: set('copy'),
    placeholder: "Spring menu. Available from March 4th\u2026"
  }))), React.createElement("div", {
    className: "dfields two"
  }, !auto && React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "A look you like"), React.createElement("span", {
    className: "dhint"
  }, "One to three examples."), React.createElement("textarea", {
    rows: 2,
    value: f.refs,
    onChange: set('refs'),
    placeholder: "Links, or a description"
  })), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Anything else"), React.createElement("span", {
    className: "dhint"
  }, "Constraints, past attempts, deadlines."), React.createElement("textarea", {
    rows: 2,
    value: f.notes,
    onChange: set('notes'),
    placeholder: "Whatever I should know"
  }))), React.createElement("div", {
    className: "dfields"
  }, React.createElement("div", null, React.createElement("span", {
    className: "dqlb"
  }, "Budget range"), React.createElement("div", {
    className: "dchips"
  }, BUDGETS.map(b => React.createElement("label", {
    key: b,
    className: 'dchip' + (f.budget === b ? ' on' : '')
  }, React.createElement("input", {
    type: "radio",
    name: "budget",
    checked: f.budget === b,
    onChange: () => setF(s => ({
      ...s,
      budget: b
    }))
  }), b)))), React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, auto ? 'Screenshots or examples' : 'Logo, brand files or references'), React.createElement("span", {
    className: "dhint"
  }, "Optional. Up to three images or PDFs, 2.5 MB each."), React.createElement("input", {
    className: "dfile",
    type: "file",
    multiple: true,
    accept: FILE_TYPES.join(','),
    onChange: onFiles
  }), files.length > 0 && React.createElement("span", {
    className: "dhint"
  }, files.map(x => x.name).join(', '))))), error && React.createElement("p", {
    className: "derr",
    role: "alert"
  }, error), React.createElement("div", {
    className: "dwalk"
  }, step > 0 && React.createElement("button", {
    className: "dback",
    type: "button",
    onClick: back
  }, "\u2190 Back"), React.createElement("p", {
    className: "dfine"
  }, step === 2 ? "Price and timeline back within a day." : step === 1 ? 'One more step. All optional.' : 'Three short steps.'), React.createElement("button", {
    className: "p-btn",
    type: "submit",
    disabled: busy || !stepValid(step)
  }, busy ? 'Sending…' : step === 2 ? 'Send brief →' : 'Continue →')))));
});
function Footer() {
  return React.createElement("footer", {
    className: "dfooter"
  }, React.createElement("div", {
    className: "dwrap dfootin"
  }, React.createElement("div", {
    className: "dcrest"
  }, React.createElement("img", {
    src: "assets/antler.png",
    alt: ""
  })), React.createElement("div", null, React.createElement("p", {
    className: "ddisplay",
    style: {
      fontSize: 22
    }
  }, "The ", React.createElement("i", null, "Scaffold")), React.createElement("p", {
    className: "dfootsub"
  }, "Tools and design by Carter Groff. Harrisonburg, Virginia.")), React.createElement("div", {
    className: "dfootlinks"
  }, React.createElement("a", {
    href: "/"
  }, "\u2190 Portfolio"), React.createElement("a", {
    href: "mailto:car.groff@gmail.com"
  }, "car.groff@gmail.com"), React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Carter Groff"))));
}
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.up');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('shown'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('shown');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
function TheScaffold() {
  const briefRef = React.useRef(null);
  useReveal();
  const onAddNeed = (lane, v) => {
    if (briefRef.current) briefRef.current.addNeed(lane, v);
    document.getElementById('brief').scrollIntoView({
      behavior: 'smooth'
    });
  };
  return React.createElement("div", {
    className: "cgd p-grain"
  }, React.createElement(Nav, null), React.createElement(Hero, {
    onAddNeed: onAddNeed
  }), React.createElement(Proofline, null), React.createElement(Make, {
    onAddNeed: onAddNeed
  }), React.createElement(How, null), React.createElement(Why, null), React.createElement(Faq, null), React.createElement(Brief, {
    ref: briefRef
  }), React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(TheScaffold, null));
