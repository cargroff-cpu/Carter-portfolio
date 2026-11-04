// GENERATED from design.jsx by scripts/build-design.mjs. Edit design.jsx, then rebuild.
const DESIGN_SERVICES = [{
  name: 'Social graphics',
  need: 'Social graphics',
  what: 'A single post or a full series that shares one look, sized for every platform you use.'
}, {
  name: 'Business cards and print',
  need: 'Business card or print',
  what: 'Double-sided, print-ready, correct bleed. Files your printer accepts the first time.'
}, {
  name: 'Flyers and one-pagers',
  need: 'Flyer or one-pager',
  what: 'For the counter, the mailbox, or the inbox. Print and digital versions from one design.'
}, {
  name: 'Documents and decks',
  need: 'Document or report',
  what: 'Proposals, menus, reports, and slides that are designed, not dropped into a template.'
}, {
  name: 'Brand basics',
  need: 'Brand basics',
  what: 'Logo refinement, a color and type system, and a one-page guide so everything stays consistent.'
}, {
  name: 'Monthly content',
  need: 'Monthly content plan',
  what: 'A set number of on-brand posts every month, planned ahead, delivered on schedule.'
}];
const DESIGN_NEEDS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Monthly content plan', 'Something else'];
const AUTOMATIONS = [{
  name: 'Lead and inquiry handling',
  what: 'Every form, call note, and email inquiry lands in one place, gets an instant reply, and reminds you to follow up.'
}, {
  name: 'Content pipelines',
  what: 'On-brand posts and emails drafted on a schedule from your own brand guide, waiting for your approval.'
}, {
  name: 'Dashboards and trackers',
  what: 'Your numbers and to-dos on one screen instead of six tabs and a spreadsheet nobody updates.'
}, {
  name: 'Custom AI assistants',
  what: 'An assistant that knows your services, prices, and tone, trained on your own documents.'
}];
const AUTOMATION_NEEDS = ['Lead and inquiry handling', 'Content pipeline', 'Dashboard or tracker', 'Custom AI assistant', 'Something else'];
const BUDGETS = ['Under $250', '$250–$750', '$750–$2,000', '$2,000+', 'Not sure yet'];
const FAQ = [['Do you use AI?', 'Yes, openly. AI drafts the first directions and handles the busywork, which is why you get three real options in days instead of one in weeks. I choose what goes forward, fix what AI gets wrong, and finish every file by hand. Nothing goes to you without my review.'], ['What if I don’t like any of the three directions?', 'Tell me what’s off and I’ll send a fresh round before we start refining. A brief that misses usually means the brief was missing something, and that’s on me to ask about.'], ['How do revisions work?', 'Two rounds of revisions are included in every design quote. A round is one consolidated list of changes. More rounds are available, and I’ll say what they cost before doing them.'], ['Who owns the files?', 'You do. Once the invoice is paid, the final files and the rights to use them are yours, including the editable source files.'], ['How do I pay?', 'Every job gets a fixed quote before any work starts. You pay by card through a secure Stripe link. No subscriptions unless you ask for a monthly plan.'], ['Do you only work with local businesses?', 'No. I’m in Harrisonburg, Virginia, and happy to meet locally, but everything works by email, so location doesn’t matter.'], ['What do you need from me?', 'The brief covers it: what you need, where it runs, when you need it, the exact wording, and your logo and colors if you have them. The more of that you send, the closer the first draft lands.']];
function Crest({
  size = 28
}) {
  return React.createElement("img", {
    src: "assets/antler.png",
    alt: "",
    width: size,
    height: Math.round(size * 0.7),
    style: {
      width: size,
      height: 'auto'
    }
  });
}
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
    className: "snav",
    "aria-label": "Main"
  }, React.createElement("div", {
    className: "snavin"
  }, React.createElement("a", {
    className: "sbrand",
    href: "#top",
    "aria-label": "The Scaffold, by Carter Groff, home"
  }, React.createElement(Crest, null), React.createElement("span", null, React.createElement("b", null, "The Scaffold"), React.createElement("span", {
    className: "ssub"
  }, "by Carter Groff"))), React.createElement("div", {
    className: "snavlinks"
  }, React.createElement("a", {
    href: "#design"
  }, "Design"), React.createElement("a", {
    href: "#automation"
  }, "Automation"), React.createElement("a", {
    href: "#how"
  }, "How it works"), React.createElement("a", {
    href: "#faq"
  }, "FAQ"), React.createElement("a", {
    href: "/"
  }, "Portfolio")), React.createElement("a", {
    className: "sbtn",
    href: "#brief"
  }, "Start a brief")));
}
function BriefToDrafts() {
  return React.createElement("figure", {
    className: "bdx",
    "aria-label": "Example: one brief for a spring menu flyer becomes three different design directions"
  }, React.createElement("div", {
    className: "bdx-brief"
  }, React.createElement("span", {
    className: "bdx-tag"
  }, "The brief"), React.createElement("p", {
    className: "bdx-name"
  }, "Rye & Ember Bakery"), React.createElement("dl", null, React.createElement("div", null, React.createElement("dt", null, "Need"), React.createElement("dd", null, "Spring menu flyer")), React.createElement("div", null, React.createElement("dt", null, "Runs on"), React.createElement("dd", null, "Counter, Instagram")), React.createElement("div", null, React.createElement("dt", null, "Copy"), React.createElement("dd", null, "\u201CNew for spring. Lemon rye, rhubarb tarts.\u201D")), React.createElement("div", null, React.createElement("dt", null, "Due"), React.createElement("dd", null, "March 4")))), React.createElement("svg", {
    className: "bdx-arrow",
    viewBox: "0 0 60 24",
    "aria-hidden": "true"
  }, React.createElement("path", {
    d: "M2 12h52M46 4l8 8-8 8",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  })), React.createElement("div", {
    className: "bdx-drafts"
  }, React.createElement("div", {
    className: "bdx-d bdx-d1"
  }, React.createElement("span", {
    className: "sun"
  }), React.createElement("b", null, "Spring"), React.createElement("i", null, "at Rye & Ember"), React.createElement("small", null, "Lemon rye \xB7 Rhubarb tarts")), React.createElement("div", {
    className: "bdx-d bdx-d2"
  }, React.createElement("small", null, "New for spring"), React.createElement("b", null, "Lemon", React.createElement("br", null), "Rye"), React.createElement("ul", null, React.createElement("li", null, "Rhubarb tart"), React.createElement("li", null, "Honey loaf"), React.createElement("li", null, "Sorrel scone"))), React.createElement("div", {
    className: "bdx-d bdx-d3"
  }, React.createElement("b", null, "NEW"), React.createElement("b", null, "FOR"), React.createElement("b", {
    className: "hot"
  }, "SPRING"), React.createElement("small", null, "Rye & Ember"))), React.createElement("figcaption", null, "Example brief. Three different directions back, not one layout in three colors."));
}
function Hero() {
  return React.createElement("header", {
    className: "shero",
    id: "top"
  }, React.createElement(Rings, null), React.createElement("div", {
    className: "swrap shero-in"
  }, React.createElement("div", {
    className: "shero-copy"
  }, React.createElement("h1", {
    className: "sdisplay"
  }, "Drafted by AI.", React.createElement("br", null), React.createElement("em", null, "Finished by hand.")), React.createElement("p", {
    className: "sdeck"
  }, "The Scaffold is a one-person studio for businesses without a designer or developer on staff. Marketing design in days, and automations that take the busywork off your plate."), React.createElement("div", {
    className: "sacts"
  }, React.createElement("a", {
    className: "sbtn",
    href: "#brief"
  }, "Start a brief"), React.createElement("a", {
    className: "sbtn ghost",
    href: "#how"
  }, "How it works")), React.createElement("ul", {
    className: "sproof"
  }, React.createElement("li", null, "Three real directions"), React.createElement("li", null, "Two revision rounds"), React.createElement("li", null, "Fixed quote in one business day"), React.createElement("li", null, "No call required"))), React.createElement(BriefToDrafts, null)));
}
function DesignLane({
  onAddNeed,
  work
}) {
  return React.createElement("section", {
    id: "design",
    className: "ssection"
  }, React.createElement("div", {
    className: "swrap"
  }, React.createElement("div", {
    className: "shead"
  }, React.createElement("h2", {
    className: "sdisplay"
  }, "Design, in days."), React.createElement("p", {
    className: "slead"
  }, "Static marketing pieces with a fixed quote, three directions to choose from, and print-ready files at the end.")), React.createElement("ul", {
    className: "slist"
  }, DESIGN_SERVICES.map(s => React.createElement("li", {
    key: s.name
  }, React.createElement("h3", null, s.name), React.createElement("p", null, s.what), React.createElement("button", {
    type: "button",
    className: "slink",
    onClick: () => onAddNeed('design', s.need)
  }, "Add to brief")))), React.createElement("p", {
    className: "saside"
  }, "Video, motion graphics, and marketing strategy are available too. Describe it in the brief and I\u2019ll quote it."), work.length > 0 && React.createElement("div", {
    className: "swork"
  }, React.createElement("h3", {
    className: "sh3"
  }, "Recent design work"), React.createElement("div", {
    className: "sworkgrid"
  }, work.map(w => React.createElement("figure", {
    key: w.title
  }, React.createElement("img", {
    src: w.thumb || w.image,
    alt: w.title + ', ' + w.kind,
    loading: "lazy"
  }), React.createElement("figcaption", null, React.createElement("b", null, w.title), React.createElement("span", null, w.kind))))))));
}
function AutomationLane({
  onAddNeed
}) {
  return React.createElement("section", {
    id: "automation",
    className: "ssection swarm"
  }, React.createElement("div", {
    className: "swrap"
  }, React.createElement("div", {
    className: "shead"
  }, React.createElement("h2", {
    className: "sdisplay"
  }, "Stop doing busywork ", React.createElement("em", null, "by hand.")), React.createElement("p", {
    className: "slead"
  }, "Small tools and automations, built around how your business already works. Every build starts with a short audit and a written plan, so you know exactly what you\u2019re getting before anything is built.")), React.createElement("div", {
    className: "sauto"
  }, React.createElement("ul", {
    className: "slist slist-two"
  }, AUTOMATIONS.map((a, i) => React.createElement("li", {
    key: a.name
  }, React.createElement("h3", null, a.name), React.createElement("p", null, a.what), React.createElement("button", {
    type: "button",
    className: "slink",
    onClick: () => onAddNeed('automation', AUTOMATION_NEEDS[i])
  }, "Add to brief")))), React.createElement("figure", {
    className: "sshot"
  }, React.createElement("img", {
    src: "assets/shot-back-room.jpg",
    alt: "The Back Room brief inbox, showing an AI triage of a sample brief with missing details, flags, scope, and a draft reply",
    loading: "lazy",
    width: "1400",
    height: "875"
  }), React.createElement("figcaption", null, "The Back Room, the lead, project, and invoice system I built and run this studio on. Every new brief gets an AI triage I review before replying. Shown with sample data.")))));
}
function How() {
  const steps = [['Send a brief', 'A short form that covers what a designer needs: the wording, the sizes, where it runs, when it’s due. No call.'], ['Get a fixed quote', 'Within one business day, a price and a delivery date. If anything’s missing, I ask before quoting.'], ['AI drafts, I direct', 'AI produces a wide set of first drafts from your brief and brand. I pick the strongest three and rework them.'], ['Choose and refine', 'Pick a direction. Two revision rounds are included to get every detail right.'], ['Get your files', 'Print-ready, correctly sized, with editable source files. Yours once the invoice is paid.']];
  return React.createElement("section", {
    id: "how",
    className: "ssection"
  }, React.createElement("div", {
    className: "swrap"
  }, React.createElement("div", {
    className: "shead"
  }, React.createElement("h2", {
    className: "sdisplay"
  }, "You always know where the job stands."), React.createElement("p", {
    className: "slead"
  }, "Five steps, the same every time. AI does the drafting and the admin. I make every decision you\u2019ll see.")), React.createElement("ol", {
    className: "ssteps"
  }, steps.map(([t, b]) => React.createElement("li", {
    key: t
  }, React.createElement("h3", null, t), React.createElement("p", null, b))))));
}
function About() {
  return React.createElement("section", {
    id: "about",
    className: "ssection swarm"
  }, React.createElement("div", {
    className: "swrap sabout"
  }, React.createElement("img", {
    className: "sportrait",
    src: "assets/portrait.jpg",
    alt: "Carter Groff on a black-sand beach",
    width: "900",
    height: "1200",
    loading: "lazy"
  }), React.createElement("div", null, React.createElement("h2", {
    className: "sdisplay"
  }, "One person, both jobs."), React.createElement("p", {
    className: "slead"
  }, "I\u2019m Carter Groff, a marketer and designer in Harrisonburg, Virginia. My day job is running marketing for two local companies, so I design for businesses that need the work to bring in customers, not just look good."), React.createElement("p", {
    className: "sbody"
  }, "I studied media arts and design at James Madison University, and I built the tools this studio runs on myself. AI lets me move at the speed of a team. The judgment, the taste, and the final file are still mine, and you\u2019re always talking to me, not an account manager."), React.createElement("a", {
    className: "slink",
    href: "/"
  }, "See the full portfolio"))));
}
function Faq() {
  return React.createElement("section", {
    id: "faq",
    className: "ssection"
  }, React.createElement("div", {
    className: "swrap sfaq"
  }, React.createElement("h2", {
    className: "sdisplay"
  }, "Questions, answered."), React.createElement("div", null, FAQ.map(([q, a], i) => React.createElement("details", {
    key: q,
    open: i === 0
  }, React.createElement("summary", null, q), React.createElement("p", null, a))))));
}
const EMPTY = {
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
  slow: '',
  tools: '',
  who: '',
  website: ''
};
const Brief = React.forwardRef(function Brief(props, ref) {
  const [step, setStep] = React.useState(0);
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [f, setF] = React.useState(EMPTY);
  const topRef = React.useRef(null);
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }));
  const setLane = lane => setF(s => s.lane === lane ? s : {
    ...s,
    lane,
    need: []
  });
  const toggleNeed = v => setF(s => ({
    ...s,
    need: s.need.includes(v) ? s.need.filter(x => x !== v) : [...s.need, v]
  }));
  React.useImperativeHandle(ref, () => ({
    addNeed: (lane, v) => {
      setStep(0);
      setF(s => {
        const base = s.lane === lane ? s : {
          ...s,
          lane,
          need: []
        };
        return base.need.includes(v) ? base : {
          ...base,
          need: [...base.need, v]
        };
      });
    }
  }));
  const auto = f.lane === 'automation';
  const needs = auto ? AUTOMATION_NEEDS : DESIGN_NEEDS;
  const stepValid = i => {
    if (i === 0) return f.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
    if (i === 1) return f.about.trim().length > 1;
    return true;
  };
  const go = n => {
    setStep(n);
    if (topRef.current) topRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  const next = () => {
    if (!stepValid(step)) return;
    if (step < 2) go(step + 1);else submit();
  };
  const submit = () => {
    setBusy(true);
    setError('');
    fetch('/api/design-brief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(f)
    }).then(r => r.json()).then(data => {
      if (data.error) setError(data.error);else setSent(true);
    }).catch(() => setError('The brief didn’t send. Check your connection and try again, or email car.groff@gmail.com.')).finally(() => setBusy(false));
  };
  if (sent) {
    return React.createElement("section", {
      id: "brief",
      className: "ssection sdeep"
    }, React.createElement("div", {
      className: "swrap sbriefwrap"
    }, React.createElement("div", {
      className: "ssent",
      role: "status"
    }, React.createElement(Crest, {
      size: 52
    }), React.createElement("h2", {
      className: "sdisplay"
    }, "Brief received."), React.createElement("p", {
      className: "slead"
    }, "I\u2019ll read it properly and reply to ", React.createElement("b", null, f.email), " with a fixed price and a delivery date, usually within one business day. If anything\u2019s missing, I\u2019ll ask."))));
  }
  const stepNames = ['Who’s asking', auto ? 'What’s slowing you down' : 'What you need', 'Details that save time'];
  return React.createElement("section", {
    id: "brief",
    className: "ssection sdeep",
    ref: topRef
  }, React.createElement(Rings, null), React.createElement("div", {
    className: "swrap sbriefwrap"
  }, React.createElement("div", {
    className: "sbriefhead"
  }, React.createElement(Crest, {
    size: 44
  }), React.createElement("h2", {
    className: "sdisplay"
  }, "Write me a ", React.createElement("em", null, "brief"), "."), React.createElement("p", {
    className: "slead"
  }, "About three minutes, no account, no call. You\u2019ll get a fixed price and a date back within one business day.")), React.createElement("div", {
    className: "slane",
    role: "radiogroup",
    "aria-label": "What kind of work"
  }, [['design', 'Design work'], ['automation', 'Automation or a tool']].map(([v, label]) => React.createElement("button", {
    key: v,
    type: "button",
    role: "radio",
    "aria-checked": f.lane === v,
    className: f.lane === v ? 'on' : '',
    onClick: () => setLane(v)
  }, label))), React.createElement("div", {
    className: "sprog",
    "aria-live": "polite"
  }, React.createElement("span", null, "Step ", step + 1, " of 3 \xB7 ", stepNames[step]), React.createElement("div", {
    className: "sprogbars",
    "aria-hidden": "true"
  }, [0, 1, 2].map(i => React.createElement("i", {
    key: i,
    className: i <= step ? 'done' : ''
  })))), React.createElement("form", {
    className: "sform",
    onSubmit: e => {
      e.preventDefault();
      next();
    },
    noValidate: true
  }, React.createElement("label", {
    className: "shp",
    "aria-hidden": "true"
  }, "Leave this empty", React.createElement("input", {
    tabIndex: -1,
    autoComplete: "off",
    value: f.website,
    onChange: set('website')
  })), step === 0 && React.createElement("div", {
    className: "sfields two"
  }, React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Your name ", React.createElement("i", null, "required")), React.createElement("input", {
    value: f.name,
    onChange: set('name'),
    placeholder: "Jane Carter",
    autoComplete: "name",
    required: true
  })), React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Email for my reply ", React.createElement("i", null, "required")), React.createElement("input", {
    type: "email",
    value: f.email,
    onChange: set('email'),
    placeholder: "jane@business.com",
    autoComplete: "email",
    required: true
  })), React.createElement("label", {
    className: "sfl span2"
  }, React.createElement("span", {
    className: "slb"
  }, "Business or project name"), React.createElement("input", {
    value: f.business,
    onChange: set('business'),
    placeholder: "Carter & Co.",
    autoComplete: "organization"
  }))), step === 1 && React.createElement("div", {
    className: "sfields"
  }, React.createElement("fieldset", {
    className: "sfs"
  }, React.createElement("legend", {
    className: "slb"
  }, auto ? 'What could be automated?' : 'What are we making?'), React.createElement("div", {
    className: "schips"
  }, needs.map(c => React.createElement("label", {
    key: c,
    className: 'schip' + (f.need.includes(c) ? ' on' : '')
  }, React.createElement("input", {
    type: "checkbox",
    checked: f.need.includes(c),
    onChange: () => toggleNeed(c)
  }), c)))), React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, auto ? 'What’s slow or repetitive today?' : 'Tell me about it', " ", React.createElement("i", null, "required")), React.createElement("span", {
    className: "shint"
  }, auto ? 'The task, how often it happens, and what goes wrong when it slips.' : 'Who it’s for, what it has to do, anything that shapes it.'), React.createElement("textarea", {
    rows: 3,
    value: f.about,
    onChange: set('about'),
    placeholder: auto ? 'We copy every web inquiry into a spreadsheet by hand and forget to follow up…' : 'A five-post series announcing our spring menu…'
  })), auto ? React.createElement("div", {
    className: "sfields two"
  }, React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Tools you use now"), React.createElement("span", {
    className: "shint"
  }, "Email, spreadsheets, a CRM, booking software."), React.createElement("input", {
    value: f.tools,
    onChange: set('tools'),
    placeholder: "Gmail, Google Sheets, Square"
  })), React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Who does this work today"), React.createElement("span", {
    className: "shint"
  }, "You, a team member, nobody yet."), React.createElement("input", {
    value: f.who,
    onChange: set('who'),
    placeholder: "Me, on Sunday nights"
  }))) : React.createElement("div", {
    className: "sfields two"
  }, React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Where it will run"), React.createElement("span", {
    className: "shint"
  }, "Instagram, a printed handout, a website, an email."), React.createElement("input", {
    value: f.where,
    onChange: set('where'),
    placeholder: "Instagram feed"
  })), React.createElement("div", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "When you need it"), React.createElement("span", {
    className: "shint"
  }, "A date, or mark it flexible."), React.createElement("div", {
    className: "sdate"
  }, React.createElement("input", {
    type: "date",
    value: f.when,
    onChange: set('when'),
    "aria-label": "Due date"
  }), React.createElement("label", {
    className: "sflex"
  }, React.createElement("input", {
    type: "checkbox",
    checked: f.flexible,
    onChange: set('flexible')
  }), "Flexible"))))), step === 2 && React.createElement("div", {
    className: "sfields"
  }, !auto && React.createElement("fieldset", {
    className: "sfs"
  }, React.createElement("legend", {
    className: "slb"
  }, "Do you have brand assets?"), React.createElement("div", {
    className: "schips"
  }, [['Yes', 'Yes: logo, colors, fonts'], ['Some', 'Some of them'], ['No', 'No, help me figure it out']].map(([value, label]) => React.createElement("label", {
    key: value,
    className: 'schip' + (f.assets === value ? ' on' : '')
  }, React.createElement("input", {
    type: "radio",
    name: "assets",
    checked: f.assets === value,
    onChange: () => setF(s => ({
      ...s,
      assets: value
    }))
  }), label)))), !auto && React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "Exact wording that must appear"), React.createElement("span", {
    className: "shint"
  }, "Paste it word for word. Wording that changes later is the most common cause of extra rounds."), React.createElement("textarea", {
    rows: 3,
    value: f.copy,
    onChange: set('copy'),
    placeholder: "Spring menu. Available from March 4th\u2026"
  })), React.createElement("div", {
    className: "sfields two"
  }, !auto && React.createElement("label", {
    className: "sfl"
  }, React.createElement("span", {
    className: "slb"
  }, "A look you like"), React.createElement("span", {
    className: "shint"
  }, "Links to one to three examples, or describe them."), React.createElement("textarea", {
    rows: 2,
    value: f.refs,
    onChange: set('refs'),
    placeholder: "Links, or a description"
  })), React.createElement("label", {
    className: 'sfl' + (auto ? ' span2' : '')
  }, React.createElement("span", {
    className: "slb"
  }, "Anything else"), React.createElement("span", {
    className: "shint"
  }, "Constraints, past attempts, who needs to sign off."), React.createElement("textarea", {
    rows: 2,
    value: f.notes,
    onChange: set('notes'),
    placeholder: "Whatever I should know"
  }))), React.createElement("fieldset", {
    className: "sfs"
  }, React.createElement("legend", {
    className: "slb"
  }, "Budget range"), React.createElement("span", {
    className: "shint"
  }, "Helps me scope the job instead of guessing."), React.createElement("div", {
    className: "schips"
  }, BUDGETS.map(b => React.createElement("label", {
    key: b,
    className: 'schip' + (f.budget === b ? ' on' : '')
  }, React.createElement("input", {
    type: "radio",
    name: "budget",
    checked: f.budget === b,
    onChange: () => setF(s => ({
      ...s,
      budget: b
    }))
  }), b))))), error && React.createElement("p", {
    className: "serr",
    role: "alert"
  }, error), React.createElement("div", {
    className: "swalk"
  }, step > 0 && React.createElement("button", {
    className: "sback",
    type: "button",
    onClick: () => go(step - 1)
  }, "Back"), React.createElement("p", {
    className: "sfine"
  }, step === 0 && !stepValid(0) ? 'Add your name and email to continue.' : step === 1 && !stepValid(1) ? 'One sentence about the job is enough to continue.' : step === 2 ? 'Everything on this step is optional.' : 'Nothing here is asked twice.'), React.createElement("button", {
    className: "sbtn",
    type: "submit",
    disabled: busy || !stepValid(step)
  }, busy ? 'Sending…' : step === 2 ? 'Send brief' : 'Continue')))));
});
function Footer() {
  return React.createElement("footer", {
    className: "sfooter"
  }, React.createElement("div", {
    className: "swrap sfootin"
  }, React.createElement(Crest, {
    size: 44
  }), React.createElement("div", null, React.createElement("p", {
    className: "sfootname"
  }, "The Scaffold"), React.createElement("p", {
    className: "sfoottag"
  }, "Design and automation, by Carter Groff. Harrisonburg, Virginia.")), React.createElement("div", {
    className: "sfootlinks"
  }, React.createElement("a", {
    href: "/"
  }, "Portfolio"), React.createElement("a", {
    href: "mailto:car.groff@gmail.com"
  }, "car.groff@gmail.com"), React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Carter Groff"))));
}
function useRecentWork() {
  const [work, setWork] = React.useState([]);
  React.useEffect(() => {
    fetch('https://rodxrkzwpsgeeatmbwku.supabase.co/rest/v1/site_content?select=data&id=eq.1', {
      headers: {
        apikey: 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x'
      }
    }).then(r => r.ok ? r.json() : []).then(rows => {
      const designs = rows && rows[0] && rows[0].data && Array.isArray(rows[0].data.designs) ? rows[0].data.designs : [];
      setWork(designs.filter(d => d && d.title && (d.thumb || d.image) && !/\.pdf($|\?)/i.test(d.thumb || d.image)).slice(0, 6));
    }).catch(() => {});
  }, []);
  return work;
}
function TheScaffold() {
  const briefRef = React.useRef(null);
  const work = useRecentWork();
  const onAddNeed = (lane, v) => {
    if (briefRef.current) briefRef.current.addNeed(lane, v);
    document.getElementById('brief').scrollIntoView({
      behavior: 'smooth'
    });
  };
  return React.createElement("div", {
    className: "scf p-grain"
  }, React.createElement("a", {
    className: "sskip",
    href: "#brief"
  }, "Skip to the brief"), React.createElement(Nav, null), React.createElement("main", null, React.createElement(Hero, null), React.createElement(DesignLane, {
    onAddNeed: onAddNeed,
    work: work
  }), React.createElement(AutomationLane, {
    onAddNeed: onAddNeed
  }), React.createElement(How, null), React.createElement(About, null), React.createElement(Faq, null), React.createElement(Brief, {
    ref: briefRef
  })), React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(TheScaffold, null));
