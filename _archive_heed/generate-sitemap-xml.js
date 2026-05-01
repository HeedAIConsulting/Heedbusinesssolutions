#!/usr/bin/env node
/**
 * Generate sitemap.xml including all area pages
 * Run: node generate-sitemap-xml.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://heedbusinesssolutions.com';
const today = new Date().toISOString().split('T')[0];

// Core pages
const corePages = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/about.html', priority: '0.8', freq: 'monthly' },
  { loc: '/services.html', priority: '0.8', freq: 'monthly' },
  { loc: '/portfolio.html', priority: '0.8', freq: 'monthly' },
  { loc: '/blog.html', priority: '0.8', freq: 'weekly' },
  { loc: '/resources.html', priority: '0.8', freq: 'monthly' },
  { loc: '/geo-audit.html', priority: '0.9', freq: 'weekly' },
  { loc: '/contact.html', priority: '0.8', freq: 'monthly' },
  { loc: '/sitemap-page.html', priority: '0.5', freq: 'monthly' },
  { loc: '/privacy.html', priority: '0.3', freq: 'yearly' },
  { loc: '/terms.html', priority: '0.3', freq: 'yearly' },
  { loc: '/accessibility.html', priority: '0.3', freq: 'yearly' },
];

// Service pages
const servicePages = [
  '/services/web-design.html',
  '/services/marketing.html',
  '/services/ppc-ads.html',
  '/services/social-media.html',
  '/services/sales-bd.html',
  '/services/technology.html',
  '/services/business-sprints.html',
  '/services/startup-launch.html',
  '/services/digital-intelligence.html',
  '/services/ad-intelligence.html',
  '/services/brand-monitoring.html',
  '/services/competitor-research.html',
  '/services/content-intelligence.html',
  '/services/local-seo.html',
  '/services/reporting-dashboards.html',
  '/services/seo-site-audit.html',
  '/services/social-analytics.html',
];

// Area pages from generated list
const areaList = fs.readFileSync(path.join(__dirname, 'areas', '_page-list.txt'), 'utf-8')
  .split('\n').filter(Boolean);

// Blog posts
const blogDir = path.join(__dirname, 'blog');
const blogPosts = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).map(f => `/blog/${f}`)
  : [];

// Spanish pages
const esDir = path.join(__dirname, 'es');
const esPages = fs.existsSync(esDir)
  ? fs.readdirSync(esDir).filter(f => f.endsWith('.html')).map(f => `/es/${f}`)
  : [];

// Russian pages
const ruDir = path.join(__dirname, 'ru');
const ruPages = fs.existsSync(ruDir)
  ? fs.readdirSync(ruDir).filter(f => f.endsWith('.html')).map(f => `/ru/${f}`)
  : [];

// Build XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Core pages
for (const p of corePages) {
  xml += `  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority}</priority>
    <changefreq>${p.freq}</changefreq>
  </url>\n`;
}

// Service pages
for (const p of servicePages) {
  xml += `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>\n`;
}

// Area pages
for (const p of areaList) {
  xml += `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>\n`;
}

// Blog posts
for (const p of blogPosts) {
  xml += `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>\n`;
}

// Spanish pages
for (const p of esPages) {
  xml += `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>\n`;
}

// Russian pages
for (const p of ruPages) {
  xml += `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>\n`;
}

xml += `</urlset>`;

const totalUrls = corePages.length + servicePages.length + areaList.length + blogPosts.length + esPages.length + ruPages.length;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml, 'utf-8');
console.log(`sitemap.xml generated with ${totalUrls} URLs`);
console.log(`  Core: ${corePages.length}`);
console.log(`  Services: ${servicePages.length}`);
console.log(`  Area pages: ${areaList.length}`);
console.log(`  Blog posts: ${blogPosts.length}`);
console.log(`  Spanish: ${esPages.length}`);
console.log(`  Russian: ${ruPages.length}`);
