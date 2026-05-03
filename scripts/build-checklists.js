#!/usr/bin/env node
/**
 * build-checklists.js — Generate printable "save as PDF" checklists
 * for the top guides. Each output is a single-page HTML with @media print
 * rules so any browser can save it as PDF.
 *
 * Output: /downloads/{slug}-checklist.html
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'downloads');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function checklist({ slug, title, subtitle, intro, sections, footer }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · West Valley Chamber Checklist</title>
<meta name="description" content="${intro.replace(/"/g,'&quot;').slice(0, 155)}">
<link rel="icon" href="../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css?v=4">
<style>
  body { background: var(--cream); }
  .toolbar { position: sticky; top: 0; z-index: 50; background: var(--paper); border-bottom: 1px solid var(--line); padding: 12px 20px; display: flex; gap: 12px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
  .toolbar__title { font-family: var(--mono); font-size: .76rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .doc { max-width: 8.5in; margin: 24px auto; background: var(--paper); padding: 0.75in; box-shadow: var(--shadow-md); border-radius: var(--r-md); }
  .doc__hdr { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 18px; border-bottom: 2px solid var(--gold); }
  .doc__brand { font-family: var(--mono); font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .doc__brand strong { display:block; font-family: var(--serif); font-size: 1.1rem; color: var(--navy); letter-spacing: 0; text-transform: none; margin-top: 2px; }
  .doc h1 { font-size: 1.9rem; margin-top: 14px; line-height: 1.15; }
  .doc__sub { color: var(--slate-mid); font-size: 1.02rem; margin-top: 4px; }
  .doc__intro { margin: 18px 0 24px; padding: 14px 16px; background: var(--blue-soft); border-left: 4px solid var(--blue); border-radius: 0 var(--r-md) var(--r-md) 0; font-size: .94rem; color: var(--navy); }
  .sec { margin: 24px 0; page-break-inside: avoid; }
  .sec h2 { font-size: 1.1rem; color: var(--navy); padding-bottom: 4px; border-bottom: 1px solid var(--line); margin-bottom: 10px; }
  .sec ul { list-style: none; padding: 0; }
  .sec li { padding: 6px 0; padding-left: 28px; position: relative; font-size: .95rem; line-height: 1.5; }
  .sec li::before { content: "☐"; position: absolute; left: 4px; top: 4px; font-size: 1.1rem; color: var(--gold-deep); }
  .sec li strong { color: var(--navy); }
  .doc__footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid var(--line); font-size: .82rem; color: var(--slate-mid); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .doc__footer strong { color: var(--gold-deep); }
  @media print {
    .toolbar { display: none; }
    body { background: white; }
    .doc { box-shadow: none; margin: 0; max-width: none; padding: 0.5in; }
    @page { size: letter; margin: 0.5in; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div>
    <div class="toolbar__title">Chamber Checklist</div>
    <div style="font-size:.88rem;color:var(--slate);">${title}</div>
  </div>
  <div style="display:flex;gap:8px;">
    <a href="../guides/${slug}.html" class="btn btn--outline btn--sm">← Back to guide</a>
    <button class="btn btn--gold btn--sm" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>
</div>

<article class="doc">
  <div class="doc__hdr">
    <div>
      <div class="doc__brand">West Valley · Warner Center<strong>Chamber of Commerce</strong></div>
      <h1>${title}</h1>
      <div class="doc__sub">${subtitle}</div>
    </div>
    <img src="../images/wvwccc-logo-2026.png" alt="" style="width:64px;height:64px;flex-shrink:0;">
  </div>

  <p class="doc__intro">${intro}</p>

  ${sections.map(s => `
  <div class="sec">
    <h2>${s.heading}</h2>
    <ul>${s.items.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>`).join('')}

  <div class="doc__footer">
    <div>${footer || 'Compiled by the West Valley Warner Center Chamber of Commerce.'}<br><strong>(818) 347-4737</strong> · woodlandhillscc.net</div>
    <div style="text-align:right;">© 2026 WVWCCC<br>Free for residents · members get printed copies on request</div>
  </div>
</article>

</body>
</html>`;
}

const CHECKLISTS = [
  // ── Date Night Restaurant Checklist ───────────────────
  {
    slug: 'restaurant',
    title: 'Date Night in the West Valley',
    subtitle: 'A printable cheat sheet for the next time you need to choose well',
    intro: '13 chamber-member restaurants, organized by vibe. Pick the row that matches your night, call ahead, show your West Valley Loyalty Card if you have one, and enjoy.',
    sections: [
      {
        heading: 'For an actual celebration (anniversary, big news)',
        items: [
          '<strong>Fogo de Chão</strong> · Topanga & Califa, Woodland Hills · (818) 887-3007 · 6 weeks out for December',
          '<strong>Sushi Katsu-Ya</strong> · 11680 Ventura, Studio City · (818) 985-6976 · omakase only after 7pm',
          '<strong>Republique</strong> · 624 S La Brea (worth the drive) · (310) 362-6115 · French bistro · weekend brunch'
        ]
      },
      {
        heading: 'For "first date that doesn\'t feel like a first date"',
        items: [
          '<strong>Casa Vega</strong> · 13301 Ventura, Sherman Oaks · margaritas, patio, since 1956',
          '<strong>Trattoria Farfalla</strong> · 1978 Hillhurst, Los Feliz · romantic, homemade pasta',
          '<strong>Lemonade</strong> · Canoga Ave, Woodland Hills · casual, healthy, conversation-friendly'
        ]
      },
      {
        heading: 'For "this turned into dinner unexpectedly"',
        items: [
          '<strong>Mel\'s Drive-In</strong> · Ventura Blvd · open 24 hours · the safety net',
          '<strong>Burgers Never Say Die</strong> · 11800 Riverside, Valley Village · craft burgers + milkshakes',
          '<strong>The Habit Burger Grill</strong> · multiple Valley locations · fast + reliable'
        ]
      },
      {
        heading: 'Before you go — check the box',
        items: [
          'Reservation made (most of the above need 24-48 hours)',
          'Loyalty Card in your wallet (10% off lunch at Fogo with the card)',
          'Parking plan (Westfield Topanga lot if dining in Warner Center)',
          'Driver agreed (margaritas at Casa Vega = no driving home)',
          'Gift / card / flowers acquired if it\'s the kind of night that needs them'
        ]
      }
    ],
    footer: 'Curated by the chamber\'s Dine SFV editor team. Updated quarterly.'
  },

  // ── New Parent Welcome Pack ───────────────────────────
  {
    slug: 'parent-resource',
    title: 'New Parent in the West Valley · Welcome Pack',
    subtitle: 'Everything you need in your first 90 days',
    intro: 'Whether you just moved in or just gave birth, here\'s the cheat sheet to the West Valley parent ecosystem. Tear off the section you need; ignore the rest until later.',
    sections: [
      {
        heading: 'First call list (save these in your phone)',
        items: [
          '<strong>Pediatrician you trust</strong> — Tarzana Family Dental for first dental, Providence Tarzana for ER',
          '<strong>Lactation consultant</strong> — Providence Tarzana lactation department · (818) 881-0800',
          '<strong>24/7 advice line</strong> — Providence Children\'s Health Line',
          '<strong>Kaiser members</strong> — (800) 422-4641 advice nurse',
          '<strong>Poison Control</strong> — (800) 222-1222 (universal)'
        ]
      },
      {
        heading: 'First-90-days checklist',
        items: [
          'Pediatrician — first appointment booked within 3-5 days',
          'Pediatric dentist by 12 months (chamber-member: Tarzana Family Dental)',
          'Stroller-friendly walking loop scoped (Tarzana Rec, Reseda Park)',
          'Family doctor for parents (postpartum has needs too)',
          'Local moms group joined (Valley Moms FB group, Wellness Network referrals)',
          'Daycare/nanny shortlist drafted (waitlists run 6-12 months)',
          'Diaper service / store identified',
          'Birth certificate requested · SSN applied for'
        ]
      },
      {
        heading: 'Free / cheap weekend ideas (Saturdays, ages 0–3)',
        items: [
          'Tarzana Library story time · most Saturdays · free',
          'Lazy Acres Natural Market · indoor browsing, A/C',
          'Lemonade Canoga · chalk wall, kid menu, healthy options',
          'Pierce College Farm · covered animal viewing',
          'Sherman Oaks Galleria · stroller-friendly indoor walk'
        ]
      },
      {
        heading: 'Chamber resources for parents',
        items: [
          'Parent Resource Guide → 62 vetted providers',
          'Family Activities Guide → 42 weekend itineraries by age',
          'Connection Circles → meet other parents, free with chamber membership',
          'Adopt-a-School → if/when school enrollment comes up'
        ]
      }
    ],
    footer: 'Compiled with input from chamber-member pediatricians and parent volunteers.'
  },

  // ── Annual Home Maintenance Calendar ──────────────────
  {
    slug: 'home-maintenance',
    title: 'Annual Home Maintenance Calendar',
    subtitle: 'A month-by-month checklist for West Valley homeowners',
    intro: 'A house in the West Valley has its own seasonal rhythm — dry winters, wildfire risk, rare-but-real flooding. This calendar covers the basics. Chamber-member home pros are listed in the Home Maintenance Guide.',
    sections: [
      {
        heading: 'Quarterly — every 3 months',
        items: [
          'HVAC filter replaced (check more often Oct-Dec when fires + Santa Anas blow)',
          'Smoke + CO detectors tested',
          'GFCI outlets tested (kitchen, bathrooms, garage)',
          'Garbage disposal flushed (ice + lemon)',
          'Refrigerator coils vacuumed'
        ]
      },
      {
        heading: 'Spring (Mar-May)',
        items: [
          'Roof inspection (post-winter, pre-fire-season) — chamber: Allegiance Roofing',
          'Gutters cleaned + leaf-guard checked',
          'Exterior caulk around windows + doors inspected',
          'AC tune-up before first heat wave (book by mid-May)',
          'Sprinkler heads checked + reset for daylight savings',
          'Termite inspection (annual)'
        ]
      },
      {
        heading: 'Summer (Jun-Aug)',
        items: [
          'Defensible space cleared — 100ft of clearance for wildfire',
          'Dryer vent cleaned (high fire-risk season)',
          'Pool equipment serviced',
          'Garage organization purge',
          'Window screens repaired'
        ]
      },
      {
        heading: 'Fall (Sep-Nov)',
        items: [
          'Heater tune-up before first cold snap',
          'Chimney cleaned if you use the fireplace',
          'Insulation in attic checked',
          'Weather stripping replaced (doors + windows)',
          'Leaves cleared from roof + gutters',
          'Rain gutters tested with a hose'
        ]
      },
      {
        heading: 'Winter (Dec-Feb)',
        items: [
          'Pipes insulated (yes, we have freezing nights occasionally)',
          'Drainage paths cleared before first storm',
          'Sump pump tested',
          'Holiday lights inspected (no frayed wires)',
          'Emergency kit refreshed (water, batteries, flashlight)'
        ]
      },
      {
        heading: 'Emergency — save these',
        items: [
          '<strong>The Drain Co.</strong> · 24-hour plumbing · $25 off first call with Loyalty',
          '<strong>Bargain Plumbing</strong> · 24/7 dispatch',
          '<strong>Allegiance Roofing</strong> · emergency tarps for storm damage',
          '<strong>Restoration 1</strong> · water/fire damage'
        ]
      }
    ],
    footer: 'Built with chamber-member contractors. Loyalty Card gets discounts at most.'
  },

  // ── Small Business Compliance Checklist ───────────────
  {
    slug: 'business-solutions',
    title: '2026 Small Business Compliance Checklist · CA',
    subtitle: 'The things you can\'t afford to forget — California, federal, and West Valley specifics',
    intro: 'A practical year-round compliance reference for chamber-member small businesses. Pull it out at the start of each quarter. Chamber-member CPAs and attorneys can verify specifics for your situation.',
    sections: [
      {
        heading: 'Q1 (Jan-Mar) — tax & end-of-year',
        items: [
          '1099-NEC sent to contractors by Jan 31 (now $400 threshold, was $600)',
          'W-2s filed and distributed by Jan 31',
          'Annual privacy notice review (CCPA)',
          'EDD payroll filing (DE-9, DE-9C)',
          'Workers\' comp policy renewal review',
          'Statement of Information for CA corp / LLC (biennial — check year)'
        ]
      },
      {
        heading: 'Year-round (every quarter)',
        items: [
          '941 (federal payroll) filed quarterly',
          'Sales tax filed (frequency varies — most monthly or quarterly)',
          'EDD payroll filed quarterly',
          'I-9 records audited — current, no expired docs',
          'P&L reviewed (with your CPA, ideally monthly)'
        ]
      },
      {
        heading: 'CA 2026-specific',
        items: [
          '<strong>Sick leave:</strong> 7 days for 25+ employees, 5 days under 25 — check policy + handbook',
          '<strong>AB-2930:</strong> AI-based hiring tool disclosure (effective Jul 1)',
          '<strong>Independent contractor reporting:</strong> $400 threshold (was $600)',
          '<strong>FAST Act:</strong> if you\'re a fast-food chain — quarterly council compliance',
          '<strong>Heat illness prevention:</strong> outdoor + indoor workplaces (Cal/OSHA)',
          '<strong>Employee privacy:</strong> annual notice updates if you have CA-resident employees'
        ]
      },
      {
        heading: 'West Valley specific',
        items: [
          'LA city business tax renewed (BTRC)',
          'LA city business license posted visibly',
          'Health permit (if food service)',
          'ABC permit (if alcohol)',
          'Sidewalk vendor permit (if applicable)',
          'Storm-drain protection compliance (LA Sanitation)'
        ]
      },
      {
        heading: 'Recommended advisors (chamber members)',
        items: [
          'CPA: Alamir Accounting · Andersen CPA · Warner Center CPA Group',
          'Employment attorney: Gaines & Stacey LLP · Antonia Reyes Law',
          'Insurance: Tim Gaspar Insurance · Combined Insurance',
          'Tech / AI compliance: Heed AI Solutions · CMIT Solutions',
          'Banking: First Banks · Premier America Credit Union'
        ]
      }
    ],
    footer: 'This is a checklist, not legal advice. Confirm specifics with a chamber-member CPA or attorney.'
  },

  // ── Self-Care Routine Planner ─────────────────────────
  {
    slug: 'spa',
    title: 'Self-Care Routine Planner',
    subtitle: 'A printable schedule for the kind of self-care that actually happens',
    intro: 'Three tiers — Always, Sometimes, Rarely-but-needed. Chamber-member spas and wellness providers fit each tier. Loyalty Card discounts apply at most.',
    sections: [
      {
        heading: 'Always (weekly or monthly habits)',
        items: [
          '<strong>10-min daily walk</strong> — Tarzana Rec or Reseda Park if you need a destination',
          '<strong>Massage every 4-6 weeks</strong> — Healing Hands WH · Massage Envy Topanga',
          '<strong>Hair every 4-8 weeks</strong> — Allen Edwards Salon WH · 10% off with Loyalty',
          '<strong>Quick facial monthly</strong> — Beauty Skin Glow · Here She Glows-Skincare'
        ]
      },
      {
        heading: 'Sometimes (quarterly or seasonal)',
        items: [
          '<strong>Full spa day</strong> — Tarzana Skin & Wellness · 5+ hours · ~$420',
          '<strong>Couples treatment</strong> — Spa at Marriott Warner Center',
          '<strong>Med-spa treatment (Botox, fillers, peels)</strong> — Epitome Med Spa',
          '<strong>Pedicure + manicure full set</strong> — quarterly minimum'
        ]
      },
      {
        heading: 'When you need it (sporadic, situational)',
        items: [
          '<strong>Postpartum recovery</strong> — Mom & Baby package · Tarzana Skin & Wellness',
          '<strong>Pre-wedding glow-up</strong> — Bridal package, 6 sessions over 4 weeks',
          '<strong>Stress recovery (post-deadline)</strong> — Cryohealthcare WH · 30 min · $60',
          '<strong>Injury recovery</strong> — BASE Training & Physical Therapy',
          '<strong>Mental wellness</strong> — Tarzana Treatment Centers (referrals only)'
        ]
      },
      {
        heading: 'Routine planner — fill in your dates',
        items: [
          'Weekly habit + day of week: ____________________',
          'Next monthly massage scheduled for: ____________________',
          'Next quarterly spa day target: ____________________',
          'Bridge appointment (annual physical, dental, eye): ____________________',
          'One restorative thing per quarter just for you: ____________________'
        ]
      }
    ],
    footer: 'Chamber Wellness Network — 38 healthcare and wellness members.'
  }
];

CHECKLISTS.forEach(c => {
  fs.writeFileSync(path.join(OUT, `${c.slug}-checklist.html`), checklist(c));
  console.log(`✓ downloads/${c.slug}-checklist.html`);
});
console.log(`\n${CHECKLISTS.length} checklists built.`);
