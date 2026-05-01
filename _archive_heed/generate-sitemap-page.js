#!/usr/bin/env node
/**
 * Generate the HTML sitemap page from the area pages data
 * Run: node generate-sitemap-page.js
 */
const fs = require('fs');
const path = require('path');

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'areas', '_page-list.json'), 'utf-8'));

// Group by service
const byService = {};
pages.forEach(p => {
  if (!byService[p.service]) byService[p.service] = [];
  byService[p.service].push(p);
});

const serviceIcons = {
  'Web Design': 'fa-globe',
  'SEO': 'fa-magnifying-glass-chart',
  'GEO Optimization': 'fa-robot',
  'Marketing': 'fa-bullhorn',
  'PPC Advertising': 'fa-chart-line',
  'Social Media Marketing': 'fa-share-nodes',
  'Business Consulting': 'fa-rocket',
  'AI Client Intake': 'fa-headset',
  'CRM Implementation': 'fa-database',
  'Sales Strategy': 'fa-handshake',
  'Technology Solutions': 'fa-microchip',
  'Digital Intelligence': 'fa-magnifying-glass-chart',
};

let serviceBlocks = '';
for (const [svc, items] of Object.entries(byService)) {
  const icon = serviceIcons[svc] || 'fa-briefcase';
  const cityLinks = items.map(i => `              <a href="${i.file}" style="color:var(--charcoal); text-decoration:none; padding:4px 0; font-size:0.9rem;">${i.city}</a>`).join('\n');

  serviceBlocks += `
          <details style="margin-bottom:var(--space-lg); border:1px solid var(--gray-mid); border-radius:var(--radius-md); overflow:hidden;">
            <summary style="padding:var(--space-lg); cursor:pointer; font-weight:600; color:var(--charcoal); background:var(--off-white);"><i class="fa-solid ${icon}" style="color:var(--gold); margin-right:var(--space-sm);"></i> ${svc} <span style="font-weight:400; color:var(--text-muted); font-size:0.85rem;">(${items.length} cities)</span></summary>
            <div style="padding:var(--space-md) var(--space-lg) var(--space-lg); display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:var(--space-xs);">
${cityLinks}
            </div>
          </details>`;
}

const totalPages = pages.length;
const totalServices = Object.keys(byService).length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="images/logos/image_e43fb0dc-dabb-48f3-a17a-817ce837ff65.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Complete sitemap for Heed Business Solutions. Browse ${totalPages} service area pages covering ${totalServices} services across 62 cities in Greater Los Angeles, plus all main pages, blog articles, and resources." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://heedbusinesssolutions.com/sitemap-page.html" />
  <title>Sitemap | Heed Business Solutions — ${totalPages}+ Pages Across Greater Los Angeles</title>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sitemap | Heed Business Solutions",
  "description": "Complete sitemap for Heed Business Solutions including ${totalPages} service area pages, main pages, blog articles, and resources.",
  "url": "https://heedbusinesssolutions.com/sitemap-page.html",
  "isPartOf": { "@type": "WebSite", "name": "Heed Business Solutions", "url": "https://heedbusinesssolutions.com" }
}
</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="css/styles.css" />
  <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/23411980.js"></script>
</head>
<body>
<a href="#main-content" class="skip-nav">Skip to main content</a>

  <header class="site-header" id="site-header">
    <nav class="site-nav container">
      <a href="/index.html" class="site-nav__logo" aria-label="Heed Business Solutions Home">
        <img src="images/logos/image_63845eb1-132b-4180-a8d3-2ceaebd41aa4.png" alt="Heed Business Solutions" class="site-nav__logo-img" onerror="this.style.display='none'; document.getElementById('logo-text-nav').style.display='inline';" />
        <span id="logo-text-nav" class="site-nav__logo-text" style="display:none;">Heed<span> Business Solutions</span></span>
      </a>
      <ul class="site-nav__links" id="nav-links">
        <li><a href="/index.html" class="site-nav__link">Home</a></li>
        <li><a href="/about.html" class="site-nav__link">About</a></li>
        <li class="site-nav__item--dropdown">
          <a href="#" class="site-nav__link site-nav__link--dropdown" aria-haspopup="true" aria-expanded="false"><span>Services</span> <i class="fa-solid fa-chevron-down site-nav__chevron"></i></a>
          <ul class="site-nav__dropdown" role="menu">
            <li role="none"><a href="/services/web-design.html" role="menuitem"><i class="fa-solid fa-globe"></i> Web Design</a></li>
            <li role="none"><a href="/services/marketing.html" role="menuitem"><i class="fa-solid fa-bullhorn"></i> Marketing</a></li>
            <li role="none"><a href="/services/ppc-ads.html" role="menuitem"><i class="fa-solid fa-chart-line"></i> PPC &amp; Ads</a></li>
            <li role="none"><a href="/services/social-media.html" role="menuitem"><i class="fa-solid fa-share-nodes"></i> Social Media</a></li>
            <li role="none"><a href="/services/sales-bd.html" role="menuitem"><i class="fa-solid fa-handshake"></i> Sales &amp; BD</a></li>
            <li role="none"><a href="/services/technology.html" role="menuitem"><i class="fa-solid fa-microchip"></i> Technology</a></li>
            <li role="none"><a href="/services/business-sprints.html" role="menuitem"><i class="fa-solid fa-rocket"></i> Consulting Sprints</a></li>
          </ul>
        </li>
        <li><a href="/portfolio.html" class="site-nav__link">Portfolio</a></li>
        <li><a href="/blog.html" class="site-nav__link">Blog</a></li>
        <li><a href="/contact.html" class="site-nav__link">Contact</a></li>
      </ul>
      <a href="https://calendar.app.google/G6oc9Q7uRibsczeR9" class="btn btn--gold site-nav__cta" target="_blank" rel="noopener">Book a Call</a>
      <button class="site-nav__hamburger" id="hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    </nav>
  </header>

  <main id="main-content">

    <section class="hero hero--sm">
      <div class="container hero--sm__inner">
        <p class="eyebrow reveal">Navigation</p>
        <h1 class="hero--sm__heading reveal reveal-delay-1">Sitemap</h1>
        <p class="hero--sm__lead reveal reveal-delay-2">Browse every page on Heed Business Solutions — ${totalPages} service area pages covering ${totalServices} services across 62 cities in Greater Los Angeles, plus all main pages, blog, and resources.</p>
      </div>
    </section>

    <section class="section bg-white">
      <div class="container" style="max-width:1100px;">

        <!-- Main Pages -->
        <div style="margin-bottom:var(--space-4xl);">
          <h2 style="font-size:1.4rem; color:var(--charcoal); margin-bottom:var(--space-xl); padding-bottom:var(--space-sm); border-bottom:2px solid var(--gold);"><i class="fa-solid fa-house" style="color:var(--gold); margin-right:var(--space-sm);"></i> Main Pages</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:var(--space-md);">
            <a href="/index.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Home</a>
            <a href="/about.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">About Michael Bowers</a>
            <a href="/portfolio.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Portfolio &amp; Case Studies</a>
            <a href="/blog.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Blog</a>
            <a href="/resources.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Resources</a>
            <a href="/geo-audit.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">GEO Readiness Audit</a>
            <a href="/contact.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Contact</a>
            <a href="/privacy.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Privacy Policy</a>
            <a href="/terms.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Terms of Service</a>
            <a href="/accessibility.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Accessibility</a>
          </div>
        </div>

        <!-- Services -->
        <div style="margin-bottom:var(--space-4xl);">
          <h2 style="font-size:1.4rem; color:var(--charcoal); margin-bottom:var(--space-xl); padding-bottom:var(--space-sm); border-bottom:2px solid var(--gold);"><i class="fa-solid fa-briefcase" style="color:var(--gold); margin-right:var(--space-sm);"></i> Services</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:var(--space-md);">
            <a href="/services/web-design.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Web Design &amp; Optimization</a>
            <a href="/services/marketing.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Marketing Services</a>
            <a href="/services/ppc-ads.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">PPC &amp; Ad Management</a>
            <a href="/services/social-media.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Social Media Marketing</a>
            <a href="/services/sales-bd.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Sales &amp; Business Development</a>
            <a href="/services/technology.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Technology &amp; Smart Spaces</a>
            <a href="/services/business-sprints.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Business Consulting Sprints</a>
            <a href="/services/startup-launch.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Startup Launch Program</a>
            <a href="/services/digital-intelligence.html" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Digital Intelligence &amp; SEO</a>
          </div>
        </div>

        <!-- Areas We Serve -->
        <div style="margin-bottom:var(--space-4xl);">
          <h2 style="font-size:1.4rem; color:var(--charcoal); margin-bottom:var(--space-sm); padding-bottom:var(--space-sm); border-bottom:2px solid var(--gold);"><i class="fa-solid fa-map-location-dot" style="color:var(--gold); margin-right:var(--space-sm);"></i> Areas We Serve</h2>
          <p style="color:var(--text-muted); margin-bottom:var(--space-2xl);">${totalPages} pages covering ${totalServices} services across 62 cities in Greater Los Angeles. Click any service to expand the full city list.</p>
${serviceBlocks}
        </div>

        <!-- Languages -->
        <div style="margin-bottom:var(--space-4xl);">
          <h2 style="font-size:1.4rem; color:var(--charcoal); margin-bottom:var(--space-xl); padding-bottom:var(--space-sm); border-bottom:2px solid var(--gold);"><i class="fa-solid fa-language" style="color:var(--gold); margin-right:var(--space-sm);"></i> Languages</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:var(--space-md);">
            <a href="/es/" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">Sitio en Espa&ntilde;ol</a>
            <a href="/ru/" style="color:var(--charcoal); text-decoration:none; padding:var(--space-sm) 0; border-bottom:1px solid var(--gray-light);">&#1057;&#1072;&#1081;&#1090; &#1085;&#1072; &#1088;&#1091;&#1089;&#1089;&#1082;&#1086;&#1084;</a>
          </div>
        </div>

      </div>
    </section>

    <section class="cta-section section bg-navy">
      <div class="container">
        <div class="cta-section__inner reveal">
          <h2 class="cta-section__heading">Cannot Find What You Are Looking For?</h2>
          <p class="cta-section__lead">Book a clarity call or send us a message. We respond within one business day.</p>
          <div class="cta-section__actions">
            <a href="https://calendar.app.google/G6oc9Q7uRibsczeR9" class="btn btn--gold" target="_blank" rel="noopener">Book a Clarity Call</a>
            <a href="/contact.html" class="btn btn--outline-light">Contact Us</a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <a href="/index.html" class="site-footer__logo-link"><img src="images/logos/image_f47409d4-5904-41c8-a00e-84279fcd534c.png" alt="Heed Business Solutions" class="site-footer__logo-img" /></a>
          <p class="site-footer__tagline">Win high-value clients who expect more. Built in LA.</p>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-heading">Company</h4>
          <ul class="site-footer__col-list">
            <li><a href="/about.html">About</a></li>
            <li><a href="/geo-audit.html">GEO Readiness Audit</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-heading">Contact</h4>
          <ul class="site-footer__col-list site-footer__col-list--contact">
            <li><a href="tel:3103630826"><i class="fa-solid fa-phone"></i> 310-363-0826</a></li>
            <li><a href="mailto:reachus@heedbusinesssolutions.com"><i class="fa-solid fa-envelope"></i> reachus@heedbusinesssolutions.com</a></li>
            <li><span><i class="fa-solid fa-map-pin"></i> Los Angeles, CA</span></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <p>&copy; 2025 Heed Business Solutions. All rights reserved.</p>
        <div class="site-footer__bottom-links"><a href="/privacy.html">Privacy Policy</a> <span aria-hidden="true">|</span> <a href="/terms.html">Terms</a></div>
      </div>
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'sitemap-page.html'), html, 'utf-8');
console.log(`Sitemap page generated with ${totalPages} area pages across ${totalServices} services`);
