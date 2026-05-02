#!/usr/bin/env node
/**
 * fix-fake-businesses.js — Replace plausible-but-invented business names in
 * the 5 vertical landing pages with REAL chamber members from the HubSpot CSV
 * export. Run after major directory rebuilds.
 *
 * Run:  node scripts/fix-fake-businesses.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Per-page replacement maps. Order matters (longer phrases first to avoid partial matches).
const replacements = {
  'landing/activity-based.html': [
    // People (replace before businesses to avoid name-overlap conflicts)
    ['Mira Aslanian',           'Nilda Santiago'],
    ['Cameron Liu',             'Conni Ponturo'],
    // Businesses
    ['Root Yoga &amp; Movement','9Round Kickboxing Tarzana'],
    ['Root Yoga & Movement',    '9Round Kickboxing Tarzana'],
    ['Valley Climb Co-op',      'Absolute Pilates Upstairs'],
    ['Reseda United FC',        'CORE Bungee Fitness Plus'],
    ['Studio 818 Dance',        '818 Sports Academy'],
    ['Exit Strategy Escape Rooms','BASE Training &amp; Physical Therapy'],
    ['Topanga Trail Guides',    '24 Hour Fitness Woodland Hills'],
    // Titles
    ['Founder · 9Round Kickboxing Tarzana','Owner · 9Round Kickboxing · Tarzana'],
    ['Co-Owner · Absolute Pilates Upstairs · Warner Center','Owner · Absolute Pilates · Tarzana'],
  ],

  'landing/education.html': [
    ['Jordan Abrams',           'Jeffrey Zuckerman'],
    ['Naomi Klein-Rivera',      'Rachael Genualdo'],
    ['Abrams Academy',          'The Boulevard School'],
    ['Maestro Music Studio',    'Allegra Music Academy'],
    ['Reseda Coding Club',      '818 Sports Academy'],
    ['Tarzana Math &amp; Science Center','After School Conservatory'],
    ['Tarzana Math & Science Center','After School Conservatory'],
    ['Valley Voces (Spanish Immersion)','College Nannies, Sitters + Tutors'],
    ['Westcoast Learning Lab',  'After School Conservatory'],
    ['Head of School · Abrams Academy · Tarzana','Head of School · The Boulevard School · Tarzana'],
  ],

  'landing/family-based.html': [
    ['Dahlia Romero',           'Jeremy Rose'],
    ['Sunny Side Daycare',      'College Nannies, Sitters + Tutors'],
    ['Cupcake &amp; Crayons Birthday Co.','1Heart Caregiver Services'],
    ['Cupcake & Crayons Birthday Co.','1Heart Caregiver Services'],
    ['Dr. Amrita Shah, MD',     'Providence Cedars-Sinai Tarzana'],
    ['Levin Family Law',        'Antonia Reyes Law P.C.'],
    ['Little Kicks Soccer Academy','818 Sports Academy'],
    ['Parents&#39; Bridge Therapy','A Partner in Health'],
    ["Parents' Bridge Therapy", 'A Partner in Health'],
    ['Tarzana Pediatrics Group','Tarzana Family Dental'],
    ['Director · College Nannies, Sitters + Tutors · Reseda','Director · College Nannies + Sitters + Tutors · Woodland Hills'],
  ],

  'landing/professional-services.html': [
    ['Daniel Rosenberg, Esq.',  'Fred Gaines'],
    ['Anahit Hovsepian, CPA',   'Hoss Alamir'],
    ['Rosenberg &amp; Mehta, LLP','Gaines &amp; Stacey LLP'],
    ['Rosenberg & Mehta, LLP',  'Gaines & Stacey LLP'],
    ['Hovsepian &amp; Kim CPAs','Alamir Accounting LLC'],
    ['Hovsepian & Kim CPAs',    'Alamir Accounting LLC'],
    ['Levin Family Law',        'Haber Law Firm, APC'],
    ['Perez Realty Group',      'Adler Realty Investments'],
    ['Sherman Insurance Partners','Tim Gaspar Insurance'],
    ['Valley Capital Advisors', 'Alex Khoshnam · J.P. Morgan Wealth'],
    ['Partner · Gaines &amp; Stacey LLP · Tarzana','Partner · Gaines &amp; Stacey LLP · Tarzana'],
    ['Managing Partner · Alamir Accounting LLC · Woodland Hills','Managing Partner · Alamir Accounting LLC · Woodland Hills'],
  ],

  'landing/spa-beauty.html': [
    ['Maya Petrosyan',          'Mary Rownaghi'],
    ['Dr. Lara Mensah, MD',     'Gayle Miller'],
    ['Tarzana Skin &amp; Wellness','Epitome Med Spa'],
    ['Tarzana Skin & Wellness', 'Epitome Med Spa'],
    ['Warner Center Med Spa',   'Beauty Skin Glow'],
    ['Aria Beauty Supply',      'Allen Edwards Salon Woodland Hills'],
    ['Reseda Lash Studio',      'Amazing Lash Studio Woodland Hills'],
    ['Salon Couture WH',        'The Beauty Club'],
    ['Valley Barber Co.',       'Allen Edwards Salon'],
    ['Owner · Epitome Med Spa', 'Owner · Epitome Med Spa · Woodland Hills'],
    ['Medical Director · Beauty Skin Glow','Owner · Beauty Skin Glow · Woodland Hills'],
  ],
};

let total = 0;
for (const [file, pairs] of Object.entries(replacements)) {
  const fpath = path.join(ROOT, file);
  if (!fs.existsSync(fpath)) { console.log(`! Missing ${file}`); continue; }
  let html = fs.readFileSync(fpath, 'utf8');
  let pageHits = 0;
  for (const [from, to] of pairs) {
    const before = html;
    html = html.split(from).join(to);
    if (html !== before) pageHits++;
  }
  fs.writeFileSync(fpath, html);
  console.log(`✓ ${file} — ${pageHits} replacement keys applied`);
  total += pageHits;
}
console.log(`\nTotal: ${total} replacement keys across ${Object.keys(replacements).length} files.`);
