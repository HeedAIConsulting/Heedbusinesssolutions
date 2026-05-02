/* ============================================================
   Chamber Desktop Assistant — admin shell logic
   ============================================================ */

window.AdminShell = (function () {
  function nav(active) {
    return `
<aside class="admin-side">
  <div class="admin-side__brand">
    <img src="../images/wvwccc-logo-2026.png" alt="WVWCCC" style="width:42px;height:42px;border-radius:8px;flex-shrink:0;">
    <div class="admin-side__brand-text">
      <div class="admin-side__brand-name">Desktop Assistant</div>
      <div class="admin-side__brand-sub">Diana's Console</div>
    </div>
  </div>
  <nav class="admin-nav">
    <div class="admin-nav__group">
      <a href="index.html" class="${active==='dashboard'?'active':''}">📊 Dashboard</a>
      <a href="approvals.html" class="${active==='approvals'?'active':''}">✅ Approvals <span class="admin-nav__badge">7</span></a>
      <a href="onboarding.html" class="${active==='onboarding'?'active':''}">🚀 Onboarding Queue <span class="admin-nav__badge">4</span></a>
      <a href="ai-assistant.html" class="${active==='ai'?'active':''}">🤖 AI Assistant</a>
    </div>
    <div class="admin-nav__group">
      <div class="admin-nav__group-title">Membership</div>
      <a href="members.html" class="${active==='members'?'active':''}">👥 Members</a>
      <a href="leads.html" class="${active==='leads'?'active':''}">📥 Leads</a>
      <a href="renewals.html" class="${active==='renewals'?'active':''}">🔄 Renewals <span class="admin-nav__badge">12</span></a>
      <a href="referrals.html" class="${active==='referrals'?'active':''}">🎁 Referrals</a>
      <a href="outreach.html" class="${active==='outreach'?'active':''}">📤 Outreach</a>
    </div>
    <div class="admin-nav__group">
      <div class="admin-nav__group-title">Programs</div>
      <a href="events.html" class="${active==='events'?'active':''}">📅 Events</a>
      <a href="guides.html" class="${active==='guides'?'active':''}">📖 Guides</a>
      <a href="sponsorships.html" class="${active==='sponsorships'?'active':''}">⭐ Sponsorships</a>
      <a href="loyalty.html" class="${active==='loyalty'?'active':''}">💳 Loyalty Program</a>
      <a href="networking.html" class="${active==='networking'?'active':''}">🤝 Networking Groups</a>
    </div>
    <div class="admin-nav__group">
      <div class="admin-nav__group-title">Content</div>
      <a href="blog.html" class="${active==='blog'?'active':''}">📝 Blog &amp; Buzz</a>
      <a href="social.html" class="${active==='social'?'active':''}">📣 Social Media</a>
      <a href="newsletter.html" class="${active==='newsletter'?'active':''}">✉️ Newsletters</a>
      <a href="email-blasts.html" class="${active==='blasts'?'active':''}">📨 Email Blasts</a>
    </div>
    <div class="admin-nav__group">
      <div class="admin-nav__group-title">Revenue</div>
      <a href="ads.html" class="${active==='ads'?'active':''}">📊 Ad Inventory &amp; Revenue</a>
      <a href="billing.html" class="${active==='billing'?'active':''}">💳 Billing</a>
    </div>
    <div class="admin-nav__group">
      <div class="admin-nav__group-title">Operations</div>
      <a href="reports.html" class="${active==='reports'?'active':''}">📈 Reports</a>
      <a href="staff.html" class="${active==='staff'?'active':''}">🛡️ Staff &amp; Roles</a>
      <a href="settings.html" class="${active==='settings'?'active':''}">⚙️ Settings</a>
    </div>
  </nav>
  <div class="admin-side__user">
    <div class="admin-side__user-avatar" style="background:var(--gold);color:var(--navy);font-weight:700;">DW</div>
    <div>
      <div class="admin-side__user-name">Diana Williams</div>
      <div class="admin-side__user-role">CEO · CBF Director</div>
    </div>
  </div>
</aside>`;
  }

  function topbar() {
    return `
<div class="admin-top">
  <div class="admin-search">
    <span style="color:var(--muted);">🔎</span>
    <input type="text" placeholder="Search members, events, content, billing — or type / for AI" id="admin-search-input">
    <kbd style="background:var(--paper);border:1px solid var(--line);padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:.72rem;color:var(--muted);">⌘ K</kbd>
  </div>
  <div class="admin-top__actions">
    <button class="btn btn--ghost btn--sm" title="Notifications">🔔 <span class="admin-pill admin-pill--gold" style="font-size:.65rem;padding:1px 6px;margin-left:4px;">3</span></button>
    <button class="btn btn--ghost btn--sm" title="Help">?</button>
    <a href="../index.html" class="btn btn--outline btn--sm" target="_blank">View site ↗</a>
  </div>
</div>`;
  }

  function aiAssistant() {
    return `
<div class="ai-assistant" id="ai-assistant">
  <div class="ai-assistant__head">
    <div class="ai-assistant__head-avatar">AI</div>
    <div class="ai-assistant__head-text">
      <div class="ai-assistant__title">Staff Assistant</div>
      <div class="ai-assistant__sub">Your AI co-pilot for everything Chamber</div>
    </div>
  </div>
  <div class="ai-assistant__body" id="ai-body">
    <div class="ai-msg ai-msg--bot">
      Hi Diana — I'm your AI assistant. I can draft content, manage approvals, look up members, schedule events, send newsletters, and answer any operational question. What do you need?
    </div>
  </div>
  <div class="ai-assistant__action">
    <button data-prompt="Draft this week's newsletter">✉️ Draft newsletter</button>
    <button data-prompt="Approve all pending listings that meet our standards">✅ Bulk approve</button>
    <button data-prompt="What needs my attention today?">🎯 What needs me?</button>
    <button data-prompt="Schedule a ribbon cutting for new member Cryohealthcare">📅 Schedule event</button>
  </div>
  <form class="ai-assistant__input" id="ai-form">
    <input type="text" id="ai-input" placeholder="Ask anything or give a command…" autocomplete="off">
    <button type="submit" class="btn btn--primary btn--sm">Send</button>
  </form>
</div>`;
  }

  function mount({ active }) {
    const sideHost = document.querySelector('[data-admin="side"]');
    const topHost = document.querySelector('[data-admin="top"]');
    const aiHost = document.querySelector('[data-admin="ai"]');
    if (sideHost) sideHost.outerHTML = nav(active);
    if (topHost) topHost.outerHTML = topbar();
    if (aiHost) aiHost.outerHTML = aiAssistant();
    bindAi();
  }

  function bindAi() {
    const body = document.getElementById('ai-body');
    const form = document.getElementById('ai-form');
    const input = document.getElementById('ai-input');
    if (!form) return;
    document.querySelectorAll('.ai-assistant__action button').forEach(b => {
      b.addEventListener('click', () => { input.value = b.dataset.prompt; form.requestSubmit(); });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addMsg(body, text, 'user');
      input.value = '';
      const t = addMsg(body, '…', 'bot');
      try {
        const r = await fetch(`${window.CHAMBER_API_BASE}/staff-assistant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await r.json();
        t.remove();
        if (data.reply) addMsg(body, data.reply, 'bot');
      } catch (err) {
        t.textContent = 'Connection issue — but in production I would have drafted that for you, fetched the data, or queued the action.';
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

  return { mount };
})();
