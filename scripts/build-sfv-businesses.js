#!/usr/bin/env node
/**
 * build-sfv-businesses.js — Filter the LA city active-businesses dataset
 * down to the West Valley service area and write data/sfv-businesses.json.
 *
 * Source CSV: raw/818guide/active_sfv_businesses.csv
 * (Originally an XLSX from the 818Guide project — converted via xlsx-cli.)
 *
 * Output is searched by the CityLoop guide + AI Concierge fallback,
 * separate from the chamber directory so paying members aren't diluted.
 *
 * Run:  node scripts/build-sfv-businesses.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'raw', '818guide', 'active_sfv_businesses.csv');
const OUT = path.join(ROOT, 'data', 'sfv-businesses.json');

// West Valley zip codes — chamber's primary service area + adjacent
const WV_ZIPS = new Set([
  '91364', // Woodland Hills
  '91367', // Woodland Hills / Warner Center
  '91335', // Reseda
  '91356', // Tarzana
  '91303', // Canoga Park
  '91304', // Canoga Park / West Hills
  '91306', // Winnetka
  '91307', // West Hills
  '91316', // Encino
  '91436', // Encino south
  '91361', // Westlake Village
  '91311', // Chatsworth (edge)
  '91326', // Porter Ranch (edge)
  '91331', // Pacoima (edge)
  '91343', // North Hills (edge)
  '91344', // Granada Hills (edge)
  '91345', // Mission Hills (edge)
  '91352', // Sun Valley (edge)
  '91504', // Burbank (edge)
  '91604', // Studio City (south edge)
  '91423', // Sherman Oaks
  '91403', // Sherman Oaks
  '91401', // Van Nuys (east edge)
  '91402', '91405', '91406', '91411', '91423' // Van Nuys / Sherman Oaks neighborhood band
]);

const CITY_TO_NEIGHBORHOOD = {
  'WOODLAND HILLS': 'Woodland Hills',
  'TARZANA': 'Tarzana',
  'RESEDA': 'Reseda',
  'CANOGA PARK': 'Canoga Park',
  'WEST HILLS': 'West Hills',
  'WINNETKA': 'Winnetka',
  'ENCINO': 'Encino',
  'WARNER CENTER': 'Warner Center',
  'SHERMAN OAKS': 'Sherman Oaks',
  'NORTHRIDGE': 'Northridge',
  'CHATSWORTH': 'Chatsworth',
  'GRANADA HILLS': 'Granada Hills',
  'PORTER RANCH': 'Porter Ranch',
  'STUDIO CITY': 'Studio City',
  'VAN NUYS': 'Van Nuys'
};

// NAICS prefix → human category
const NAICS_CATEGORIES = [
  ['11', 'Agriculture'],   ['21', 'Mining'],            ['22', 'Utilities'],
  ['23', 'Construction'],  ['31', 'Manufacturing'],     ['32', 'Manufacturing'], ['33', 'Manufacturing'],
  ['42', 'Wholesale'],     ['44', 'Retail'],            ['45', 'Retail'],
  ['48', 'Transportation'],['49', 'Transportation'],
  ['51', 'Information / Tech'], ['52', 'Financial Services'], ['53', 'Real Estate'],
  ['54', 'Professional Services'], ['55', 'Management'], ['56', 'Business Services'],
  ['61', 'Education'],     ['62', 'Healthcare'],
  ['71', 'Arts & Entertainment'], ['72', 'Restaurant / Hospitality'],
  ['81', 'Personal Services'], ['92', 'Public Administration']
];
function naicsToCategory(code) {
  if (!code) return 'Other';
  const s = String(code);
  for (const [prefix, cat] of NAICS_CATEGORIES) {
    if (s.startsWith(prefix)) return cat;
  }
  return 'Other';
}

// Tiny CSV parser (handles quoted fields with commas)
function parseCSVLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') inQ = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}
function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
function titleCase(s) {
  return String(s).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

// Find the header row — file starts with a #-comment line.
let headerIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (/LOCATION ACCOUNT/i.test(lines[i])) { headerIdx = i; break; }
}
const headers = parseCSVLine(lines[headerIdx]).map(h => h.trim().replace(/^﻿/, ''));
const idx = name => headers.indexOf(name);
const COL_ACCT = idx('LOCATION ACCOUNT #');
const COL_NAME = idx('BUSINESS NAME');
const COL_DBA = idx('DBA NAME');
const COL_ADDR = idx('STREET ADDRESS');
const COL_CITY = idx('CITY');
const COL_ZIP = idx('ZIP CODE');
const COL_NAICS = idx('NAICS');
const COL_NAICS_DESC = idx('PRIMARY NAICS DESCRIPTION');
const COL_START = idx('LOCATION START DATE');
const COL_END = idx('LOCATION END DATE');

const seen = new Set();
const out = [];

for (let i = headerIdx + 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const f = parseCSVLine(line);

  const rawZip = (f[COL_ZIP] || '').trim();
  const zip5 = rawZip.split('-')[0];
  if (!WV_ZIPS.has(zip5)) continue;

  const endDate = (f[COL_END] || '').trim();
  if (endDate) continue; // closed/inactive

  const businessName = (f[COL_DBA] || f[COL_NAME] || '').trim();
  if (!businessName) continue;

  const display = titleCase(businessName);
  const id = slug(display + '-' + zip5);
  if (seen.has(id)) continue;
  seen.add(id);

  const cityRaw = (f[COL_CITY] || '').trim().toUpperCase();
  const neighborhood = CITY_TO_NEIGHBORHOOD[cityRaw] || titleCase(cityRaw) || 'West Valley';

  out.push({
    id,
    name: display,
    legalName: titleCase((f[COL_NAME] || '').trim()),
    address: titleCase((f[COL_ADDR] || '').trim()),
    neighborhood,
    zip: zip5,
    category: naicsToCategory(f[COL_NAICS]),
    naics: (f[COL_NAICS] || '').trim(),
    naicsDescription: (f[COL_NAICS_DESC] || '').trim(),
    startDate: (f[COL_START] || '').trim(),
    chamberMember: false,
    tier: 'community',
    source: 'LA City Active Business License Dataset (818Guide)'
  });
}

// Sort: alphabetical
out.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

// Stats
const byNeighborhood = out.reduce((m, b) => (m[b.neighborhood] = (m[b.neighborhood] || 0) + 1, m), {});
const byCategory = out.reduce((m, b) => (m[b.category] = (m[b.category] || 0) + 1, m), {});
console.log(`✓ data/sfv-businesses.json — ${out.length} active businesses`);
console.log('\nBy neighborhood:');
Object.entries(byNeighborhood).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
console.log('\nTop categories:');
Object.entries(byCategory).sort((a,b) => b[1]-a[1]).slice(0,10).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
