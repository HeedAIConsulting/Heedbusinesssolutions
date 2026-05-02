#!/usr/bin/env node
/**
 * build-community-pages.js — Generates the 4 neighborhood subpages
 * (Tarzana, Woodland Hills, Reseda, Warner Center) plus the West Valley
 * overview, all under /community/.
 *
 * Run:  node scripts/build-community-pages.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const COMM = path.join(ROOT, 'community');
if (!fs.existsSync(COMM)) fs.mkdirSync(COMM, { recursive: true });

const NEIGHBORHOODS = [
  {
    slug: 'tarzana', name: 'Tarzana', accent: '#7c3aed',
    population: '37,000+', founded: '1928 (named for Tarzan author Edgar Rice Burroughs)',
    headline: 'A walkable Ventura corridor, the chamber\'s heart since 1930.',
    intro: 'Tarzana sits on the south face of the West Valley between Encino and Reseda, anchored by the Ventura Boulevard corridor. Edgar Rice Burroughs, the creator of Tarzan, named the community when he subdivided his ranch here in 1928. Today Tarzana is the West Valley\'s most walkable village — boutiques, family restaurants, medical offices, and the chamber\'s historic membership base.',
    landmarks: ['Providence Cedars-Sinai Tarzana Medical Center','Tarzana Recreation Center','El Caballero Country Club','Edgar Rice Burroughs Inc. (still based here)','The Ventura Blvd retail corridor'],
    keyMembers: ['Providence Cedars-Sinai Tarzana','Tarzana Family Dental','Ring Planet','Allegra Music Academy','Tarzana Treatment Centers'],
    voice: 'Tarzana is where the chamber holds Lee\'s Connection Circle, our oldest networking group. It\'s the kind of place where the Saturday-morning walking loop hits six chamber members.'
  },
  {
    slug: 'woodland-hills', name: 'Woodland Hills', accent: '#0e7490',
    population: '76,000+', founded: '1922',
    headline: 'The West Valley\'s commercial center — and the chamber\'s home.',
    intro: 'Woodland Hills is the largest community in the West Valley, stretching from the Ventura corridor north into Warner Center and west to Topanga Canyon. It\'s home to the chamber\'s headquarters, the Westfield Topanga shopping center, and the Warner Center business district.',
    landmarks: ['Westfield Topanga & The Village','Warner Center 2035 development zone','Woodland Hills Country Club','The Promenade','Pierce College'],
    keyMembers: ['Westfield','Warner Center Marriott','WH Camera & Telescopes','Fogo de Chão','Beauty Skin Glow'],
    voice: 'When the chamber says "the Valley," Woodland Hills is usually the first image that comes to mind. Our biggest events — the Halloween Boo Bash, the Holiday Open House — happen here at Westfield.'
  },
  {
    slug: 'reseda', name: 'Reseda', accent: '#16a34a',
    population: '74,000+', founded: '1912',
    headline: 'Diverse, dense, and full of the family-owned businesses that built the West Valley.',
    intro: 'Reseda runs north-south through the heart of the West Valley along Reseda Boulevard. It\'s the most ethnically diverse community in our service area — Persian, Armenian, Korean, Latino, and Filipino businesses cluster along Reseda and Sherman Way — and one of the densest by chamber-member count per capita.',
    landmarks: ['Reseda Park','Reseda Boulevard transit corridor','Cleveland Charter High School','The Reseda Theatre (historic)','LAPD Topanga Division'],
    keyMembers: ['The Drain Co.','Antonia Reyes Law P.C.','Habit Cafe','Citywide Law Group','9Round Kickboxing'],
    voice: 'Reseda is where the chamber\'s Adopt-a-School program operates and where a lot of our most active small-business owners run their shops. The Sherman Way streetscape grant in 2026 was the chamber\'s biggest Reseda win in a decade.'
  },
  {
    slug: 'warner-center', name: 'Warner Center', accent: '#dc2626',
    population: 'Daytime population: 80,000+ workers', founded: '1979 (Warner Ranch master plan)',
    headline: 'The West Valley\'s urban core — towers, hotels, and the future of the neighborhood.',
    intro: 'Warner Center is technically a sub-area of Woodland Hills but functions as its own neighborhood — the West Valley\'s only high-rise district, anchored by office towers, the Marriott, the Promenade, and a steadily growing residential population from the 2035 specific plan.',
    landmarks: ['Warner Center Marriott','The Promenade (post-redevelopment)','Anthem Blue Cross HQ','21st Century Insurance HQ','The Wisteria & Westgate residential towers'],
    keyMembers: ['Warner Center Marriott','Hilton Woodland Hills','Anthem Blue Cross','Wisteria Warner Center','Douglas Emmett'],
    voice: 'Warner Center is where the chamber\'s biggest sponsorship dollars live — the office towers, the hotels, the institutional members. The 2035 plan is reshaping the area into a true 24/7 mixed-use district.'
  },
  {
    slug: 'west-valley', name: 'West Valley', accent: '#0B2545',
    population: '~250,000 residents · 800+ chamber-member businesses', founded: 'Chamber chartered 1930',
    headline: 'The whole region the chamber serves — five neighborhoods, one community.',
    intro: 'The "West Valley" is shorthand for the West San Fernando Valley — the area west of the 405 freeway, north of the Santa Monica Mountains, south of the 118, and east of the Ventura/LA County line. Tarzana, Woodland Hills, Reseda, Warner Center, and Encino make up the chamber\'s primary service area.',
    landmarks: ['Westfield Topanga','Warner Center','Pierce College','Topanga State Park (south rim)','Sepulveda Basin (east edge)'],
    keyMembers: ['UCLA Health','MPTF','Westfield','Providence Tarzana','Boys & Girls Clubs of West Valley'],
    voice: 'Five distinct neighborhoods, one regional identity. The chamber has been the connective tissue since 1930 — the place where the developer of Warner Center and the family-restaurant owner in Reseda end up sitting at the same table.'
  }
];

function pageHTML(n) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${n.name} · West Valley Warner Center Chamber of Commerce</title>
<meta name="description" content="${n.intro.slice(0, 155).replace(/"/g, '&quot;')}…">
<meta property="og:title" content="${n.name} · West Valley Chamber of Commerce">
<meta property="og:description" content="${n.headline}">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<meta property="og:url" content="https://www.woodlandhillscc.net/community/${n.slug}.html">
<link rel="canonical" href="https://www.woodlandhillscc.net/community/${n.slug}.html">
<script type="application/ld+json">
{ "@context":"https://schema.org","@type":"Place",
  "name":"${n.name}",
  "description":"${n.intro.replace(/"/g, '\\"')}",
  "containedInPlace":{"@type":"AdministrativeArea","name":"San Fernando Valley, Los Angeles County, CA"} }
</script>
<link rel="icon" href="../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css">
</head>
<body>
<header data-partial="header"></header>

<section class="hero" style="background:linear-gradient(135deg, ${n.accent}, var(--navy));">
  <div class="container">
    <div class="hero__inner" style="grid-template-columns:1.4fr 1fr;align-items:center;">
      <div>
        <span class="eyebrow eyebrow--navy">Our Community</span>
        <h1>${n.name}</h1>
        <p class="hero__lead" style="margin-bottom:24px;">${n.headline}</p>
        <div class="hero__actions">
          <a href="../members/directory.html?neighborhood=${encodeURIComponent(n.name)}" class="btn btn--gold btn--lg">See ${n.name} chamber members</a>
          <a href="../guides/cityloop.html" class="btn btn--outline btn--lg" style="border-color:rgba(255,255,255,0.5);color:#fff;">Browse local guide</a>
        </div>
      </div>
      <div class="card" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);padding:24px;color:#fff;">
        <div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);">Population</div>
        <div style="font-family:var(--serif);font-size:1.6rem;font-weight:700;color:var(--gold);">${n.population}</div>
        <div style="margin-top:18px;border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;">
          <div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);">Founded</div>
          <div style="color:rgba(255,255,255,0.85);font-size:.95rem;margin-top:4px;">${n.founded}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section bg-paper">
  <div class="container container-narrow">
    <h2>About ${n.name}</h2>
    <p class="lead">${n.intro}</p>
    <p style="margin-top:16px;color:var(--slate-mid);font-style:italic;">${n.voice}</p>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div class="grid grid-2" style="gap:48px;align-items:start;">
      <div>
        <span class="eyebrow">Landmarks &amp; anchors</span>
        <h2>What defines ${n.name}</h2>
        <ul style="list-style:none;padding:0;margin-top:16px;">
          ${n.landmarks.map(l => `<li style="padding:12px 0;border-top:1px solid var(--line-soft);">📍 ${l}</li>`).join('')}
        </ul>
      </div>
      <div>
        <span class="eyebrow">Featured chamber members in ${n.name}</span>
        <h2>Who you'll find here</h2>
        <ul style="list-style:none;padding:0;margin-top:16px;">
          ${n.keyMembers.map(m => `<li style="padding:12px 0;border-top:1px solid var(--line-soft);"><span class="cm-badge" style="margin-right:8px;">Chamber Member</span> ${m}</li>`).join('')}
        </ul>
        <a href="../members/directory.html?neighborhood=${encodeURIComponent(n.name)}" class="btn btn--primary mt-4">All ${n.name} members ›</a>
      </div>
    </div>
  </div>
</section>

<section class="section bg-navy">
  <div class="container">
    <div class="grid grid-3" style="gap:24px;">
      <a href="../guides/cityloop.html" class="card" style="text-decoration:none;color:inherit;padding:28px;background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);">
        <div style="font-size:2rem;color:var(--gold);">🏙️</div>
        <h3 style="margin:12px 0 8px;color:#fff;">CityLoop guide</h3>
        <p style="color:rgba(255,255,255,0.78);">The everything-finder — search ${n.name} businesses, services, events.</p>
      </a>
      <a href="../events/index.html" class="card" style="text-decoration:none;color:inherit;padding:28px;background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);">
        <div style="font-size:2rem;color:var(--gold);">📅</div>
        <h3 style="margin:12px 0 8px;color:#fff;">${n.name} events</h3>
        <p style="color:rgba(255,255,255,0.78);">Mixers, ribbon cuttings, festivals — all the chamber dates near you.</p>
      </a>
      <a href="../ai-concierge.html" class="card" style="text-decoration:none;color:inherit;padding:28px;background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);">
        <div style="font-size:2rem;color:var(--gold);">🤖</div>
        <h3 style="margin:12px 0 8px;color:#fff;">Ask the Concierge</h3>
        <p style="color:rgba(255,255,255,0.78);">"Best dim sum in ${n.name}?" "Pediatrician taking new patients?" — just ask.</p>
      </a>
    </div>
  </div>
</section>

<footer data-partial="footer"></footer>
<script src="../js/partials.js"></script>
<script src="../js/chamber.js"></script>
<script>ChamberPartials.mount({ active: 'community', depth: 1 });</script>
</body>
</html>`;
}

NEIGHBORHOODS.forEach(n => {
  fs.writeFileSync(path.join(COMM, n.slug + '.html'), pageHTML(n));
  console.log(`✓ community/${n.slug}.html`);
});
console.log(`\n${NEIGHBORHOODS.length} community subpages built.`);
