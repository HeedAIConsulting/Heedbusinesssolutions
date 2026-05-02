#!/usr/bin/env node
/**
 * build-ad-inventory.js — Generate the chamber's full ad inventory across
 * every monetizable surface (homepage, guides, landing pages, blog, newsletters)
 * × every language version (en/es/ru/hy/zh).
 *
 * Pricing: 2026 introductory rate (locked through Dec 31, 2026)
 *          → Jan 1, 2027 "new website" pricing (~50% step-up).
 *
 * Output: data/ad-inventory.json
 *
 * Run:  node scripts/build-ad-inventory.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'ad-inventory.json');

// Ad surfaces — what's available where
// Format: [pageId, label, position, dimensions, intro$/mo, new$/mo, sponsorshipType]
const SURFACES = [
  // ── HOMEPAGE ────────────────────────────────────────────
  ['/',                  'Homepage Top Leaderboard',       'leaderboard-top',     '1240×90',  1200, 1800, 'banner'],
  ['/',                  'Homepage Hero Sponsor',          'hero-sponsor',         'inline',  3500, 5000, 'presenting'],
  ['/',                  'Homepage Mid Banner',            'banner-mid',           '728×90',   600,  900, 'banner'],
  ['/',                  'Homepage Sidebar (Featured Resources)', 'sidebar-1',     '300×250',  500,  750, 'banner'],
  ['/',                  'Homepage Newsletter Sponsor Strip','newsletter-strip',   'inline',   400,  600, 'banner'],

  // ── DIRECTORY ───────────────────────────────────────────
  ['/members/directory.html','Directory Top Leaderboard',     'leaderboard-top', '1240×90',  900, 1350, 'banner'],
  ['/members/directory.html','Directory Sidebar (Premium Listing Promo)','sidebar-1','300×600',  600,  900, 'banner'],
  ['/members/directory.html','"Featured Member" Slot 1',      'featured-1',     'inline',   300,  450, 'feature'],
  ['/members/directory.html','"Featured Member" Slot 2',      'featured-2',     'inline',   300,  450, 'feature'],
  ['/members/directory.html','"Featured Member" Slot 3',      'featured-3',     'inline',   300,  450, 'feature'],

  // ── GUIDE HUB + EACH GUIDE ──────────────────────────────
  ['/guides/index.html', 'Guide Hub Leaderboard',          'leaderboard-top', '1240×90',  500,  750, 'banner'],
  ['/guides/cityloop.html','CityLoop Presenting Sponsor',  'presenting',     'inline',  1500, 2250, 'presenting'],
  ['/guides/cityloop.html','CityLoop Sidebar Banner',      'sidebar-1',      '300×250',  400,  600, 'banner'],
  ['/guides/cityloop.html','CityLoop Section Sponsor: Trending', 'section-trending', 'inline', 350, 525, 'section'],
  ['/guides/cityloop.html','CityLoop Section Sponsor: Local Tips', 'section-tips',  'inline', 300, 450, 'section'],
  ['/guides/restaurant.html','Restaurant Guide Presenting','presenting',     'inline',  1067, 1600, 'presenting'],
  ['/guides/restaurant.html','Restaurant Guide Banner',    'banner-1',       '728×90',   400,  600, 'banner'],
  ['/guides/parent-resource.html','Parent Guide Presenting','presenting',    'inline',   933, 1400, 'presenting'],
  ['/guides/parent-resource.html','Parent Guide Banner',   'banner-1',       '728×90',   350,  525, 'banner'],
  ['/guides/spa.html',   'Spa & Wellness Presenting',      'presenting',     'inline',   800, 1200, 'presenting'],
  ['/guides/spa.html',   'Spa & Wellness Banner',          'banner-1',       '728×90',   300,  450, 'banner'],
  ['/guides/home-maintenance.html','Home Pro Presenting',  'presenting',     'inline',   600,  900, 'presenting'],
  ['/guides/home-maintenance.html','Home Pro Banner',      'banner-1',       '728×90',   250,  375, 'banner'],
  ['/guides/business-solutions.html','Business Solutions Presenting','presenting','inline',600, 900,'presenting'],
  ['/guides/education.html','Education Presenting',        'presenting',     'inline',   600,  900, 'presenting'],
  ['/guides/family-activities.html','Family Activities Presenting','presenting','inline', 600, 900, 'presenting'],
  ['/guides/professional-services.html','Pro Services Presenting','presenting','inline', 600, 900, 'presenting'],

  // ── EVENTS ──────────────────────────────────────────────
  ['/events/index.html', 'Events Page Leaderboard',        'leaderboard-top', '1240×90',  500,  750, 'banner'],
  ['/events/index.html', 'Events Calendar Sidebar',        'sidebar-1',      '300×250',  400,  600, 'banner'],

  // ── BLOG ────────────────────────────────────────────────
  ['/blog/',             'Blog Index Leaderboard',          'leaderboard-top','1240×90',  400,  600, 'banner'],
  ['/blog/',             'Blog Index Sidebar',              'sidebar-1',      '300×600',  350,  525, 'banner'],
  ['/blog/post-*.html',  'Blog Post In-Article (rotating)', 'in-article',     'inline',   200,  300, 'rotating'],
  ['/blog/post-*.html',  'Blog Post Sidebar (rotating)',    'sidebar-1',      '300×250',  150,  225, 'rotating'],

  // ── NEWSLETTERS ─────────────────────────────────────────
  ['/newsletters/',      'Newsletter Hub Banner',          'banner-1',       '728×90',   200,  300, 'banner'],
  ['/newsletter/weekly', 'West Valley Weekly Sponsor',     'newsletter-presenting','inline', 500, 750, 'newsletter'],
  ['/newsletter/parents','Valley Parents Sponsor',         'newsletter-presenting','inline', 300, 450, 'newsletter'],
  ['/newsletter/dining', 'Dine SFV Sponsor',               'newsletter-presenting','inline', 350, 525, 'newsletter'],
  ['/newsletter/business','Valley Biz Brief Sponsor',      'newsletter-presenting','inline', 350, 525, 'newsletter'],
  ['/newsletter/wellness','Wellness Network Digest Sponsor','newsletter-presenting','inline',250, 375, 'newsletter'],
  ['/newsletter/events', 'This Week in the Valley Sponsor','newsletter-presenting','inline', 400, 600, 'newsletter'],
  ['/newsletter/realestate','Valley Real Estate Sponsor',  'newsletter-presenting','inline', 200, 300, 'newsletter'],

  // ── LOYALTY + LANDING + REFERRAL ────────────────────────
  ['/loyalty.html',      'Loyalty Program Sidebar',        'sidebar-1',      '300×250',  300,  450, 'banner'],
  ['/loyalty.html',      'Loyalty Program Co-op Slot',     'inline-coop',    'inline',   400,  600, 'banner'],
  ['/landing/professional-services.html','Pro Services Landing Sidebar','sidebar-1','300×250',250,375,'banner'],
  ['/landing/spa-beauty.html','Spa Landing Sidebar',       'sidebar-1',      '300×250',  250,  375, 'banner'],
  ['/landing/education.html','Education Landing Sidebar',  'sidebar-1',      '300×250',  250,  375, 'banner'],
  ['/landing/family-based.html','Family Landing Sidebar',  'sidebar-1',      '300×250',  250,  375, 'banner'],
  ['/landing/activity-based.html','Activity Landing Sidebar','sidebar-1',    '300×250',  250,  375, 'banner'],
  ['/referral.html',     'Referral Page Footer Banner',    'footer-banner',  '728×90',   150,  225, 'banner']
];

const LANGS = [
  { code: 'en', label: 'English', multiplier: 1.00 },
  { code: 'es', label: 'Spanish', multiplier: 0.55 },
  { code: 'ru', label: 'Russian', multiplier: 0.40 },
  { code: 'hy', label: 'Armenian', multiplier: 0.45 },
  { code: 'zh', label: 'Chinese', multiplier: 0.50 }
];

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const inventory = [];
SURFACES.forEach(([pageId, label, position, dimensions, introMo, newMo, type]) => {
  LANGS.forEach(L => {
    const m = L.multiplier;
    const introMonth  = Math.round(introMo * m);
    const introAnnual = Math.round(introMonth * 10);  // 2 months free annually
    const newMonth    = Math.round(newMo * m);
    const newAnnual   = Math.round(newMonth * 10);
    const id = `${slug(pageId)}-${slug(position)}-${L.code}`;
    inventory.push({
      id,
      page: pageId,
      language: L.code,
      languageLabel: L.label,
      label: `${label} (${L.label})`,
      position,
      dimensions,
      type,
      pricing: {
        introMonthly: introMonth,
        introAnnual,
        newMonthly: newMonth,
        newAnnual,
        introExpires: '2026-12-31',
        newPricingStarts: '2027-01-01'
      },
      status: 'available',  // available | reserved | sold
      buyer: null,
      termStart: null,
      termEnd: null,
      notes: ''
    });
  });
});

// Pre-populate a handful as "sold" to demonstrate the dashboard
const presetSold = [
  { id: 'index-html-presenting-en', buyer: 'Westfield Topanga & The Village', term: 'annual', termStart: '2026-01-01', termEnd: '2026-12-31' },
  { id: 'guides-restaurant-html-presenting-en', buyer: 'Fogo de Chão Brazilian Steakhouse', term: 'annual', termStart: '2026-04-01', termEnd: '2027-03-31' },
  { id: 'guides-cityloop-html-presenting-en', buyer: 'Providence Cedars-Sinai Tarzana', term: 'annual', termStart: '2026-01-01', termEnd: '2026-12-31' },
  { id: 'guides-spa-html-presenting-en', buyer: 'Epitome Med Spa', term: 'annual', termStart: '2026-03-01', termEnd: '2027-02-28' },
  { id: 'guides-parent-resource-html-presenting-en', buyer: 'Tarzana Treatment Centers', term: 'annual', termStart: '2026-02-01', termEnd: '2027-01-31' },
  { id: 'newsletter-weekly-newsletter-presenting-en', buyer: 'Warner Center Marriott', term: 'annual', termStart: '2026-01-01', termEnd: '2026-12-31' },
  { id: 'newsletter-parents-newsletter-presenting-en', buyer: 'Allegra Music Academy', term: 'annual', termStart: '2026-04-01', termEnd: '2027-03-31' },
  { id: 'newsletter-dining-newsletter-presenting-en', buyer: 'Lemonade Restaurant', term: 'monthly', termStart: '2026-04-01', termEnd: '2026-04-30' },
  { id: 'index-html-leaderboard-top-en', buyer: 'UCLA Health', term: 'annual', termStart: '2026-01-01', termEnd: '2026-12-31' },
  { id: 'index-html-banner-mid-en', buyer: 'Tim Gaspar Insurance', term: 'monthly', termStart: '2026-04-01', termEnd: '2026-04-30' },
  { id: 'members-directory-html-leaderboard-top-en', buyer: 'Premier America Credit Union', term: 'annual', termStart: '2026-02-01', termEnd: '2027-01-31' },
  { id: 'members-directory-html-featured-1-en', buyer: 'Allen Edwards Salon Woodland Hills', term: 'annual', termStart: '2026-01-15', termEnd: '2027-01-14' },
  { id: 'members-directory-html-featured-2-en', buyer: 'Beauty Skin Glow', term: 'annual', termStart: '2026-02-01', termEnd: '2027-01-31' },
  { id: 'loyalty-html-sidebar-1-en', buyer: 'WH Camera & Telescopes', term: 'annual', termStart: '2026-01-01', termEnd: '2026-12-31' },
  { id: 'newsletter-business-newsletter-presenting-en', buyer: 'Heed AI Solutions', term: 'annual', termStart: '2026-03-01', termEnd: '2027-02-28' }
];
presetSold.forEach(s => {
  const item = inventory.find(i => i.id === s.id);
  if (item) {
    item.status = 'sold';
    item.buyer = s.buyer;
    item.termStart = s.termStart;
    item.termEnd = s.termEnd;
    item.term = s.term;
  }
});

fs.writeFileSync(OUT, JSON.stringify(inventory, null, 2));

const sold = inventory.filter(i => i.status === 'sold');
const available = inventory.filter(i => i.status === 'available');
const mrr = sold.reduce((s, i) => s + (i.term === 'annual' ? i.pricing.introAnnual / 12 : i.pricing.introMonthly), 0);
const arr = sold.reduce((s, i) => s + (i.term === 'annual' ? i.pricing.introAnnual : i.pricing.introMonthly * 12), 0);
const totalAvailableMRR = inventory.reduce((s, i) => s + i.pricing.introMonthly, 0);
const totalAvailableARR = inventory.reduce((s, i) => s + i.pricing.introAnnual, 0);

console.log(`✓ data/ad-inventory.json — ${inventory.length} ad spaces (${SURFACES.length} surfaces × ${LANGS.length} languages)`);
console.log(`\n📊 Inventory:`);
console.log(`  Sold: ${sold.length} (${((sold.length/inventory.length)*100).toFixed(1)}%)`);
console.log(`  Available: ${available.length} (${((available.length/inventory.length)*100).toFixed(1)}%)`);
console.log(`\n💰 Revenue (current sold, intro pricing):`);
console.log(`  MRR: $${Math.round(mrr).toLocaleString()}`);
console.log(`  ARR: $${Math.round(arr).toLocaleString()}`);
console.log(`\n🔮 Total inventory potential (if 100% sold at intro pricing):`);
console.log(`  Monthly: $${totalAvailableMRR.toLocaleString()}`);
console.log(`  Annual:  $${totalAvailableARR.toLocaleString()}`);
console.log(`\n📈 Jan 1, 2027 step-up: ~50% on most surfaces`);
