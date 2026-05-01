#!/usr/bin/env node
/**
 * build-directory.js
 *
 * Builds the unified West Valley ~ Warner Center Chamber business directory by
 * merging three sources:
 *
 *   1. data/members.json
 *      Hand-curated "featured leaders" — Providence, Marriott, WH Camera,
 *      Fogo de Chao, etc. Always treated as chamber members and preserved
 *      verbatim (with chamberMember: true forced).
 *
 *   2. raw/wvwccc_members.csv
 *      The HubSpot export of the chamber's actual paying members
 *      (~797 rows). Each row becomes a directory entry tagged
 *      chamberMember: true and tier: 'member' unless overridden by the
 *      curated list above.
 *
 *   3. raw/cityloop/data_files/SFV_*_Directory.csv
 *      Broader San Fernando Valley business listings (Restaurants, Beauty,
 *      Education, Fitness). These are tagged chamberMember: false and
 *      tier: 'community' — visible in the directory but not paying members.
 *      A fuzzy lookup against the chamber CSV upgrades any matches to
 *      chamberMember: true.
 *
 * Outputs:
 *   - data/directory.json        Unified, deterministic, sorted array
 *   - data/directory-stats.json  Totals, chamber vs community, by category,
 *                                by neighborhood
 *
 * No npm dependencies. Tiny inline CSV parser handles quoted fields and
 * escaped quotes the way the source files use them.
 *
 * Run:    node scripts/build-directory.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const RAW_DIR = path.join(ROOT, 'raw');

// ---------------------------------------------------------------------------
// CSV parsing (RFC-4180-ish: quoted fields, escaped quotes, embedded commas)
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell); cell = '';
      } else if (ch === '\n') {
        row.push(cell); rows.push(row); row = []; cell = '';
      } else if (ch === '\r') {
        // ignore — handle on \n
      } else {
        cell += ch;
      }
    }
  }
  // Last cell / row if file does not end in newline
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.length && r.some(v => v && v.trim().length))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
      return obj;
    });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function cleanPhone(p) {
  if (!p) return '';
  const s = String(p).trim();
  if (!s || s.toLowerCase() === 'nan') return '';
  return s;
}

function cleanString(s) {
  if (s === undefined || s === null) return '';
  const v = String(s).trim();
  if (!v || v.toLowerCase() === 'nan') return '';
  return v;
}

function cleanWebsite(w) {
  const v = cleanString(w);
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return 'https://' + v.replace(/^\/+/, '');
}

function logoLetter(name) {
  const m = String(name || '').replace(/^[^A-Za-z0-9]+/, '').match(/[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : '?';
}

// Keyword-based category classifier for the HubSpot CSV (which has no
// category column). Order matters: more specific first.
const CATEGORY_RULES = [
  { cat: 'Real Estate',          re: /\b(realty|realtor|real estate|properties|homes?|broker|escrow|mortgage|coldwell|keller williams|sotheby|compass|re\/?max|berkshire hathaway|exp realty|douglas elliman|rodeo|equity)\b/i },
  { cat: 'Healthcare',           re: /\b(medical|health|hospital|clinic|dental|dentist|orthodont|chiropract|physician|doctor|md|dpm|optomet|pediatric|cardio|derm|psych|therap|surgery|surgical|wellness center|nursing|rehab|hospice|urgent care|pharmacy|veterinary|vet)\b/i },
  { cat: 'Restaurant',           re: /\b(restaurant|cafe|caf['e9]|coffee|bistro|grill|kitchen|pizz|sushi|deli|bakery|bbq|tavern|bar & grill|steakhouse|catering|eatery|food|cuisine|brewery|brew|wine|hoagie|sandwich|tacos?|burger)\b/i },
  { cat: 'Auto',                 re: /\b(auto|automotive|car wash|tire|mechanic|collision|body shop|smog|transmission|oil change|dealership|motors|towing)\b/i },
  { cat: 'Legal',                re: /\b(law|legal|attorney|esq|paralegal|advocacy|llp|counsel)\b/i },
  { cat: 'Insurance',            re: /\b(insurance|allstate|farmers|state farm|geico|liability)\b/i },
  { cat: 'Financial Services',   re: /\b(financial|finance|bank|credit union|wealth|investment|advisor|cpa|accounting|tax|bookkeeping|audit)\b/i },
  { cat: 'Technology',           re: /\b(tech|technolog|software|it services|computer|networking|cyber|digital|cloud|ai|saas|web|app dev|consulting|systems)\b/i },
  { cat: 'Beauty',               re: /\b(salon|spa|barber|nails?|hair|lash|brow|wax|aesthet|skincare|beauty|cosmet|makeup|day spa|med spa)\b/i },
  { cat: 'Fitness',              re: /\b(fitness|gym|yoga|pilates|crossfit|martial arts|karate|dance|cycling|cycle bar|barre|training|trainer|cryo)\b/i },
  { cat: 'Education',            re: /\b(school|academy|tutor|preschool|montessori|kindergarten|college|university|learning|education|kumon|sylvan)\b/i },
  { cat: 'Retail',               re: /\b(boutique|store|shop|retail|gallery|jewelry|jeweler|florist|gifts?|apparel|fashion|grocery|market|pharmacy|cigars?)\b/i },
  { cat: 'Hospitality',          re: /\b(hotel|inn|suites|marriott|hilton|hyatt|motel|lodge|resort|airbnb)\b/i },
  { cat: 'Home Services',        re: /\b(plumb|electric|hvac|heating|cooling|roofing|landscap|garden|cleaning|janitor|pest|handyman|construction|contractor|paint|carpet|window|solar|locksmith|moving|movers)\b/i },
  { cat: 'Marketing & Media',    re: /\b(marketing|advert|media|production|video|film|photograph|design|branding|pr |public relations|seo|social media|agency|studio|creative|broadcast|radio|tv|print)\b/i },
  { cat: 'Nonprofit',            re: /\b(foundation|nonprofit|non-profit|charity|community|chamber|rotary|kiwanis|lions club|church|synagogue|temple|ministry|outreach)\b/i },
  { cat: 'Events',               re: /\b(events?|wedding|caterer|catering|venue|dj|entertainment|party|productions?)\b/i },
  { cat: 'Recreation',           re: /\b(country club|golf|tennis|bowling|recreation|rec center|aquatic|swim)\b/i },
  { cat: 'Family & Kids',        re: /\b(kids?|children|child care|daycare|nanny|maternity|baby|family|parent|tutoring)\b/i },
  { cat: 'Travel',               re: /\b(travel|tours?|cruise|airlines?|trips?)\b/i },
  { cat: 'Pet Services',         re: /\b(pet|dog|cat|grooming|kennel|vet)\b/i },
  { cat: 'Professional Services',re: /\b(consulting|advisory|professional|services|llc|inc\b|corp|enterprises|group|associates|partners|solutions)\b/i },
];

function classifyCompany(name) {
  const s = String(name || '').toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(s)) return rule.cat;
  }
  return 'Business Services';
}

// ---------------------------------------------------------------------------
// Load & merge
// ---------------------------------------------------------------------------
function loadCurated() {
  const file = path.join(DATA_DIR, 'members.json');
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  return arr.map(m => ({
    ...m,
    chamberMember: true,
    tier: m.tier || 'member',
    neighborhood: m.neighborhood || 'West Valley',
    logo: m.logo || logoLetter(m.name),
    featured: !!m.featured,
    source: 'curated',
  }));
}

function loadHubspotMembers() {
  const file = path.join(RAW_DIR, 'wvwccc_members.csv');
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(text);
  return rows.map(r => {
    const name = cleanString(r['Company']);
    if (!name) return null;
    const first = cleanString(r['First Name']);
    const last = cleanString(r['Last Name']);
    const email = cleanString(r['Email']);
    const phone = cleanPhone(r['Phone Number']);
    const id = slugify(name);
    if (!id) return null;
    return {
      id,
      name,
      category: classifyCompany(name),
      tier: 'member',
      neighborhood: 'West Valley',
      contactName: [first, last].filter(Boolean).join(' '),
      email,
      phone,
      logo: logoLetter(name),
      chamberMember: true,
      source: 'hubspot',
    };
  }).filter(Boolean);
}

function loadCityloopFile(filename, category) {
  const file = path.join(RAW_DIR, 'cityloop', 'data_files', filename);
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(text);
  return rows.map(r => {
    const name = cleanString(r['business_name'] || r['institution_name']);
    if (!name) return null;
    const id = slugify(name);
    if (!id) return null;

    const featuresRaw = cleanString(r['features'] || r['amenities'] || r['services'] || r['programs']);
    const features = featuresRaw
      ? featuresRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const ratingNum = parseFloat(r['rating']);
    const reviewNum = parseInt(String(r['review_count'] || '').replace(/[^0-9]/g, ''), 10);

    return {
      id,
      name,
      category,
      subcategory: cleanString(r['subcategory'] || r['cuisine_type'] || r['type']),
      tier: 'community',
      neighborhood: cleanString(r['neighborhood']) || 'San Fernando Valley',
      address: cleanString(r['address']),
      phone: cleanPhone(r['phone']),
      website: cleanWebsite(r['website']),
      rating: Number.isFinite(ratingNum) ? ratingNum : null,
      reviewCount: Number.isFinite(reviewNum) ? reviewNum : null,
      priceRange: cleanString(r['price_range']),
      hours: cleanString(r['hours']),
      features,
      specialties: cleanString(r['specialties']),
      logo: logoLetter(name),
      chamberMember: false,
      source: 'cityloop',
    };
  }).filter(Boolean);
}

function loadCityloop() {
  return [
    ...loadCityloopFile('SFV_Restaurants_Directory.csv', 'Restaurant'),
    ...loadCityloopFile('SFV_Beauty_Personal_Care_Directory.csv', 'Beauty'),
    ...loadCityloopFile('SFV_Education_Services_Directory.csv', 'Education'),
    ...loadCityloopFile('SFV_Fitness_Wellness_Directory.csv', 'Fitness'),
  ];
}

// Fuzzy chamber-member match for community entries: lowercase, strip
// non-alphanumerics, then substring-compare names and websites.
function fuzzyKey(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function crossCheckChamberMembership(communityEntries, chamberEntries) {
  const chamberNameKeys = new Set();
  const chamberSiteKeys = new Set();
  for (const c of chamberEntries) {
    const k = fuzzyKey(c.name);
    if (k.length >= 4) chamberNameKeys.add(k);
    if (c.website) {
      const dom = String(c.website).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      if (dom) chamberSiteKeys.add(fuzzyKey(dom.split('.')[0]));
    }
  }
  for (const e of communityEntries) {
    const nameKey = fuzzyKey(e.name);
    let hit = false;
    for (const k of chamberNameKeys) {
      if (k.length >= 5 && (nameKey.includes(k) || k.includes(nameKey))) { hit = true; break; }
    }
    if (!hit && e.website) {
      const dom = String(e.website).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      const siteKey = fuzzyKey(dom.split('.')[0]);
      if (siteKey.length >= 4 && chamberSiteKeys.has(siteKey)) hit = true;
    }
    if (hit) {
      e.chamberMember = true;
      e.tier = 'member';
    }
  }
}

// ---------------------------------------------------------------------------
// Merge with conflict resolution: chamber-member wins.
// Tier precedence (curated > hubspot member > community).
// ---------------------------------------------------------------------------
const TIER_RANK = {
  platinum: 0, gold: 1, silver: 2, bronze: 3,
  supporter: 4, friend: 4, member: 5, community: 6,
};
function tierRank(t) { return TIER_RANK[t] != null ? TIER_RANK[t] : 99; }

function mergeEntries(a, b) {
  // Pick the one with the better tier as the base
  const base = tierRank(a.tier) <= tierRank(b.tier) ? a : b;
  const other = base === a ? b : a;
  const merged = { ...other, ...base };
  // Always preserve chamberMember if either says true
  merged.chamberMember = !!(a.chamberMember || b.chamberMember);
  // Merge features/tags arrays
  const fA = Array.isArray(a.features) ? a.features : [];
  const fB = Array.isArray(b.features) ? b.features : [];
  if (fA.length || fB.length) merged.features = Array.from(new Set([...fA, ...fB]));
  const tA = Array.isArray(a.tags) ? a.tags : [];
  const tB = Array.isArray(b.tags) ? b.tags : [];
  if (tA.length || tB.length) merged.tags = Array.from(new Set([...tA, ...tB]));
  // Prefer the non-empty value for each field
  for (const k of ['address', 'phone', 'website', 'email', 'tagline', 'subcategory', 'specialties', 'hours', 'priceRange']) {
    merged[k] = base[k] || other[k] || merged[k] || '';
    if (!merged[k]) delete merged[k];
  }
  if (a.rating || b.rating) merged.rating = a.rating || b.rating;
  if (a.reviewCount || b.reviewCount) merged.reviewCount = a.reviewCount || b.reviewCount;
  return merged;
}

function dedupe(entries) {
  const map = new Map();
  for (const e of entries) {
    if (!e.id) continue;
    if (map.has(e.id)) {
      map.set(e.id, mergeEntries(map.get(e.id), e));
    } else {
      map.set(e.id, e);
    }
  }
  return [...map.values()];
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
function buildStats(entries) {
  const byCategory = {};
  const byNeighborhood = {};
  let chamber = 0, community = 0;
  for (const e of entries) {
    if (e.chamberMember) chamber++; else community++;
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    byNeighborhood[e.neighborhood] = (byNeighborhood[e.neighborhood] || 0) + 1;
  }
  // Sort objects deterministically by count desc then name
  const sortObj = (o) => Object.fromEntries(
    Object.entries(o).sort(([ka, va], [kb, vb]) => (vb - va) || ka.localeCompare(kb))
  );
  return {
    total: entries.length,
    byChamberMember: { members: chamber, community },
    byCategory: sortObj(byCategory),
    byNeighborhood: sortObj(byNeighborhood),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log('[build-directory] loading sources...');

  const curated = loadCurated();
  const hubspot = loadHubspotMembers();
  const cityloop = loadCityloop();

  console.log(`  curated:  ${curated.length}`);
  console.log(`  hubspot:  ${hubspot.length}`);
  console.log(`  cityloop: ${cityloop.length}`);

  // Combine chamber sources (curated wins on id collisions because curated
  // tier is better than 'member')
  const chamberEntries = [...curated, ...hubspot];

  // Cross-check community entries against chamber members
  crossCheckChamberMembership(cityloop, chamberEntries);

  // Combine everything and dedupe
  const all = dedupe([...chamberEntries, ...cityloop]);

  // Deterministic sort: chamberMember first, then by tier rank, then name
  all.sort((a, b) => {
    if (!!b.chamberMember - !!a.chamberMember) return !!b.chamberMember - !!a.chamberMember ? 1 : -1;
    const r = tierRank(a.tier) - tierRank(b.tier);
    if (r) return r;
    return String(a.name).localeCompare(String(b.name));
  });

  const stats = buildStats(all);

  fs.writeFileSync(
    path.join(DATA_DIR, 'directory.json'),
    JSON.stringify(all, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(DATA_DIR, 'directory-stats.json'),
    JSON.stringify(stats, null, 2) + '\n',
    'utf8'
  );

  console.log('\n[build-directory] done.');
  console.log(`  total entries:   ${stats.total}`);
  console.log(`  chamber members: ${stats.byChamberMember.members}`);
  console.log(`  community:       ${stats.byChamberMember.community}`);
  console.log('  by category:');
  for (const [k, v] of Object.entries(stats.byCategory)) {
    console.log(`    ${k.padEnd(24)} ${v}`);
  }
  console.log('  by neighborhood (top 10):');
  Object.entries(stats.byNeighborhood).slice(0, 10).forEach(([k, v]) => {
    console.log(`    ${k.padEnd(24)} ${v}`);
  });
}

main();
