/* ============================================================
   Chamber — Shared header & footer partials
   Pages call window.ChamberPartials.mount({ active, depth })
   depth = 0 for root pages, 1 for subdirectory pages
   ============================================================ */

window.ChamberPartials = (function () {
  function p(depth, path) { return (depth ? '../' : '') + path; }

  function header(active, depth) {
    return `
<header class="site-header">
  <div class="site-header__top">
    <div class="container">
      <div class="site-header__top-meta">
        <span>📞 (818) 347-4737</span>
        <span>📍 Tarzana · Woodland Hills · Reseda · Warner Center</span>
        <span>🕒 Est. 1930</span>
      </div>
      <div class="site-header__top-actions">
        <a href="${p(depth, 'auth/member-login.html')}">Member Login</a>
        <span style="color:rgba(255,255,255,0.3);">·</span>
        <a href="${p(depth, 'auth/staff-login.html')}">Staff</a>
        <span style="color:rgba(255,255,255,0.3);">·</span>
        <a href="${p(depth, 'contact.html')}">Contact</a>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="site-header__main">
      <a href="${p(depth, 'index.html')}" class="brand">
        <div class="brand__seal">WV</div>
        <div class="brand__text">
          <div class="brand__name">West Valley ~ Warner Center</div>
          <div class="brand__sub">Chamber of Commerce · Since 1930</div>
        </div>
      </a>
      <nav class="nav" aria-label="Main">
        <a href="${p(depth, 'index.html')}" ${active==='home'?'class="active"':''}>Home</a>
        <a href="${p(depth, 'about.html')}" ${active==='about'?'class="active"':''}>The Chamber</a>
        <a href="${p(depth, 'members/directory.html')}" ${active==='members'?'class="active"':''}>Directory</a>
        <a href="${p(depth, 'events/index.html')}" ${active==='events'?'class="active"':''}>Events</a>
        <a href="${p(depth, 'guides/index.html')}" ${active==='guides'?'class="active"':''}>Guides</a>
        <a href="${p(depth, 'community/index.html')}" ${active==='community'?'class="active"':''}>Community</a>
        <a href="${p(depth, 'blog/index.html')}" ${active==='blog'?'class="active"':''}>Blog</a>
        <a href="${p(depth, 'join.html')}" class="btn btn--gold btn--sm nav-cta">Join Now</a>
      </nav>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
</header>`;
  }

  function footer(depth) {
    return `
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <div class="brand">
          <div class="brand__seal">WV</div>
          <div class="brand__text">
            <div class="brand__name" style="color:#fff;">West Valley ~ Warner Center</div>
            <div class="brand__sub">Chamber of Commerce · Since 1930</div>
          </div>
        </div>
        <p class="mt-4">Connecting the businesses and residents of Tarzana, Woodland Hills, Reseda, and the Warner Center for nearly a century.</p>
        <div class="social-links mt-4">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="X / Twitter">𝕏</a>
          <a href="#" aria-label="LinkedIn">in</a>
        </div>
      </div>
      <div>
        <h4>Members</h4>
        <ul>
          <li><a href="${p(depth, 'join.html')}">Join Now</a></li>
          <li><a href="${p(depth, 'members/directory.html')}">Directory</a></li>
          <li><a href="${p(depth, 'benefits.html')}">Benefits</a></li>
          <li><a href="${p(depth, 'member-deals.html')}">Member Deals</a></li>
          <li><a href="${p(depth, 'auth/member-login.html')}">Member Login</a></li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="${p(depth, 'guides/index.html')}">All Guides</a></li>
          <li><a href="${p(depth, 'guides/restaurant.html')}">Restaurant Guide</a></li>
          <li><a href="${p(depth, 'guides/parent-resource.html')}">Parent Guide</a></li>
          <li><a href="${p(depth, 'guides/home-maintenance.html')}">Home Services</a></li>
          <li><a href="${p(depth, 'ai-concierge.html')}">AI Concierge</a></li>
        </ul>
      </div>
      <div>
        <h4>Engage</h4>
        <ul>
          <li><a href="${p(depth, 'events/index.html')}">Events</a></li>
          <li><a href="${p(depth, 'sponsor.html')}">Sponsor</a></li>
          <li><a href="${p(depth, 'advertise.html')}">Advertise</a></li>
          <li><a href="${p(depth, 'donate.html')}">Donate</a></li>
          <li><a href="${p(depth, 'blog/guest-post.html')}">Guest Post</a></li>
        </ul>
      </div>
      <div>
        <h4>About</h4>
        <ul>
          <li><a href="${p(depth, 'about.html')}">The Chamber</a></li>
          <li><a href="${p(depth, 'community/index.html')}">Community</a></li>
          <li><a href="${p(depth, 'contact.html')}">Contact</a></li>
          <li><a href="${p(depth, 'accessibility.html')}">Accessibility</a></li>
          <li><a href="${p(depth, 'privacy.html')}">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <div>© 2026 West Valley ~ Warner Center Chamber of Commerce. All rights reserved.</div>
      <div>Site rebuilt by <a href="https://heedbusinesssolutions.com" style="color:var(--gold);">Heed Business Solutions</a></div>
    </div>
  </div>
</footer>`;
  }

  function mount({ active = '', depth = 0 } = {}) {
    const h = document.querySelector('[data-partial="header"]');
    const f = document.querySelector('[data-partial="footer"]');
    if (h) h.outerHTML = header(active, depth);
    if (f) f.outerHTML = footer(depth);
  }

  return { mount };
})();
