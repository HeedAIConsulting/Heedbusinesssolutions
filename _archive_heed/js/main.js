/* ============================================================
   HEED CONSULTING — Main JavaScript
   Nav | Forms | Scroll Reveal | Filters | FAQ
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. DOM Ready ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initDropdowns();
    initScrollReveal();
    initForms();
    initFAQ();
    initFilter();
    initActiveNav();
    initReadAloud();
  });

  /* ── 2. Navigation ───────────────────────────────────── */
  function initNav() {
    // Support both patterns: site-header wrapper (root pages) or standalone .site-nav (sub-pages)
    const siteHeader = document.querySelector('.site-header');
    const nav        = siteHeader || document.querySelector('.site-nav');
    const hamburger  = document.querySelector('.nav-hamburger, .site-nav__hamburger');
    const mobileMenu = document.querySelector('.nav-mobile');

    if (!nav) return;

    // Scroll behaviour — add .scrolled to whichever is the outer fixed element
    function onScroll() {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', isOpen);
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !mobileMenu.contains(e.target) && mobileMenu.classList.contains('open')) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ── 3. Active Nav Link ──────────────────────────────── */
  function initActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const allLinks    = document.querySelectorAll('.nav-link, .nav-dropdown-item, .nav-mobile-link');

    allLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      // Normalize
      const linkPath = href.replace(/\/$/, '').split('?')[0];
      if (
        linkPath === currentPath ||
        (linkPath !== '' && linkPath !== '/' && currentPath.startsWith(linkPath))
      ) {
        link.classList.add('active');
      }
    });
  }

  /* ── 4. Scroll Reveal ────────────────────────────────── */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      reveals.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback: show all immediately
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ── 5. Forms (Formspree AJAX) ──────────────────────── */
  function initForms() {
    const ENDPOINT = 'https://formspree.io/f/xkoqkkjw';
    const forms    = document.querySelectorAll('form[data-formspree], form.resource-form');

    forms.forEach(function (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const btn     = form.querySelector('[type="submit"]');
        const success = form.querySelector('.form-success');
        const original = btn ? btn.innerHTML : '';

        // Validate required fields
        let valid = true;
        form.querySelectorAll('[required]').forEach(function (field) {
          field.classList.remove('error');
          if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
          }
        });
        if (!valid) return;

        // Loading state
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';
        }

        try {
          const res = await fetch(ENDPOINT, {
            method:  'POST',
            headers: { 'Accept': 'application/json' },
            body:    new FormData(form),
          });

          if (res.ok) {
            // Resource cards use .resource-success sibling, regular forms use .form-success
            const resourceSuccess = form.parentElement.querySelector('.resource-success');
            if (resourceSuccess) {
              form.style.display = 'none';
              resourceSuccess.style.display = 'block';
            } else {
              form.style.display = 'none';
              if (success) success.style.display = 'block';
            }
            // GA4 event
            if (typeof gtag === 'function') {
              const resourceName = form.querySelector('[name="resource"]');
              gtag('event', resourceName ? 'resource_download' : 'form_submit', {
                event_category: resourceName ? 'Resource' : 'Lead',
                event_label:    resourceName ? resourceName.value : (form.id || 'contact_form'),
              });
            }
          } else {
            throw new Error('Server error');
          }
        } catch (err) {
          if (btn) {
            btn.disabled  = false;
            btn.innerHTML = original;
          }
          alert('Something went wrong. Please email us directly at mbowers@heedconsulting.ai');
        }
      });
    });
  }

  /* ── 6. FAQ Accordion ────────────────────────────────── */
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(function (i) { i.classList.remove('open'); });

        // Toggle clicked
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── 7. Portfolio Filter ─────────────────────────────── */
  function initFilter() {
    const filterBar   = document.querySelector('.filter-bar');
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('[data-filter]');

    if (!filterBar || !portfolioItems.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.dataset.filter || 'all';

        // Active state
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Show/hide
        portfolioItems.forEach(function (item) {
          const cats = (item.dataset.filter || '').split(' ');
          if (filter === 'all' || cats.includes(filter)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ── 8. Counter animation ────────────────────────────── */
  function animateCounter(el, target, suffix) {
    const duration  = 1500;
    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger counters when visible
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix);
          co.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }


  /* ── DROPDOWN CLICK TOGGLE (fixes hover-gap disappear bug) ── */
  function initDropdowns() {
    // Site-nav pattern (root pages)
    document.querySelectorAll('.site-nav__item--dropdown').forEach(function (item) {
      var toggle = item.querySelector('.site-nav__link--dropdown');
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = item.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
        // Close siblings
        item.closest('ul').querySelectorAll('.site-nav__item--dropdown').forEach(function (sibling) {
          if (sibling !== item) {
            sibling.classList.remove('open');
            var s = sibling.querySelector('.site-nav__link--dropdown');
            if (s) s.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // Sub-page nav pattern (.nav-dropdown-toggle)
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (toggle) {
      var item = toggle.closest('.nav-item--dropdown');
      if (!item) return;
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = item.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
        // Close siblings
        item.closest('ul').querySelectorAll('.nav-item--dropdown').forEach(function (sibling) {
          if (sibling !== item) {
            sibling.classList.remove('open');
            var s = sibling.querySelector('.nav-dropdown-toggle');
            if (s) s.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-nav__item--dropdown, .nav-item--dropdown')) {
        document.querySelectorAll('.site-nav__item--dropdown.open, .nav-item--dropdown.open').forEach(function (item) {
          item.classList.remove('open');
          var t = item.querySelector('[aria-expanded]');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.site-nav__item--dropdown.open, .nav-item--dropdown.open').forEach(function (item) {
          item.classList.remove('open');
          var t = item.querySelector('[aria-expanded]');
          if (t) { t.setAttribute('aria-expanded', 'false'); t.focus(); }
        });
      }
    });
  }

  /* ── READ ALOUD — Web Speech API for accessibility ──────── */
  function initReadAloud() {
    if (!('speechSynthesis' in window)) return;

    // Create the button
    var btn = document.createElement('button');
    btn.id = 'read-aloud-btn';
    btn.className = 'read-aloud-btn';
    btn.setAttribute('aria-label', 'Read page aloud');
    btn.setAttribute('title', 'Read page aloud');
    btn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i><span>Listen</span>';
    document.body.appendChild(btn);

    var speaking = false;
    var utterance = null;

    btn.addEventListener('click', function () {
      if (speaking) {
        window.speechSynthesis.cancel();
        speaking = false;
        btn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i><span>Listen</span>';
        btn.setAttribute('aria-label', 'Read page aloud');
        btn.classList.remove('is-speaking');
        return;
      }

      // Collect readable text from main content
      var main = document.querySelector('main, article, .article-body, .hero__content');
      if (!main) main = document.body;
      var text = main.innerText || main.textContent || '';
      text = text.replace(/\s+/g, ' ').trim().substring(0, 8000); // cap at 8000 chars

      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.lang = document.documentElement.lang || 'en-US';

      utterance.onend = function () {
        speaking = false;
        btn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i><span>Listen</span>';
        btn.setAttribute('aria-label', 'Read page aloud');
        btn.classList.remove('is-speaking');
      };

      window.speechSynthesis.speak(utterance);
      speaking = true;
      btn.innerHTML = '<i class="fa-solid fa-stop" aria-hidden="true"></i><span>Stop</span>';
      btn.setAttribute('aria-label', 'Stop reading aloud');
      btn.classList.add('is-speaking');
    });
  }

  /* ── 9. GEO Report Popup Modal ─────────────────────── */
  (function initGeoPopup() {
    var overlay  = document.getElementById('geo-modal');
    var closeBtn = document.getElementById('geo-modal-close');
    var doneBtn  = document.getElementById('geo-modal-done');
    var step1    = document.getElementById('geo-step-1');
    var step2    = document.getElementById('geo-step-2');
    var step3    = document.getElementById('geo-step-3');
    var form1    = document.getElementById('geo-popup-form');
    var form2    = document.getElementById('geo-competition-form');

    if (!overlay) return;

    // Show popup after 12 seconds or 40% scroll (whichever first), once per session
    var shown = sessionStorage.getItem('geoPopupShown');
    if (!shown) {
      var timer = setTimeout(showPopup, 12000);
      window.addEventListener('scroll', function scrollTrigger() {
        var scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrollPct > 0.4) {
          showPopup();
          window.removeEventListener('scroll', scrollTrigger);
        }
      });
    }

    function showPopup() {
      if (sessionStorage.getItem('geoPopupShown')) return;
      clearTimeout(timer);
      overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem('geoPopupShown', '1');
    }

    function closePopup() {
      overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (doneBtn)  doneBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-visible')) closePopup();
    });

    // Also allow manual trigger from CTA buttons
    document.querySelectorAll('[data-geo-popup]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showPopup();
        sessionStorage.setItem('geoPopupShown', '1');
      });
    });

    // Step 1 submit → show Step 2
    if (form1) {
      form1.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form1.checkValidity()) { form1.reportValidity(); return; }

        var data = new FormData(form1);
        var emailVal = data.get('email');

        // Store email for step 2
        var hiddenEmail = document.getElementById('geo-comp-email-hidden');
        if (hiddenEmail) hiddenEmail.value = emailVal;

        // Submit to Formspree
        fetch('https://formspree.io/f/xkoqkkjw', {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        // Transition to step 2
        step1.style.display = 'none';
        step2.style.display = 'block';
      });
    }

    // Step 2 submit → show Step 3
    if (form2) {
      form2.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form2.checkValidity()) { form2.reportValidity(); return; }

        var data = new FormData(form2);

        fetch('https://formspree.io/f/xkoqkkjw', {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        step2.style.display = 'none';
        step3.style.display = 'block';
      });
    }
  })();

  /* ── 10. Parallax Scroll ──────────────────────────── */
  (function initParallax() {
    var img = document.getElementById('parallax-img');
    if (!img) return;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var speed = 0.35;
          img.style.transform = 'translate3d(0,' + (scrollY * speed) + 'px,0)';
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

})();
