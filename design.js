// design.js — GENERATED from design.jsx by scripts/build-design.mjs. Do not edit; edit design.jsx and run `npm run build:design`.
function GasLamp({
  height = 640,
  style = {},
  out = false,
  onGlobeClick,
  variant
}) {
  const halo = {
    opacity: out ? 0 : 1,
    transition: `opacity ${out ? 0.3 : 0.5}s ease`
  };
  const darkGlobe = {
    opacity: out ? 1 : 0,
    transition: `opacity ${out ? 0.3 : 0.5}s ease`
  };
  return React.createElement("svg", {
    viewBox: "0 0 200 900",
    width: height * 200 / 900,
    height: height,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "lamp-iron",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#070403"
  }), React.createElement("stop", {
    offset: "50%",
    stopColor: "#100a06"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#241608"
  })), React.createElement("linearGradient", {
    id: "lamp-rust",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#5a2a10"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#2a1408"
  })), React.createElement("radialGradient", {
    id: "lamp-glass",
    cx: "50%",
    cy: "45%",
    r: "70%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#fff5d0"
  }), React.createElement("stop", {
    offset: "40%",
    stopColor: "#f4c478"
  }), React.createElement("stop", {
    offset: "80%",
    stopColor: "#c6862c"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#6e3a10"
  })), React.createElement("linearGradient", {
    id: "lamp-glassHi",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "78%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "94%",
    stopColor: "#fff5d8",
    stopOpacity: "0.6"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  })), React.createElement("radialGradient", {
    id: "lamp-halo",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#f5cd6a",
    stopOpacity: "0.62"
  }), React.createElement("stop", {
    offset: "22%",
    stopColor: "#e7b357",
    stopOpacity: "0.34"
  }), React.createElement("stop", {
    offset: "48%",
    stopColor: "#d99a3d",
    stopOpacity: "0.15"
  }), React.createElement("stop", {
    offset: "74%",
    stopColor: "#c98a34",
    stopOpacity: "0.05"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#c98a34",
    stopOpacity: "0"
  }))), React.createElement("g", {
    style: halo
  }, React.createElement("g", {
    transform: variant ? 'translate(0 22.5)' : undefined
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.95;0.95;0.6;0.95;0.95;0.7;0.95",
    keyTimes: "0;0.45;0.52;0.6;0.82;0.88;1",
    dur: "9s",
    repeatCount: "indefinite"
  }), React.createElement("ellipse", {
    cx: "104",
    cy: "96",
    rx: "300",
    ry: "250",
    fill: "url(#lamp-halo)"
  }), React.createElement("ellipse", {
    cx: "70",
    cy: "150",
    rx: "190",
    ry: "230",
    fill: "url(#lamp-halo)",
    opacity: "0.7"
  }), React.createElement("ellipse", {
    cx: "140",
    cy: "70",
    rx: "170",
    ry: "150",
    fill: "url(#lamp-halo)",
    opacity: "0.6"
  }))), variant ? React.createElement("g", null, React.createElement("ellipse", {
    cx: "100",
    cy: "899",
    rx: "88",
    ry: "6",
    fill: "#000",
    opacity: "0.55"
  }), React.createElement("image", {
    href: `/assets/lamps/${variant}-out.webp`,
    x: "0",
    y: "8.5",
    width: "200",
    height: "900",
    preserveAspectRatio: "none"
  }), React.createElement("image", {
    href: `/assets/lamps/${variant}-lit.webp`,
    x: "0",
    y: "8.5",
    width: "200",
    height: "900",
    preserveAspectRatio: "none",
    style: {
      opacity: out ? 0 : 1,
      transition: `opacity ${out ? 0.3 : 0.5}s ease`
    }
  }), React.createElement("path", {
    d: "M 70 94.5 L 130 94.5 L 122 144.5 L 78 144.5 Z",
    fill: "#1a1008",
    style: {
      opacity: 0
    }
  })) : React.createElement(React.Fragment, null, React.createElement("path", {
    d: "M 100 6 L 100.8 24 L 100 27 L 99.2 24 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "27",
    rx: "1.6",
    ry: "1.0",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "96",
    y: "28",
    width: "8",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "93",
    y: "31",
    width: "14",
    height: "1.5",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 93 32.5 L 107 32.5 L 126 56 L 74 56 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 93 32.5 L 100 32.5 L 100 33 L 74 56 Z",
    fill: "#000",
    opacity: "0.4"
  }), React.createElement("path", {
    d: "M 100 32.5 L 107 32.5 L 126 56 L 100 33 Z",
    fill: "#3a2614",
    opacity: "0.55"
  }), React.createElement("line", {
    x1: "100",
    y1: "32.5",
    x2: "100",
    y2: "56",
    stroke: "#000",
    strokeWidth: "0.5",
    opacity: "0.5"
  }), React.createElement("rect", {
    x: "74",
    y: "56",
    width: "52",
    height: "1.5",
    fill: "#0a0604"
  }), React.createElement("rect", {
    x: "74",
    y: "58",
    width: "52",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "74",
    y: "62",
    width: "52",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("path", {
    d: "M 74 63 L 126 63 L 132 72 L 68 72 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "72",
    width: "64",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "75",
    width: "64",
    height: "1.2",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("g", null, React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "url(#lamp-glass)"
  }), React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "url(#lamp-glassHi)"
  }), React.createElement("line", {
    x1: "71",
    y1: "76.5",
    x2: "79",
    y2: "128",
    stroke: "#0a0604",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "129",
    y1: "76.5",
    x2: "121",
    y2: "128",
    stroke: "#0a0604",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "87",
    y1: "76.5",
    x2: "91",
    y2: "128",
    stroke: "#1a1208",
    strokeWidth: "0.8"
  }), React.createElement("line", {
    x1: "113",
    y1: "76.5",
    x2: "109",
    y2: "128",
    stroke: "#1a1208",
    strokeWidth: "0.8"
  }), React.createElement("line", {
    x1: "100",
    y1: "79",
    x2: "100",
    y2: "126",
    stroke: "#fff5db",
    strokeOpacity: "0.42",
    strokeWidth: "0.6"
  }), React.createElement("path", {
    d: "M 118 84 Q 121 104, 116 124",
    stroke: "#fff5db",
    strokeWidth: "1.3",
    strokeOpacity: "0.6",
    fill: "none"
  })), React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "#1a1008",
    style: darkGlobe
  }), React.createElement("rect", {
    x: "76",
    y: "128",
    width: "48",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "76",
    y: "131",
    width: "48",
    height: "1.2",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("path", {
    d: "M 80 132.2 L 120 132.2 L 113 139 L 87 139 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "88",
    y: "139",
    width: "24",
    height: "2",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 88 141 L 112 141 L 107 146 L 93 146 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "148.5",
    rx: "3.5",
    ry: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 100 151 L 100.6 154 L 100 155 L 99.4 154 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 86 151 L 114 151 L 110 164 L 90 164 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 90 164 L 110 164 L 106 176 L 94 176 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "176",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 94 179 L 106 179 Q 108 188, 104 198 L 96 198 Q 92 188, 94 179 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "198",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "201",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "202",
    width: "6",
    height: "200",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "103",
    y1: "205",
    x2: "103",
    y2: "400",
    stroke: "#3a2614",
    strokeWidth: "0.6",
    opacity: "0.7"
  }), React.createElement("line", {
    x1: "98",
    y1: "205",
    x2: "98",
    y2: "400",
    stroke: "#000",
    strokeWidth: "0.4",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "92",
    y: "402",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "94",
    y: "405",
    width: "12",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "409",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "412",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "413",
    width: "6",
    height: "200",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "103",
    y1: "416",
    x2: "103",
    y2: "611",
    stroke: "#3a2614",
    strokeWidth: "0.6",
    opacity: "0.7"
  }), React.createElement("line", {
    x1: "98",
    y1: "416",
    x2: "98",
    y2: "611",
    stroke: "#000",
    strokeWidth: "0.4",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "92",
    y: "613",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 94 616 L 106 616 Q 108 624, 104 632 L 96 632 Q 92 624, 94 616 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "632",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "635",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "636",
    width: "6",
    height: "48",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "684",
    width: "16",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "89",
    y: "688",
    width: "22",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "89",
    y: "691",
    width: "22",
    height: "1.5",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("path", {
    d: "M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 112 786 C 121 772, 130 754, 127 734 C 124 715, 115 708, 110 693 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 100 786 L 100 693 Z",
    fill: "#000",
    opacity: "0.18"
  }), React.createElement("g", {
    fill: "none",
    opacity: "0.6"
  }, React.createElement("path", {
    d: "M 84 700 C 79 720, 80 760, 86 784",
    stroke: "#000",
    strokeWidth: "0.5"
  }), React.createElement("path", {
    d: "M 100 698 L 100 784",
    stroke: "#2a1810",
    strokeWidth: "0.5"
  }), React.createElement("path", {
    d: "M 116 700 C 121 720, 120 760, 114 784",
    stroke: "#3a2514",
    strokeWidth: "0.5"
  })), React.createElement("rect", {
    x: "70",
    y: "786",
    width: "60",
    height: "5",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "791",
    width: "64",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "794",
    width: "64",
    height: "1.5",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("rect", {
    x: "66",
    y: "796",
    width: "68",
    height: "26",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "64",
    y: "800",
    width: "72",
    height: "2",
    fill: "#000",
    opacity: "0.22"
  }), React.createElement("rect", {
    x: "77",
    y: "802",
    width: "46",
    height: "16",
    fill: "#3a2514",
    opacity: "0.14",
    stroke: "#000",
    strokeOpacity: "0.4",
    strokeWidth: "0.6"
  }), React.createElement("rect", {
    x: "58",
    y: "822",
    width: "84",
    height: "32",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "56",
    y: "826",
    width: "88",
    height: "2",
    fill: "#000",
    opacity: "0.22"
  }), React.createElement("rect", {
    x: "71",
    y: "828",
    width: "58",
    height: "20",
    fill: "#3a2514",
    opacity: "0.14",
    stroke: "#000",
    strokeOpacity: "0.4",
    strokeWidth: "0.6"
  }), React.createElement("path", {
    d: "M 50 854 L 150 854 L 154 878 L 46 878 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "42",
    y: "878",
    width: "116",
    height: "21",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "42",
    y1: "880",
    x2: "158",
    y2: "880",
    stroke: "#000",
    strokeWidth: "0.6",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "42",
    y: "895",
    width: "116",
    height: "4",
    fill: "url(#lamp-rust)",
    opacity: "0.7"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "898",
    rx: "86",
    ry: "6",
    fill: "#000",
    opacity: "0.55"
  })), out && onGlobeClick && !variant && React.createElement("ellipse", {
    cx: "100",
    cy: "102",
    rx: "60",
    ry: "78",
    fill: "rgba(217,154,61,0.16)",
    style: {
      filter: 'blur(9px)',
      pointerEvents: 'none'
    }
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.5;1;0.5",
    dur: "3.4s",
    repeatCount: "indefinite"
  })), onGlobeClick && React.createElement("rect", {
    x: "26",
    y: "18",
    width: "148",
    height: "200",
    rx: "24",
    fill: "transparent",
    onClick: onGlobeClick,
    style: {
      cursor: 'pointer',
      pointerEvents: 'auto',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent'
    }
  }));
}
const SITE = {
  showPrices: false,
  headline: 'Design that looks right. Tools that work right.',
  deck: 'Websites, graphics and print, and the tools that take busywork off your plate.',
  whyHead: 'I’m Carter.',
  whyIntro: 'A marketer, designer and builder in Harrisonburg, Virginia. By day I lead marketing and automation at a local company, so I know what small teams actually need.',
  rules: ['Prove it by hand before automating it.', 'Automate the bottleneck, not everything.', 'A person approves anything that reaches a customer.']
};
const DESIGN_SERVICES = [{
  title: 'Social graphics',
  desc: 'One post or a series with one look.',
  need: 'Social graphics',
  from: '$75',
  turn: '2 business days'
}, {
  title: 'Websites',
  sub: 'front and back end',
  desc: 'Designed, built and launched, then kept running: the pages people see and the logins, databases, payments and forms behind them.',
  need: 'Website',
  from: '',
  turn: 'Quoted'
}, {
  title: 'Cards, flyers and print',
  desc: 'Print-ready with correct bleed, or sized for screen.',
  need: 'Business card or print',
  from: '$150',
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
const DESIGN_CHIPS = ['Website', 'Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = [...TOOL_SERVICES.map(t => t.need), 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];
const WORK = [];
const TESTIMONIALS = [];
const FAQ = [['Do you use AI?', 'Yes. AI does the drafting and the first pass of the build. I make the decisions, check everything and finish it.'], ['What does it cost?', 'Graphics and print are priced per piece. Websites and tools are quoted after a short brief. Either way, you see the price before anything starts.'], ['Can you build the back end of a website too?', 'Yes. Besides the pages people see, I build what runs behind them: logins, databases, payments, booking and contact forms that land somewhere useful, and the admin pages you run it from.'], ['Will I need new software?', 'Not usually. Where I can, I build on what you already use.'], ['How fast is it?', 'Most design pieces: three directions within two business days of a complete brief. Tools: a plan within a few days, then a first working version.'], ['What if something breaks?', 'I fix it. Ongoing care is available as a monthly plan.'], ['Who owns the work?', 'You do, once it’s paid.'], ['Do we need a call?', 'No. The brief covers it. If a call would help, I’ll say so.']];
const STEPS = [['I', 'Who’s asking'], ['II', 'What you need'], ['III', 'Details that save time']];
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
  }), React.createElement("span", null, React.createElement("b", null, "The Scaffold"), React.createElement("span", {
    className: "dsub"
  }, "by Carter Groff"))), React.createElement("div", {
    className: "dnavlinks"
  }, React.createElement("a", {
    href: "#make"
  }, "What I make"), React.createElement("a", {
    href: "#how"
  }, "How it works"), React.createElement("a", {
    href: "#faq"
  }, "Questions"), React.createElement("a", {
    href: "https://www.cargroff.com/"
  }, "Portfolio")), React.createElement("a", {
    className: "p-btn",
    href: "#brief"
  }, "Start a brief")));
}
function TickRing({
  r1 = 268,
  r1Major = 258,
  r2 = 280
}) {
  const ticks = [];
  for (let i = 0; i < 120; i++) {
    const major = i % 10 === 0,
      t = i * 3 * Math.PI / 180,
      a = major ? r1Major : r1;
    ticks.push(React.createElement("line", {
      key: i,
      className: major ? 'major' : '',
      x1: (300 + a * Math.sin(t)).toFixed(2),
      y1: (300 - a * Math.cos(t)).toFixed(2),
      x2: (300 + r2 * Math.sin(t)).toFixed(2),
      y2: (300 - r2 * Math.cos(t)).toFixed(2)
    }));
  }
  return React.createElement("g", {
    className: "dm-ticks"
  }, ticks);
}
const HOURS = Array.from({
  length: 12
}, (_, i) => {
  const big = i % 3 === 0,
    t = i * 30 * Math.PI / 180,
    r1 = 232,
    r2 = big ? 270 : 256;
  return {
    big,
    delay: i * 0.5,
    x1: 300 + r1 * Math.sin(t),
    y1: 300 - r1 * Math.cos(t),
    x2: 300 + r2 * Math.sin(t),
    y2: 300 - r2 * Math.cos(t)
  };
});
const RAYS = Array.from({
  length: 24
}, (_, i) => ({
  a: i * 15 + 7.5,
  len: i % 2 ? 150 : 230
}));
function Medallion() {
  return React.createElement("svg", {
    className: "dmedal",
    viewBox: "0 0 600 600",
    role: "img",
    "aria-label": "The Scaffold, by Carter Groff"
  }, React.createElement("defs", null, React.createElement("radialGradient", {
    id: "dm-wash"
  }, React.createElement("stop", {
    offset: "0%",
    className: "dm-wash-0"
  }), React.createElement("stop", {
    offset: "65%",
    className: "dm-wash-1"
  }), React.createElement("stop", {
    offset: "100%",
    className: "dm-wash-2"
  })), React.createElement("linearGradient", {
    id: "dm-gold",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    className: "dm-gold-hi"
  }), React.createElement("stop", {
    offset: "100%",
    className: "dm-gold-lo"
  })), React.createElement("linearGradient", {
    id: "dm-sheen",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    className: "dm-sheen-0"
  }), React.createElement("stop", {
    offset: "50%",
    className: "dm-sheen-1"
  }), React.createElement("stop", {
    offset: "100%",
    className: "dm-sheen-0"
  })), React.createElement("mask", {
    id: "dm-crest",
    maskUnits: "userSpaceOnUse",
    x: "0",
    y: "0",
    width: "600",
    height: "600"
  }, React.createElement("image", {
    href: "assets/antler.png",
    x: "145",
    y: "186",
    width: "310",
    height: "237"
  })), React.createElement("linearGradient", {
    id: "dm-ray",
    x1: "0",
    y1: "1",
    x2: "0",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    className: "dm-ray-0"
  }), React.createElement("stop", {
    offset: "100%",
    className: "dm-ray-1"
  })), React.createElement("linearGradient", {
    id: "dm-fadeg",
    gradientUnits: "userSpaceOnUse",
    x1: "0",
    y1: "430",
    x2: "0",
    y2: "620"
  }, React.createElement("stop", {
    offset: "0%",
    className: "dm-fade-0"
  }), React.createElement("stop", {
    offset: "100%",
    className: "dm-fade-1"
  })), React.createElement("mask", {
    id: "dm-fade",
    maskUnits: "userSpaceOnUse",
    x: "-600",
    y: "-600",
    width: "1800",
    height: "1800"
  }, React.createElement("rect", {
    x: "-600",
    y: "-600",
    width: "1800",
    height: "1800",
    fill: "url(#dm-fadeg)"
  }))), React.createElement("circle", {
    className: "dm-wash",
    cx: "300",
    cy: "300",
    r: "250",
    fill: "url(#dm-wash)"
  }), React.createElement("g", {
    mask: "url(#dm-fade)"
  }, React.createElement("g", {
    className: "dm-rays"
  }, RAYS.map((r, i) => React.createElement("rect", {
    key: i,
    className: "dm-ray",
    x: "299",
    y: 20 - r.len,
    width: "2",
    height: r.len,
    fill: "url(#dm-ray)",
    transform: 'rotate(' + r.a + ' 300 300)'
  })))), React.createElement("g", {
    className: "dm-spin-in"
  }, React.createElement("g", {
    className: "dm-spin"
  }, HOURS.map((h, i) => React.createElement("line", {
    key: i,
    className: 'dm-hour' + (h.big ? ' big' : ''),
    style: {
      animationDelay: h.delay + 's'
    },
    x1: h.x1.toFixed(2),
    y1: h.y1.toFixed(2),
    x2: h.x2.toFixed(2),
    y2: h.y2.toFixed(2)
  })))), React.createElement("rect", {
    x: "135",
    y: "176",
    width: "330",
    height: "257",
    fill: "url(#dm-gold)",
    mask: "url(#dm-crest)"
  }), React.createElement("g", {
    mask: "url(#dm-crest)"
  }, React.createElement("rect", {
    className: "dm-sheen",
    x: "55",
    y: "176",
    width: "140",
    height: "257",
    fill: "url(#dm-sheen)"
  })));
}
function BriefRing() {
  return React.createElement("svg", {
    className: "dbrief-ring",
    viewBox: "0 0 600 600",
    "aria-hidden": "true"
  }, React.createElement("circle", {
    className: "dm-ripple",
    cx: "300",
    cy: "300",
    r: "250"
  }), React.createElement("circle", {
    className: "dm-rule",
    cx: "300",
    cy: "300",
    r: "294"
  }), React.createElement("g", {
    className: "dm-spin slow"
  }, React.createElement(TickRing, null)), React.createElement("circle", {
    className: "dm-rule",
    cx: "300",
    cy: "300",
    r: "250"
  }), React.createElement("circle", {
    className: "dm-rule dashed dm-spin-back",
    cx: "300",
    cy: "300",
    r: "232"
  }), React.createElement("circle", {
    className: "dm-rule",
    cx: "300",
    cy: "300",
    r: "214"
  }));
}
const LANE = [['back', 260], ['far', 380], ['mid', 560], ['near', 820]];
const LAMP_VARY = {
  near: {
    l: {
      lean: -1.6,
      sc: 1,
      iron: ['scroll', 'bar']
    },
    r: {
      lean: 1.1,
      sc: .985,
      iron: ['scroll', 'collar']
    }
  },
  mid: {
    l: {
      lean: -.8,
      sc: 1.02,
      iron: ['bar']
    },
    r: {
      lean: 1.4,
      sc: .99,
      iron: ['collar', 'bar']
    }
  },
  far: {
    l: {
      lean: -1.2,
      sc: 1,
      iron: ['scroll']
    },
    r: {
      lean: .6,
      sc: 1.015,
      iron: ['bar']
    }
  },
  back: {
    l: {
      lean: -.5,
      sc: 1,
      iron: ['bar']
    },
    r: {
      lean: .9,
      sc: .99,
      iron: []
    }
  }
};
function Ironwork({
  kind
}) {
  if (kind === 'bar') return React.createElement("g", {
    className: "lw-iron"
  }, React.createElement("rect", {
    x: "70",
    y: "330",
    width: "60",
    height: "5",
    rx: "2.5"
  }), React.createElement("circle", {
    cx: "70",
    cy: "332.5",
    r: "4.5"
  }), React.createElement("circle", {
    cx: "130",
    cy: "332.5",
    r: "4.5"
  }));
  if (kind === 'scroll') return React.createElement("g", {
    className: "lw-scroll"
  }, React.createElement("path", {
    d: "M96 190 C 78 190, 66 206, 74 220 C 80 228, 90 222, 86 214"
  }), React.createElement("path", {
    d: "M104 190 C 122 190, 134 206, 126 220 C 120 228, 110 222, 114 214"
  }));
  if (kind === 'collar') return React.createElement("g", {
    className: "lw-iron"
  }, React.createElement("rect", {
    x: "89",
    y: "470",
    width: "22",
    height: "7",
    rx: "2"
  }), React.createElement("rect", {
    x: "91",
    y: "480",
    width: "18",
    height: "3",
    rx: "1.5"
  }));
  return null;
}
function HeroLamp({
  side,
  row,
  height
}) {
  const [out, setOut] = React.useState(false);
  const v = LAMP_VARY[row][side];
  return React.createElement("div", {
    className: 'dhero-lamp ' + side + ' ' + row + (out ? ' out' : ''),
    "aria-hidden": "true"
  }, React.createElement("div", {
    className: "dlamp-vary",
    style: {
      '--lean': v.lean + 'deg',
      '--sc': v.sc
    }
  }, React.createElement("div", {
    className: "dhero-candle"
  }), React.createElement(GasLamp, {
    height: height,
    out: out,
    variant: row + '-' + side.toUpperCase(),
    onGlobeClick: () => setOut(o => !o)
  }), false && v.iron.length > 0 && React.createElement("svg", {
    className: "dlamp-iron",
    viewBox: "0 0 200 900",
    "aria-hidden": "true"
  }, v.iron.map(k => React.createElement(Ironwork, {
    key: k,
    kind: k
  })))));
}
function LaneFog({
  row,
  dur,
  delay
}) {
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: 'dhero-veil ' + row,
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: 'dhero-wisp ' + row,
    "aria-hidden": "true",
    style: {
      animationDuration: dur + 's',
      animationDelay: delay + 's'
    }
  }));
}
const LANE_FOG = {
  back: [40, -8],
  far: [34, -14],
  mid: [28, -4]
};
function Hero({
  onAddNeed
}) {
  return React.createElement("header", {
    className: "dhero dpanel dlive",
    id: "top"
  }, React.createElement("div", {
    className: "dhero-fog",
    "aria-hidden": "true",
    style: {
      top: '24%',
      animationDuration: '26s'
    }
  }), React.createElement("div", {
    className: "dhero-fog",
    "aria-hidden": "true",
    style: {
      top: '50%',
      animationDuration: '34s',
      animationDelay: '-12s'
    }
  }), React.createElement("div", {
    className: "dhero-fog",
    "aria-hidden": "true",
    style: {
      top: '72%',
      animationDuration: '30s',
      animationDelay: '-20s'
    }
  }), React.createElement("div", {
    className: "dhero-vignette",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "dhero-path",
    "aria-hidden": "true"
  }), LANE.map(([row, h]) => React.createElement(React.Fragment, {
    key: row
  }, React.createElement(HeroLamp, {
    side: "l",
    row: row,
    height: h
  }), React.createElement(HeroLamp, {
    side: "r",
    row: row,
    height: h
  }), LANE_FOG[row] && React.createElement(LaneFog, {
    row: row,
    dur: LANE_FOG[row][0],
    delay: LANE_FOG[row][1]
  }))), React.createElement("div", {
    className: "dwrap dhero-in"
  }, React.createElement("div", {
    className: "dhero-medal"
  }, React.createElement(Medallion, null)), React.createElement("h1", {
    className: "ddisplay"
  }, SITE.headline), React.createElement("p", {
    className: "ddeck"
  }, SITE.deck), React.createElement("div", {
    className: "dacts"
  }, React.createElement("a", {
    className: "p-btn",
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed('design');
    }
  }, "Start a brief"), React.createElement("a", {
    className: "p-btn ghost",
    href: "#doors"
  }, "See the work"))));
}
const DRAFTS = [{
  cls: 'd1',
  body: React.createElement(React.Fragment, null, React.createElement("span", null, "Spring", React.createElement("br", null), "menu."), React.createElement("i", null, "From March 4th"))
}, {
  cls: 'd2',
  body: React.createElement(React.Fragment, null, React.createElement("span", null, "Spring menu"), React.createElement("i", null, "from March 4th"))
}, {
  cls: 'd3',
  body: React.createElement(React.Fragment, null, React.createElement("span", null, "spring", React.createElement("br", null), React.createElement("b", null, "menu")), React.createElement("i", null, "March 4"))
}];
const SESSION = [['$', 'inquiry in', '# kitchen remodel, website form'], ['+', 'auto-reply sent', ''], ['+', 'quote drafted from your prices', ''], ['?', 'send it?', '# you approve'], ['+', 'follow-up set for three days out', '']];
function Doors({
  onAddNeed
}) {
  const [pick, setPick] = React.useState(1);
  const [typed, setTyped] = React.useState(false);
  const sessionRef = React.useRef(null);
  React.useEffect(() => {
    const el = sessionRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setTyped(true);
      return;
    }
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting) {
        setTyped(true);
        io.disconnect();
      }
    }, {
      threshold: 0.35
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return React.createElement("section", {
    id: "doors",
    className: "dsection ddoors dsoft"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("h2", {
    className: "ddisplay"
  }, "What each half looks like.")), React.createElement("div", {
    className: "dduo"
  }, React.createElement("div", {
    className: "ddoor up"
  }, React.createElement("span", {
    className: "dk"
  }, "Design"), React.createElement("h3", {
    className: "ddisplay"
  }, "Three drafts. You pick one."), React.createElement("div", {
    className: "dsheet up"
  }, React.createElement("div", {
    className: "dhv-drafts",
    role: "group",
    "aria-label": "Three drafts of a spring menu flyer"
  }, DRAFTS.map((d, i) => React.createElement("button", {
    key: d.cls,
    type: "button",
    className: "dprint",
    "aria-pressed": pick === i,
    "aria-label": 'Draft ' + (i + 1),
    onClick: () => setPick(i)
  }, React.createElement("span", {
    className: 'dhv-d ' + d.cls
  }, d.body), React.createElement("span", {
    className: "dprint-n"
  }, i + 1, React.createElement("small", null, "Your pick")))))), React.createElement("p", {
    className: "dcap"
  }, "Example: a spring menu flyer. Pick a draft."), React.createElement("p", null, React.createElement("a", {
    className: "p-btn",
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed('design');
    }
  }, "Start a design brief"))), React.createElement("div", {
    className: "ddoor dauto up"
  }, React.createElement("span", {
    className: "dk"
  }, "Tools"), React.createElement("h3", {
    className: "ddisplay"
  }, "An inquiry, handled."), React.createElement("div", {
    className: 'dsession' + (typed ? ' on' : ''),
    ref: sessionRef,
    "aria-label": "Example: an inquiry gets an auto-reply, a drafted quote you approve, then a follow-up"
  }, React.createElement("ol", null, SESSION.map(([p, t, c], i) => React.createElement("li", {
    key: i,
    style: {
      transitionDelay: i * 0.4 + 's'
    }
  }, React.createElement("span", {
    className: "dsp"
  }, p), React.createElement("span", null, t, c && React.createElement("span", {
    className: "dsc"
  }, " ", c)))), React.createElement("li", {
    style: {
      transitionDelay: SESSION.length * 0.4 + 's'
    }
  }, React.createElement("span", {
    className: "dsp"
  }, "$"), React.createElement("span", null, React.createElement("span", {
    className: "dcursor",
    "aria-hidden": "true"
  }))))), React.createElement("p", {
    className: "dcap"
  }, "Example: one tool. You approve what customers see."), React.createElement("p", null, React.createElement("a", {
    className: "p-btn",
    href: "#brief",
    onClick: e => {
      e.preventDefault();
      onAddNeed('automation');
    }
  }, "Start a tools brief"))))));
}
const HOW_STEPS = [['Send a brief', 'A short form: what you need, and what it has to do. About three minutes, no account, no call.'], ['Get options', 'Design: three directions within two business days. Tools: a one-page plan and a fixed quote.'], ['I finish it', 'Design: refined by hand, two revision rounds included. Tools: built and tested on real work.'], ['You get it', 'Design: print-ready files. Tools: a working build, handed over and explained. Yours once it’s paid.']];
const SEAL = 200;
function sealPt(r, a) {
  const t = a * Math.PI / 180;
  return [+(SEAL + r * Math.sin(t)).toFixed(2), +(SEAL - r * Math.cos(t)).toFixed(2)];
}
function sealArc(a, r) {
  const flip = a === 180;
  const [x1, y1] = sealPt(r, flip ? a + 58 : a - 58);
  const [x2, y2] = sealPt(r, flip ? a - 58 : a + 58);
  return 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 0 ' + (flip ? 0 : 1) + ' ' + x2 + ' ' + y2;
}
const SEAL_TRACK = 2 * Math.PI * 128;
function Dial() {
  const [at, setAt] = React.useState(0);
  const [auto, setAuto] = React.useState(true);
  const [seen, setSeen] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const box = React.useRef(null);
  const pick = i => {
    setAuto(false);
    setAt(i);
  };
  React.useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => setSeen(es[0].isIntersecting), {
      threshold: 0.4
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  React.useEffect(() => {
    if (!auto || !seen || held) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setAt(a => (a + 1) % 4), 3600);
    return () => clearInterval(t);
  }, [auto, seen, held]);
  return React.createElement("section", {
    id: "how",
    ref: box,
    className: "dsection dwood dpanel",
    onMouseEnter: () => setHeld(true),
    onMouseLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false)
  }, React.createElement("div", {
    className: "dsec-candle",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "dwrap ddialwrap"
  }, React.createElement("div", {
    className: "ddial up",
    "aria-hidden": "true"
  }, React.createElement("svg", {
    viewBox: "0 0 400 400",
    role: "presentation"
  }, React.createElement("defs", null, HOW_STEPS.map((s, i) => React.createElement("path", {
    key: i,
    id: 'dseal-' + i,
    d: sealArc(i * 90, i === 2 ? 170 : 158)
  }))), React.createElement("circle", {
    className: "dseal-rule",
    cx: "200",
    cy: "200",
    r: "190"
  }), React.createElement("circle", {
    className: "dseal-rule",
    cx: "200",
    cy: "200",
    r: "184"
  }), React.createElement("circle", {
    className: "dseal-rule",
    cx: "200",
    cy: "200",
    r: "142"
  }), HOW_STEPS.map(([title], i) => React.createElement("g", {
    key: title,
    className: 'dseal-name' + (at === i ? ' on' : ''),
    onClick: () => pick(i)
  }, React.createElement("text", null, React.createElement("textPath", {
    href: '#dseal-' + i,
    startOffset: "50%",
    textAnchor: "middle"
  }, title)))), React.createElement("g", {
    className: "dseal-dots"
  }, [45, 135, 225, 315].map((a, k) => {
    const [x, y] = sealPt(163, a);
    return React.createElement("circle", {
      key: a,
      className: "dseal-dot",
      cx: x,
      cy: y,
      r: "2",
      style: {
        animationDelay: k * 0.9 + 's'
      }
    });
  })), React.createElement("circle", {
    className: "dseal-track",
    cx: "200",
    cy: "200",
    r: "128"
  }), React.createElement("circle", {
    className: "dseal-done",
    cx: "200",
    cy: "200",
    r: "128",
    transform: "rotate(-90 200 200)",
    strokeDasharray: SEAL_TRACK,
    strokeDashoffset: SEAL_TRACK * (1 - at / 4)
  }), HOW_STEPS.map((s, i) => {
    const [x, y] = sealPt(128, i * 90);
    const [nx, ny] = sealPt(98, i * 90);
    return React.createElement("g", {
      key: i,
      className: 'dseal-stop' + (i <= at ? ' done' : ''),
      onClick: () => pick(i)
    }, React.createElement("rect", {
      x: x - 5,
      y: y - 5,
      width: "10",
      height: "10",
      transform: 'rotate(45 ' + x + ' ' + y + ')'
    }), React.createElement("text", {
      x: nx,
      y: ny,
      dy: "0.35em",
      textAnchor: "middle"
    }, i + 1));
  }), React.createElement("g", {
    className: "dseal-mark",
    style: {
      transform: 'rotate(' + at * 90 + 'deg)'
    }
  }, React.createElement("rect", {
    x: "191",
    y: "63",
    width: "18",
    height: "18",
    transform: "rotate(45 200 72)"
  })), React.createElement("image", {
    href: "assets/antler.png",
    x: "152",
    y: "164",
    width: "96",
    height: "73",
    className: "dseal-crest"
  }))), React.createElement("div", null, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("h2", {
    className: "ddisplay"
  }, "Four steps. No surprises.")), React.createElement("ol", {
    className: "dsteplist"
  }, HOW_STEPS.map(([title, body], i) => React.createElement("li", {
    key: title,
    className: at === i ? 'on' : ''
  }, React.createElement("button", {
    type: "button",
    "aria-expanded": at === i,
    "aria-controls": 'dstep-' + i,
    onClick: () => pick(i)
  }, React.createElement("span", {
    className: "dstep-n"
  }, i + 1), React.createElement("span", {
    className: "dstep-t"
  }, title)), React.createElement("p", {
    id: 'dstep-' + i,
    hidden: at !== i
  }, body)))))));
}
function Turn({
  s,
  lane
}) {
  const turn = lane === 'design' ? s.turn || 'Quoted' : null;
  const price = SITE.showPrices && s.from;
  if (!turn && !price) return null;
  return React.createElement("em", {
    className: "dturn"
  }, price && React.createElement("span", {
    className: "dprice"
  }, "From ", s.from), turn && React.createElement("span", null, turn));
}
function Shelf({
  lane,
  label,
  title,
  blurb,
  items,
  cta,
  onAddNeed
}) {
  return React.createElement("div", {
    className: 'dhalf-sec up' + (lane === 'automation' ? ' dauto' : '')
  }, React.createElement("span", {
    className: "dk"
  }, label), React.createElement("h3", {
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
  }, React.createElement("span", {
    className: "dlist-main"
  }, React.createElement("b", null, s.title, s.sub && React.createElement("small", {
    className: "dlist-sub"
  }, s.sub))), React.createElement(Turn, {
    s: s,
    lane: lane
  }))))), React.createElement("p", {
    style: {
      marginTop: 24
    }
  }, React.createElement("a", {
    className: "p-btn ghost",
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
  const [show, setShow] = React.useState('design');
  return React.createElement("section", {
    id: "make",
    className: "dsection dplain"
  }, React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dshead"
  }, React.createElement("h2", {
    className: "ddisplay"
  }, "Two kinds of work, one person.")), React.createElement("div", {
    className: "dmaketabs",
    role: "tablist",
    "aria-label": "Kind of work"
  }, [['design', 'Design'], ['automation', 'Tools']].map(([v, label]) => React.createElement("button", {
    key: v,
    type: "button",
    role: "tab",
    "aria-selected": show === v,
    className: 'dlane' + (show === v ? ' on' : '') + (v === 'automation' ? ' auto' : ''),
    onClick: () => setShow(v)
  }, label))), React.createElement("div", {
    className: 'dduo dmake show-' + show
  }, React.createElement(Shelf, {
    lane: "design",
    label: "Design",
    title: "What your customers see",
    blurb: "Three directions, you pick one, I finish it.",
    items: DESIGN_SERVICES,
    cta: "Start a design brief",
    onAddNeed: onAddNeed
  }), React.createElement(Shelf, {
    lane: "automation",
    label: "Tools",
    title: "What runs behind the scenes",
    blurb: "Proven by hand first. Quoted after a short brief.",
    items: TOOL_SERVICES,
    cta: "Start a tools brief",
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
  }), React.createElement("figcaption", null, React.createElement("b", null, w.title), ", ", w.kind)))))));
}
function Why() {
  return React.createElement("section", {
    id: "why",
    className: "dsection dpanel"
  }, React.createElement("div", {
    className: "dsec-candle left",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "dwrap"
  }, React.createElement("div", {
    className: "dwhyhead up"
  }, React.createElement("img", {
    className: "dportrait",
    src: "assets/portrait.jpg",
    alt: "Carter Groff",
    loading: "lazy"
  }), React.createElement("div", null, React.createElement("h2", {
    className: "ddisplay"
  }, SITE.whyHead), React.createElement("p", {
    className: "dp"
  }, SITE.whyIntro), SITE.rules.length > 0 && React.createElement("span", {
    className: "dk drules-k"
  }, "My rules"), SITE.rules.length > 0 && React.createElement("ol", {
    className: "drules"
  }, SITE.rules.map((r, i) => React.createElement("li", {
    key: i
  }, React.createElement("b", null, i + 1), React.createElement("span", null, r)))))), TESTIMONIALS.length > 0 && React.createElement("div", {
    className: "dquotes"
  }, TESTIMONIALS.map(t => React.createElement("blockquote", {
    className: "up",
    key: t.name
  }, React.createElement("p", null, "\u201C", t.quote, "\u201D"), React.createElement("cite", null, t.name, t.business ? ', ' + t.business : ''))))));
}
function Faq() {
  return React.createElement("section", {
    id: "faq",
    className: "dsection dsoft"
  }, React.createElement("div", {
    className: "dwrap dfaqgrid"
  }, React.createElement("div", {
    className: "dshead up"
  }, React.createElement("h2", {
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
const PLAN_TYPES = ['application/pdf', 'application/zip', 'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const PLAN_MAX_BYTES = 25 * 1024 * 1024;
async function uploadPlan(file) {
  const r = await fetch('/api/design-brief', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'plan-upload',
      filename: file.name,
      type: file.type,
      size: file.size
    })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) throw new Error(j.error || 'The plan could not upload.');
  const put = await fetch(j.url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'x-upsert': 'false'
    },
    body: file
  });
  if (!put.ok) throw new Error('The plan could not upload.');
  return {
    path: j.path,
    filename: file.name,
    type: file.type
  };
}
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
  const [plan, setPlan] = React.useState(null);
  const [busyNote, setBusyNote] = React.useState('');
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
  const onPlan = e => {
    setError('');
    const p = (e.target.files || [])[0] || null;
    if (p && (!PLAN_TYPES.includes(p.type) || p.size > PLAN_MAX_BYTES)) {
      setError(`${p.name}: a PDF, Word, Excel, PowerPoint, text, image or zip file, up to 25 MB.`);
      e.target.value = '';
      setPlan(null);
      return;
    }
    setPlan(p);
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
      if (auto && plan) {
        setBusyNote('Uploading your plan\u2026');
        try {
          payload.plan = await uploadPlan(plan);
        } catch (e) {
          setError(e.message + ' Remove it and send the brief without it, or email it to car.groff@gmail.com.');
          return;
        }
        setBusyNote('');
      }
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
      setBusyNote('');
    }
  };
  if (sent) {
    return React.createElement("section", {
      id: "brief",
      className: "dsection ddeep"
    }, React.createElement("div", {
      className: "dwrap"
    }, React.createElement("div", {
      className: "dsent"
    }, React.createElement("h3", {
      className: "ddisplay"
    }, "Brief received."), sent.reference && React.createElement("p", {
      className: "dref"
    }, "Reference ", sent.reference), React.createElement("p", {
      className: "dp"
    }, sent.confirmation ? 'A copy is on its way to your inbox. ' : '', "I\u2019ll read it properly and come back with a price and a delivery date, usually within one business day. If anything\u2019s missing I\u2019ll ask for exactly that."))));
  }
  const chips = auto ? AUTOMATION_CHIPS : DESIGN_CHIPS;
  return React.createElement("section", {
    id: "brief",
    className: 'dsection ddeep dlive' + (auto ? ' dauto' : '')
  }, React.createElement("div", {
    className: "dbrief-glow",
    "aria-hidden": "true"
  }), React.createElement(BriefRing, null), React.createElement("div", {
    className: "dwrap dbriefwrap"
  }, React.createElement("div", {
    className: "dbriefhead"
  }, React.createElement("img", {
    className: "dbrief-crest",
    src: "assets/antler.png",
    alt: ""
  }), React.createElement("h2", {
    className: "ddisplay"
  }, "Write me a brief."), React.createElement("p", {
    className: "ddeck"
  }, "Three short steps. The more you tell me, the sooner you get a price."), React.createElement("p", {
    className: "dbriefmeta"
  }, "About three minutes. No account, and no call. ", auto ? 'A price and a timeline within a day.' : 'Three design directions within two business days.')), React.createElement("div", {
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
  }, React.createElement("span", null, "Step ", step + 1, " of 3: ", STEPS[step][1].toLowerCase()), React.createElement("span", null, step === 2 ? 'Last step' : step === 1 ? 'One left' : 'Two left')), React.createElement("div", {
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
  }, auto ? 'What you want to stop doing by hand.' : 'Who it’s for and what it has to do.'), React.createElement("textarea", {
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
  }, "What\u2019s slow today"), React.createElement("span", {
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
  }, ['Yes: logo, colors, fonts', 'Some of them', 'No, help me figure it out'].map((label, i) => {
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
  }, files.map(x => x.name).join(', '))), auto && React.createElement("label", {
    className: "dfl"
  }, React.createElement("span", {
    className: "dlb"
  }, "Your plan or spec"), React.createElement("span", {
    className: "dhint"
  }, "Optional. If you have a written plan for the tool, attach it: a PDF, Word, Excel, PowerPoint, text, image or zip file, up to 25 MB."), React.createElement("input", {
    className: "dfile",
    type: "file",
    accept: PLAN_TYPES.join(','),
    onChange: onPlan
  }), plan && React.createElement("span", {
    className: "dhint"
  }, plan.name)))), busyNote && React.createElement("p", {
    className: "dhint",
    role: "status"
  }, busyNote), error && React.createElement("p", {
    className: "derr",
    role: "alert"
  }, error), React.createElement("div", {
    className: "dwalk"
  }, step > 0 && React.createElement("button", {
    className: "dback",
    type: "button",
    onClick: back
  }, "Back"), React.createElement("p", {
    className: "dfine"
  }, step === 2 ? "Price and timeline back within a day." : step === 1 ? 'One more step. All optional.' : 'Three short steps.'), React.createElement("button", {
    className: "p-btn",
    type: "submit",
    disabled: busy || !stepValid(step)
  }, busy ? 'Sending…' : step === 2 ? 'Send brief' : 'Continue')))));
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
  }, "The Scaffold"), React.createElement("p", {
    className: "dfootsub"
  }, "Tools and design by Carter Groff. Harrisonburg, Virginia.")), React.createElement("div", {
    className: "dfootlinks"
  }, React.createElement("a", {
    href: "https://www.cargroff.com/"
  }, "Portfolio"), React.createElement("a", {
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
    const lives = document.querySelectorAll('.dlive');
    const live = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('idle', !e.isIntersecting));
    });
    lives.forEach(el => live.observe(el));
    return () => {
      io.disconnect();
      live.disconnect();
    };
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
  }), React.createElement(Doors, {
    onAddNeed: onAddNeed
  }), React.createElement(Dial, null), React.createElement(Make, {
    onAddNeed: onAddNeed
  }), React.createElement(Why, null), React.createElement(Brief, {
    ref: briefRef
  }), React.createElement(Faq, null), React.createElement(Footer, null));
}
const SC_SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const SC_SUPABASE_KEY = 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x';
const DESIGN_NEEDS = DESIGN_CHIPS.slice();
const TOOL_NEEDS = AUTOMATION_CHIPS.slice();
const scStr = v => typeof v === 'string' && v.trim() ? v.trim() : '';
const scFill = (arr, next) => {
  if (next.length) arr.splice(0, arr.length, ...next);
};
function applyScaffoldContent(o) {
  if (!o || typeof o !== 'object') return;
  ['headline', 'deck', 'whyHead', 'whyIntro'].forEach(k => {
    if (scStr(o[k])) SITE[k] = scStr(o[k]);
  });
  if (typeof o.showPrices === 'boolean') SITE.showPrices = o.showPrices;
  if (Array.isArray(o.rules)) SITE.rules = o.rules.map(scStr).filter(Boolean).slice(0, 6);
  if (Array.isArray(o.design)) scFill(DESIGN_SERVICES, o.design.filter(d => d && scStr(d.title)).map(d => ({
    title: scStr(d.title),
    sub: scStr(d.sub),
    need: DESIGN_NEEDS.includes(d.need) ? d.need : 'Something else',
    from: scStr(d.from),
    turn: scStr(d.turn) || 'Quoted'
  })));
  if (Array.isArray(o.tools)) scFill(TOOL_SERVICES, o.tools.filter(t => t && scStr(t.title)).map(t => ({
    title: scStr(t.title),
    need: TOOL_NEEDS.includes(t.need) ? t.need : 'Something else'
  })));
  if (Array.isArray(o.how) && o.how.length === 4 && o.how.every(h => h && scStr(h.title) && scStr(h.text))) {
    scFill(HOW_STEPS, o.how.map(h => [scStr(h.title), scStr(h.text)]));
  }
  if (Array.isArray(o.faq)) scFill(FAQ, o.faq.filter(f => f && scStr(f.q) && scStr(f.a)).map(f => [scStr(f.q), scStr(f.a)]));
  if (Array.isArray(o.testimonials)) {
    TESTIMONIALS.splice(0, TESTIMONIALS.length, ...o.testimonials.filter(t => t && scStr(t.quote) && scStr(t.name)).map(t => ({
      quote: scStr(t.quote),
      name: scStr(t.name),
      business: scStr(t.business)
    })));
  }
}
function loadScaffoldContent() {
  const get = fetch(SC_SUPABASE_URL + '/rest/v1/site_content?select=data&id=eq.2', {
    headers: {
      apikey: SC_SUPABASE_KEY
    }
  }).then(r => r.ok ? r.json() : null).then(rows => rows && rows[0] ? rows[0].data : null);
  const wait = new Promise(resolve => setTimeout(() => resolve(null), 1500));
  return Promise.race([get, wait]).catch(() => null);
}
loadScaffoldContent().then(o => {
  try {
    applyScaffoldContent(o);
  } catch (e) {}
}).finally(() => ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(TheScaffold, null)));
