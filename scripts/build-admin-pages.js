#!/usr/bin/env node
/**
 * build-admin-pages.js — Generate the new admin sub-pages added to the sidebar:
 * onboarding, referrals, outreach, loyalty, networking, email-blasts.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function template({ slug, active, title, subtitle, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · Diana's Console</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css">
<link rel="stylesheet" href="admin.css">
</head>
<body>
<div class="admin-shell">
  <div data-admin="side"></div>
  <main class="admin-main">
    <div data-admin="top"></div>
    <div class="admin-content">
      <div class="admin-page-head">
        <div>
          <div class="admin-page-head__sub">${subtitle}</div>
          <h1>${title}</h1>
        </div>
      </div>
${body}
    </div>
  </main>
</div>
<script src="admin.js"></script>
<script src="_stub.js"></script>
<script>
AdminShell.mount({ active: '${active}' });
</script>
<script src="admin-hydrate.js"></script>
</body>
</html>
`;
}

const pages = [
  {
    slug: 'onboarding',
    active: 'onboarding',
    title: 'Onboarding Queue',
    subtitle: 'New chamber members — auto-approved or pending review',
    body: `      <div class="admin-stat-grid">
        <div class="admin-stat"><div class="admin-stat__label">Auto-approved (today)</div><div class="admin-stat__num">3</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Pending review</div><div class="admin-stat__num">4</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Avg. time to live</div><div class="admin-stat__num">42m</div></div>
        <div class="admin-stat"><div class="admin-stat__label">This month</div><div class="admin-stat__num">28</div></div>
      </div>
      <div class="admin-card">
        <div class="admin-card__head"><div class="admin-card__title">Pending review</div></div>
        <div class="admin-card__body admin-card__body--p0">
          <table class="admin-table">
            <thead><tr><th>Business</th><th>Tier</th><th>Trust score</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td><strong>Cryohealthcare West Valley</strong><br><span class="text-xs text-muted">Healthcare · Woodland Hills · Bahiye Sakerian</span></td><td><span class="tier tier--gold">Gold</span></td><td>4/5 ⚠️ Missing license confirmation</td><td class="text-muted text-sm">12m ago</td><td class="admin-actions"><button class="approve">Approve &amp; list</button><button class="reject">Hold for info</button><button>Review</button></td></tr>
              <tr><td><strong>Tarzana Treatment Centers</strong><br><span class="text-xs text-muted">Healthcare · Tarzana · Heiddy Gomez</span></td><td><span class="tier tier--silver">Silver</span></td><td>5/5 ✓ Auto-approve eligible</td><td class="text-muted text-sm">28m ago</td><td class="admin-actions"><button class="approve">Approve &amp; list</button><button>Review</button></td></tr>
              <tr><td><strong>Safir Mediterranean Cuisine</strong><br><span class="text-xs text-muted">Restaurant · Tarzana</span></td><td><span class="tier tier--bronze">Bronze</span></td><td>3/5 ⚠️ Tagline too short</td><td class="text-muted text-sm">1h ago</td><td class="admin-actions"><button class="approve">Approve</button><button>AI fix tagline</button><button>Review</button></td></tr>
              <tr><td><strong>Valley Asian Pacific Islander Coalition</strong><br><span class="text-xs text-muted">Nonprofit · Reseda</span></td><td><span class="tier tier--supporter">Supporter</span></td><td>5/5 ✓ Auto-approve eligible</td><td class="text-muted text-sm">2h ago</td><td class="admin-actions"><button class="approve">Approve &amp; list</button><button>Review</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="admin-grid mt-6" style="grid-template-columns:1fr 1fr;">
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">Auto-approval rules</div></div>
          <div class="admin-card__body">
            <p class="text-sm">A business auto-approves if Trust Score ≥ 4. Trust Score adds 1 each for: ✓ valid website, ✓ valid phone, ✓ description ≥ 80 chars, ✓ tagline present, ✓ category in known vertical.</p>
            <p class="text-sm">Diana can change the threshold in <a href="settings.html">Settings → Onboarding</a>.</p>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">Auto-fired actions on approval</div></div>
          <div class="admin-card__body">
            <ul style="list-style:none;padding:0;">
              <li>📧 Welcome email to member (Diana's signature)</li>
              <li>📧 Cc Felicia for ribbon-cutting outreach</li>
              <li>📅 30-day check-in scheduled in admin</li>
              <li>📰 Featured in next Friday newsletter</li>
              <li>🤖 AI Concierge ingests their listing</li>
              <li>💳 Loyalty program enrollment offer sent</li>
            </ul>
          </div>
        </div>
      </div>`
  },
  {
    slug: 'referrals',
    active: 'referrals',
    title: 'Referrals',
    subtitle: 'Member-to-member referral program · pending and credited',
    body: `      <div class="admin-stat-grid">
        <div class="admin-stat"><div class="admin-stat__label">Pending</div><div class="admin-stat__num">9</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Joined (this Q)</div><div class="admin-stat__num">14</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Credits issued</div><div class="admin-stat__num">$1,400</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Top referrer</div><div class="admin-stat__num" style="font-size:1.2rem;">Tim Gaspar</div></div>
      </div>
      <div class="admin-card">
        <div class="admin-card__head"><div class="admin-card__title">Open referrals</div></div>
        <div class="admin-card__body admin-card__body--p0">
          <table class="admin-table">
            <thead><tr><th>Referrer</th><th>Referred Business</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>Tim Gaspar Insurance</td><td>Acuity Eye Care · Tarzana</td><td><span class="admin-pill admin-pill--gold">Outreach in progress</span></td><td class="text-muted text-sm">2d ago</td><td class="admin-actions"><button>Send AI outreach</button><button>Mark joined</button></td></tr>
              <tr><td>WH Camera</td><td>Frame &amp; Co · Reseda</td><td><span class="admin-pill admin-pill--blue">First call done</span></td><td class="text-muted text-sm">5d ago</td><td class="admin-actions"><button>Schedule follow-up</button><button>Mark joined</button></td></tr>
              <tr><td>Joint Matters</td><td>Allegro Physical Therapy · Woodland Hills</td><td><span class="admin-pill admin-pill--green">Meeting Friday</span></td><td class="text-muted text-sm">1w ago</td><td class="admin-actions"><button>Mark joined</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>`
  },
  {
    slug: 'outreach',
    active: 'outreach',
    title: 'Outreach',
    subtitle: 'AI-generated email sequences for prospective members · approve or send',
    body: `      <div class="admin-grid" style="grid-template-columns:1fr 2fr;">
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">Quick actions</div></div>
          <div class="admin-card__body" style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn--gold">+ Generate sequence for new prospect</button>
            <button class="btn btn--outline">Import prospects from CSV</button>
            <button class="btn btn--outline">Find prospects via AI Concierge logs</button>
            <button class="btn btn--outline">Reactivate lapsed members (14 found)</button>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">In progress sequences (12)</div></div>
          <div class="admin-card__body admin-card__body--p0">
            <table class="admin-table">
              <thead><tr><th>Prospect</th><th>Stage</th><th>Next send</th><th>Reply?</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td><strong>Ventura Ridge Realty</strong><br><span class="text-xs text-muted">Real estate · Tarzana</span></td><td>Email 2 of 3</td><td>Mon May 4</td><td>—</td><td class="admin-actions"><button>Edit draft</button><button>Approve send</button></td></tr>
                <tr><td><strong>Petite Patisserie</strong><br><span class="text-xs text-muted">Restaurant · Reseda</span></td><td>Email 3 of 3</td><td>Wed May 6</td><td>—</td><td class="admin-actions"><button>Edit draft</button><button>Approve send</button></td></tr>
                <tr><td><strong>Sunset Pediatrics</strong><br><span class="text-xs text-muted">Healthcare · Woodland Hills</span></td><td>Email 1 of 3</td><td>Today 2pm</td><td>—</td><td class="admin-actions"><button>Edit draft</button><button>Approve send</button></td></tr>
                <tr><td><strong>De Soto Dental</strong><br><span class="text-xs text-muted">Healthcare · Reseda</span></td><td>Replied 👋</td><td>Diana to respond</td><td>Yes — interested in mixer</td><td class="admin-actions"><button class="approve">Open thread</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`
  },
  {
    slug: 'loyalty',
    active: 'loyalty',
    title: 'Loyalty Program',
    subtitle: 'West Valley Loyalty Card · participating members and redemptions',
    body: `      <div class="admin-stat-grid">
        <div class="admin-stat"><div class="admin-stat__label">Cards issued</div><div class="admin-stat__num">2,340</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Active offers</div><div class="admin-stat__num">12</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Redemptions (MTD)</div><div class="admin-stat__num">487</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Top business</div><div class="admin-stat__num" style="font-size:1.2rem;">Fogo de Chão</div></div>
      </div>
      <div class="admin-card">
        <div class="admin-card__head"><div class="admin-card__title">Participating members &amp; offers</div><a href="../loyalty.html" target="_blank" class="text-sm">View public page →</a></div>
        <div class="admin-card__body admin-card__body--p0">
          <table class="admin-table">
            <thead><tr><th>Business</th><th>Offer</th><th>Redemptions (90d)</th><th>Avg. order</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td><strong>Fogo de Chão</strong></td><td>10% off lunch Mon-Fri</td><td>122</td><td>$48</td><td class="admin-actions"><button>Edit offer</button><button>Pause</button></td></tr>
              <tr><td><strong>WH Camera</strong></td><td>5% off + free sensor cleaning</td><td>34</td><td>$280</td><td class="admin-actions"><button>Edit offer</button><button>Pause</button></td></tr>
              <tr><td><strong>Tarzana Skin &amp; Wellness</strong></td><td>Free 30-min consult + 15% off</td><td>27</td><td>$165</td><td class="admin-actions"><button>Edit offer</button><button>Pause</button></td></tr>
              <tr><td><strong>The Drain Co.</strong></td><td>$25 off first call</td><td>19</td><td>$210</td><td class="admin-actions"><button>Edit offer</button><button>Pause</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>`
  },
  {
    slug: 'networking',
    active: 'networking',
    title: 'Networking Groups',
    subtitle: '8 active groups · join requests · group activity',
    body: `      <div class="admin-stat-grid">
        <div class="admin-stat"><div class="admin-stat__label">Active groups</div><div class="admin-stat__num">8</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Group members</div><div class="admin-stat__num">250</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Pending requests</div><div class="admin-stat__num">11</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Referrals tracked (90d)</div><div class="admin-stat__num">$340K</div></div>
      </div>
      <div class="admin-card">
        <div class="admin-card__head"><div class="admin-card__title">Pending join requests</div></div>
        <div class="admin-card__body admin-card__body--p0">
          <table class="admin-table">
            <thead><tr><th>Member</th><th>Group</th><th>Submitted</th><th>Group leader notified?</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>Sarah Chen — Chen CPA</td><td>AI for Business Circle</td><td class="text-muted text-sm">3h ago</td><td>✓ Yes (Michael Bowers)</td><td class="admin-actions"><button class="approve">Confirm</button></td></tr>
              <tr><td>Marcus Holloway — Holloway Realty</td><td>Lee's Connection Circle</td><td class="text-muted text-sm">1d ago</td><td>✓ Yes (Lee Pearce)</td><td class="admin-actions"><button class="approve">Confirm</button></td></tr>
              <tr><td>Elena Rodriguez — Studio Bloom</td><td>Valley Women in Business</td><td class="text-muted text-sm">2d ago</td><td>✓ Yes</td><td class="admin-actions"><button class="approve">Confirm</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>`
  },
  {
    slug: 'email-blasts',
    active: 'blasts',
    title: 'Email Blasts',
    subtitle: 'Dedicated single-send emails purchased by members',
    body: `      <div class="admin-grid" style="grid-template-columns:1fr 2fr;">
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">Schedule a blast</div></div>
          <div class="admin-card__body">
            <p class="text-sm">Members can purchase a dedicated email blast at $295 ($595 for non-members) or $1,500 for an event presenting blast.</p>
            <button class="btn btn--gold mt-3">+ New blast (member purchase)</button>
            <button class="btn btn--outline mt-2">+ Chamber-direct blast</button>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card__head"><div class="admin-card__title">Upcoming &amp; recent</div></div>
          <div class="admin-card__body admin-card__body--p0">
            <table class="admin-table">
              <thead><tr><th>Subject</th><th>Sender</th><th>Send date</th><th>Recipients</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td><strong>VAPI Festival May 2 — last call to RSVP</strong></td><td>Chamber direct</td><td>Apr 30 9am</td><td>4,218</td><td><span class="admin-pill admin-pill--green">Sent · 51% opens</span></td></tr>
                <tr><td><strong>Cryohealthcare ribbon cutting May 13</strong></td><td>Cryohealthcare (paid)</td><td>May 6 10am</td><td>4,218</td><td><span class="admin-pill admin-pill--gold">Scheduled</span></td></tr>
                <tr><td><strong>Mother's Day at Fogo de Chão</strong></td><td>Fogo de Chão (paid)</td><td>May 8 9am</td><td>2,305 (Dine SFV)</td><td><span class="admin-pill admin-pill--gold">Scheduled · pending review</span></td></tr>
                <tr><td><strong>State of the Chamber 2026 keynote</strong></td><td>Chamber direct</td><td>Apr 22 7am</td><td>4,218</td><td><span class="admin-pill admin-pill--green">Sent · 47% opens</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`
  }
];

function build() {
  pages.forEach(p => {
    const file = path.join(ROOT, 'admin', p.slug + '.html');
    fs.writeFileSync(file, template(p));
    console.log(`✓ admin/${p.slug}.html`);
  });
}
if (require.main === module) build();
