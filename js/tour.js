/* ============================================================
   Chamber Tour — guided walkthrough across the entire site.
   Persistent across page navigation via sessionStorage so a step
   can say "navigate to /admin/index.html and continue".

   Trigger:
     <button data-tour-start>Take the tour</button>
       — or call window.WVTour.start()

   Skip / resume:
     window.WVTour.skip()    — stops tour, sets tour-skipped flag
     window.WVTour.reset()   — clears all state so it auto-starts again
   ============================================================ */

(function () {
  'use strict';

  // ── Steps ────────────────────────────────────────────────────
  // Each step: { page, target, title, body, position, action }
  //   page     - URL path the step lives on. If current location !== this,
  //              tour will navigate there before showing the step.
  //   target   - CSS selector for the element to highlight (or null = centered modal)
  //   title    - tooltip header
  //   body     - tooltip text (HTML allowed)
  //   position - 'top' | 'bottom' | 'left' | 'right' | 'center' (default 'bottom')
  //   action   - optional callback that runs once the step is shown (e.g. open a menu)
  var STEPS = [
    {
      page: '/',
      target: null,
      title: 'Welcome to the West Valley Chamber of Commerce',
      body: 'This is your guided tour. We\'ll walk through the public site, the member experience, the staff admin, and the AI features in about 90 seconds. You can skip or pause anytime.',
      position: 'center'
    },
    {
      page: '/',
      target: '.hero h1',
      title: 'A community engine, AI-powered',
      body: 'The chamber connects 800+ businesses across Tarzana, Woodland Hills, Reseda, and Warner Center — now backed by an AI Concierge that answers in 8 languages.',
      position: 'right'
    },
    {
      page: '/',
      target: '.lang-switcher',
      title: 'Five languages, one click',
      body: 'The whole site is available in English, Spanish, Russian, Armenian, and Chinese. The AI Concierge speaks 8 (adds Vietnamese, Japanese, Ukrainian by voice).',
      position: 'bottom'
    },
    {
      page: '/',
      target: '.hero__visual, [data-partial="concierge-inline"]',
      title: 'AI Concierge — always on',
      body: 'A chamber concierge that never sleeps. Voice + text. Recommends real chamber members first, surfaces events, answers operational questions.',
      position: 'left'
    },
    {
      page: '/',
      target: '.grid.grid-6, [class*="grid-6"]',
      title: 'Quick-find tiles',
      body: 'One-click into the six most-asked-about categories — dining, spa, home pros, parents, the flagship CityLoop guide, and the AI itself.',
      position: 'top'
    },
    {
      page: '/',
      target: '#partners-grid',
      title: 'Sponsorship that funds the chamber',
      body: 'Six tiers — Platinum down to Friend Leaders. Real members at every tier (or "[NEEDS REAL DATA]" until the chamber confirms its own roster). Click "Become a Leader" to see individual sponsorship menus.',
      position: 'top'
    },
    {
      page: '/members/directory.html',
      target: '.members-toolbar, .container h1',
      title: '851-entry member directory',
      body: 'Search, filter by tier or neighborhood, see real members with phones, websites, and a Concierge follow-up button. The chamber\'s actual roster will load on go-live.',
      position: 'bottom'
    },
    {
      page: '/guides/index.html',
      target: '.container',
      title: 'Ten community guides',
      body: 'Restaurants · Spas · Home Pros · Parents · CityLoop · Education · Family · Professional · Business · Plus the hub. Each is a full microsite linking back to chamber members.',
      position: 'top'
    },
    {
      page: '/events/index.html',
      target: '.events-toolbar, .container h1',
      title: 'Events with real Add-to-Calendar',
      body: 'Every event has a working .ics download, Google Calendar link, Outlook deep-link, and native share via WhatsApp / Email / Twitter / LinkedIn. Real RFC-5545, no fake buttons.',
      position: 'bottom'
    },
    {
      page: '/sponsor.html',
      target: '.container h1, .container',
      title: 'Individual sponsorship potential',
      body: 'Six membership tiers from Friend ($295/yr) to Platinum ($5K+) — plus event-specific sponsorships ($500 ribbon-cutting host up to $25K Food & Wine presenting sponsor). Diana can configure any of these.',
      position: 'bottom'
    },
    {
      page: '/auth/member-login.html',
      target: 'main, .container, body',
      title: 'Members area',
      body: 'Members log in to manage their listing, post deals, RSVP, redeem loyalty rewards, and access member-only events. Single sign-on ready.',
      position: 'bottom'
    },
    {
      page: '/admin/index.html',
      target: '.admin-stat-grid, .admin-side',
      title: 'Diana\'s Console — staff admin',
      body: 'The chamber operations dashboard. Live member stats, revenue, concierge sessions, attribution. Approve listings, send newsletters, manage events — all from here.',
      position: 'right'
    },
    {
      page: '/admin/index.html',
      target: '#ai-assistant, .ai-assistant',
      title: 'AI Staff Assistant — collapsible',
      body: 'An AI co-pilot for Diana — drafts content, summarizes inboxes, generates outreach. Click the header to collapse / expand. Powered by Gemini with Anthropic fallback.',
      position: 'left'
    },
    {
      page: '/admin/outreach.html',
      target: '#bd-intent, .admin-card',
      title: 'Bulk email drafting — connected to Microsoft 365',
      body: 'Filter members by tier / category / neighborhood → Gemini generates a personalized email per recipient → drafts land in Outlook for review. Real Graph API, real drafts.',
      position: 'top'
    },
    {
      page: '/admin/settings.html',
      target: '#integrations-body, .admin-card',
      title: 'Real integration status',
      body: 'No fake "Connected" labels. The Microsoft 365 row shows the actual signed-in mailbox. Gemini shows live / fallback. This is what production looks like.',
      position: 'top'
    },
    {
      page: '/',
      target: null,
      title: 'Tour complete',
      body: 'You\'ve seen the public site, the member directory, the resource guides, events, sponsorships, the staff admin, the AI Concierge, the AI Staff Assistant, and the bulk-draft generator wired to Microsoft 365.<br><br>Questions or feedback? Use the AI Concierge in the bottom-right of any page, or contact info@woodlandhillscc.net.',
      position: 'center',
      isFinal: true
    }
  ];

  // ── State ────────────────────────────────────────────────────
  var STORAGE_KEY = 'wv-tour-state';

  function getState() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setState(s) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ── Path helpers ─────────────────────────────────────────────
  function currentPath() {
    var p = window.location.pathname || '/';
    // Normalize index.html
    if (p === '' || p === '/') return '/';
    if (p.endsWith('/index.html')) return p.replace(/index\.html$/, '');
    return p;
  }
  function pathMatches(stepPage, current) {
    if (stepPage === current) return true;
    if (stepPage === '/' && (current === '/' || current === '/index.html' || current === '')) return true;
    if (stepPage === current.replace(/\/$/, '')) return true;
    if (stepPage + '/' === current) return true;
    return false;
  }

  // ── Overlay UI ───────────────────────────────────────────────
  var overlayEl, tooltipEl, highlightEl, styleEl;

  function injectStyles() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.id = 'wv-tour-styles';
    styleEl.textContent = '\
      .wv-tour-overlay { position:fixed; inset:0; z-index:99998; pointer-events:none; }\
      .wv-tour-mask { position:fixed; inset:0; background:rgba(11,37,69,0.60); pointer-events:auto; transition:opacity 200ms; }\
      .wv-tour-highlight { position:fixed; pointer-events:none; border-radius:8px; box-shadow: 0 0 0 4px #C9A227, 0 0 0 9999px rgba(11,37,69,0.65); transition:all 220ms cubic-bezier(.4,0,.2,1); z-index:99999; }\
      .wv-tour-tooltip { position:fixed; z-index:100000; background:#fff; border-radius:14px; box-shadow:0 24px 56px rgba(11,37,69,0.30); padding:24px; max-width:380px; pointer-events:auto; font-family: Inter, -apple-system, sans-serif; }\
      .wv-tour-tooltip__step { font-family: "JetBrains Mono", ui-monospace, monospace; font-size:.7rem; color:#8C6E14; text-transform:uppercase; letter-spacing:.12em; margin-bottom:6px; }\
      .wv-tour-tooltip__title { font-family: "Source Serif Pro", Cambria, Georgia, serif; font-weight:700; font-size:1.2rem; color:#0B2545; margin:0 0 10px; line-height:1.25; }\
      .wv-tour-tooltip__body { font-size:.95rem; color:#2A3340; line-height:1.55; margin:0 0 18px; }\
      .wv-tour-tooltip__actions { display:flex; gap:8px; align-items:center; justify-content:space-between; }\
      .wv-tour-tooltip__progress { font-size:.78rem; color:#6B7280; flex-shrink:0; }\
      .wv-tour-tooltip__buttons { display:flex; gap:8px; }\
      .wv-tour-btn { padding:.55rem 1rem; border-radius:8px; font-weight:600; font-size:.88rem; cursor:pointer; border:none; font-family:inherit; }\
      .wv-tour-btn--primary { background:#C9A227; color:#0B2545; }\
      .wv-tour-btn--primary:hover { background:#8C6E14; color:#fff; }\
      .wv-tour-btn--ghost { background:transparent; color:#6B7280; }\
      .wv-tour-btn--ghost:hover { color:#0B2545; }\
      .wv-tour-tooltip__close { position:absolute; top:10px; right:12px; background:transparent; border:none; color:#6B7280; font-size:1.2rem; cursor:pointer; padding:4px 8px; border-radius:4px; }\
      .wv-tour-tooltip__close:hover { background:#F2EBDB; color:#0B2545; }\
      @media (max-width: 640px) { .wv-tour-tooltip { max-width:calc(100vw - 32px); margin:0 16px; } }\
      ';
    document.head.appendChild(styleEl);
  }

  function ensureOverlay() {
    injectStyles();
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.className = 'wv-tour-overlay';
    overlayEl.innerHTML =
      '<div class="wv-tour-mask"></div>' +
      '<div class="wv-tour-highlight" style="display:none;"></div>' +
      '<div class="wv-tour-tooltip" role="dialog" aria-live="polite">' +
        '<button class="wv-tour-tooltip__close" aria-label="Skip tour">×</button>' +
        '<div class="wv-tour-tooltip__step"></div>' +
        '<h3 class="wv-tour-tooltip__title"></h3>' +
        '<div class="wv-tour-tooltip__body"></div>' +
        '<div class="wv-tour-tooltip__actions">' +
          '<div class="wv-tour-tooltip__progress"></div>' +
          '<div class="wv-tour-tooltip__buttons">' +
            '<button class="wv-tour-btn wv-tour-btn--ghost" data-action="back">‹ Back</button>' +
            '<button class="wv-tour-btn wv-tour-btn--primary" data-action="next">Next ›</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlayEl);
    tooltipEl = overlayEl.querySelector('.wv-tour-tooltip');
    highlightEl = overlayEl.querySelector('.wv-tour-highlight');

    overlayEl.querySelector('[data-action=next]').addEventListener('click', next);
    overlayEl.querySelector('[data-action=back]').addEventListener('click', back);
    overlayEl.querySelector('.wv-tour-tooltip__close').addEventListener('click', skip);
    overlayEl.querySelector('.wv-tour-mask').addEventListener('click', function(e){ /* clicks pass through but don't close */ });
  }

  function destroyOverlay() {
    if (overlayEl) overlayEl.remove();
    overlayEl = null;
    tooltipEl = null;
    highlightEl = null;
  }

  // ── Step rendering ───────────────────────────────────────────
  function renderStep(stepIndex) {
    var step = STEPS[stepIndex];
    if (!step) { complete(); return; }

    // Are we on the right page?
    if (!pathMatches(step.page, currentPath())) {
      setState({ idx: stepIndex });
      window.location.href = step.page;
      return;
    }

    ensureOverlay();
    setState({ idx: stepIndex });

    // Wait a tick for any partials to mount
    setTimeout(function () {
      var target = step.target ? document.querySelector(step.target) : null;

      // Update tooltip content
      tooltipEl.querySelector('.wv-tour-tooltip__step').textContent = 'Step ' + (stepIndex + 1) + ' of ' + STEPS.length;
      tooltipEl.querySelector('.wv-tour-tooltip__title').textContent = step.title;
      tooltipEl.querySelector('.wv-tour-tooltip__body').innerHTML = step.body;
      tooltipEl.querySelector('.wv-tour-tooltip__progress').textContent = Math.round(((stepIndex + 1) / STEPS.length) * 100) + '%';

      // Last step: change Next button
      var nextBtn = tooltipEl.querySelector('[data-action=next]');
      nextBtn.textContent = step.isFinal ? 'Done ✓' : (stepIndex === STEPS.length - 1 ? 'Done ✓' : 'Next ›');
      tooltipEl.querySelector('[data-action=back]').style.visibility = stepIndex === 0 ? 'hidden' : 'visible';

      // Highlight target
      if (target) {
        var rect = target.getBoundingClientRect();
        // If target is offscreen, scroll it into view first
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function () { positionAround(target, step.position || 'bottom'); }, 350);
        } else {
          positionAround(target, step.position || 'bottom');
        }
      } else {
        // Centered modal
        highlightEl.style.display = 'none';
        tooltipEl.style.left = '50%';
        tooltipEl.style.top = '50%';
        tooltipEl.style.transform = 'translate(-50%, -50%)';
      }

      // Run optional action
      if (typeof step.action === 'function') {
        try { step.action(); } catch (e) { console.warn('Tour action failed:', e); }
      }
    }, 300);
  }

  function positionAround(target, position) {
    var rect = target.getBoundingClientRect();
    var pad = 8;
    highlightEl.style.display = 'block';
    highlightEl.style.left = (rect.left - pad) + 'px';
    highlightEl.style.top = (rect.top - pad) + 'px';
    highlightEl.style.width = (rect.width + pad * 2) + 'px';
    highlightEl.style.height = (rect.height + pad * 2) + 'px';

    var tipRect = tooltipEl.getBoundingClientRect();
    var tipW = 380;
    var tipH = tipRect.height || 200;
    var GAP = 16;
    var left, top;
    var trans = '';

    switch (position) {
      case 'top':
        left = Math.max(16, Math.min(window.innerWidth - tipW - 16, rect.left + rect.width / 2 - tipW / 2));
        top = Math.max(16, rect.top - tipH - GAP);
        break;
      case 'left':
        left = Math.max(16, rect.left - tipW - GAP);
        top = Math.max(16, Math.min(window.innerHeight - tipH - 16, rect.top + rect.height / 2 - tipH / 2));
        break;
      case 'right':
        left = Math.min(window.innerWidth - tipW - 16, rect.right + GAP);
        top = Math.max(16, Math.min(window.innerHeight - tipH - 16, rect.top + rect.height / 2 - tipH / 2));
        break;
      case 'center':
        highlightEl.style.display = 'none';
        tooltipEl.style.left = '50%';
        tooltipEl.style.top = '50%';
        tooltipEl.style.transform = 'translate(-50%, -50%)';
        return;
      case 'bottom':
      default:
        left = Math.max(16, Math.min(window.innerWidth - tipW - 16, rect.left + rect.width / 2 - tipW / 2));
        top = Math.min(window.innerHeight - tipH - 16, rect.bottom + GAP);
        break;
    }
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
    tooltipEl.style.transform = trans;
  }

  // ── Controls ─────────────────────────────────────────────────
  function start() {
    setState({ idx: 0 });
    renderStep(0);
  }
  function next() {
    var s = getState() || { idx: 0 };
    var idx = s.idx + 1;
    if (idx >= STEPS.length) return complete();
    renderStep(idx);
  }
  function back() {
    var s = getState() || { idx: 0 };
    var idx = Math.max(0, s.idx - 1);
    renderStep(idx);
  }
  function skip() {
    if (!confirm('Skip the tour? You can restart it anytime by clicking "Take the tour" on the homepage.')) return;
    clearState();
    destroyOverlay();
  }
  function complete() {
    clearState();
    destroyOverlay();
  }
  function reset() {
    clearState();
    destroyOverlay();
  }

  // ── Auto-resume on page load ─────────────────────────────────
  function maybeResume() {
    var s = getState();
    if (!s || typeof s.idx !== 'number') return;
    var step = STEPS[s.idx];
    if (!step) { clearState(); return; }
    if (pathMatches(step.page, currentPath())) {
      renderStep(s.idx);
    } else {
      // Wrong page; advance to nearest step on the current page or stay paused
      var idx = STEPS.findIndex(function (st) { return pathMatches(st.page, currentPath()); });
      if (idx >= 0 && idx > s.idx) {
        // Auto-jump if the user navigated forward
        renderStep(idx);
      }
    }
  }

  // ── Wiring ───────────────────────────────────────────────────
  function init() {
    document.querySelectorAll('[data-tour-start]').forEach(function (el) {
      if (el.__wvTourBound) return;
      el.__wvTourBound = true;
      el.addEventListener('click', function (e) { e.preventDefault(); start(); });
    });
    maybeResume();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.WVTour = { start: start, skip: skip, reset: reset, next: next, back: back };
})();
