/* ============================================================
   WVWCCC — Shared header & footer partials
   Pages call window.ChamberPartials.mount({ active, depth, lang })
   depth = 0 root, 1 subdir (e.g. /members/), 2 nested (e.g. /es/blog/)
   lang = 'en' (default), 'es', 'ru', 'hy', 'zh'
   ============================================================ */

window.ChamberPartials = (function () {
  function p(depth, path) { return ('../'.repeat(depth)) + path; }

  // i18n strings — extend as we ship language versions
  var I18N = {
    en: {
      since: 'Since 1930',
      tagline: 'Serving Tarzana · Woodland Hills · Reseda · Warner Center',
      memberLogin: 'Member Login', staff: 'Staff', contact: 'Contact',
      home: 'Home', theChamber: 'The Chamber', ourCommunity: 'Our Community',
      gratefulHearts: 'Grateful Hearts', events: 'Events', chamberProfiles: 'Chamber Profiles',
      joinNow: 'Join Now', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: 'Dining Guide',
      donate: 'Donate', directory: 'Directory', news: 'News', calendar: 'Calendar',
      // Mega-menu
      social: 'Social', searchMembers: 'Search Members', communityForum: 'Community Forum',
      gallery: 'Gallery', jobBoard: 'Job Board', communityChoiceAwards: 'Community Choice Awards',
      adoptASchool: 'Adopt-a-School', connectionCircles: 'Connection Circles',
      youngProfessionals: 'Young Professionals Network',
      membership: 'Membership', benefits: 'Benefits of Membership',
      memberDeals: 'Member-to-Member Deals', newMembers: 'New Members',
      renewing: 'Renewing Members', advertising: 'Advertising Opportunities',
      committees: 'Committees',
      aboutUs: 'About Us', boardLetter: 'Letter From the Board President',
      ceoLetter: 'Letter From the CEO', boardOfDirectors: 'Board of Directors',
      chamberStaff: 'Chamber Staff', wellnessNetwork: 'Wellness Resource Network',
      ambassadors: 'Ambassadors', leaders: 'Leaders', partnerships: 'Partnerships',
      history: 'History', demographics: 'Demographics',
      woodlandHills: 'Woodland Hills', reseda: 'Reseda', tarzana: 'Tarzana',
      warnerCenter: 'Warner Center', westValley: 'West Valley',
      cbf: 'Community Benefit Foundation',
      resources: 'Resources', dineSFV: 'Dine SFV',
      communityResources: 'Community Resources', visitorCenter: 'Visitor Center',
      attractions: 'Attractions', hotels: 'Hotels & Motels', schools: 'Schools',
      utilities: 'Utilities', seniorCitizens: 'Senior Citizens', banks: 'Banks',
      importantPhones: 'Important Phone Numbers', links: 'Useful Links',
      // Footer
      members: 'Members', resourcesFooter: 'Resources', engage: 'Engage', about: 'About',
      footerTag: 'Connecting the businesses and residents of Tarzana, Woodland Hills, Reseda, and the Warner Center for nearly a century.',
      copyright: '© 2026 West Valley ~ Warner Center Chamber of Commerce. All rights reserved.',
      rebuiltBy: 'Site rebuilt by',
      // Languages
      languages: 'Languages',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      // Concierge
      askConcierge: 'Ask the Chamber Concierge'
    },
    es: { /* populated by language script — see /es/ pages */ },
    ru: {}, hy: {}, zh: {}
  };

  function t(lang, key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  function logoBlock(depth, light) {
    return `
      <a href="${p(depth, 'index.html')}" class="brand">
        <img src="${p(depth, 'images/wvwccc-logo-2026.png')}" alt="West Valley Warner Center Chamber of Commerce" class="brand__logo" width="64" height="64" loading="eager">
        <div class="brand__text">
          <div class="brand__name"${light ? ' style="color:#fff;"' : ''}>West Valley · Warner Center</div>
          <div class="brand__sub">Chamber of Commerce · Since 1930</div>
        </div>
      </a>`;
  }

  function header(active, depth, lang) {
    lang = lang || 'en';
    var L = function(k) { return t(lang, k); };
    return `
<header class="site-header">
  <div class="site-header__top">
    <div class="container">
      <div class="site-header__top-meta">
        <span>📞 (818) 347-4737</span>
        <span>📍 ${L('tagline')}</span>
        <span>🕒 ${L('since')}</span>
      </div>
      <div class="site-header__top-actions">
        <div class="lang-switcher">
          <button class="lang-switcher__btn" aria-haspopup="true" aria-expanded="false">🌐 ${lang === 'es' ? 'ES' : lang === 'ru' ? 'RU' : lang === 'hy' ? 'HY' : lang === 'zh' ? 'ZH' : 'EN'} ▾</button>
          <div class="lang-switcher__menu">
            <a href="${p(depth, 'index.html')}">${L('english')}</a>
            <a href="${p(depth, 'es/index.html')}">${L('spanish')}</a>
            <a href="${p(depth, 'ru/index.html')}">${L('russian')}</a>
            <a href="${p(depth, 'hy/index.html')}">${L('armenian')}</a>
            <a href="${p(depth, 'zh/index.html')}">${L('chinese')}</a>
          </div>
        </div>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'auth/member-login.html')}">${L('memberLogin')}</a>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'auth/staff-login.html')}">${L('staff')}</a>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'contact.html')}">${L('contact')}</a>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="site-header__main">
      ${logoBlock(depth, false)}
      <nav class="nav" aria-label="Main">
        <a href="${p(depth, 'index.html')}" ${active==='home'?'class="active"':''}>${L('home')}</a>

        <div class="nav-item nav-item--has-mega ${active==='chamber'?'active':''}">
          <a href="${p(depth, 'about.html')}">${L('theChamber')} ▾</a>
          <div class="mega-menu">
            <div class="mega-menu__col">
              <h4>${L('social')}</h4>
              <a href="${p(depth, 'members/directory.html')}">${L('searchMembers')}</a>
              <a href="${p(depth, 'profiles/index.html')}">${L('chamberProfiles')}</a>
              <a href="${p(depth, 'community/forum.html')}">${L('communityForum')}</a>
              <a href="${p(depth, 'community/gallery.html')}">${L('gallery')}</a>
              <a href="${p(depth, 'community/jobs.html')}">${L('jobBoard')}</a>
              <a href="${p(depth, 'community/awards.html')}">${L('communityChoiceAwards')}</a>
              <a href="${p(depth, 'community/adopt-a-school.html')}">${L('adoptASchool')}</a>
              <a href="${p(depth, 'community/connection-circles.html')}">${L('connectionCircles')}</a>
              <a href="${p(depth, 'community/young-professionals.html')}">${L('youngProfessionals')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('membership')}</h4>
              <a href="${p(depth, 'members/directory.html')}">${L('directory')}</a>
              <a href="${p(depth, 'join.html')}">${L('joinNow')}</a>
              <a href="${p(depth, 'benefits.html')}">${L('benefits')}</a>
              <a href="${p(depth, 'member-deals.html')}">${L('memberDeals')}</a>
              <a href="${p(depth, 'members/new.html')}">${L('newMembers')}</a>
              <a href="${p(depth, 'members/renewing.html')}">${L('renewing')}</a>
              <a href="${p(depth, 'advertise.html')}">${L('advertising')}</a>
              <a href="${p(depth, 'committees.html')}">${L('committees')}</a>
              <a href="${p(depth, 'referral.html')}">Referral Program</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('aboutUs')}</h4>
              <a href="${p(depth, 'about.html')}">${L('aboutUs')}</a>
              <a href="${p(depth, 'about/board-letter.html')}">${L('boardLetter')}</a>
              <a href="${p(depth, 'about/ceo-letter.html')}">${L('ceoLetter')}</a>
              <a href="${p(depth, 'about/board.html')}">${L('boardOfDirectors')}</a>
              <a href="${p(depth, 'about/staff.html')}">${L('chamberStaff')}</a>
              <a href="${p(depth, 'about/wellness-network.html')}">${L('wellnessNetwork')}</a>
              <a href="${p(depth, 'about/ambassadors.html')}">${L('ambassadors')}</a>
              <a href="${p(depth, 'about/leaders.html')}">${L('leaders')}</a>
              <a href="${p(depth, 'about/partnerships.html')}">${L('partnerships')}</a>
            </div>
          </div>
        </div>

        <div class="nav-item nav-item--has-mega ${active==='community'?'active':''}">
          <a href="${p(depth, 'community/index.html')}">${L('ourCommunity')} ▾</a>
          <div class="mega-menu">
            <div class="mega-menu__col">
              <h4>${L('history')}</h4>
              <a href="${p(depth, 'community/history.html')}">${L('history')}</a>
              <a href="${p(depth, 'community/demographics.html')}">${L('demographics')}</a>
              <a href="${p(depth, 'community/district-3.html')}">District 3</a>
              <a href="${p(depth, 'community/woodland-hills.html')}">${L('woodlandHills')}</a>
              <a href="${p(depth, 'community/reseda.html')}">${L('reseda')}</a>
              <a href="${p(depth, 'community/tarzana.html')}">${L('tarzana')}</a>
              <a href="${p(depth, 'community/warner-center.html')}">${L('warnerCenter')}</a>
              <a href="${p(depth, 'community/west-valley.html')}">${L('westValley')}</a>
              <a href="${p(depth, 'community/foundation.html')}">${L('cbf')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('resources')}</h4>
              <a href="${p(depth, 'guides/index.html')}">All Resource Guides</a>
              <a href="${p(depth, 'guides/restaurant.html')}">${L('dineSFV')} / Dining</a>
              <a href="${p(depth, 'guides/cityloop.html')}">CityLoop Local Resource Guide</a>
              <a href="${p(depth, 'community/visitor-center.html')}">${L('visitorCenter')}</a>
              <a href="${p(depth, 'community/attractions.html')}">${L('attractions')}</a>
              <a href="${p(depth, 'community/hotels.html')}">${L('hotels')}</a>
              <a href="${p(depth, 'community/schools.html')}">${L('schools')}</a>
              <a href="${p(depth, 'community/seniors.html')}">${L('seniorCitizens')}</a>
              <a href="${p(depth, 'community/important-phones.html')}">${L('importantPhones')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('gratefulHearts')}</h4>
              <a href="${p(depth, 'grateful-hearts.html')}">Grateful Hearts Program</a>
              <a href="${p(depth, 'donate.html')}">${L('donate')}</a>
              <a href="${p(depth, 'sponsor.html')}">Sponsor a Cause</a>
              <a href="${p(depth, 'community/foundation.html')}">Community Benefit Foundation</a>
            </div>
          </div>
        </div>

        <a href="${p(depth, 'events/index.html')}" ${active==='events'?'class="active"':''}>${L('events')}</a>

        <div class="nav-item nav-item--has-dropdown ${active==='guides'?'active':''}">
          <a href="${p(depth, 'guides/index.html')}">Guides ▾</a>
          <div class="dropdown">
            <a href="${p(depth, 'guides/index.html')}">All Guides</a>
            <a href="${p(depth, 'guides/restaurant.html')}">🍽️ Restaurant / Dining</a>
            <a href="${p(depth, 'guides/parent-resource.html')}">👨‍👩‍👧 Parent Resource</a>
            <a href="${p(depth, 'guides/spa.html')}">💆 Spa & Wellness</a>
            <a href="${p(depth, 'guides/home-maintenance.html')}">🔧 Home Maintenance</a>
            <a href="${p(depth, 'guides/business-solutions.html')}">💼 Business Solutions</a>
            <a href="${p(depth, 'guides/cityloop.html')}">🏙️ CityLoop (Local)</a>
            <a href="${p(depth, 'guides/education.html')}">🎓 Education</a>
            <a href="${p(depth, 'guides/family-activities.html')}">🎪 Family Activities</a>
            <a href="${p(depth, 'guides/professional-services.html')}">⚖️ Professional Services</a>
          </div>
        </div>

        <a href="${p(depth, 'blog/index.html')}" ${active==='blog'?'class="active"':''}>${L('valleyBizBuzz')}</a>
        <a href="${p(depth, 'donate.html')}" ${active==='donate'?'class="active"':''}>${L('donate')}</a>
        <a href="${p(depth, 'join.html')}" class="btn btn--gold btn--sm nav-cta">${L('joinNow')}</a>
      </nav>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
</header>`;
  }

  function footer(depth, lang) {
    lang = lang || 'en';
    var L = function(k) { return t(lang, k); };
    return `
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        ${logoBlock(depth, true)}
        <p class="mt-4">${L('footerTag')}</p>
        <div class="social-links mt-4">
          <a href="https://facebook.com/woodlandhillscc" aria-label="Facebook" rel="noopener">f</a>
          <a href="https://instagram.com/woodlandhillscc" aria-label="Instagram" rel="noopener">ig</a>
          <a href="https://twitter.com/woodlandhillscc" aria-label="X / Twitter" rel="noopener">𝕏</a>
          <a href="https://linkedin.com/company/west-valley-warner-center-chamber-of-commerce" aria-label="LinkedIn" rel="noopener">in</a>
          <a href="https://youtube.com/@woodlandhillscc" aria-label="YouTube" rel="noopener">▶</a>
        </div>
      </div>
      <div>
        <h4>${L('members')}</h4>
        <ul>
          <li><a href="${p(depth, 'join.html')}">${L('joinNow')}</a></li>
          <li><a href="${p(depth, 'members/directory.html')}">${L('directory')}</a></li>
          <li><a href="${p(depth, 'benefits.html')}">${L('benefits')}</a></li>
          <li><a href="${p(depth, 'member-deals.html')}">${L('memberDeals')}</a></li>
          <li><a href="${p(depth, 'referral.html')}">Referral Program</a></li>
          <li><a href="${p(depth, 'auth/member-login.html')}">${L('memberLogin')}</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('resourcesFooter')}</h4>
        <ul>
          <li><a href="${p(depth, 'guides/index.html')}">All Guides</a></li>
          <li><a href="${p(depth, 'guides/restaurant.html')}">Dining Guide</a></li>
          <li><a href="${p(depth, 'guides/cityloop.html')}">CityLoop</a></li>
          <li><a href="${p(depth, 'guides/parent-resource.html')}">Parent Guide</a></li>
          <li><a href="${p(depth, 'guides/home-maintenance.html')}">Home Services</a></li>
          <li><a href="${p(depth, 'ai-concierge.html')}">AI Concierge</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('engage')}</h4>
        <ul>
          <li><a href="${p(depth, 'events/index.html')}">${L('events')}</a></li>
          <li><a href="${p(depth, 'sponsor.html')}">Sponsor</a></li>
          <li><a href="${p(depth, 'advertise.html')}">Advertise</a></li>
          <li><a href="${p(depth, 'donate.html')}">${L('donate')}</a></li>
          <li><a href="${p(depth, 'grateful-hearts.html')}">Grateful Hearts</a></li>
          <li><a href="${p(depth, 'blog/guest-post.html')}">Guest Post</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('about')}</h4>
        <ul>
          <li><a href="${p(depth, 'about.html')}">The Chamber</a></li>
          <li><a href="${p(depth, 'about/board.html')}">Board of Directors</a></li>
          <li><a href="${p(depth, 'about/staff.html')}">Chamber Staff</a></li>
          <li><a href="${p(depth, 'community/index.html')}">Community</a></li>
          <li><a href="${p(depth, 'contact.html')}">${L('contact')}</a></li>
          <li><a href="${p(depth, 'accessibility.html')}">Accessibility</a></li>
          <li><a href="${p(depth, 'privacy.html')}">Privacy</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('languages')}</h4>
        <ul>
          <li><a href="${p(depth, 'index.html')}" hreflang="en">${L('english')}</a></li>
          <li><a href="${p(depth, 'es/index.html')}" hreflang="es">${L('spanish')}</a></li>
          <li><a href="${p(depth, 'ru/index.html')}" hreflang="ru">${L('russian')}</a></li>
          <li><a href="${p(depth, 'hy/index.html')}" hreflang="hy">${L('armenian')}</a></li>
          <li><a href="${p(depth, 'zh/index.html')}" hreflang="zh">${L('chinese')}</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <div>${L('copyright')}</div>
      <div>${L('rebuiltBy')} <a href="https://heedbusinesssolutions.com" style="color:var(--gold);">Heed Business Solutions</a></div>
    </div>
  </div>
</footer>`;
  }

  function mount({ active = '', depth = 0, lang = 'en' } = {}) {
    const h = document.querySelector('[data-partial="header"]');
    const f = document.querySelector('[data-partial="footer"]');
    if (h) h.outerHTML = header(active, depth, lang);
    if (f) f.outerHTML = footer(depth, lang);

    // Close mega menus on outside click / esc
    document.addEventListener('click', function(e){
      if(!e.target.closest('.nav-item--has-mega') && !e.target.closest('.nav-item--has-dropdown') && !e.target.closest('.lang-switcher')){
        document.querySelectorAll('.nav-item--has-mega.open, .nav-item--has-dropdown.open, .lang-switcher.open').forEach(el => el.classList.remove('open'));
      }
    });

    // Mobile menu toggle
    const tog = document.querySelector('.menu-toggle');
    if(tog){
      tog.addEventListener('click', function(){
        document.querySelector('.nav').classList.toggle('open');
      });
    }
  }

  return { mount, header, footer };
})();
