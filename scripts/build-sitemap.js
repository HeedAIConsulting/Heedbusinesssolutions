#!/usr/bin/env node
/**
 * build-sitemap.js — Generate sitemap.xml + robots.txt for woodlandhillscc.net.
 * Includes hreflang xhtml:link alternates for /es/, /ru/, /hy/, /zh/.
 *
 * Run: node scripts/build-sitemap.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SITE = 'https://www.woodlandhillscc.net';
const today = new Date().toISOString().slice(0, 10);
const LANGS = ['en', 'es', 'ru', 'hy', 'zh'];

// Pages with multilingual versions — hreflang applies
const I18N_PAGES = [
  { p: '', priority: 1.0, change: 'daily' },
];

// Single-language pages
const PAGES = [
  ['', 1.0, 'daily'],
  ['about.html', 0.9, 'monthly'],
  ['contact.html', 0.7, 'yearly'],
  ['accessibility.html', 0.3, 'yearly'],
  ['privacy.html', 0.3, 'yearly'],

  // Membership funnel
  ['join.html', 0.95, 'weekly'],
  ['join-checkout.html', 0.6, 'monthly'],
  ['onboard.html', 0.85, 'weekly'],
  ['referral.html', 0.85, 'monthly'],
  ['sponsor.html', 0.85, 'monthly'],
  ['advertise.html', 0.8, 'monthly'],
  ['donate.html', 0.7, 'monthly'],
  ['loyalty.html', 0.9, 'weekly'],
  ['networking-groups.html', 0.85, 'weekly'],

  // AI Concierge
  ['ai-concierge.html', 0.9, 'weekly'],

  // Directory + members
  ['members/directory.html', 0.95, 'daily'],
  ['members/profile.html', 0.6, 'weekly'],

  // Events
  ['events/index.html', 0.9, 'daily'],
  ['events/checkout.html', 0.5, 'weekly'],

  // Guides
  ['guides/index.html', 0.9, 'weekly'],
  ['guides/restaurant.html', 0.85, 'weekly'],
  ['guides/parent-resource.html', 0.85, 'weekly'],
  ['guides/spa.html', 0.85, 'weekly'],
  ['guides/home-maintenance.html', 0.85, 'weekly'],
  ['guides/business-solutions.html', 0.85, 'weekly'],
  ['guides/cityloop.html', 0.85, 'weekly'],
  ['guides/education.html', 0.85, 'weekly'],
  ['guides/family-activities.html', 0.85, 'weekly'],
  ['guides/professional-services.html', 0.85, 'weekly'],

  // Vertical landings
  ['landing/professional-services.html', 0.8, 'monthly'],
  ['landing/spa-beauty.html', 0.8, 'monthly'],
  ['landing/education.html', 0.8, 'monthly'],
  ['landing/family-based.html', 0.8, 'monthly'],
  ['landing/activity-based.html', 0.8, 'monthly'],

  // Community
  ['community/index.html', 0.7, 'weekly'],

  // Newsletters
  ['newsletters/index.html', 0.85, 'weekly'],
  ['newsletters/2025-11-21-ai-real-world-use-cases.html', 0.5, 'yearly'],

  // Blog
  ['blog/index.html', 0.85, 'daily'],
  ['blog/guest-post.html', 0.6, 'monthly'],

  // Auth / portals
  ['auth/member-login.html', 0.4, 'yearly'],
  ['auth/staff-login.html', 0.3, 'yearly'],
  ['auth/member-portal.html', 0.5, 'monthly']
];

// Discover any blog posts that exist
function listBlogPosts() {
  const dir = path.join(ROOT, 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('post-') && f.endsWith('.html'))
    .map(f => ['blog/' + f, 0.7, 'monthly']);
}

function urlEntry(loc, priority, change, alternates) {
  let s = `  <url>\n    <loc>${SITE}/${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${change}</changefreq>\n    <priority>${priority.toFixed(2)}</priority>`;
  if (alternates) {
    LANGS.forEach(lang => {
      const altUrl = lang === 'en' ? `${SITE}/${loc}` : `${SITE}/${lang}/${loc}`;
      s += `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${altUrl}"/>`;
    });
    s += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${loc}"/>`;
  }
  s += '\n  </url>';
  return s;
}

function buildSitemap() {
  const allPages = [...PAGES, ...listBlogPosts()];
  const urls = [];

  // Multilingual root for each language
  ['', 'es/', 'ru/', 'hy/', 'zh/'].forEach(prefix => {
    urls.push(urlEntry(prefix, prefix === '' ? 1.0 : 0.9, 'daily', prefix === ''));
  });

  // Other pages (English only for now)
  allPages.forEach(([p, priority, change]) => {
    if (p === '') return; // already added above
    urls.push(urlEntry(p, priority, change));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log(`✓ sitemap.xml — ${urls.length} URLs`);

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /onboard.html
Disallow: /auth/
Disallow: /raw/
Disallow: /scripts/
Disallow: /backend/
Disallow: /_archive_heed/
Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log(`✓ robots.txt`);
}

if (require.main === module) buildSitemap();
module.exports = buildSitemap;
