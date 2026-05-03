/* ============================================================
   Chamber Site — Shared client logic
   - Mobile nav toggle
   - Fetch helpers
   AI Concierge moved to ElevenLabs ConvAI widget
   (mounted in partials.js, agent-id configured in admin.)
   ============================================================ */

(function () {
  'use strict';

  // ── Mobile nav toggle ──
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
  }

  // ── Active nav link ──
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '');
    if (href && (path === href || (href !== '/' && path.startsWith(href)))) a.classList.add('active');
  });

  // ── Fetch helper ──
  const apiBase = window.CHAMBER_API_BASE || '/api';
  window.Chamber = {
    api: apiBase,
    fetchJson: async (p, opts = {}) => {
      const r = await fetch(`${apiBase}${p}`, {
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
  };
})();
