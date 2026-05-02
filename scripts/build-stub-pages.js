#!/usr/bin/env node
/**
 * build-stub-pages.js — Generate the remaining pages referenced from
 * the live-site mega-menu (Wellness Network, Awards, Forum, Gallery, Jobs,
 * Connection Circles, Young Professionals, Adopt-a-School, Important Phones).
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function pageWrap({ title, description, depth, active, body }) {
  const up = '../'.repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · West Valley Warner Center Chamber of Commerce</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<link rel="icon" href="${up}images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}css/chamber.css?v=4">
</head>
<body>
<header data-partial="header"></header>
${body}
<footer data-partial="footer"></footer>
<script src="${up}js/partials.js?v=4"></script>
<script src="${up}js/chamber.js?v=4"></script>
<script>ChamberPartials.mount({ active: '${active}', depth: ${depth} });</script>
</body>
</html>`;
}

const PAGES = [
  // ── Wellness Resource Network ─────────────────────────────
  {
    rel: 'about/wellness-network.html', active: 'chamber', depth: 1,
    title: 'Wellness Resource Network',
    description: '38 healthcare, fitness, and wellness chamber members meeting monthly at Providence Cedars-Sinai Tarzana. Cross-referrals + quarterly community wellness fairs.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Networking Group</span>
  <h1>Wellness Resource Network</h1>
  <p class="hero__lead">38 healthcare, fitness, and wellness members. Meets the 3rd Tuesday at 5pm at Providence Cedars-Sinai Tarzana.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:48px;align-items:start;">
    <div>
      <h2>Who's in the room</h2>
      <p>Healthcare providers, integrative medicine practitioners, mental wellness specialists, fitness studios, spa &amp; aesthetic medicine, senior living, and ancillary wellness services across the West Valley.</p>
      <h3 style="margin-top:24px;">Format</h3>
      <ul>
        <li>Monthly meeting at Providence Cedars-Sinai Tarzana, 3rd Tuesday 5pm</li>
        <li>Structured 60-second member introductions + open referrals</li>
        <li>Quarterly community wellness fair (next: October 2026)</li>
        <li>Cross-promotion in the Wellness Network Digest newsletter</li>
      </ul>
    </div>
    <div>
      <div class="card" style="padding:32px;background:linear-gradient(135deg,var(--blue-soft),var(--paper));">
        <h3>Stats</h3>
        <ul style="list-style:none;padding:0;">
          <li style="padding:10px 0;border-top:1px solid var(--line-soft);"><strong>38</strong> active members</li>
          <li style="padding:10px 0;border-top:1px solid var(--line-soft);"><strong>$108K</strong> in tracked referrals (2025)</li>
          <li style="padding:10px 0;border-top:1px solid var(--line-soft);"><strong>4</strong> wellness fairs run</li>
          <li style="padding:10px 0;border-top:1px solid var(--line-soft);"><strong>11</strong> years of continuous operation</li>
        </ul>
        <a href="../networking-groups.html#wellness-resource-network" class="btn btn--gold mt-3">Request to join ›</a>
      </div>
    </div>
  </div>
</div></section>`
  },

  // ── Awards ────────────────────────────────────────────────
  {
    rel: 'community/awards.html', active: 'community', depth: 1,
    title: 'Community Choice Awards',
    description: 'The annual West Valley Community Choice Awards — public-voted recognition for the best businesses, restaurants, and services in Tarzana, Woodland Hills, Reseda, and Warner Center.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Annual Recognition</span>
  <h1>Community Choice Awards</h1>
  <p class="hero__lead">Public-voted, chamber-administered. Eight categories, 40+ winners every year. The West Valley's "neighborhood Oscars."</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <h2>Categories</h2>
  <div class="grid grid-3" style="gap:20px;margin-top:16px;">
    <div class="card" style="padding:20px;"><h3>Best Restaurant</h3><p class="text-muted">2025: Fogo de Chão (Repeat winner)</p></div>
    <div class="card" style="padding:20px;"><h3>Best Family Service</h3><p class="text-muted">2025: Tarzana Family Dental</p></div>
    <div class="card" style="padding:20px;"><h3>Best Home Pro</h3><p class="text-muted">2025: The Drain Co.</p></div>
    <div class="card" style="padding:20px;"><h3>Best Retail</h3><p class="text-muted">2025: WH Camera &amp; Telescopes</p></div>
    <div class="card" style="padding:20px;"><h3>Best Wellness</h3><p class="text-muted">2025: Tarzana Skin Wellness</p></div>
    <div class="card" style="padding:20px;"><h3>Best Newcomer</h3><p class="text-muted">2025: Cryohealthcare WH</p></div>
    <div class="card" style="padding:20px;"><h3>Best Nonprofit</h3><p class="text-muted">2025: Boys &amp; Girls Clubs of West Valley</p></div>
    <div class="card" style="padding:20px;"><h3>Best Hospitality</h3><p class="text-muted">2025: Warner Center Marriott</p></div>
  </div>

  <div class="card mt-6" style="padding:32px;text-align:center;background:linear-gradient(135deg,var(--gold-soft),var(--gold));">
    <h3 style="color:var(--navy);">2026 voting opens September 1</h3>
    <p style="color:var(--navy);">Public voting runs Sep 1–Oct 15. Ceremony at the Warner Center Marriott, November 12.</p>
    <a href="../contact.html?topic=awards" class="btn btn--primary mt-3">Nominate a business →</a>
  </div>
</div></section>`
  },

  // ── Community Forum ───────────────────────────────────────
  {
    rel: 'community/forum.html', active: 'community', depth: 1,
    title: 'Community Forum',
    description: 'Members-only chamber community forum — events, discussions, classifieds, deal-of-the-week.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Members only</span>
  <h1>Community Forum</h1>
  <p class="hero__lead">Discussion threads, classifieds, deal-of-the-week, member shoutouts. Sign in to post.</p>
</div></section>

<section class="section bg-cream"><div class="container container-narrow">
  <div class="card" style="padding:48px;text-align:center;">
    <h2>Sign in to access the forum</h2>
    <p>The community forum is open to chamber members in good standing. Sign in with your member portal credentials to read and post.</p>
    <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="../auth/member-login.html" class="btn btn--gold btn--lg">Member sign in →</a>
      <a href="../join.html" class="btn btn--outline btn--lg">Join the chamber</a>
    </div>
  </div>
</div></section>`
  },

  // ── Gallery ───────────────────────────────────────────────
  {
    rel: 'community/gallery.html', active: 'community', depth: 1,
    title: 'Gallery',
    description: 'Photo gallery from chamber events — mixers, ribbon cuttings, Grateful Hearts, VAPI Festival, and more.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Photos &amp; videos</span>
  <h1>Gallery</h1>
  <p class="hero__lead">Selected photos from chamber events. Member volunteers + chamber staff photography.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" style="gap:16px;">
    ${[
      ['VAPI Cultural Festival 2025','22,000 attendees · Pierce College','#dc2626'],
      ['Grateful Hearts Day 2025','207 volunteers · 1,800 meals','#0e7490'],
      ['Holiday Mixer at Fogo','110 members · December 2025','#16a34a'],
      ['MLK Day of Service','160 volunteers · 4 worksites','#7c3aed'],
      ['State of the Chamber 2026','Marriott ballroom · April 22','#0B2545'],
      ['Cryohealthcare Ribbon Cutting','New member · May 13, 2026','#C9A227']
    ].map(([t,s,c]) => `
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="height:200px;background:linear-gradient(135deg,${c},var(--navy));display:flex;align-items:center;justify-content:center;color:#fff;font-size:2.2rem;">📸</div>
        <div class="card__body"><h3 style="font-size:1.05rem;">${t}</h3><p class="text-sm text-muted">${s}</p></div>
      </div>
    `).join('')}
  </div>
  <p class="text-center text-muted mt-6">Want full-resolution photos for your business marketing? <a href="../contact.html?topic=photos">Request from the chamber →</a></p>
</div></section>`
  },

  // ── Job Board ─────────────────────────────────────────────
  {
    rel: 'community/jobs.html', active: 'community', depth: 1,
    title: 'Job Board',
    description: 'West Valley jobs posted by chamber-member businesses. Free for members.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Members post free</span>
  <h1>Job Board</h1>
  <p class="hero__lead">Open positions at chamber-member businesses across the West Valley.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid" style="gap:12px;">
    <div class="card" style="padding:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
      <div><h3 style="margin-bottom:4px;">Senior Receptionist</h3><p class="text-sm text-muted">Tarzana Family Dental · Tarzana · Full-time · Posted Apr 28</p></div>
      <a href="../contact.html?topic=job" class="btn btn--outline">Apply</a>
    </div>
    <div class="card" style="padding:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
      <div><h3 style="margin-bottom:4px;">Marketing Coordinator</h3><p class="text-sm text-muted">Warner Center Marriott · Warner Center · Full-time · Posted Apr 24</p></div>
      <a href="../contact.html?topic=job" class="btn btn--outline">Apply</a>
    </div>
    <div class="card" style="padding:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
      <div><h3 style="margin-bottom:4px;">Event &amp; Volunteer Coordinator</h3><p class="text-sm text-muted">West Valley Chamber · Woodland Hills · Part-time · Posted Apr 22</p></div>
      <a href="../contact.html?topic=job" class="btn btn--outline">Apply</a>
    </div>
    <div class="card" style="padding:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
      <div><h3 style="margin-bottom:4px;">Server / Bartender (Multiple)</h3><p class="text-sm text-muted">Fogo de Chão · Woodland Hills · FT/PT · Posted Apr 18</p></div>
      <a href="../contact.html?topic=job" class="btn btn--outline">Apply</a>
    </div>
    <div class="card" style="padding:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
      <div><h3 style="margin-bottom:4px;">AI Implementation Consultant</h3><p class="text-sm text-muted">Heed AI Solutions · Woodland Hills · Contract · Posted Apr 15</p></div>
      <a href="../contact.html?topic=job" class="btn btn--outline">Apply</a>
    </div>
  </div>
  <div class="card mt-6" style="padding:32px;background:linear-gradient(135deg,var(--gold-soft),var(--gold));text-align:center;">
    <h3 style="color:var(--navy);">Chamber members post jobs free</h3>
    <p style="color:var(--navy);">Up to 3 active postings at any time. Listings are also surfaced by the AI Concierge to job-seekers.</p>
    <a href="../auth/member-login.html" class="btn btn--primary mt-3">Member sign-in →</a>
  </div>
</div></section>`
  },

  // ── Connection Circles ────────────────────────────────────
  {
    rel: 'community/connection-circles.html', active: 'community', depth: 1,
    title: 'Connection Circles',
    description: 'Three weekly chamber referral circles — Lee\'s Circle, Dynamic Business Networking, and the AI for Business Circle.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Free with membership</span>
  <h1>Connection Circles</h1>
  <p class="hero__lead">Three structured referral groups. Limited to one business per category per group. The chamber's longest-running networking format.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" style="gap:24px;">
    <div class="card" style="padding:28px;">
      <h3>Lee's Connection Circle</h3>
      <p class="text-sm text-muted">Lee Pearce · 2nd Tuesday, 8am · Rotating venues</p>
      <p>Long-running cross-vertical referral group. 22-member cap, 19 active. Tracked $340K in referrals (2025).</p>
      <a href="../networking-groups.html#lees-connection-circle" class="btn btn--outline btn--sm mt-3">Request to join</a>
    </div>
    <div class="card" style="padding:28px;">
      <h3>Dynamic Business Networking</h3>
      <p class="text-sm text-muted">Priscilla Purganan · 2nd Monday, 11:30am · Mountaingate CC</p>
      <p>Larger lunch group with rotating speakers. 60-member cap, 41 active. Strong real-estate, financial-services, and home-service representation.</p>
      <a href="../networking-groups.html#dynamic-business-networking" class="btn btn--outline btn--sm mt-3">Request to join</a>
    </div>
    <div class="card" style="padding:28px;border-color:var(--gold);">
      <span class="chip chip--gold">New for 2026</span>
      <h3 style="margin-top:8px;">AI for Business Circle</h3>
      <p class="text-sm text-muted">Michael Bowers (Heed AI) · 1st Wednesday, 9am · Marriott</p>
      <p>Peer learning on AI tools that move the needle for small Valley businesses. 35-member cap, 12 active. Hands-on, no fluff.</p>
      <a href="../networking-groups.html#ai-for-business" class="btn btn--gold btn--sm mt-3">Request to join</a>
    </div>
  </div>
</div></section>`
  },

  // ── Young Professionals ──────────────────────────────────
  {
    rel: 'community/young-professionals.html', active: 'community', depth: 1,
    title: 'Young Professionals Network',
    description: 'Under-40 chamber members. Last Thursday, 6:30pm at member-hosted venues. Casual mixer + monthly skill workshops.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Under 40 · Free with membership</span>
  <h1>Young Professionals Network</h1>
  <p class="hero__lead">53 active members under 40. Monthly mixers, quarterly skill workshops, and a peer-mentorship program with senior chamber members.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:48px;">
    <div>
      <h2>Format</h2>
      <ul>
        <li><strong>Last Thursday, 6:30pm</strong> — casual mixer at rotating venues</li>
        <li><strong>Quarterly skill workshops</strong> — practical topics (AI tools, contracts 101, raising your first round, etc.)</li>
        <li><strong>Peer mentorship</strong> — paired with senior chamber members on request</li>
        <li><strong>Annual leadership retreat</strong> — September each year</li>
      </ul>
      <a href="../networking-groups.html#young-professionals-network" class="btn btn--gold mt-3">Request to join</a>
    </div>
    <div>
      <h2>Recent topics</h2>
      <div class="grid" style="gap:8px;margin-top:12px;">
        <div class="card" style="padding:14px;"><strong>April:</strong> AI tools that save 5 hours/week</div>
        <div class="card" style="padding:14px;"><strong>March:</strong> Contracts 101 (with chamber-member attorneys)</div>
        <div class="card" style="padding:14px;"><strong>February:</strong> 2026 kickoff mixer at Wisteria (70 attendees)</div>
        <div class="card" style="padding:14px;"><strong>January:</strong> Year-end retrospective + 2026 priorities</div>
      </div>
    </div>
  </div>
</div></section>`
  },

  // ── Adopt a School ────────────────────────────────────────
  {
    rel: 'community/adopt-a-school.html', active: 'community', depth: 1,
    title: 'Adopt-a-School',
    description: 'The chamber pairs member businesses with West Valley schools — supplies, internships, mentorship, career-day visits.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Community Benefit Foundation</span>
  <h1>Adopt-a-School</h1>
  <p class="hero__lead">12 chamber-member businesses paired with 6 West Valley schools. Supplies, internships, mentorship, career-day participation.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:48px;">
    <div>
      <h2>How it works</h2>
      <ol>
        <li>Member business commits to one school for the academic year</li>
        <li>Quarterly check-in with the school's administrative liaison</li>
        <li>Annual giving (supplies, scholarship, equipment) suited to the business's capacity</li>
        <li>Career-day participation at least once per year</li>
        <li>Optional: paid summer-internship slot (rising juniors and seniors)</li>
      </ol>
      <h3 style="margin-top:24px;">Schools currently served</h3>
      <ul>
        <li>Cleveland Charter High School</li>
        <li>Reseda Charter High School</li>
        <li>Taft Charter High School</li>
        <li>Granada Hills Charter (partner school)</li>
        <li>Pierce College (community-college partner)</li>
        <li>Sherman Oaks Center for Enriched Studies (CES)</li>
      </ul>
    </div>
    <div class="card" style="padding:32px;background:linear-gradient(135deg,var(--blue-soft),var(--paper));">
      <h3>2026 expansion</h3>
      <p>The chamber's CBF is growing the program from 6 → 8 schools this year. Two new Reseda partner schools will be announced in September.</p>
      <a href="../contact.html?topic=adopt-a-school" class="btn btn--gold mt-3">Adopt a school →</a>
      <p class="text-sm text-muted mt-3">Members pay $0 to participate. The chamber covers program admin via the CBF.</p>
    </div>
  </div>
</div></section>`
  },

  // ── Important Phones ──────────────────────────────────────
  {
    rel: 'community/important-phones.html', active: 'community', depth: 1,
    title: 'Important Phone Numbers',
    description: 'Critical West Valley phone numbers — police, fire, utilities, city services, schools, hospitals.',
    body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Quick reference</span>
  <h1>Important Phone Numbers</h1>
  <p class="hero__lead">Save these. Print these. Tape them to the inside of the kitchen cabinet.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:24px;">
    <div class="card" style="padding:24px;">
      <h3>Emergency</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>911</strong> — Emergency (police/fire/medical)</li>
        <li><strong>(818) 374-7611</strong> — LAPD Topanga Division (non-emergency)</li>
        <li><strong>(818) 998-5621</strong> — LAFD Station 84 (non-emergency)</li>
        <li><strong>(213) 974-1234</strong> — LA County Sheriff (non-emergency)</li>
        <li><strong>(800) 222-1222</strong> — Poison Control</li>
      </ul>
    </div>
    <div class="card" style="padding:24px;">
      <h3>Hospitals</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>(818) 881-0800</strong> — Providence Cedars-Sinai Tarzana</li>
        <li><strong>(818) 364-3110</strong> — Northridge Hospital</li>
        <li><strong>(800) 422-4641</strong> — Kaiser Permanente</li>
        <li><strong>(310) 825-9111</strong> — UCLA Health (info)</li>
      </ul>
    </div>
    <div class="card" style="padding:24px;">
      <h3>City Services</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>311</strong> — LA City Services (potholes, trash, code)</li>
        <li><strong>(213) 473-3231</strong> — Council District 3 (Blumenfield)</li>
        <li><strong>(800) 342-5397</strong> — DWP Power outage</li>
        <li><strong>(800) 342-5397</strong> — DWP Water emergency</li>
      </ul>
    </div>
    <div class="card" style="padding:24px;">
      <h3>Utilities</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>(800) 427-2200</strong> — SoCal Gas</li>
        <li><strong>(800) 655-4555</strong> — Spectrum (cable/internet)</li>
        <li><strong>(800) 288-2020</strong> — AT&amp;T</li>
        <li><strong>(800) 449-7587</strong> — LA Sanitation (trash/recycle)</li>
      </ul>
    </div>
    <div class="card" style="padding:24px;">
      <h3>Schools (LAUSD)</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>(818) 654-3600</strong> — LAUSD Region North</li>
        <li><strong>(818) 360-2361</strong> — Cleveland Charter HS</li>
        <li><strong>(818) 758-3700</strong> — Reseda Charter HS</li>
        <li><strong>(818) 887-1814</strong> — Taft Charter HS</li>
      </ul>
    </div>
    <div class="card" style="padding:24px;background:var(--gold-soft);">
      <h3>Chamber</h3>
      <ul style="list-style:none;padding:0;">
        <li><strong>(818) 347-4737</strong> — Main line / Felicia / Diana</li>
        <li><strong>diana@woodlandhillscc.net</strong> — CEO direct</li>
        <li><strong>felicia@woodlandhillscc.net</strong> — Events / RSVP</li>
        <li><strong>21250 Califa St #102</strong>, Woodland Hills 91367</li>
      </ul>
    </div>
  </div>
</div></section>`
  }
];

PAGES.forEach(p => {
  const fpath = path.join(ROOT, p.rel);
  ensureDir(path.dirname(fpath));
  fs.writeFileSync(fpath, pageWrap(p));
  console.log(`✓ ${p.rel}`);
});

// ── /cityloop redirect at root ────────────────────────────
fs.writeFileSync(path.join(ROOT, 'cityloop.html'), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CityLoop · Redirecting…</title>
<meta http-equiv="refresh" content="0; url=guides/cityloop.html">
<link rel="canonical" href="https://www.woodlandhillscc.net/guides/cityloop.html">
</head>
<body>
<p>Redirecting to <a href="guides/cityloop.html">CityLoop guide</a>…</p>
<script>window.location.replace('guides/cityloop.html');</script>
</body>
</html>`);
console.log('✓ cityloop.html (root redirect)');

console.log(`\n${PAGES.length + 1} stub pages built.`);
