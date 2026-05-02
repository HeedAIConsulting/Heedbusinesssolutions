/* ============================================================
   Chamber Site — Shared client logic
   - Mobile nav, AI concierge widget, fetch helpers
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
    const href = a.getAttribute('href').replace(/\/$/, '');
    if (href && (path === href || (href !== '/' && path.startsWith(href)))) a.classList.add('active');
  });

  // ── AI Concierge ──
  const apiBase = window.CHAMBER_API_BASE || '/api';

  function buildConcierge() {
    if (document.querySelector('.ai-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'ai-widget';
    widget.innerHTML = `
      <button class="ai-widget__btn" aria-label="Open AI concierge" data-action="toggle">
        <span class="ai-widget__pulse"></span>
        <span>Ask the Chamber Concierge</span>
      </button>
      <div class="ai-widget__panel" role="dialog" aria-label="Chamber AI Concierge">
        <div class="ai-widget__header">
          <div class="ai-widget__avatar">CC</div>
          <div>
            <div class="ai-widget__title">Chamber Concierge</div>
            <div class="ai-widget__sub">Powered by AI · Always on duty</div>
          </div>
          <button class="ai-widget__close" data-action="toggle" aria-label="Close concierge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="ai-widget__body" data-role="messages">
          <div class="ai-msg ai-msg--bot">
            Welcome to the West Valley ~ Warner Center Chamber. I can help you find a member business, an event, a community resource, or guide you through joining the Chamber. What are you looking for today?
          </div>
          <div class="ai-suggest">
            <button data-prompt="Find a restaurant for date night">Date-night restaurant</button>
            <button data-prompt="What events are happening this week?">This week's events</button>
            <button data-prompt="Recommend a plumber that's a chamber member">Find a plumber</button>
            <button data-prompt="How do I join the chamber?">How to join</button>
            <button data-prompt="Best after-school programs for kids">Kids programs</button>
          </div>
        </div>
        <form class="ai-widget__input" data-role="form">
          <input type="text" placeholder="Ask anything about the West Valley…" data-role="input" autocomplete="off" />
          <button type="submit" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(widget);

    const panel = widget.querySelector('.ai-widget__panel');
    const messages = widget.querySelector('[data-role="messages"]');
    const form = widget.querySelector('[data-role="form"]');
    const input = widget.querySelector('[data-role="input"]');

    widget.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action="toggle"]');
      if (t) { panel.classList.toggle('is-open'); if (panel.classList.contains('is-open')) input.focus(); return; }
      const sug = e.target.closest('.ai-suggest button');
      if (sug) { input.value = sug.dataset.prompt; form.requestSubmit(); }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addMsg(messages, text, 'user');
      input.value = '';
      const thinking = addMsg(messages, '…', 'bot');
      thinking.classList.add('thinking');

      try {
        const r = await fetch(`${apiBase}/concierge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, page: window.location.pathname })
        });
        if (!r.ok) throw new Error('backend ' + r.status);
        const data = await r.json();
        thinking.remove();
        if (data.reply) addMsg(messages, data.reply, 'bot');
        if (Array.isArray(data.cards) && data.cards.length) renderCards(messages, data.cards);
      } catch (err) {
        // Backend offline — fall back to client-side directory search so we can still help
        thinking.remove();
        await clientSideConcierge(messages, text);
      }
    });
  }

  function addMsg(container, text, role) {
    const el = document.createElement('div');
    el.className = `ai-msg ai-msg--${role}`;
    el.textContent = text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  function renderCards(container, cards) {
    cards.slice(0, 4).forEach(c => {
      const el = document.createElement('a');
      el.className = 'ai-msg ai-msg--bot';
      el.style.display = 'block';
      el.style.textDecoration = 'none';
      el.style.color = 'inherit';
      el.style.maxWidth = '100%';
      el.href = c.href || '#';
      el.innerHTML = `
        <div style="font-weight:600;color:var(--navy);">${escape(c.title)}</div>
        ${c.meta ? `<div style="font-size:.78rem;color:var(--muted);margin-top:2px;">${escape(c.meta)}</div>` : ''}
        ${c.body ? `<div style="font-size:.88rem;color:var(--slate-mid);margin-top:6px;">${escape(c.body)}</div>` : ''}
      `;
      container.appendChild(el);
    });
    container.scrollTop = container.scrollHeight;
  }

  function escape(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  // Client-side concierge fallback — when the backend is offline, do a
  // local keyword-match against directory + events JSON so the user still
  // gets useful results instead of an apology.
  let _DIR_CACHE = null;
  let _SFV_CACHE = null;
  let _EVT_CACHE = null;
  async function loadJSON(p) {
    const tries = ['data/', '../data/', '../../data/'];
    for (const prefix of tries) {
      try {
        const r = await fetch(prefix + p);
        if (r.ok) return await r.json();
      } catch (_) {}
    }
    return null;
  }
  async function clientSideConcierge(container, query) {
    if (!_DIR_CACHE) _DIR_CACHE = await loadJSON('directory.json') || [];
    if (!_SFV_CACHE) _SFV_CACHE = await loadJSON('sfv-businesses.json') || [];
    if (!_EVT_CACHE) _EVT_CACHE = await loadJSON('events.json') || [];

    const q = query.toLowerCase();
    const tokens = q.split(/[^a-z0-9]+/).filter(t => t.length >= 3);

    function score(m) {
      const hay = [m.name, m.legalName, m.category, m.subcategory, m.naicsDescription, m.tagline, m.neighborhood, m.address, (m.tags||[]).join(' '), (m.features||[]).join(' '), (m.specialties||'')].filter(Boolean).join(' ').toLowerCase();
      let s = 0;
      tokens.forEach(t => { if (hay.includes(t)) s += hay.startsWith(t) ? 4 : hay.split(t).length - 1; });
      // Heavy bias: chamber members ALWAYS rank above community businesses
      if (m.chamberMember) s += 5;
      const tierBoost = { platinum: 3, gold: 2.5, silver: 2, bronze: 1.5, supporter: 1, friend: 1, member: 0.5 };
      s += tierBoost[m.tier] || 0;
      return s;
    }

    // Search chamber directory FIRST, fall back to SFV-wide if nothing relevant
    const chamberScored = _DIR_CACHE.map(m => ({ m, s: score(m), source: 'chamber' })).filter(x => x.s > 0);
    const sfvScored = _SFV_CACHE.map(m => ({ m, s: score(m), source: 'sfv' })).filter(x => x.s > 0);

    let combined;
    if (chamberScored.length >= 3) {
      // Plenty of chamber matches — show top 4 chamber-only
      combined = chamberScored.sort((a,b) => b.s - a.s).slice(0, 4);
    } else {
      // Fewer chamber matches — pad with SFV matches but always chamber-first
      combined = [
        ...chamberScored.sort((a,b) => b.s - a.s),
        ...sfvScored.sort((a,b) => b.s - a.s).slice(0, 4 - chamberScored.length)
      ].slice(0, 4);
    }

    if (!combined.length) {
      addMsg(container, "I couldn't find a match for that. Try a different keyword (neighborhood, business type, or what you need) — or browse the full directory from the top menu.", 'bot');
      return;
    }

    const depth = (window.location.pathname.match(/\/[^/]+\//g) || []).length - 1;
    const prefix = '../'.repeat(Math.max(0, depth));

    const chamberCount = combined.filter(x => x.source === 'chamber').length;
    const intro = chamberCount === combined.length
      ? `Here are the chamber-member matches I found for "${query}":`
      : chamberCount > 0
        ? `Here are the top matches for "${query}" — chamber members first, then community businesses:`
        : `No chamber members directly match "${query}", but here are some West Valley businesses worth checking:`;

    addMsg(container, intro, 'bot');
    const cards = combined.map(({ m, source }) => ({
      title: m.name,
      meta: [m.category, m.neighborhood, m.phone || m.address].filter(Boolean).join(' · '),
      body: m.tagline || m.naicsDescription || (m.features && m.features.slice(0,2).join(' · ')) || '',
      href: source === 'chamber' ? `${prefix}members/profile.html?id=${encodeURIComponent(m.id)}` : `${prefix}guides/cityloop.html#${encodeURIComponent(m.id)}`,
      badge: m.chamberMember ? 'Chamber Member' : 'Community'
    }));
    renderCards(container, cards);

    if (chamberCount === 0) {
      addMsg(container, "💡 Tip: Chamber-member businesses get faster, vetted recommendations. Open the full directory or join the chamber to be found here.", 'bot');
    }
  }

  // Boot widget on every page except admin/auth
  if (!/\/(admin|auth)\//.test(window.location.pathname)) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildConcierge);
    } else {
      buildConcierge();
    }
  }

  // Expose helpers
  window.Chamber = {
    api: apiBase,
    fetchJson: async (path, opts = {}) => {
      const r = await fetch(`${apiBase}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
  };
})();
