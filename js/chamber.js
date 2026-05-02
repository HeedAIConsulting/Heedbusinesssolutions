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
    // Respect a "dismissed for this session" flag so the user can hide it entirely.
    if (sessionStorage.getItem('wvwccc_concierge_hidden') === '1') return;
    if (document.querySelector('.ai-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'ai-widget';
    widget.innerHTML = `
      <button class="ai-widget__btn" aria-label="Open AI concierge" data-action="toggle">
        <span class="ai-widget__pulse"></span>
        <span>Ask the Chamber Concierge</span>
      </button>
      <button class="ai-widget__dismiss" data-action="dismiss" aria-label="Hide concierge for this session" title="Hide for this session">×</button>
      <div class="ai-widget__panel" role="dialog" aria-label="Chamber AI Concierge">
        <div class="ai-widget__header">
          <div class="ai-widget__avatar">CC</div>
          <div>
            <div class="ai-widget__title">Chamber Concierge</div>
            <div class="ai-widget__sub">Powered by AI · Always on duty</div>
          </div>
          <button class="ai-widget__minimize" data-action="minimize" aria-label="Minimize concierge" title="Minimize">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13h14"/></svg>
          </button>
          <button class="ai-widget__close" data-action="close" aria-label="Close concierge" title="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
      const m = e.target.closest('[data-action="minimize"]');
      if (m) { panel.classList.remove('is-open'); return; }
      const c = e.target.closest('[data-action="close"]');
      if (c) {
        panel.classList.remove('is-open');
        const msgsList = messages.querySelectorAll('.ai-msg, .ai-cards');
        msgsList.forEach((el, i) => { if (i > 0) el.remove(); });
        return;
      }
      const d = e.target.closest('[data-action="dismiss"]');
      if (d) {
        e.stopPropagation();
        sessionStorage.setItem('wvwccc_concierge_hidden', '1');
        widget.remove();
        return;
      }
      const sug = e.target.closest('.ai-suggest button');
      if (sug) { input.value = sug.dataset.prompt; form.requestSubmit(); }
    });

    // Esc-to-minimize keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
      }
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
  // Words that don't add meaning — filtered before scoring so a query like
  // "find me a plumber that's a chamber member" doesn't match every chamber
  // member just because of the words "chamber" and "member".
  const STOP = new Set([
    'find','show','give','help','want','need','looking','please','recommend',
    'best','good','great','any','some','all','new','near','around',
    'the','and','for','with','from','that','this','what','where','who','how',
    'chamber','member','members','business','businesses','company','place','places',
    'open','today','now','near','close','far','here'
  ]);

  async function clientSideConcierge(container, query) {
    if (!_DIR_CACHE) _DIR_CACHE = await loadJSON('directory.json') || [];
    if (!_SFV_CACHE) _SFV_CACHE = await loadJSON('sfv-businesses.json') || [];
    if (!_EVT_CACHE) _EVT_CACHE = await loadJSON('events.json') || [];

    const q = query.toLowerCase();
    const allTokens = q.split(/[^a-z0-9]+/).filter(t => t.length >= 3);
    const tokens = allTokens.filter(t => !STOP.has(t));

    if (tokens.length === 0) {
      addMsg(container, "Try giving me a more specific keyword — what kind of business, neighborhood, or service are you looking for?", 'bot');
      return;
    }

    // Word-boundary matchers — prevents "join" from matching "joint",
    // "skin" from matching "skincare" as a hard match, etc. We accept
    // word-prefix matches (skin → skincare) at lower score so legitimate
    // stem-style searches still surface relevant members.
    function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function wordRe(t) { return new RegExp('\\b' + escapeRe(t) + '\\b', 'i'); }
    function prefixRe(t) { return new RegExp('\\b' + escapeRe(t), 'i'); }

    // Find the rarest content token. Use WORD-BOUNDARY matching so
    // "join" in "joint chiropractic" doesn't count as a match when the
    // user typed "join the chamber".
    function matchCountIn(set, t) {
      const re = wordRe(t);
      let n = 0;
      for (const m of set) {
        const hay = [m.name, m.legalName, m.category, m.subcategory, m.naicsDescription, m.tagline, m.neighborhood, m.address, (m.tags||[]).join(' '), (m.features||[]).join(' '), (m.specialties||'')].filter(Boolean).join(' ');
        if (re.test(hay)) n++;
      }
      return n;
    }
    const tokenCounts = tokens.map(t => ({ t, n: matchCountIn(_DIR_CACHE, t) + matchCountIn(_SFV_CACHE, t) }));
    const rarestToken = tokenCounts.sort((a,b) => a.n - b.n)[0];
    if (rarestToken && rarestToken.n === 0) {
      addMsg(container, `I don't see any chamber-member or community businesses matching "${rarestToken.t}". Try a different keyword — or browse the full directory.`, 'bot');
      return;
    }
    const requiredToken = rarestToken && rarestToken.n < 50 ? rarestToken.t : null;
    const requiredRe = requiredToken ? wordRe(requiredToken) : null;

    function score(m) {
      const hay = [m.name, m.legalName, m.category, m.subcategory, m.naicsDescription, m.tagline, m.neighborhood, m.address, (m.tags||[]).join(' '), (m.features||[]).join(' '), (m.specialties||'')].filter(Boolean).join(' ');
      const name = m.name || '';

      // Require the rarest token (word-boundary). 'join' must match a
      // standalone "join", not "joint" or "joiner".
      if (requiredRe && !requiredRe.test(hay)) return { s: 0, matchedTokens: 0 };

      let tokenScore = 0;
      let matchedTokens = 0;
      tokens.forEach(t => {
        const wre = wordRe(t);
        const pre = prefixRe(t);
        let pts = 0;
        if (wre.test(name)) pts = 12;       // whole word in business name (best)
        else if (wre.test(hay))  pts = 8;   // whole word anywhere
        else if (pre.test(name)) pts = 5;   // word-prefix in name (skin → skincare)
        else if (pre.test(hay))  pts = 2;   // word-prefix anywhere (weakest)
        if (pts > 0) { matchedTokens++; tokenScore += pts; }
      });

      if (tokenScore === 0) return { s: 0, matchedTokens: 0 };
      let s = tokenScore + matchedTokens * 50;
      if (m.chamberMember) s += 5;
      const tierBoost = { platinum: 3, gold: 2.5, silver: 2, bronze: 1.5, supporter: 1, friend: 1, member: 0.5 };
      s += tierBoost[m.tier] || 0;
      return { s, matchedTokens };
    }

    // Score everything once
    const chamberScored = _DIR_CACHE.map(m => { const r = score(m); return { m, ...r, source: 'chamber' }; }).filter(x => x.s > 0);
    const sfvScored     = _SFV_CACHE.map(m => { const r = score(m); return { m, ...r, source: 'sfv' };     }).filter(x => x.s > 0);

    // Prefer entries that match ALL query tokens. If no entry matches all,
    // fall back to entries that match the most. This stops "pizza tarzana"
    // from returning a hospital just because it's in Tarzana.
    function pickBest(scored) {
      if (!scored.length) return [];
      const maxMatched = Math.max(...scored.map(x => x.matchedTokens));
      const bestTier = scored.filter(x => x.matchedTokens === maxMatched);
      return bestTier.sort((a, b) => b.s - a.s);
    }

    const chamberBest = pickBest(chamberScored);
    const sfvBest     = pickBest(sfvScored);

    let combined;
    if (chamberBest.length >= 3) {
      combined = chamberBest.slice(0, 4);
    } else {
      combined = [
        ...chamberBest,
        ...sfvBest.filter(x => x.matchedTokens >= (chamberBest[0]?.matchedTokens || 1))
                  .slice(0, 4 - chamberBest.length)
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
