/* Admin sub-page hydration —
 * Tries to fetch /api/admin/queues and replaces the static sample
 * tables with live data when the backend is running. If the API isn't
 * reachable, the static placeholders stay so Diana can still see the layout.
 */
(async function () {
  const API = (window.CHAMBER_API_BASE || '/api');
  let queues;
  try {
    const r = await fetch(API + '/admin/queues');
    if (!r.ok) throw new Error('api ' + r.status);
    queues = await r.json();
  } catch (e) {
    console.info('[admin-hydrate] backend offline; keeping static sample data');
    return;
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 60) return mins + 'm ago';
    if (mins < 60 * 24) return Math.round(mins / 60) + 'h ago';
    return Math.round(mins / 60 / 24) + 'd ago';
  }

  // Detect which admin page we're on by scanning the title/h1.
  const h1 = (document.querySelector('h1') || {}).textContent || '';
  const path = window.location.pathname.toLowerCase();

  function replaceRows(selector, rowsHTML) {
    const tbody = document.querySelector(selector);
    if (!tbody || !rowsHTML) return;
    tbody.innerHTML = rowsHTML;
  }

  // ── Onboarding queue ────────────────────────────────────────────
  if (/onboarding/i.test(h1) || path.endsWith('onboarding.html')) {
    const pending = (queues.onboarding || []).filter(o => o.status === 'pending_review');
    if (pending.length) {
      const rows = pending.map(o => `
        <tr>
          <td><strong>${escapeHTML(o.businessName)}</strong><br><span class="text-xs text-muted">${escapeHTML(o.category||'')} · ${escapeHTML(o.neighborhood||'West Valley')} · ${escapeHTML(o.contactName||'')}</span></td>
          <td><span class="tier tier--${escapeHTML(o.tier||'member')}">${escapeHTML(o.tier||'member')}</span></td>
          <td>${o.trustScore||0}/5</td>
          <td class="text-muted text-sm">${timeAgo(o.completedAt||o.createdAt)}</td>
          <td class="admin-actions"><button class="approve" data-id="${escapeHTML(o.onboardingId||o.id)}">Approve &amp; list</button><button>Review</button></td>
        </tr>`).join('');
      replaceRows('.admin-card__body table tbody', rows);
    }
  }

  // ── Referrals ───────────────────────────────────────────────────
  if (/referrals/i.test(h1) || path.endsWith('referrals.html')) {
    const refs = queues.referrals || [];
    if (refs.length) {
      const rows = refs.map(r => `
        <tr>
          <td>${escapeHTML(r.referrerBusiness||r.referrerName||'—')}</td>
          <td>${escapeHTML(r.referredBusiness||'—')}${r.neighborhood?` · ${escapeHTML(r.neighborhood)}`:''}</td>
          <td><span class="admin-pill admin-pill--gold">${escapeHTML(r.status||'New')}</span></td>
          <td class="text-muted text-sm">${timeAgo(r._ts)}</td>
          <td class="admin-actions"><button>Send AI outreach</button><button>Mark joined</button></td>
        </tr>`).join('');
      replaceRows('.admin-card__body table tbody', rows);
    }
  }

  // ── Loyalty enrollments ─────────────────────────────────────────
  if (/loyalty/i.test(h1) || path.endsWith('loyalty.html')) {
    const enrolls = queues.loyalty_enrollments || [];
    if (enrolls.length) {
      const rows = enrolls.map(e => `
        <tr>
          <td><strong>${escapeHTML(e.businessName||e.business||'—')}</strong></td>
          <td>${escapeHTML(e.offer||'—')}</td>
          <td>—</td>
          <td>—</td>
          <td class="admin-actions"><button>Edit offer</button><button>Pause</button></td>
        </tr>`).join('');
      replaceRows('.admin-card__body table tbody', rows);
    }
  }

  // ── Member leads (Outreach drafts) ──────────────────────────────
  if (/outreach/i.test(h1) || path.endsWith('outreach.html')) {
    const upgrades = queues.upgrades || [];
    const blogs = queues.blog_pitches || [];
    // No specific live data yet — keep sample, but log
    if (upgrades.length || blogs.length) {
      console.info('[admin-hydrate] outreach has live data points; sample table preserved for layout');
    }
  }
})();
