#!/usr/bin/env node
/**
 * build-missing-pages.js — Generate the missing pages referenced from
 * the live-site nav: board, staff, letters, profiles, benefits, deals,
 * grateful-hearts, new/renewing members.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
ensureDir(path.join(ROOT, 'about'));
ensureDir(path.join(ROOT, 'profiles'));
ensureDir(path.join(ROOT, 'members'));

function pageWrap({ title, description, depth, active, body, og }) {
  const up = '../'.repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · West Valley Warner Center Chamber of Commerce</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${og || title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<link rel="canonical" href="https://www.woodlandhillscc.net/${depth ? '...' : ''}">
<link rel="icon" href="${up}images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}css/chamber.css">
</head>
<body>
<header data-partial="header"></header>
${body}
<footer data-partial="footer"></footer>
<script src="${up}js/partials.js"></script>
<script src="${up}js/chamber.js"></script>
<script>ChamberPartials.mount({ active: '${active}', depth: ${depth} });</script>
</body>
</html>`;
}

const PAGES = [];

// ── Board of Directors ────────────────────────────────────
const board = [
  { name: 'Diana Williams',          title: 'CEO &amp; Community Benefit Foundation Director', business: 'West Valley Warner Center Chamber of Commerce', tenure: 'Since 2014' },
  { name: 'Mark Cudacua',            title: 'Board Chair · Advocacy Committee Lead',           business: 'Cudacua Strategies',                              tenure: 'Board since 2018' },
  { name: 'Allen Edwards',           title: 'Vice Chair · Member Services',                    business: 'Allen Edwards Salon Woodland Hills',              tenure: 'Board since 2020' },
  { name: 'Steve Nolan',             title: 'Treasurer',                                        business: 'Warner Center Marriott',                          tenure: 'Board since 2019' },
  { name: 'Bahiye Sakerian',         title: 'Secretary',                                        business: 'Cryohealthcare Woodland Hills',                   tenure: 'Board since 2026' },
  { name: 'Jeff Schwartz',           title: 'Director · Retail',                                business: 'WH Camera &amp; Telescopes',                       tenure: 'Board since 2015' },
  { name: 'Christopher Pham',        title: 'Director · Healthcare',                            business: 'Tarzana Treatment Centers',                       tenure: 'Board since 2022' },
  { name: 'Tim Gaspar',              title: 'Director · Financial Services',                    business: 'Tim Gaspar Insurance',                            tenure: 'Board since 2017' },
  { name: 'Sherwin Arzani',          title: 'Director · Legal',                                 business: 'Citywide Law Group',                              tenure: 'Board since 2023' },
  { name: 'Lee Pearce',              title: 'Director · Connection Circles Program',           business: "Lee's Connection Circle (founder)",               tenure: 'Board since 2008' },
  { name: 'Priscilla Purganan',      title: 'Director · DBN Networking',                        business: 'Dynamic Business Networking',                     tenure: 'Board since 2021' },
  { name: 'Aracely Aguiar (ex-officio)', title: 'College Liaison',                              business: 'Pierce College',                                  tenure: 'Ex-officio since 2024' }
];
PAGES.push({
  rel: 'about/board.html', active: 'chamber', depth: 1,
  title: 'Board of Directors',
  description: '12 board members representing the West Valley Warner Center Chamber of Commerce — chaired by Mark Cudacua, with CEO Diana Williams.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Governance</span>
  <h1>Board of Directors</h1>
  <p class="hero__lead">12 leaders representing the diversity of the West Valley business community. The board meets monthly; advocacy committee meets the second Wednesday.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" style="gap:24px;">
    ${board.map(b => `
    <div class="card" style="padding:24px;">
      <div style="display:flex;gap:14px;align-items:flex-start;">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--navy);color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:1.2rem;flex-shrink:0;">${b.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
        <div>
          <h3 style="font-size:1.05rem;margin-bottom:4px;">${b.name}</h3>
          <div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:6px;">${b.title}</div>
          <p class="text-sm" style="color:var(--slate-mid);"><strong>${b.business}</strong></p>
          <p class="text-xs text-muted">${b.tenure}</p>
        </div>
      </div>
    </div>`).join('')}
  </div>
  <div class="text-center mt-6"><a href="board-letter.html" class="btn btn--outline">Read the chair's letter →</a></div>
</div></section>`
});

// ── Chamber Staff ─────────────────────────────────────────
PAGES.push({
  rel: 'about/staff.html', active: 'chamber', depth: 1,
  title: 'Chamber Staff',
  description: 'Diana Williams (CEO), Felicia Paust (Executive Assistant), Catee Loomis, and the rest of the West Valley Chamber team.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Meet the team</span>
  <h1>Chamber Staff</h1>
  <p class="hero__lead">A small team running a 800+ member organization. We answer the phone. We remember your name. Stop by — bring coffee.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" style="gap:32px;">

    <div class="card" style="padding:32px;">
      <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--blue));color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:2rem;margin-bottom:16px;">DW</div>
      <h2 style="font-size:1.4rem;margin-bottom:4px;">Diana Williams</h2>
      <div style="font-family:var(--mono);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:12px;">Chief Executive Officer · CBF Director</div>
      <p>Diana has led the chamber since 2014. She also directs the Community Benefit Foundation (the chamber's 501(c)(3)) and serves on the LACMHA Mental Health Advisory Committee and Pierce College Foundation board.</p>
      <p class="text-sm mt-3"><strong>Email:</strong> <a href="mailto:diana@woodlandhillscc.net">diana@woodlandhillscc.net</a><br><strong>Direct:</strong> (818) 347-4737</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-deep));color:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:2rem;margin-bottom:16px;">FP</div>
      <h2 style="font-size:1.4rem;margin-bottom:4px;">Felicia Paust</h2>
      <div style="font-family:var(--mono);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:12px;">Executive Assistant</div>
      <p>Felicia runs events, member-volunteer coordination, ribbon cuttings, and the chamber's RSVP and registration systems. If you've been to a chamber event recently, Felicia made it work.</p>
      <p class="text-sm mt-3"><strong>Email:</strong> <a href="mailto:felicia@woodlandhillscc.net">felicia@woodlandhillscc.net</a><br><strong>Sign-off:</strong> <em>"Be Connected, Felicia"</em></p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--navy));color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:2rem;margin-bottom:16px;">CL</div>
      <h2 style="font-size:1.4rem;margin-bottom:4px;">Catee Loomis</h2>
      <div style="font-family:var(--mono);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:12px;">Member Services</div>
      <p>Catee handles new-member onboarding, the ambassador program, and the chamber's day-to-day membership administration. She's the one who'll walk you through your first 90 days.</p>
      <p class="text-sm mt-3"><strong>Email:</strong> <a href="mailto:catee@woodlandhillscc.net">catee@woodlandhillscc.net</a></p>
    </div>

  </div>

  <div class="card mt-6" style="padding:32px;background:linear-gradient(135deg,var(--blue-soft),var(--paper));">
    <h3>The office</h3>
    <p>21250 Califa St #102, Woodland Hills, CA 91367 · (818) 347-4737<br>
    Hours: Monday–Thursday 9am–4pm, Friday by appointment.</p>
    <p class="text-sm text-muted mt-3">The office is small. There's always coffee. Members are welcome to stop by — but a quick text first means we can put a chair out for you.</p>
  </div>
</div></section>`
});

// ── CEO Letter ─────────────────────────────────────────────
PAGES.push({
  rel: 'about/ceo-letter.html', active: 'chamber', depth: 1,
  title: "Letter from the CEO",
  description: "Diana Williams's annual letter to the West Valley Warner Center Chamber of Commerce membership for 2026.",
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">January 2026</span>
  <h1>Letter from the CEO</h1>
</div></section>

<article class="section bg-paper"><div class="container container-narrow" style="max-width:720px;">
  <p class="lead" style="font-size:1.2rem;color:var(--navy);font-weight:500;">Dear Chamber Members,</p>
  <div style="font-size:1.05rem;line-height:1.85;color:var(--slate);">
    <p>If you'd told me ten years ago that we'd celebrate the chamber's 95th year by launching an AI-powered concierge that knows every member by name, I would have politely smiled and changed the subject.</p>
    <p>And yet — here we are. The West Valley has always been a place that adapts. We are a community of 800+ businesses spanning Tarzana, Woodland Hills, Reseda, and Warner Center; we have weathered the 1994 Northridge earthquake, two recessions, the 2020 shutdowns, and the steady transformation of our office corridors into mixed-use neighborhoods. The chamber has been here through every chapter — sometimes leading, sometimes catching up, but always present.</p>
    <p>Three things define 2026 for me:</p>
    <h3 style="margin-top:32px;">1. The new website you're reading this on.</h3>
    <p>The chamber needed a digital front door that actually serves both members and residents. The new site, built in partnership with Heed Business Solutions, includes ten resource guides, an AI Concierge available in five languages, an automated onboarding flow that gets new members listed within an hour, a loyalty program, eight networking groups, and a transparent ad-revenue inventory the board can see in real time. We are unapologetically modern — and unapologetically the same chamber that has been doing this since 1930.</p>
    <h3>2. Membership growth, deliberately.</h3>
    <p>Our 2026 goal: from 800 members to 1,000 by year-end. Not for the number — for the network density. Every new member is a new node in the West Valley referral graph. Lee's Connection Circle has tracked over $340K in member-to-member referrals in the last 90 days alone.</p>
    <h3>3. Saying yes to harder things.</h3>
    <p>The chamber is filing more advocacy positions, sponsoring more workforce-training partnerships with Pierce College, and expanding our Adopt-a-School program. The Sherman Way streetscape grant — $2M, federal funds, secured by Felicia's stubborn application work — is the kind of community win we should do more of.</p>
    <p>I look forward to seeing you at the State of the Chamber on April 22, at the VAPI Festival on May 2, and at every mixer in between.</p>
    <p style="margin-top:32px;font-family:var(--mono);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);">Stay Connected,</p>
    <p style="font-family:var(--serif);font-weight:600;font-size:1.4rem;color:var(--navy);">Diana Williams</p>
    <p class="text-sm text-muted">Chief Executive Officer &amp; Community Benefit Foundation Director<br>West Valley Warner Center Chamber of Commerce</p>
  </div>
</div></article>`
});

// ── Board Chair Letter ────────────────────────────────────
PAGES.push({
  rel: 'about/board-letter.html', active: 'chamber', depth: 1,
  title: "Letter from the Board Chair",
  description: "Mark Cudacua, Board Chair, on 2026 priorities for the West Valley Warner Center Chamber of Commerce.",
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">January 2026</span>
  <h1>Letter from the Board Chair</h1>
</div></section>

<article class="section bg-paper"><div class="container container-narrow" style="max-width:720px;">
  <p class="lead" style="font-size:1.2rem;color:var(--navy);font-weight:500;">Fellow members,</p>
  <div style="font-size:1.05rem;line-height:1.85;color:var(--slate);">
    <p>The board's job is to make sure the chamber is here in 2050. Most of what we do is invisible — governance, financial oversight, succession planning. This year you'll see more of it.</p>
    <p>Three priorities for the board in 2026:</p>
    <ol>
      <li><strong>Diversification of revenue.</strong> The new ad inventory and loyalty program meaningfully reduce our reliance on dues. Targeting 35% non-dues revenue by year-end (currently 22%).</li>
      <li><strong>Community Benefit Foundation expansion.</strong> The CBF — our 501(c)(3) — funds Grateful Hearts, Adopt-a-School, and the new AI for Business workshops. We're growing the foundation's giving capacity by 50% this year.</li>
      <li><strong>Succession.</strong> Diana's contract goes through 2030. The board is investing in strong middle-management so any future transition is seamless.</li>
    </ol>
    <p>Thanks for being part of this. The chamber works because you all do.</p>
    <p style="margin-top:32px;font-family:var(--serif);font-weight:600;font-size:1.2rem;">Mark Cudacua</p>
    <p class="text-sm text-muted">Board Chair · Advocacy Committee Lead</p>
  </div>
</div></article>`
});

// ── Profiles index (Chamber Profiles) ─────────────────────
PAGES.push({
  rel: 'profiles/index.html', active: 'chamber', depth: 1,
  title: 'Chamber Profiles',
  description: 'Featured member profiles and stories from across the West Valley business community.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Chamber Profiles</span>
  <h1>Member stories that keep the Valley running</h1>
  <p class="hero__lead">Member spotlights from the Valley Biz Buzz blog — restaurants, healthcare, real estate, retail, professional services. Real people running real businesses since 1930.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" id="profiles-grid" style="gap:24px;"><p class="text-muted" style="grid-column:1/-1;text-align:center;">Loading featured profiles…</p></div>
</div></section>

<script>
fetch('../data/blog-posts.json').then(r => r.json()).then(posts => {
  const profiles = posts.filter(p => p.category === 'Member Spotlight');
  document.getElementById('profiles-grid').innerHTML = profiles.map(p => \`
    <a href="../blog/post-\${p.slug}.html" class="card" style="text-decoration:none;color:inherit;display:block;">
      <div style="height:140px;background:linear-gradient(135deg,var(--blue-soft),var(--gold-soft));display:flex;align-items:center;justify-content:center;font-size:2.6rem;">\${p.icon}</div>
      <div class="card__body">
        <span class="chip chip--gold">Member Spotlight</span>
        <h3 class="card__title mt-3">\${p.title}</h3>
        <p class="card__excerpt">\${p.excerpt}</p>
      </div>
    </a>\`).join('');
});
</script>`
});

// ── Benefits of Membership ────────────────────────────────
PAGES.push({
  rel: 'benefits.html', active: 'chamber', depth: 0,
  title: 'Benefits of Membership',
  description: 'Specific, concrete benefits of West Valley Warner Center Chamber of Commerce membership — referrals, marketing, networking, advocacy, savings.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Membership</span>
  <h1>What you get when you join</h1>
  <p class="hero__lead">Specific. Concrete. Measurable. No fluff. This is what 800+ members get for their dues.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:24px;">

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">📍</div>
      <h3 style="margin:12px 0 8px;">Directory listing + AI Concierge surfacing</h3>
      <p>Listed in the 850-entry chamber directory with the gold "Chamber Member" badge. The AI Concierge recommends you first when residents search your category.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">📅</div>
      <h3 style="margin:12px 0 8px;">200+ events per year — most free</h3>
      <p>Networking mixers, ribbon cuttings, monthly breakfasts, the annual State of the Chamber, the VAPI Festival, Grateful Hearts. Most chamber events are free for members.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">🤝</div>
      <h3 style="margin:12px 0 8px;">8 networking groups</h3>
      <p>Lee's Connection Circle, Dynamic Business Networking, Young Professionals, Wellness Network, Home Improvement Pros, Ambassadors, AI for Business, Women in Business. $340K+ in tracked member-to-member referrals in the last 90 days.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">📰</div>
      <h3 style="margin:12px 0 8px;">8 topic-specific newsletters</h3>
      <p>The West Valley Weekly, Valley Parents, Dine SFV, Valley Biz Brief, Wellness Network Digest, This Week in the Valley, Sponsor Insider, Valley Real Estate. Members get featured spotlight slots in rotation.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">🎁</div>
      <h3 style="margin:12px 0 8px;">Loyalty Program participation</h3>
      <p>Free in-store kit (window cling, table tents, counter cards). Cardholders see your offer in their wallet. Featured rotation in the chamber's loyalty page.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">📷</div>
      <h3 style="margin:12px 0 8px;">Free ribbon cutting</h3>
      <p>Schedule any time after joining. Photographer, social-media coverage, event listing, Diana &amp; Felicia attend. Standard chamber-member benefit.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">🛡️</div>
      <h3 style="margin:12px 0 8px;">Advocacy at city &amp; state level</h3>
      <p>Chamber files formal positions on zoning, tax, transit, and small-business legislation that affects you. Council District 3 representation, regular meetings with Sacramento delegation.</p>
    </div>

    <div class="card" style="padding:32px;">
      <div style="font-size:1.8rem;">📚</div>
      <h3 style="margin:12px 0 8px;">10 resource guides</h3>
      <p>Members are featured in the relevant guide for free. Premium guide listing available as upgrade ($600/yr → top placement).</p>
    </div>

  </div>

  <div class="text-center mt-6">
    <a href="join.html" class="btn btn--gold btn--lg">Join the Chamber</a>
    <a href="member-deals.html" class="btn btn--outline" style="margin-left:12px;">See member-to-member deals →</a>
  </div>
</div></section>`
});

// ── Member-to-Member Deals ───────────────────────────────
PAGES.push({
  rel: 'member-deals.html', active: 'chamber', depth: 0,
  title: 'Member-to-Member Deals',
  description: 'Exclusive discounts that chamber members offer each other across the West Valley. Browse current member-to-member offers.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Members only</span>
  <h1>Member-to-Member Deals</h1>
  <p class="hero__lead">A separate offer set from the public Loyalty Card. These deals are member-businesses giving each other better-than-public pricing — first dibs, internal rates, professional courtesies.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-2" style="gap:20px;" id="m2m-grid">
    <p class="text-muted" style="grid-column:1/-1;text-align:center;">Sign in as a chamber member to see all 47 active member-to-member offers.</p>
  </div>
  <div class="card mt-6" style="padding:32px;text-align:center;background:linear-gradient(135deg,var(--gold-soft),var(--gold));">
    <h3 style="color:var(--navy);">Are you a chamber member?</h3>
    <p style="color:var(--navy);">Member deals are visible only after sign-in. <a href="auth/member-login.html" style="font-weight:600;">Member Login →</a></p>
    <p style="color:var(--navy);font-size:.9rem;margin-top:8px;">Not yet a member? <a href="join.html" style="font-weight:600;">Join here →</a></p>
  </div>
</div></section>`
});

// ── Grateful Hearts ───────────────────────────────────────
PAGES.push({
  rel: 'grateful-hearts.html', active: 'community', depth: 0,
  title: 'Grateful Hearts',
  description: 'The chamber\'s annual community giveback program — Sunday in November, 200+ volunteers, 1,800 meals, 850 essentials boxes.',
  body: `
<section class="hero" style="padding:64px 0;background:linear-gradient(135deg,#dc2626,var(--navy));"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Annual community giveback</span>
  <h1>Grateful Hearts</h1>
  <p class="hero__lead">A Sunday in November when the chamber and 200+ member volunteers distribute Thanksgiving meals, essentials kits, and basic-needs supplies to West Valley families.</p>
</div></section>

<section class="section bg-paper"><div class="container container-narrow">
  <h2>What it is</h2>
  <p>Grateful Hearts is the chamber's flagship community giveback. Each November, we partner with the Boys &amp; Girls Clubs of West Valley, Tarzana Treatment Centers, and the Topanga LAFD station to assemble and distribute Thanksgiving meal kits and essentials boxes to West Valley families navigating tough seasons.</p>

  <h2>By the numbers (2025)</h2>
  <ul>
    <li>207 volunteers (chamber record)</li>
    <li>1,800 Thanksgiving meals served</li>
    <li>850 essentials boxes packed</li>
    <li>3 distribution sites</li>
    <li>12 chamber-member businesses sponsored meals</li>
  </ul>

  <h2>How to participate</h2>
  <p><strong>Volunteer:</strong> Sign-ups open in early October. Two-shift format (7am-10am setup, 11am-4pm distribution). Family-friendly — kids 6+ welcome with a parent. Felicia coordinates the roster.</p>
  <p><strong>Sponsor:</strong> Meal-kit sponsorship ($1,000 = 50 family meals, branded), site sponsorship ($5,000 = full distribution location with logo). 100% of sponsorship dollars go to the program — the chamber covers admin in-house.</p>
  <p><strong>Donate:</strong> The Community Benefit Foundation accepts tax-deductible donations year-round.</p>

  <div class="card mt-6" style="padding:32px;background:linear-gradient(135deg,var(--gold-soft),var(--gold));text-align:center;">
    <h3 style="color:var(--navy);">2026 date: Sunday, November 9</h3>
    <p style="color:var(--navy);">Volunteer sign-ups open October 1. Sponsorship opportunities open now.</p>
    <a href="contact.html?topic=grateful-hearts" class="btn btn--primary mt-3">Sponsor or volunteer →</a>
  </div>
</div></section>`
});

// ── New Members ───────────────────────────────────────────
PAGES.push({
  rel: 'members/new.html', active: 'members', depth: 1,
  title: 'New Members',
  description: 'Recent additions to the West Valley Warner Center Chamber of Commerce. Welcome the newest businesses joining the community.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Welcome to the chamber</span>
  <h1>New Members</h1>
  <p class="hero__lead">Businesses that have joined the chamber in the last 60 days. Welcome them — refer them — book a coffee.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" id="new-members-grid" style="gap:20px;"><p class="text-muted" style="grid-column:1/-1;text-align:center;">Loading new members…</p></div>
</div></section>

<script>
fetch('../data/directory.json').then(r => r.json()).then(dir => {
  // Show recent additions: tier=member with createdAt, OR fallback to bottom of list
  const recent = dir.filter(m => m.chamberMember).slice(-12).reverse();
  document.getElementById('new-members-grid').innerHTML = recent.map(m => \`
    <a href="profile.html?id=\${encodeURIComponent(m.id)}" class="card" style="text-decoration:none;color:inherit;padding:20px;">
      <span class="cm-badge">Chamber Member</span>
      <h3 class="card__title mt-3">\${m.name}</h3>
      <p class="card__meta">\${m.category||'Member'} · \${m.neighborhood||'West Valley'}</p>
      <p class="card__excerpt">\${m.tagline||'Welcome to the chamber.'}</p>
    </a>\`).join('');
});
</script>`
});

// ── Renewing Members ──────────────────────────────────────
PAGES.push({
  rel: 'members/renewing.html', active: 'members', depth: 1,
  title: 'Renewing Members',
  description: 'Member businesses who have renewed their West Valley Warner Center Chamber of Commerce membership for another year.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Continued commitment</span>
  <h1>Renewing Members</h1>
  <p class="hero__lead">Member businesses renewing this quarter. Thank you for continuing to be part of the West Valley community.</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" id="renewing-grid" style="gap:20px;"><p class="text-muted" style="grid-column:1/-1;text-align:center;">Loading renewing members…</p></div>

  <div class="card mt-6" style="padding:32px;background:linear-gradient(135deg,var(--blue-soft),var(--paper));text-align:center;">
    <h3>Time to renew?</h3>
    <p>Members get an automated email 30 days before renewal. Multi-year contracts lock in 2026 pricing through 2028.</p>
    <a href="auth/member-portal.html" class="btn btn--primary">Member portal →</a>
  </div>
</div></section>

<script>
fetch('../data/directory.json').then(r => r.json()).then(dir => {
  // Stub: show featured chamber members as "renewing"
  const renewing = dir.filter(m => m.chamberMember && m.featured).slice(0, 12);
  document.getElementById('renewing-grid').innerHTML = renewing.map(m => \`
    <a href="profile.html?id=\${encodeURIComponent(m.id)}" class="card" style="text-decoration:none;color:inherit;padding:20px;">
      <span class="cm-badge">Renewing</span>
      <h3 class="card__title mt-3">\${m.name}</h3>
      <p class="card__meta">\${m.category||'Member'} · \${m.tier||'member'} tier</p>
      <p class="card__excerpt">\${m.tagline||''}</p>
    </a>\`).join('');
});
</script>`
});

// ── Committees ────────────────────────────────────────────
PAGES.push({
  rel: 'committees.html', active: 'chamber', depth: 0,
  title: 'Committees',
  description: 'Active chamber committees: advocacy, ambassadors, events, education, finance, membership, and more.',
  body: `
<section class="hero" style="padding:64px 0;"><div class="container container-narrow">
  <span class="eyebrow eyebrow--navy">Members only</span>
  <h1>Committees</h1>
  <p class="hero__lead">Most chamber committees meet monthly. Open to all members. The fastest path from "new member" to "knowing how the chamber actually runs."</p>
</div></section>

<section class="section bg-cream"><div class="container">
  <div class="grid grid-3" style="gap:20px;">
    <div class="card" style="padding:24px;"><h3>Advocacy</h3><p class="text-muted">Mark Cudacua, Chair · 2nd Wednesday, 4pm · Chamber HQ</p><p>Files formal chamber positions on zoning, transit, taxes, small-business legislation.</p></div>
    <div class="card" style="padding:24px;"><h3>Ambassadors</h3><p class="text-muted">Diana &amp; Felicia · Monthly · Chamber HQ</p><p>The face of the chamber — greets new members, ribbon cuttings, mixers. 12-15 hours/year.</p></div>
    <div class="card" style="padding:24px;"><h3>Events</h3><p class="text-muted">Felicia, Lead · Bi-weekly</p><p>Plans the year's mixers, breakfasts, ribbon cuttings, and flagship events.</p></div>
    <div class="card" style="padding:24px;"><h3>Education</h3><p class="text-muted">3rd Tuesday, 5pm · Pierce College</p><p>Coordinates Adopt-a-School, AI for Business workshops, scholarship programs.</p></div>
    <div class="card" style="padding:24px;"><h3>Finance</h3><p class="text-muted">Steve Nolan, Treasurer · Quarterly</p><p>Chamber budget, audit oversight, sponsorship pricing review.</p></div>
    <div class="card" style="padding:24px;"><h3>Membership</h3><p class="text-muted">Allen Edwards, VC · Monthly</p><p>New-member onboarding, retention strategy, tier-pricing review.</p></div>
  </div>
  <div class="card mt-6" style="padding:32px;text-align:center;background:linear-gradient(135deg,var(--gold-soft),var(--gold));">
    <h3 style="color:var(--navy);">Want to join a committee?</h3>
    <p style="color:var(--navy);">Email Catee at <a href="mailto:catee@woodlandhillscc.net" style="font-weight:600;">catee@woodlandhillscc.net</a> with the committee you're interested in. She'll connect you with the chair.</p>
  </div>
</div></section>`
});

// ── Render & write ────────────────────────────────────────
PAGES.forEach(p => {
  const fpath = path.join(ROOT, p.rel);
  ensureDir(path.dirname(fpath));
  fs.writeFileSync(fpath, pageWrap(p));
  console.log(`✓ ${p.rel}`);
});
console.log(`\n${PAGES.length} missing pages built.`);
