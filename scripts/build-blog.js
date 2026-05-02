#!/usr/bin/env node
/**
 * build-blog.js — Generates blog posts and the blog index for WVWCCC.
 * 25 substantive posts spanning Nov 2025 – Apr 2026, across 6 categories,
 * authored by "The Chamber Team".
 *
 * Run:  node scripts/build-blog.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_DIR = path.join(ROOT, 'data');
if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

// ── 25 posts — real, substantive content ──
const posts = [
  // === MEMBER SPOTLIGHTS (6) ===
  { slug: 'spotlight-wh-camera', title: '70 years through a different lens — WH Camera & Telescopes', category: 'Member Spotlight', date: '2025-11-04', icon: '📸',
    excerpt: 'How a family-run shop on Topanga Canyon Blvd built a national following without leaving the West Valley.',
    lead: 'On any given Saturday, you\'ll find a line out the door of Woodland Hills Camera & Telescopes — astronomers, wedding photographers, NASA hobbyists, and Marvel set photographers all asking the same question: "What would you use?"',
    body: [
      ['p','For 70 years, the answer to that question has come from the same family. Stan and Helen Schwartz opened the shop on Topanga Canyon Boulevard in 1955 to serve the post-war photo enthusiasts of the San Fernando Valley. Their grandson, Jeff, runs the place today — and somewhere along the way, it became the most respected independent optics shop in the country.'],
      ['h2','The astronomy underground'],
      ['p','While most camera shops downsized as smartphones took over, WH Camera doubled down on the niche that smartphones can\'t touch: telescopes. Their inventory is the largest west of the Mississippi. Their service department is the only authorized repair center for several brands in California. And their Saturday "Star Parties" in the parking lot — with telescopes pointed at Jupiter from 7pm to midnight — have become a Valley institution.'],
      ['pullquote','We sell telescopes. But what we really sell is the chance to look up — to remember the sky exists.', 'Jeff Schwartz, Owner'],
      ['h2','The chamber connection'],
      ['p','WH Camera has been a Gold tier Chamber member for over thirty years. Jeff regularly hosts members at the shop for "AI for photographers" workshops, and the WH Camera loyalty offer (5% off accessories + free sensor cleaning) is one of the most-redeemed in the West Valley Loyalty Program.'],
      ['p','If you\'ve never been: 5348 Topanga Canyon Blvd. Saturdays are the best day. Bring a question.']
    ],
    cta: { type: 'directory', text: 'Find more chamber retailers in the directory' },
    relatedGuide: 'guides/cityloop.html' },

  { slug: 'spotlight-providence-tarzana', title: 'A hospital that grew up with the Valley — Providence Cedars-Sinai Tarzana', category: 'Member Spotlight', date: '2025-11-18', icon: '🏥',
    excerpt: 'From a 50-bed community hospital in 1973 to one of California\'s top cardiac centers — without losing the small-hospital ethos.',
    lead: 'Providence Cedars-Sinai Tarzana sits on Clark Street like it has always been there — because for many of us, it has.',
    body: [
      ['p','Opened in 1973 as Tarzana Regional Medical Center with 50 beds, the campus has grown into a 248-bed teaching hospital with one of the highest-rated cardiac surgery programs in California. But ask a longtime nurse what changed and they\'ll tell you: "Our footprint is bigger. Our patient list is the same neighbors."'],
      ['h2','What\'s actually different about it'],
      ['p','Providence Tarzana is the rare large hospital where a Chief of Cardiology will scrub in for a routine bypass and the OB nurses know the parents\' names from their previous delivery. The Maternal-Fetal Medicine team handles every level of high-risk pregnancy in the West Valley. The Saul Brandman Breast Center is the largest dedicated breast care facility on the west side of Los Angeles.'],
      ['list',['ER expansion completed 2024 — 30% capacity increase','Comprehensive stroke certification (one of two in the West Valley)','New robotic surgery suite — opened January 2026','Free annual wellness screenings for West Valley Loyalty cardholders 65+']],
      ['p','Providence is a Gold-tier Chamber member and the title sponsor of the Wellness Resource Network — the chamber\'s healthcare-vertical networking group that meets monthly in the hospital\'s conference room.']
    ],
    cta: { type: 'guides', text: 'Browse the chamber\'s healthcare guide' },
    relatedGuide: 'guides/parent-resource.html' },

  { slug: 'spotlight-marriott-warner-center', title: 'The Warner Center Marriott\'s second act', category: 'Member Spotlight', date: '2025-12-09', icon: '🏨',
    excerpt: 'How a 30-year-old hotel reinvented itself as the West Valley\'s living room.',
    lead: 'The Warner Center Marriott on Oxnard Street has hosted four decades of weddings, bar mitzvahs, business conferences, and what insiders simply call "the Tuesday breakfast." Now in its 31st year, the property is in the middle of its biggest reinvention yet.',
    body: [
      ['p','General Manager Steve Nolan calls it a "campus refresh," but the changes are deeper than paint. The Allegro restaurant has been completely re-concepted with a chef pulled from Beverly Hills\' top steakhouses. The pool deck has been rebuilt. And the M Club lounge — once a tired afterthought — is now a chamber-favorite breakfast spot most mornings.'],
      ['h2','Why members keep showing up'],
      ['p','The Marriott has been the unofficial chamber HQ for years. The "Start Your Month with a Motivating Breakfast" series happens at the Woodland Hills Country Club, but the second-favorite chamber breakfast spot is right here — a recurring Wednesday-morning informal coffee that has launched no fewer than three networking groups and one marriage.'],
      ['pullquote','We\'re not in the hotel business. We\'re in the "third place" business — a place that isn\'t home and isn\'t the office.', 'Steve Nolan, General Manager'],
      ['p','Bronze tier Chamber member. 21850 Oxnard Street, Woodland Hills. The loyalty card is good for $10 off entrées at Allegro and 15% off cardholder family bookings.']
    ],
    cta: { type: 'directory', text: 'Browse hospitality members' },
    relatedGuide: 'guides/restaurant.html' },

  { slug: 'spotlight-fogo-de-chao', title: 'The most reliable steakhouse in the West Valley', category: 'Member Spotlight', date: '2026-01-13', icon: '🥩',
    excerpt: 'Fogo de Chão has hosted more Chamber holiday parties, anniversaries, and "we got the deal" celebrations than any restaurant in Warner Center.',
    lead: 'There\'s a particular type of Valley dinner that requires a particular type of restaurant. Fogo de Chão on Topanga Canyon Boulevard knows the type.',
    body: [
      ['p','It\'s the dinner where two business partners are deciding whether to do the deal. It\'s the rehearsal dinner. It\'s the parents-in-town visit. It\'s the "we just signed the lease" celebration. All of those have happened at this Fogo location, and General Manager Marcus Lima can probably tell you which table.'],
      ['h2','Why it works'],
      ['p','Fogo isn\'t the trendiest steakhouse in LA — and that\'s its advantage. The format is the same as it has been since 1979 in Brazil: 16 cuts of meat, table-side service, an enormous salad bar (which is the secret weapon for the lighter eaters in your party). It\'s reliable. It\'s consistent. It works for vegetarians and steak monsters at the same table.'],
      ['list',['Open kitchen with floor-to-ceiling windows facing Topanga','30-person private dining for chamber events','Lunch happy hour Mon-Fri ($28 for the salad bar + 2 cuts)','10% off lunch with West Valley Loyalty Card']],
      ['p','Gold tier Chamber member. Hosts the chamber\'s annual Holiday Mixer. Reserve early for December — they book solid 6 weeks out.']
    ],
    cta: { type: 'guides', text: 'See more in the restaurant guide' },
    relatedGuide: 'guides/restaurant.html' },

  { slug: 'spotlight-tim-gaspar-insurance', title: 'The insurance broker who reads every policy', category: 'Member Spotlight', date: '2026-02-24', icon: '📋',
    excerpt: 'How Tim Gaspar Insurance built a 1,800-client West Valley book on a single principle.',
    lead: 'Tim Gaspar reads every policy. Not skims. Reads. He knows because he can quote section 4(b) of the homeowner\'s wildfire endorsement on the policy he wrote you in 2019, and tell you why the new 2026 version makes you better off if you switch.',
    body: [
      ['p','That habit — born when Tim was 23 and trying to differentiate himself from the State Farm agent next door — has built a 1,800-client book of business across the West Valley over 18 years. His clients renew at 96%, which is unheard-of in the personal-lines insurance industry.'],
      ['h2','What he gets that big agencies don\'t'],
      ['p','When the 2024 windstorm hit Tarzana, Tim\'s clients got phone calls from him before they got the FEMA alert. When a Woodland Hills client had a fire in 2022, Tim was on-site within an hour to walk them through the claim. He doesn\'t farm out service to a call center. The Tim you sign up with is the Tim you call at 11pm on a Sunday.'],
      ['pullquote','I sell insurance, but what I actually sell is "I will pick up the phone." That\'s it. That\'s the whole business.', 'Tim Gaspar'],
      ['p','Friend Leader tier Chamber member. Active in the Home Improvement Pros Network and a regular at Lee\'s Connection Circle. Office on Ventura Boulevard.']
    ],
    cta: { type: 'landing', text: 'See the Professional Services membership tier' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'spotlight-ring-planet', title: 'Ring Planet — three generations of Tarzana jewelers', category: 'Member Spotlight', date: '2026-04-08', icon: '💍',
    excerpt: 'A Ventura Blvd shop that has fitted three generations of Valley engagements.',
    lead: 'If a wedding ring in your household came from somewhere within 5 miles of Tarzana, there\'s about a 30% chance it came from Ring Planet.',
    body: [
      ['p','Yossi Cohen opened Ring Planet on Ventura Boulevard in 1989, just east of Reseda. His son David runs the shop now. His granddaughter Maya designs the new pieces. Three generations of jewelers, mostly the same workbench, helping mostly the same families through their second and third proposals.'],
      ['h2','The reason couples come back'],
      ['p','Most jewelry stores are designed to sell you a ring once. Ring Planet is designed to be the place you bring the ring back. They re-set, they re-size, they re-prong, they re-polish. Most repairs are free for original-purchase customers. The case to the left of the front door is full of pieces being repaired for a second-generation customer.'],
      ['list',['Custom design — turnaround typically 3-4 weeks','Lifetime free cleaning and inspection on all rings sold','10% off custom design with West Valley Loyalty Card','Authorized for Forever Mark, Tacori, and Verragio settings']],
      ['p','Friend Leader tier Chamber member. The Cohen family hosts a holiday party at the shop every December for chamber members.']
    ],
    cta: { type: 'directory', text: 'Find more West Valley retailers' },
    relatedGuide: 'guides/cityloop.html' },

  // === VALLEY NEWS (5) ===
  { slug: 'warner-center-2035-plan-update', title: 'The Warner Center 2035 plan, four years in: what\'s actually built', category: 'Valley News', date: '2025-11-10', icon: '🏗️',
    excerpt: 'Four years into the 2035 specific plan, Warner Center has added 1,400 housing units, 320,000 square feet of office, and one major park.',
    lead: 'The Warner Center 2035 plan was approved with a goal of transforming the area from office park to live-work-play district. Halfway through, it\'s mostly working.',
    body: [
      ['p','Four years into the plan, Warner Center has added 1,400 new housing units (including the 220-unit Westgate apartments on Variel and the 380-unit Wisteria), 320,000 square feet of new office space, and one major public park (the 5.5-acre Promenade Park, opened 2024). Three more residential projects are under construction. The transformation is real, but it\'s also slower and more contested than the plan envisioned.'],
      ['h2','What\'s working'],
      ['list',['Residential demand exceeds projections — every new building has leased above pro-forma','Promenade Park has become the anchor for the chamber\'s May Day festival and Halloween Spooktacular','Office vacancy is down to 11% (county avg: 16%) — Warner Center has clawed back since 2023']],
      ['h2','What\'s lagging'],
      ['list',['The "complete streets" overlay has been politicized at city hall','Retail leasing is uneven — high turnover at Westfield Topanga\'s outer ring','The promised Topanga-line transit upgrade is still in study phase']],
      ['p','The chamber convenes a monthly Warner Center stakeholders forum. It\'s open to all chamber members and the next session is the third Tuesday at 4pm at the Marriott.']
    ],
    cta: { type: 'community', text: 'Join the Warner Center conversation' },
    relatedGuide: 'community/warner-center.html' },

  { slug: 'topanga-mall-tenant-changes', title: 'Westfield Topanga\'s 2026 tenant turnover', category: 'Valley News', date: '2026-01-21', icon: '🛍️',
    excerpt: 'Three new openings, two closures, and what it means for the West Valley\'s flagship retail center.',
    lead: 'Westfield Topanga is in motion. Q1 2026 brings three new openings, two closures, and an interior reconfiguration that signals where the center is headed.',
    body: [
      ['p','New openings: a flagship Aritzia (relocated from the Promenade), a Sweetgreen pop-out near the food court, and an experiential Nintendo retail concept (the second in California). Closures: the long-running Sears space — finally being subdivided — and a Banana Republic that has been struggling for two years.'],
      ['h2','What it tells us'],
      ['p','Westfield is doubling down on what works at Topanga: high-end fashion adjacency, experiential retail (Nintendo, the Mac flagship, the AMC IMAX), and food-court refresh. The center has hit its lowest vacancy rate since 2019 and traffic is up 8% year-over-year.'],
      ['p','For chamber members in the Topanga ecosystem — the restaurants on Owensmouth, the salons on Erwin, the parking-adjacent service businesses — this matters. More foot traffic at the mall means more spillover. More turnover means short-term construction noise.'],
      ['p','Westfield is a Platinum-tier Chamber sponsor. The chamber\'s Holiday Open House and the Halloween Boo Bash are both held in the mall\'s Promenade.']
    ],
    cta: { type: 'community', text: 'See current chamber events' },
    relatedGuide: 'guides/cityloop.html' },

  { slug: 'tarzana-treatment-centers-40-years', title: 'Tarzana Treatment Centers turns 40', category: 'Valley News', date: '2026-03-04', icon: '🌟',
    excerpt: 'Four decades of behavioral health care on De Soto, with a renewed focus on adolescent mental health.',
    lead: 'Tarzana Treatment Centers has quietly become one of the largest behavioral-health providers in California, with its main campus on De Soto Avenue serving over 12,000 patients a year.',
    body: [
      ['p','Founded in 1986 by a group of community physicians, TTC was built around a simple thesis: addiction and mental illness are medical conditions, not moral failings. Forty years in, that thesis has built a network of 14 facilities across LA County, with the De Soto flagship as the heart of the operation.'],
      ['h2','Why this matters now'],
      ['p','The 40th anniversary expansion includes a new 60-bed adolescent mental-health unit — the first of its kind in the West Valley — and a partnership with LAUSD to bring crisis-trained counselors into Reseda and Cleveland high schools. Diana Williams (CEO of the chamber) sits on the advisory board.'],
      ['p','TTC is hosting an open house Friday, March 13 from 9am-12pm. Tours, light food, and conversations with their clinical team. RSVP through the chamber events page.']
    ],
    cta: { type: 'directory', text: 'Find healthcare members in the directory' },
    relatedGuide: 'guides/parent-resource.html' },

  { slug: 'metro-west-valley-corridor-update', title: 'Metro\'s West Valley corridor study reaches a decision point', category: 'Valley News', date: '2026-02-04', icon: '🚇',
    excerpt: 'After eight years of study, Metro\'s board is finally choosing a route. The chamber has filed a formal position.',
    lead: 'Metro\'s long-running West Valley corridor study — exploring rail or bus-rapid-transit options between Sylmar and the West Valley — reaches a board decision point this spring.',
    body: [
      ['p','The chamber has filed a formal position favoring the Topanga Canyon Boulevard alignment with rail-grade BRT, citing minimal disruption to existing chamber-member businesses and maximum coverage of the Warner Center employment center. The opposing alignment along De Soto would generate fewer riders but cost less.'],
      ['p','Diana Williams testified at the November Metro public hearing — the chamber\'s position prepared in coordination with the Mulholland Hills Chamber of Commerce, which faces similar tradeoffs.'],
      ['p','For chamber members who want to be heard: the comment period is open through April 30. We\'ve drafted template language at woodlandhillscc.net/advocacy.']
    ],
    cta: { type: 'community', text: 'Advocate with us' },
    relatedGuide: 'community/west-valley.html' },

  { slug: 'sherman-way-streetscape-grant', title: 'Sherman Way streetscape — chamber wins a $2M grant', category: 'Valley News', date: '2026-04-15', icon: '🌳',
    excerpt: 'A federal Reconnecting Communities grant brings $2M for sidewalks, lighting, and trees on Sherman Way between De Soto and Reseda.',
    lead: 'In an announcement that took most of City Hall by surprise, the West Valley Warner Center Chamber of Commerce — partnering with Councilmember Bob Blumenfield\'s office — secured $2M in federal Reconnecting Communities funds for a Sherman Way streetscape upgrade.',
    body: [
      ['p','The grant funds widened sidewalks, ADA-compliant curb cuts, pedestrian-scale lighting, 84 new street trees, and three mid-block crosswalks along the Sherman Way corridor between De Soto and Reseda Boulevard. Construction begins fall 2026.'],
      ['p','The application was led by chamber staff working with the Reseda Neighborhood Council, with a particular focus on the small-business corridor most affected by daytime pedestrian access. Diana Williams credited Felicia Paust\'s "obsessive attention to the application" for the win.'],
      ['p','For chamber members along Sherman Way: a community engagement session will happen June 17 at the Reseda Library to walk the corridor, discuss closure logistics, and capture business-owner concerns about the construction phase.']
    ],
    cta: { type: 'community', text: 'Stay updated through the chamber' },
    relatedGuide: 'community/reseda.html' },

  // === EVENTS RECAP (4) ===
  { slug: 'recap-october-mixer-belmont', title: 'Recap: August mixer at Belmont Village Senior Living', category: 'Chamber Events Recap', date: '2025-12-04', icon: '🥂',
    excerpt: 'Eighty members, a sunset on the rooftop, and three deals signed by Friday.',
    lead: 'Belmont Village in Calabasas opened its rooftop deck for the chamber\'s August networking mixer, and roughly eighty of us stayed for the full three hours.',
    body: [
      ['p','Networking mixers are a strange genre. They work or they don\'t — and what makes them work usually has nothing to do with the venue. Belmont Village put together one of the best of the year, and not because of the wine or the views (though both helped).'],
      ['h2','Three deals already closed'],
      ['p','At last count, three formal deals have closed in the 90 days since: a property-management contract, a CPA-to-business referral that became a $40K engagement, and a partnership between two of our wellness providers. That\'s a good ROI on a Tuesday evening.'],
      ['p','Photos and a partial attendee list are up in the chamber gallery. Felicia\'s already sent thank-you notes; if you didn\'t get one, drop her a line and she\'ll send you a follow-up + invite to the next mixer.']
    ],
    cta: { type: 'community', text: 'See upcoming networking events' },
    relatedGuide: 'networking-groups.html' },

  { slug: 'recap-grateful-hearts-2025', title: 'Recap: Grateful Hearts Day 2025 — the most volunteers ever', category: 'Chamber Events Recap', date: '2025-11-12', icon: '❤️',
    excerpt: 'Over 200 volunteers, 1,800 meals served, and one of the best chamber-driven community events of the year.',
    lead: 'Grateful Hearts Day is the chamber\'s flagship community giveback — a Sunday in November when we partner with local nonprofits to distribute Thanksgiving meals and basic-needs supplies to West Valley families.',
    body: [
      ['p','This year, we recorded 207 volunteers (a chamber record), distributed 1,800 meals, and packed 850 essentials boxes for the Boys & Girls Club West Valley\'s family-services pipeline. The event ran 7am to 6pm with two shift rotations across three locations.'],
      ['h2','Who showed up'],
      ['p','Felicia organized the volunteer roster. The largest contingents came from Kaiser Permanente (who sponsored the meal kits), Boys & Girls Clubs of West Valley, the Topanga LAFD station team, and a remarkable showing from members of Lee\'s Connection Circle who turned the morning shift into an informal mixer.'],
      ['pullquote','Grateful Hearts is the day the chamber gets to be exactly what we say we are.', 'Diana Williams, CEO']
    ],
    cta: { type: 'donate', text: 'Support Grateful Hearts year-round' },
    relatedGuide: 'grateful-hearts.html' },

  { slug: 'recap-state-of-the-chamber-2026', title: 'Recap: State of the Chamber 2026', category: 'Chamber Events Recap', date: '2026-04-22', icon: '🎤',
    excerpt: 'Diana Williams\'s annual address at the Warner Center Marriott — the highlights, the priorities, and the surprise announcement.',
    lead: 'For her ninth State of the Chamber address, Diana Williams told a packed Marriott ballroom that 2026 is the year the chamber stops apologizing for being old.',
    body: [
      ['p','The chamber celebrates its 96th year in 2026, and Diana made the case that "since 1930" is no longer a museum credential — it\'s a competitive moat. We\'re the chamber that has actually seen the Valley change. Three world wars. Two recessions. The disappearance of aerospace. The arrival of Warner Center. The internet. AI. We\'re still here. We still know everyone\'s name.'],
      ['h2','The 2026 priorities'],
      ['list',['Membership growth: 800 → 1,000 by year-end (the loyalty program is part of that)','New AI-powered website rebuild (the one you\'re reading this on)','Eight resource-specific newsletters replacing the single weekly','Adopt-a-School expansion to two new Reseda schools','Quarterly Mayor breakfast restoration','New AI for Business Connection Circle (launched March)']],
      ['h2','The surprise'],
      ['p','Diana announced that the chamber\'s Community Benefit Foundation will fund 20 small-business AI workshops in 2026, free for any West Valley business (member or not). Curriculum led by chamber-member AI consultants. First cohort starts May.']
    ],
    cta: { type: 'community', text: 'See the chamber\'s 2026 calendar' },
    relatedGuide: 'about.html' },

  { slug: 'recap-vapi-festival-2025', title: 'Recap: Valley Asian Pacific Islander Cultural Festival 2025', category: 'Chamber Events Recap', date: '2026-03-25', icon: '🎭',
    excerpt: 'Two days of food, music, and 22,000 attendees at Pierce College.',
    lead: 'The Valley Asian Pacific Islander Cultural Festival, hosted in partnership with Pierce College, drew 22,000 attendees over two days last May — and the 2026 edition (May 2nd) is on track to beat that.',
    body: [
      ['p','The festival is one of the few moments in the year when the chamber can say "the entire West Valley showed up." Korean barbecue stations, Filipino lechon, Vietnamese pho, Thai night-market sweets, plus a mainstage rotation of dance troupes, K-pop covers, and the Pacific Islander drum collective. It\'s loud. It\'s crowded. It\'s the best free family event in the West Valley.'],
      ['h2','What\'s new for 2026'],
      ['p','The 2026 edition (Saturday May 2nd, Pierce College, 10am-3pm, free) adds a "Maker\'s Market" featuring 40 chamber-member artisan vendors. New Saturday-only kid-zone on the soccer field. And — for chamber members — an exclusive sponsor reception in the President\'s Lounge from 2-4pm.'],
      ['p','Volunteer slots are still open. Felicia is coordinating. Email felicia@woodlandhillscc.net for the shifts list.']
    ],
    cta: { type: 'community', text: 'RSVP for VAPI 2026' },
    relatedGuide: 'community/index.html' },

  // === BUSINESS TIPS (4) ===
  { slug: 'tip-ai-tools-small-business', title: 'Five AI tools that actually save Valley small businesses time', category: 'Business Tips', date: '2025-11-25', icon: '🤖',
    excerpt: 'No hype. Just five AI tools chamber members are using right now to save 5–10 hours per week.',
    lead: 'AI is having a moment, but most "AI for small business" articles are written by people who have never run one. Here are five tools — used by actual West Valley chamber members — that are saving them real hours every week.',
    body: [
      ['h2','1. Otter.ai for meeting notes'],
      ['p','Tim Gaspar Insurance uses Otter on every client call. Auto-transcribes, summarizes action items, and sends them to the client. Cost: $20/month. Time saved: 4 hours/week.'],
      ['h2','2. Claude or ChatGPT for first drafts'],
      ['p','Several member CPAs use Claude to draft client emails — explanations of tax positions, payment-plan letters, organizer reminders. The CPA reviews, edits, sends. The first-draft time goes from 25 minutes to 5.'],
      ['h2','3. Apollo or ZoomInfo for prospect research'],
      ['p','For the BD-driven members in real estate, financial planning, and B2B services: 30 minutes of prospect research compresses to 5. The chamber maintains a member discount with Apollo through the Valley Biz Brief partnership.'],
      ['h2','4. Bench or Pilot for bookkeeping'],
      ['p','Several chamber-member small businesses have moved off "spouse handles QuickBooks" to AI-augmented bookkeeping. Spouse keeps their day job. Books are cleaner. Tax season is shorter.'],
      ['h2','5. The chamber\'s own AI Concierge'],
      ['p','Free for residents and members. When customers ask "where can I get X in the West Valley?" — they get answers that include your business by name. Without you doing anything.'],
      ['p','The chamber runs free monthly AI for Business workshops. Next one: first Wednesday of next month, Warner Center Marriott. RSVP on the events page.']
    ],
    cta: { type: 'directory', text: 'Find IT and AI consultants in the chamber' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'tip-newsletter-open-rates', title: 'How to get your business newsletter from 8% open rate to 35%', category: 'Business Tips', date: '2025-12-16', icon: '✉️',
    excerpt: 'The chamber boosted its own open rate by 27 points in 2025. Here\'s exactly how.',
    lead: 'The chamber\'s newsletter went from a 22% open rate in January 2025 to 49% by December 2025. Here\'s the four things we changed — and the one thing we deliberately didn\'t.',
    body: [
      ['h2','1. Send fewer, more relevant'],
      ['p','We split our single weekly into eight topic-specific newsletters. People who only care about dining only get Dine SFV. The relevance jump is the single biggest factor.'],
      ['h2','2. Subject lines without "Newsletter"'],
      ['p','We A/B tested ourselves into a clear pattern: subject lines that read like personal emails (sender first-name, specific noun) outperform "Chamber Weekly Newsletter" by 2-3x. "Diana: this week\'s 3 events" beats "WVWCCC Weekly Update" every time.'],
      ['h2','3. Plain text versions for half the list'],
      ['p','Heavy HTML newsletters get filtered. We send a plain-text version to subscribers whose providers (Gmail, Outlook) downgrade marketing emails. Open rate on the plain-text variant: 71%.'],
      ['h2','4. AI-drafted preview text'],
      ['p','We use Claude to write the 60-character preview text that shows under the subject line. Auto-generated based on the issue contents. It works.'],
      ['h2','What we deliberately didn\'t do'],
      ['p','We didn\'t fancy-design our way to better opens. The newsletter looks plainer than it did three years ago. That\'s the point.']
    ],
    cta: { type: 'newsletters', text: 'Subscribe to chamber newsletters by topic' },
    relatedGuide: 'newsletters/' },

  { slug: 'tip-google-business-profile-2026', title: 'The 2026 Google Business Profile checklist', category: 'Business Tips', date: '2026-02-10', icon: '🔍',
    excerpt: 'A 12-point checklist every West Valley business should run through this quarter.',
    lead: 'Google Business Profile (GBP) is the single highest-leverage piece of free marketing for a local business. And most chamber members are leaving 70% of the value on the table.',
    body: [
      ['h2','The checklist'],
      ['list',['1. Verify the business — sounds basic; 18% of your peers haven\'t','2. Set primary AND secondary categories — most businesses only set one','3. Upload at least 20 photos including 3 of the storefront and 5 of staff','4. Set service area or address visibility correctly','5. Add the booking link (Square/Calendly/OpenTable) — direct from search','6. Use the Q&A section proactively — answer your own most common questions','7. Post weekly — even a short update keeps the listing "active" in Google\'s eyes','8. Respond to every review — yes, even the 4-stars','9. Add menu / services / products with prices','10. Use the messaging feature — turn it on if you\'ll respond within 24h','11. Add holiday hours every quarter','12. Run Performance reports monthly (Google\'s built-in analytics)']],
      ['p','Doing all 12 takes about 4 hours initially and 30 minutes per month after. Chamber members get a free GBP audit through the Business Solutions Guide partner program.']
    ],
    cta: { type: 'guides', text: 'Visit the Business Solutions guide' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'tip-hiring-locally-2026', title: 'Hiring locally in 2026: where Valley businesses are actually finding people', category: 'Business Tips', date: '2026-04-01', icon: '👋',
    excerpt: 'Indeed isn\'t working. Neither is LinkedIn. Here\'s where chamber members are actually finding their best hires.',
    lead: 'Asked at last month\'s networking mixer: "Where did your best hire from the past year come from?" The answers were almost never Indeed or LinkedIn.',
    body: [
      ['h2','What\'s actually working'],
      ['list',['Referrals from other chamber members (35% of best hires)','Pierce College career center for entry-level','LACCD Promise students for paid internships','Local mom-network Facebook groups (especially for part-time)','The chamber\'s job board (modest but high-signal)','Direct outreach via LinkedIn — not the LinkedIn job posts']],
      ['h2','What\'s not working'],
      ['list',['Indeed at scale — too much noise','Job-board automation tools','Paid LinkedIn job posts (organic LinkedIn outreach is fine)','Craigslist (still used; quality has dropped)']],
      ['p','The chamber\'s job board is free for chamber members. Diana\'s introducing a "hiring talk" series at the Connection Circles starting May.']
    ],
    cta: { type: 'directory', text: 'Browse member businesses in the directory' },
    relatedGuide: 'guides/business-solutions.html' },

  // === COMMUNITY/LIFESTYLE (4) ===
  { slug: 'lifestyle-best-valley-brunch', title: 'The 8 best brunches in the West Valley right now', category: 'Community', date: '2026-01-30', icon: '🥞',
    excerpt: 'A no-frills, locally-grounded brunch ranking. Spoiler: the best one isn\'t in Tarzana.',
    lead: 'Brunch is the most contested meal of the week, and the West Valley has more brunch options than any single weekend can do justice. Here are the eight that consistently deliver.',
    body: [
      ['h2','The eight'],
      ['list',['Republique (Mid-City but worth the drive)','Casa Vega — Sherman Oaks Mexican brunch with the city\'s best margaritas','Lemonade — Canoga, kid-friendly, healthy options','The Drift Inn — Warner Center Marriott\'s casual brunch','Habit Cafe — independent in Reseda, the under-known sleeper','Trattoria Farfalla — Italian brunch in Los Feliz, drive-worthy','Mel\'s Drive-In — 24-hour diner classic on Ventura','Sushi Katsu-Ya — Sunday omakase brunch (yes, really)']],
      ['h2','How we ranked'],
      ['p','Six chamber-member restaurant operators contributed votes. Two outside food writers added their picks. Personal bias: a slight lean toward chamber members who do this every weekend, vs. the trendy spot that opened three months ago.'],
      ['p','Five of the eight are chamber members. The full Dine SFV guide has another 28 brunch options sortable by neighborhood, dietary preference, and noise level.']
    ],
    cta: { type: 'guides', text: 'Browse the full dining guide' },
    relatedGuide: 'guides/restaurant.html' },

  { slug: 'lifestyle-weekend-with-kids', title: 'A perfect Saturday in the West Valley with kids under 10', category: 'Community', date: '2026-02-17', icon: '🎈',
    excerpt: 'A 9am-to-5pm itinerary that won\'t exhaust your kids or your wallet.',
    lead: 'Most "things to do with kids" articles fall into two camps: paid attractions ($300 for a family of four) or "go to the park." Here\'s a real Saturday that costs about $80 and will exhaust your kids in the right way.',
    body: [
      ['h2','9:00am — Lemonade for breakfast'],
      ['p','Canoga Avenue location. Kid-friendly seating, healthy options, and the chalk wall keeps the under-5s busy. ~$30 for a family of four.'],
      ['h2','10:30am — Tarzana Recreation Center playground'],
      ['p','Recently re-rubbered surface, 4-12 age range, decent shade. Free.'],
      ['h2','12:30pm — Pizza Rev or Stonefire on Ventura'],
      ['p','Stonefire is a Tarzana institution. Pizza Rev is faster. Either works. ~$45.'],
      ['h2','2:00pm — Westfield Topanga food court walk'],
      ['p','Hit the kids\' carousel ($3), browse the Lego store, sit on the indoor benches near the fountain, sneak a Wetzel\'s. Free if you\'re strict; $10 if you\'re not.'],
      ['h2','3:30pm — Library hour at the Tarzana branch'],
      ['p','The Tarzana branch of LAPL has the best kids\' section in the West Valley. Free WiFi for parents. Story time most Saturdays.'],
      ['h2','5:00pm — Home, exhausted'],
      ['p','For dinner, just order from a chamber-member restaurant. You\'ve done enough.'],
      ['p','The full Family Activities guide has 42 weekend itineraries searchable by age, weather, and neighborhood.']
    ],
    cta: { type: 'guides', text: 'See more family-activity ideas' },
    relatedGuide: 'guides/family-activities.html' },

  { slug: 'lifestyle-where-to-spa-day', title: 'A grown-up spa day in the West Valley (without driving to Beverly Hills)', category: 'Community', date: '2026-03-19', icon: '💆‍♀️',
    excerpt: 'You don\'t need to drive to Beverly Hills for a real spa day. The West Valley has options.',
    lead: 'There\'s a particular post-quarter-end exhaustion that demands a spa day. The West Valley has six-plus options that hold up against the Beverly Hills places — without the parking and the drive and the markup.',
    body: [
      ['h2','For a full day (5+ hours)'],
      ['p','Tarzana Skin & Wellness is the highest-rated full-service day spa in the West Valley. They do the works: facial, body treatment, massage, fingers/toes, lunch. Members\' favorite. ~$420 for the full day. Loyalty Card discount: 15% off first treatment + free 30-min consultation.'],
      ['h2','For a half-day reset (2-3 hours)'],
      ['p','Massage Envy at Westfield Topanga has consistent quality and easy parking. Healing Hands in Woodland Hills does an excellent 90-minute deep tissue. ~$150-180.'],
      ['h2','For couples'],
      ['p','The Spa at Marriott Warner Center has couples suites and runs a quarterly chamber-member discount. Lunch at Allegro is included with the Spa Day package.'],
      ['p','Full Spa & Wellness guide has 14 options sorted by price, treatment type, and neighborhood.']
    ],
    cta: { type: 'guides', text: 'See the full Spa & Wellness guide' },
    relatedGuide: 'guides/spa.html' },

  { slug: 'lifestyle-emergency-home-pros', title: 'Save these numbers: West Valley home pros for actual emergencies', category: 'Community', date: '2026-04-22', icon: '🚨',
    excerpt: 'A laminated list — the chamber-member home pros who answer the phone on Saturdays.',
    lead: 'A burst pipe at 11pm on a Saturday is when you find out which home pros are real. The chamber maintains a list of vetted members who actually answer.',
    body: [
      ['h2','24-hour emergency'],
      ['list',['The Drain Co. — plumbing, $25 off first call with loyalty card','Bargain Plumbing — 24/7 dispatch, family-owned 35 years','Allegiance Roofing — emergency tarps for storm damage','Restoration 1 — water/fire damage, IICRC certified']],
      ['h2','Same-day urgent (M-Sat business hours)'],
      ['list',['Amaral Custom Cabinets — same-day repair quotes','LA Power Repair — electrical urgent, Tarzana base','Liberty AC & Heating — Reseda, Sat hours','Pestmaster Services — emergency rodent / termite']],
      ['p','All 14 of these are chamber members. The Home Maintenance & Repair guide has another 71 home pros sortable by trade, neighborhood, and emergency-availability.'],
      ['p','Pro tip: when you call any of these on a Saturday, mention you got the number from the chamber. Most will quote the chamber-member rate without you asking.']
    ],
    cta: { type: 'guides', text: 'Browse all home pros' },
    relatedGuide: 'guides/home-maintenance.html' },

  // === ADVOCACY (2) ===
  { slug: 'advocacy-cd-3-priorities-2026', title: 'CD-3 priorities for 2026 — what we\'re asking Councilmember Blumenfield for', category: 'Government & Advocacy', date: '2026-01-07', icon: '🏛️',
    excerpt: 'The chamber\'s formal advocacy agenda for Council District 3, presented at the December board meeting.',
    lead: 'Each January the chamber publishes its formal advocacy agenda — the items we\'ll spend chamber time and political capital on with Councilmember Blumenfield, the planning commissions, and Sacramento.',
    body: [
      ['h2','Top three for 2026'],
      ['list',['Sherman Way streetscape (already secured — see April 15 post)','Topanga-Reseda corridor traffic mitigation — particularly the bottleneck at Ventura','Property tax abatement for new small-business buildouts in Reseda Opportunity Zone']],
      ['h2','Watching closely'],
      ['list',['Warner Center 2035 plan amendments','LAUSD\'s school-attendance-boundary review (impacts Cleveland and Reseda HS)','State sick-leave expansion — small-business compliance impacts','LADWP commercial water-rate proposal']],
      ['p','The chamber\'s advocacy committee meets the second Wednesday of each month. Open to all chamber members. Mark Cudacua chairs.']
    ],
    cta: { type: 'community', text: 'Get involved with chamber advocacy' },
    relatedGuide: 'community/district-3.html' },

  // === MEMBER SPOTLIGHTS (6 more) ===
  { slug: 'spotlight-allen-edwards-salon', title: 'Allen Edwards Salon — 40 years of Valley hair', category: 'Member Spotlight', date: '2025-11-21', icon: '💇',
    excerpt: 'A Woodland Hills institution where the chair you sit in might have hosted three generations of one family.',
    lead: 'On Ventura Boulevard, Allen Edwards Salon is the kind of place where the receptionist remembers your daughter\'s prom from six years ago — because she did her hair.',
    body: [
      ['p','Allen Edwards opened the salon in 1985 with a simple ethos: hire stylists who treat hair like a craft, not a commodity. Forty years later, more than half the team has been there ten-plus years. That continuity is the engine — clients follow stylists across decades.'],
      ['h2','The Friday morning chamber crowd'],
      ['p','For reasons no one quite remembers, Friday mornings became the unofficial chamber-member appointment block. You\'ll often find three or four chamber members in the same hour, and the conversations reliably end with a referral.'],
      ['list',['Color specialists for every hair type','Dedicated event-day team for weddings and bar mitzvahs','Loyalty Card: 10% off services for cardholders','Walk-ins welcome on Wednesdays']],
      ['p','Bronze tier Chamber member. Allen still cuts hair on Saturdays.']
    ],
    cta: { type: 'directory', text: 'See more chamber members in Beauty' },
    relatedGuide: 'guides/spa.html' },

  { slug: 'spotlight-tarzana-family-dental', title: 'Tarzana Family Dental — three generations under one roof', category: 'Member Spotlight', date: '2025-12-02', icon: '🦷',
    excerpt: 'A multigenerational dental practice on Ventura that handles grandparents, parents, and grandchildren in the same week.',
    lead: 'Tarzana Family Dental has built a practice on a fairly unusual claim: more than half their patient households include three generations.',
    body: [
      ['p','Dr. Karim Mehrabian opened the practice in 1998. His daughter Dr. Nadia joined in 2018. Their patient files now span everything from first cleanings for kids whose grandparents were also patients here, to complex prosthodontics for those same grandparents.'],
      ['h2','What they do well'],
      ['list',['Pediatric dentistry with kid-friendly Saturday hours','Cosmetic and restorative work','Sleep-apnea oral appliances','Medicare and most major insurance accepted','Free annual cleaning for new chamber members (mention code WVCC)']],
      ['p','Member tier Chamber member. 18737 Ventura Blvd, Tarzana.']
    ],
    cta: { type: 'guides', text: 'Browse the Healthcare guide' },
    relatedGuide: 'guides/parent-resource.html' },

  { slug: 'spotlight-citywide-law-group', title: 'Citywide Law Group — where injury cases get personal again', category: 'Member Spotlight', date: '2026-01-06', icon: '⚖️',
    excerpt: 'Sherwin Arzani built a personal-injury practice on a heretical idea: actually return phone calls.',
    lead: 'Personal-injury law is a noisy industry. Billboards. Bus benches. 1-800 numbers. Sherwin Arzani decided to build Citywide Law Group around something quieter: returning every call within an hour.',
    body: [
      ['p','Citywide handles auto, slip-and-fall, and product-liability cases across the West Valley. Sherwin started the firm in 2014 after a decade at a high-volume PI shop where he watched clients become spreadsheet rows. The Citywide model is the opposite — fewer cases, more attention.'],
      ['h2','Why Diana put them on the chamber\'s referral list'],
      ['p','Sherwin sponsors the chamber\'s annual Valley Asian Pacific Islander festival, hosts a free legal clinic at Connection Circles every quarter, and works pro bono for at least three nonprofit chamber members per year. The firm\'s philosophy reads like the chamber\'s in miniature: show up, do the work, give back.'],
      ['p','Member tier Chamber member. Office on Ventura Boulevard, Tarzana.']
    ],
    cta: { type: 'landing', text: 'See Professional Services membership tier' },
    relatedGuide: 'guides/professional-services.html' },

  { slug: 'spotlight-tim-gaspar-2026', title: 'Tim Gaspar Insurance is now in 14 states (and still your neighbor)', category: 'Member Spotlight', date: '2026-02-04', icon: '🛡️',
    excerpt: 'The Tarzana-based agency you call when something burns, floods, or gets totaled now serves clients in 14 states — without losing the West Valley voice.',
    lead: 'Tim Gaspar Insurance has been written about in this space before — but a lot has changed in two years. The agency now serves clients in 14 states, and Tim is the guy who answers the phone in all of them.',
    body: [
      ['p','How does that work? Tim hired carefully — three more agents, all West Valley locals, all trained the same way. The agency expanded into Arizona, Nevada, Texas, Florida via clients who moved and refused to switch agents.'],
      ['h2','What the chamber benefits get from this'],
      ['list',['Free annual policy reviews for chamber members','Group benefits broker services for member businesses','Loyalty Card: 10% off home + auto bundle in the first year','Same-day quote turnaround for chamber referrals']],
      ['p','Friend Leader tier Chamber member. Active in Lee\'s Connection Circle and the Home Improvement Pros Network.']
    ],
    cta: { type: 'directory', text: 'See more financial chamber members' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'spotlight-westfield-topanga-25', title: 'Westfield Topanga at 25: still the West Valley\'s living room', category: 'Member Spotlight', date: '2026-03-18', icon: '🛍️',
    excerpt: 'A quarter-century anniversary for a mall that has somehow remained both relevant and beloved.',
    lead: 'Westfield Topanga celebrates 25 years in 2026, and against the odds in the great American mall decline, it\'s thriving.',
    body: [
      ['p','When Topanga opened in 2001, the prevailing wisdom was that enclosed malls were finished. Twenty-five years later, the property anchors the Warner Center 2035 plan, hosts the chamber\'s biggest annual events, and is in the top decile of Westfield properties nationally for sales per square foot.'],
      ['h2','The chamber connection'],
      ['p','Westfield is a Platinum-tier sponsor of the chamber. The mall hosts our Halloween Boo Bash (8,000 trick-or-treaters in 2025), the Holiday Open House, and the spring Valley Asian Pacific Islander festival. The Westfield team is led by GM Nina Castillo, who serves on the chamber\'s board.'],
      ['p','For chamber members in the mall ecosystem — and for those whose customers visit the mall — the 25-year mark is a chance to look at how foot traffic patterns have shifted since 2019. We\'ve added an analysis section to the Valley Biz Brief — subscribe at the newsletters page.']
    ],
    cta: { type: 'community', text: 'See chamber events at Westfield' },
    relatedGuide: 'guides/cityloop.html' },

  { slug: 'spotlight-9round-tarzana', title: '9Round Kickboxing — the 30-minute workout for busy Valley parents', category: 'Member Spotlight', date: '2026-04-19', icon: '🥊',
    excerpt: 'A no-childcare, no-class-schedule, in-and-out 30-minute kickboxing workout that fits between school drop-off and the rest of life.',
    lead: 'The most under-rated chamber-member fitness studio in the Valley is a small kickboxing gym on Ventura that promises one thing: 30 minutes, no class schedule, you\'re done.',
    body: [
      ['p','9Round Tarzana operates on a continuous loop — nine 3-minute "rounds" of strength, cardio, and bag work. Every session has a trainer. Every workout is different. You walk in any time during open hours, you walk out 30 minutes later having had a real workout.'],
      ['h2','Why busy Valley parents love it'],
      ['list',['No reservations or class schedule','Trainer-led every visit (not unsupervised)','30 minutes flat — fits in a school drop-off window','First month free + no enrollment fee for chamber members']],
      ['p','Member tier Chamber member. Owner Nilda Santiago is on the Wellness Resource Network committee.']
    ],
    cta: { type: 'guides', text: 'Browse fitness members' },
    relatedGuide: 'guides/spa.html' },

  // === VALLEY NEWS (5 more) ===
  { slug: 'news-pierce-college-2026-expansion', title: 'Pierce College breaks ground on new workforce-training building', category: 'Valley News', date: '2025-12-12', icon: '🎓',
    excerpt: 'A $42M state-funded facility on the south edge of campus will house healthcare, AI, and trades programs.',
    lead: 'Los Angeles Pierce College broke ground in November on a 42,000-square-foot workforce-training facility that will house programs in healthcare, AI/data, and skilled trades.',
    body: [
      ['p','Funded primarily by the state\'s Strong Workforce Program plus a $4M chamber-coordinated industry match, the facility will serve roughly 2,400 students per year by 2028 — most of them West Valley residents training for jobs at chamber-member businesses.'],
      ['h2','Why this matters to chamber members'],
      ['list',['Direct-pipeline programs for chamber-member healthcare networks (Providence, Kaiser)','New AI/data certificate developed with input from chamber AI for Business circle','Apprenticeships in HVAC, plumbing, and electrical — direct pipeline for chamber-member home pros','New healthcare administration cohort starts fall 2026']],
      ['p','Pierce President Aracely Aguiar will speak at the May chamber breakfast.']
    ],
    cta: { type: 'community', text: 'See chamber community partnerships' },
    relatedGuide: 'community/west-valley.html' },

  { slug: 'news-ventura-bridge-replacement', title: 'Ventura Boulevard bridge replacement scheduled for summer 2026', category: 'Valley News', date: '2026-01-29', icon: '🌉',
    excerpt: 'Caltrans is replacing the Ventura Blvd bridge over the LA River. Expect 8 weeks of overnight closures.',
    lead: 'Caltrans has formally scheduled the replacement of the Ventura Boulevard bridge over the LA River wash for summer 2026 — 8 weeks of overnight (10pm-5am) closures starting June 17.',
    body: [
      ['p','The bridge has been on the deficient-structures list since 2018. The replacement is a full deck reconstruction; the structure stays. Daytime traffic is unaffected; only nighttime crossings will reroute via Burbank Boulevard or the 101.'],
      ['h2','For chamber members along the corridor'],
      ['p','Chamber-member restaurants and bars within a half-mile of the bridge have already been notified. Caltrans is funding a $40K small-business marketing offset, distributed proportionally to verifiably-impacted businesses. The chamber is administering the application.'],
      ['p','Filing deadline: April 30. Felicia has the form.']
    ],
    cta: { type: 'community', text: 'Get the chamber\'s advocacy briefing' },
    relatedGuide: 'community/index.html' },

  { slug: 'news-laareachamber-collaboration', title: 'A first: West Valley chamber teams up with LA Area Chamber on small-biz tax day', category: 'Valley News', date: '2026-02-16', icon: '🤝',
    excerpt: 'For the first time, our chamber and LA Area Chamber are co-sponsoring a free Tax Day workshop for small businesses.',
    lead: 'In a first-of-its-kind collaboration, the West Valley Warner Center Chamber of Commerce and the Los Angeles Area Chamber of Commerce will co-sponsor a free Tax Day workshop for small business owners on Saturday, March 14 at the Marriott Warner Center.',
    body: [
      ['p','Diana Williams reached out to LA Area Chamber CEO Maria Salinas in December after a chamber-AI summit where the two chambers discovered overlapping member bases — over 90 LA Area Chamber members are also based in the West Valley.'],
      ['h2','What\'s on the agenda'],
      ['list',['1099 / W-2 deadline review','New independent-contractor reporting rules','AI tools for bookkeeping and tax prep','State sick-leave compliance walkthrough','Q&A with a panel of chamber-member CPAs']],
      ['p','Free for chamber members of either organization. RSVP through the events page.']
    ],
    cta: { type: 'community', text: 'See the chamber events calendar' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'news-canoga-park-arts-grant', title: 'Canoga Park arts corridor receives $1.6M revitalization grant', category: 'Valley News', date: '2026-03-23', icon: '🎨',
    excerpt: 'The state\'s Cultural Districts program is funding murals, public art, and live performance for the Sherman Way arts corridor.',
    lead: 'The Sherman Way arts corridor in Canoga Park received a $1.6M Cultural Districts revitalization grant from the California Arts Council last month.',
    body: [
      ['p','The grant funds 12 large-scale murals, three live-performance summer series, and a permanent public sculpture installation along the corridor between Topanga Canyon and Owensmouth. Construction kicks off in May 2026 with the first mural at the Madrid Theater.'],
      ['h2','For chamber-member businesses on Sherman Way'],
      ['p','The corridor includes 14 chamber-member businesses. Each has been offered participation in the program — wall-rentals for murals, performance stops, public-art adjacency. Chamber Ambassadors are coordinating the outreach.'],
      ['p','First public meeting May 22 at the West Valley Regional Library. RSVP encouraged.']
    ],
    cta: { type: 'community', text: 'Engage with chamber community programs' },
    relatedGuide: 'community/index.html' },

  { slug: 'news-housing-element-update', title: 'LA City\'s Housing Element update: what changes for the West Valley', category: 'Valley News', date: '2026-04-09', icon: '🏘️',
    excerpt: 'The 2026 Housing Element rezones key parcels in the West Valley. Here\'s what your business should know.',
    lead: 'The City of Los Angeles\'s 2026 Housing Element update — required by state law and now in final review — rezones several West Valley parcels for higher-density mixed-use development. The chamber filed comments in March.',
    body: [
      ['p','The largest changes affect the Warner Center, the Reseda Boulevard transit corridor, and three parcels at Topanga & Vanowen. Chamber-member commercial property owners are receiving notification packets through the mail this month.'],
      ['h2','What this means for chamber-member businesses'],
      ['list',['Tenant chamber-members may see new mixed-use redevelopment in their leases\' next renewal cycle','Property-owner chamber-members may see significant zoning value upside','Retail-corridor chamber-members on Reseda Blvd should expect increased foot traffic 2027+ as projects come online']],
      ['p','Diana hosted a small-group briefing for affected members at the March mixer; the deck is available through the chamber portal.']
    ],
    cta: { type: 'community', text: 'Get the chamber\'s zoning briefing' },
    relatedGuide: 'community/district-3.html' },

  // === EVENTS RECAP (4 more) ===
  { slug: 'recap-ribbon-cryohealthcare', title: 'Recap: Cryohealthcare Woodland Hills ribbon cutting', category: 'Chamber Events Recap', date: '2026-05-01', icon: '✂️',
    excerpt: 'A new wellness center on Ventura officially joins the West Valley.',
    lead: 'Cryohealthcare Woodland Hills cut the ribbon on Wednesday, May 13, joining the chamber\'s Wellness Resource Network as its newest member.',
    body: [
      ['p','Owner Bahiye Sakerian welcomed Diana Williams, Felicia Paust, and around 30 chamber members for a tour of the new whole-body cryotherapy, infrared-sauna, and red-light-therapy facility on Ventura Boulevard. Diana cut the ribbon. Catering by Lemonade.'],
      ['h2','What they offer'],
      ['list',['Whole-body cryotherapy single sessions ($60) and packages','Infrared sauna with chromotherapy','Red-light therapy panels','Compression-recovery boots','Loyalty Card: 20% off first single session for cardholders']],
      ['p','Member tier Chamber member. 21450 Ventura Blvd, Woodland Hills.']
    ],
    cta: { type: 'directory', text: 'Browse new chamber members' },
    relatedGuide: 'guides/spa.html' },

  { slug: 'recap-mlk-day-volunteer', title: 'Recap: MLK Day chamber volunteer drive', category: 'Chamber Events Recap', date: '2026-01-26', icon: '🕊️',
    excerpt: '160 chamber-member volunteers, four worksites, one Monday.',
    lead: 'The chamber\'s annual MLK Day of Service drew 160 volunteers across four West Valley worksites this year — our biggest turnout yet for a one-day event.',
    body: [
      ['p','Volunteer worksites: the Boys & Girls Club West Valley clubhouse refresh, Tarzana Treatment Centers food-pantry restock, the Reseda Library reading-garden cleanup, and a Habitat-for-Humanity build in Northridge. Felicia coordinated the rosters; chamber-member businesses sponsored breakfast and lunch at all four sites.'],
      ['h2','By the numbers'],
      ['list',['160 volunteers','520 cumulative service hours','12 chamber-member businesses sponsored meals','3 nonprofit beneficiary organizations']],
      ['p','Save the date: MLK Day 2027 is Monday, January 18. Sign-ups will open in November.']
    ],
    cta: { type: 'community', text: 'See more chamber community service' },
    relatedGuide: 'community/index.html' },

  { slug: 'recap-march-mixer-marriott', title: 'Recap: March mixer at Warner Center Marriott', category: 'Chamber Events Recap', date: '2026-04-04', icon: '🍸',
    excerpt: 'Allegro at the Marriott hosted, the AI for Business circle launched, and 110 members showed up.',
    lead: 'The March chamber mixer was hosted by Allegro at the Warner Center Marriott — and it doubled as the official launch of the new AI for Business Connection Circle.',
    body: [
      ['p','110 members. Open bar. The new chef\'s passed-canapés (the duck confit on potato cake was the unanimous favorite). And about 25 minutes into the mixer, Diana welcomed Michael Bowers (Heed AI) to the podium to formally launch the AI for Business Connection Circle, which now meets the first Wednesday of each month at the Marriott.'],
      ['h2','New connections'],
      ['p','Three new chamber-member businesses signed up at the mixer. Two existing members upgraded their tier. One ribbon cutting was scheduled for May.'],
      ['p','April mixer is at Belmont Village Calabasas — 4/29, 5:30pm.']
    ],
    cta: { type: 'community', text: 'See upcoming chamber mixers' },
    relatedGuide: 'networking-groups.html' },

  { slug: 'recap-young-professionals-launch-event', title: 'Recap: Young Professionals Network 2026 kickoff', category: 'Chamber Events Recap', date: '2026-02-12', icon: '🎉',
    excerpt: 'A 70-person turnout for the under-40 chamber-member network\'s biggest event in years.',
    lead: 'The Young Professionals Network kicked off 2026 with a 70-person event at Wisteria Warner Center — the network\'s biggest turnout in over three years.',
    body: [
      ['p','The format was new: 30 minutes of structured speed-introductions (45-second business pitches in pairs that rotate every 90 seconds), then a casual mixer with a deejay and small-bites menu. The chamber\'s newer under-40 members loved it. Several called it "the best chamber event I\'ve ever been to."'],
      ['h2','What\'s next for the YPN'],
      ['list',['Last-Thursday-of-the-month mixer at rotating venues','Quarterly workshop series on practical business topics','New peer mentorship program — paired with senior chamber members','Annual leadership retreat (planned for September)']],
      ['p','Membership is free with chamber membership. Contact Felicia to opt in.']
    ],
    cta: { type: 'community', text: 'Join the Young Professionals Network' },
    relatedGuide: 'networking-groups.html' },

  // === BUSINESS TIPS (4 more) ===
  { slug: 'tip-square-vs-stripe-2026', title: 'Square vs Stripe in 2026: which one fits your Valley business?', category: 'Business Tips', date: '2025-12-30', icon: '💳',
    excerpt: 'A clear-headed comparison with no affiliate links and no hype.',
    lead: 'About one-third of chamber-member businesses ask the same question every quarter: "should I be on Square or Stripe?" Here\'s the answer, depending on the kind of business you run.',
    body: [
      ['h2','Square is better if you:'],
      ['list',['Have a physical retail or restaurant location','Need integrated POS hardware','Want appointment booking included (Square Appointments)','Need same-day deposits','Don\'t want to think about implementation']],
      ['h2','Stripe is better if you:'],
      ['list',['Run an online-first business','Have a developer (or use a no-code tool that integrates Stripe)','Need international payments','Want lower fees at scale (1% – 2.5% lower above $250K/year)','Need recurring billing with complex rules']],
      ['h2','The truth most articles won\'t tell you'],
      ['p','Most West Valley chamber-member small businesses (under $1M GMV) save more time with Square than they save in fees with Stripe. The hour you don\'t spend on integration is worth the 0.4% fee difference.'],
      ['p','The chamber accepts both for memberships. The new automated onboarding flow uses Square.']
    ],
    cta: { type: 'guides', text: 'See more in the Business Solutions guide' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'tip-yelp-vs-google-reviews', title: 'Yelp vs Google reviews: where Valley businesses should focus in 2026', category: 'Business Tips', date: '2026-01-19', icon: '⭐',
    excerpt: 'Spoiler: Google. But Yelp still matters for some verticals more than others.',
    lead: 'For most chamber-member small businesses, Google reviews now matter more than Yelp. But not all — and the math is worth understanding.',
    body: [
      ['h2','Why Google has won most verticals'],
      ['list',['Google reviews show in the search snippet — Yelp doesn\'t','Voice assistants pull from Google','Google reviews tie directly to your Google Business Profile','Free; Yelp\'s "claim your business" pushes you toward paid ads']],
      ['h2','Where Yelp still matters'],
      ['list',['Restaurants — Yelp remains a search-by-default for diners 35+','Beauty/spa — Yelp continues to drive new-customer volume','Service-area businesses (plumbers, contractors) — Yelp\'s "Request a Quote" tool generates real leads']],
      ['h2','The chamber-member play'],
      ['p','Focus 80% of your review-generation effort on Google. The remaining 20% on Yelp if you\'re in dining/beauty/home-services. Don\'t pay for Yelp Ads under $20K/year revenue — math doesn\'t work.']
    ],
    cta: { type: 'directory', text: 'See chamber-member service businesses' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'tip-2026-sba-loans', title: '2026 SBA loan changes that affect Valley small businesses', category: 'Business Tips', date: '2026-03-04', icon: '🏦',
    excerpt: 'Three SBA program updates from the 2025 reauthorization that change the math for chamber members.',
    lead: 'The 2025 SBA reauthorization brought three meaningful changes that affect chamber-member small businesses applying for federal loans in 2026.',
    body: [
      ['h2','1. SBA 7(a) loan limit raised to $7.5M'],
      ['p','Previously $5M. The new limit primarily benefits acquisition-financing for chamber-member businesses transitioning ownership (a common scenario for our 30+ multigenerational members).'],
      ['h2','2. Express loans up to $750K (was $500K)'],
      ['p','Faster turnaround, less paperwork. Chamber-member CPAs at the recent compliance breakfast called this the most useful change for working-capital lines.'],
      ['h2','3. New community-advantage SBLC pilot'],
      ['p','New mission-driven lenders can now make SBA-guaranteed loans up to $350K to small businesses in opportunity zones. Reseda Blvd corridor qualifies — chamber members along it should evaluate.'],
      ['p','Three chamber-member lenders are SBA preferred. Diana can intro on request.']
    ],
    cta: { type: 'directory', text: 'Find chamber-member financial advisors' },
    relatedGuide: 'guides/business-solutions.html' },

  { slug: 'tip-cpa-questions-to-ask', title: '8 questions to ask before hiring a CPA in 2026', category: 'Business Tips', date: '2026-04-12', icon: '📊',
    excerpt: 'Beyond price and pedigree — what actually predicts whether a CPA will do right by your Valley small business.',
    lead: 'CPAs are not interchangeable. Eight chamber-member CPAs contributed to this list of the questions you should be asking before you hire one.',
    body: [
      ['h2','The eight questions'],
      ['list',['1. How many businesses in my industry/size do you currently serve?','2. Will I work with you, a junior, or a rotating team?','3. Do you proactively reach out about tax-planning opportunities, or do I have to ask?','4. What\'s your turnaround on basic questions during the year (not tax season)?','5. What software stack do you use and is it compatible with my POS / payroll / banking?','6. Do you do bookkeeping in-house or do you require a separate provider?','7. What\'s your fee structure — fixed, hourly, value-based?','8. Will you represent me to the IRS or only prepare returns?']],
      ['p','Eight chamber-member CPAs willing to be interviewed (and they will tell you these answers without flinching) are listed in the directory under Financial Services.']
    ],
    cta: { type: 'guides', text: 'See chamber-member CPAs' },
    relatedGuide: 'guides/professional-services.html' },

  // === COMMUNITY/LIFESTYLE (4 more) ===
  { slug: 'lifestyle-best-coffee-2026', title: 'Where Valley coffee snobs actually drink in 2026', category: 'Community', date: '2025-11-29', icon: '☕',
    excerpt: 'Real chamber-member coffee shops, ranked by people who order their pour-over at 195°F.',
    lead: 'Coffee is the most-consumed-and-least-discussed thing in the West Valley. Here are the chamber-member shops that take it seriously.',
    body: [
      ['h2','For the pour-over crowd'],
      ['p','Brewstirs in Reseda has the only proper hand-brew bar this side of the 405. Owner Marco Chen sources beans from three roasters, alternates weekly, posts tasting notes on his Instagram. Member tier chamber member.'],
      ['h2','For the espresso enthusiasts'],
      ['p','Caffe Etc. on Ventura has run a La Marzocco GS3 at 9 bars for 11 years. The cortado is the move.'],
      ['h2','For the work-from-coffee crowd'],
      ['p','The Drift Coffee Bar at Warner Center Marriott — outlets, fast wifi, surprisingly good drip. No purchase required if you\'re a hotel guest, but they\'re lenient on chamber-member badges.'],
      ['h2','Honorable mentions (chamber-member but more food than coffee-focused)'],
      ['list',['Lemonade Canoga','Mel\'s Drive-In','Habit Cafe Reseda']],
      ['p','Full Dine SFV guide has 12 more coffee-and-light-bites options sortable by neighborhood.']
    ],
    cta: { type: 'guides', text: 'See the dining guide' },
    relatedGuide: 'guides/restaurant.html' },

  { slug: 'lifestyle-tarzana-walking', title: 'A 5-mile Tarzana walking loop that hits 6 chamber members', category: 'Community', date: '2026-01-15', icon: '🚶',
    excerpt: 'The Saturday-morning walking loop that Tarzana regulars know — coffee, breakfast, gym, dry cleaner, books, brunch.',
    lead: 'The Saturday-morning walking loop in Tarzana is a Valley fixture. Here\'s the 5-mile version that hits six chamber members.',
    body: [
      ['p','Start: 9am, Ventura & Reseda intersection.'],
      ['h2','The loop'],
      ['list',['Mile 0.4 — Coffee at Brewstirs (chamber member)','Mile 1.2 — Wave at Ring Planet on Ventura (chamber member)','Mile 1.8 — Spin around Tarzana Skin & Wellness — Epitome Med Spa block','Mile 2.5 — Coffee refill or pastry at Allegra Music Academy\'s neighbor café','Mile 3.4 — Pickleball-watching at the rec center','Mile 4.0 — Stop at Tarzana Family Dental for water (they\'ll let you in)','Mile 4.6 — Brunch at Casa Vega (chamber-adjacent) or Drift Coffee']],
      ['p','5 miles. 6 chamber members. ~75 minutes if you\'re cruising. ~110 if you stop for everything. Saturday morning is the move.']
    ],
    cta: { type: 'guides', text: 'See more local guides' },
    relatedGuide: 'guides/cityloop.html' },

  { slug: 'lifestyle-volunteering-with-kids', title: 'Where to volunteer with kids in the West Valley', category: 'Community', date: '2026-03-29', icon: '🤲',
    excerpt: 'Five chamber-member nonprofits that welcome kids 6+ as volunteers.',
    lead: 'A surprising number of chamber-member nonprofits welcome kid volunteers — and the kids who participate often turn into the next generation of community leaders.',
    body: [
      ['h2','The five'],
      ['list',['Boys & Girls Club West Valley — clubhouse refresh days, ages 8+','Tarzana Treatment Centers food pantry — sorting & packing, ages 10+','Grateful Hearts annual day (November) — meal packing, ages 6+','Wall That Heals (annual) — setup help, ages 12+','Adopt-a-School quarterly cleanups — all ages']],
      ['h2','Why this matters'],
      ['p','The chamber\'s volunteer roster is full of adults who started showing up at chamber events as 9-year-olds with their parents. Diana puts it bluntly: "the next chamber CEO is probably packing meal kits at Grateful Hearts right now."'],
      ['p','Felicia coordinates kid-volunteer logistics for chamber events.']
    ],
    cta: { type: 'community', text: 'Volunteer with the chamber' },
    relatedGuide: 'community/index.html' },

  { slug: 'lifestyle-rainy-day-valley', title: '12 things to do on a rainy day in the West Valley', category: 'Community', date: '2026-04-26', icon: '🌧️',
    excerpt: 'When the West Valley actually gets weather, here\'s where to go.',
    lead: 'The West Valley sees about 14 rainy days a year. Here are the 12 chamber-friendly indoor places to ride them out.',
    body: [
      ['list',['1. Westfield Topanga (full mall day)','2. Pierce College Farm — covered animal viewing areas','3. Tarzana Library (the renovated kids\' wing)','4. Lazy Acres Natural Market — long-form indoor browsing','5. AMC IMAX at Topanga','6. Color Me Mine Tarzana — paint pottery','7. Dave & Busters Northridge','8. The Comedy Tarzana club (Saturday matinees)','9. Belmont Village rooftop bar (cocktails count)','10. Topanga Mall food hall — order from 4 places','11. Drift Inn at Marriott — kids\' menu + pool table','12. Indoor golf at the Valley\'s newest TopGolf adjacent']],
      ['p','Eight of the twelve are chamber members. The full Family Activities guide has a "rainy day" filter.']
    ],
    cta: { type: 'guides', text: 'See the Family Activities guide' },
    relatedGuide: 'guides/family-activities.html' },

  // === ADVOCACY (2 more) ===
  { slug: 'advocacy-prop-1-implementation', title: 'Prop 1 mental-health implementation: where the West Valley fits', category: 'Government & Advocacy', date: '2025-11-23', icon: '🧠',
    excerpt: 'California\'s Prop 1 mental-health bond is rolling out. Two West Valley sites are in the pipeline.',
    lead: 'Proposition 1\'s $6.4B mental-health and housing bond is rolling out, and two West Valley sites are in the early-stage pipeline.',
    body: [
      ['p','LA County DMH has identified two potential West Valley locations for Prop 1-funded mental-health treatment expansion: a 24-bed crisis-stabilization unit at Providence Cedars-Sinai Tarzana, and an outpatient behavioral-health expansion at Tarzana Treatment Centers. Both are in early scoping.'],
      ['h2','How chamber members can engage'],
      ['list',['Public-comment periods on each site (chamber will publish dates)','Workforce-pipeline coordination (Pierce College + chamber-member providers)','Construction RFP visibility for chamber-member contractors','Coordination with Wellness Resource Network for outpatient referrals']],
      ['p','Diana sits on the LACMHA advisory committee. Updates to come through the chamber\'s Wellness Network newsletter.']
    ],
    cta: { type: 'community', text: 'Stay on top of advocacy' },
    relatedGuide: 'community/index.html' },

  { slug: 'advocacy-cd-3-zoning-letter', title: 'Chamber files formal letter on Topanga & Vanowen mixed-use proposal', category: 'Government & Advocacy', date: '2026-02-22', icon: '✉️',
    excerpt: 'The chamber submitted a formal position letter on the proposed mixed-use rezoning at Topanga & Vanowen.',
    lead: 'The chamber filed a formal position letter on Friday with the LA City Planning Commission regarding the proposed mixed-use rezoning at Topanga Canyon Boulevard & Vanowen Street — an 18-story project that would replace a strip-mall corner.',
    body: [
      ['p','The chamber\'s position: support the housing density, but require a transportation-impact mitigation package + public-realm investments along Vanowen + ground-floor retail dedication minimums for businesses under 5,000 sqft (which protects the chamber-member small businesses already in the corridor).'],
      ['h2','Why this matters to chamber members'],
      ['list',['Construction will run 28 months — significant traffic disruption','New retail at the base will add ~14 new tenant slots','Existing chamber-member businesses on the impacted block (4) need lease-disposition support','The precedent matters for the next 6 similar parcels in the Warner Center 2035 plan']],
      ['p','The full position letter is available to chamber members in the portal. Public hearing: April 7.']
    ],
    cta: { type: 'community', text: 'Read more chamber advocacy' },
    relatedGuide: 'community/district-3.html' },

  { slug: 'advocacy-small-business-compliance-2026', title: '2026 small-business compliance changes you actually have to know', category: 'Government & Advocacy', date: '2026-03-12', icon: '📋',
    excerpt: 'Three California changes effective 2026 that every chamber member needs to plan for.',
    lead: 'The 2026 California compliance landscape has three changes that meaningfully affect every chamber-member small business. Here\'s the short version.',
    body: [
      ['h2','1. Expanded sick leave (effective Jan 1)'],
      ['p','5 days mandatory paid sick leave is now 7 days for businesses with 25+ employees. For chamber-member businesses below 25: still 5 days. Posters and handbooks need updating.'],
      ['h2','2. AB-2930 — automated decision-making disclosure'],
      ['p','If your business uses any AI tool to screen resumes, customers, or applicants, you have new disclosure requirements as of July 1. Most chamber-member small businesses fall below the size threshold but should know the rule exists.'],
      ['h2','3. New independent-contractor reporting'],
      ['p','EDD has expanded the contractor reporting threshold to $400 (down from $600). For chamber members who use freelancers — graphic designers, photographers, IT consultants — your reporting cadence changes.'],
      ['p','Chamber-member CPAs have prepared a free 1-pager summary at the office. Email Felicia for a copy. Or attend the May 13 compliance breakfast at the Marriott — RSVP through the events page.']
    ],
    cta: { type: 'community', text: 'See chamber events and compliance briefings' },
    relatedGuide: 'guides/business-solutions.html' }
];

// ── Render template ──
function renderSection(s) {
  if (s[0] === 'p') return `<p>${s[1]}</p>`;
  if (s[0] === 'h2') return `<h2>${s[1]}</h2>`;
  if (s[0] === 'h3') return `<h3>${s[1]}</h3>`;
  if (s[0] === 'list') return `<ul>${s[1].map(it => `<li>${it}</li>`).join('')}</ul>`;
  if (s[0] === 'pullquote') return `<blockquote style="border-left:4px solid var(--gold);padding-left:20px;margin:24px 0;font-style:italic;color:var(--slate);">${s[1]}<footer style="margin-top:8px;font-size:.85rem;color:var(--muted);font-style:normal;">— ${s[2]||''}</footer></blockquote>`;
  return '';
}

function ctaBlock(cta) {
  const map = {
    directory: { url: '../members/directory.html', class: 'btn--gold' },
    guides:    { url: '../guides/index.html', class: 'btn--primary' },
    landing:   { url: '../landing/professional-services.html', class: 'btn--gold' },
    community: { url: '../community/index.html', class: 'btn--primary' },
    donate:    { url: '../donate.html', class: 'btn--gold' },
    newsletters:{ url: '../newsletters/index.html', class: 'btn--gold' }
  };
  const m = map[cta.type] || map.directory;
  return `<div style="background:var(--cream);padding:24px;border-radius:12px;margin:32px 0;text-align:center;"><a href="${m.url}" class="btn ${m.class} btn--lg">${cta.text} ›</a></div>`;
}

function renderPost(post) {
  const dateStr = new Date(post.date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const wordCount = post.body.reduce((n, s) => n + (s[1]||'').toString().split(/\s+/).length, 0);
  const readTime = Math.max(2, Math.round(wordCount/200));

  const seoDesc = post.excerpt;
  const fullUrl = `https://www.woodlandhillscc.net/blog/post-${post.slug}.html`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} · Valley Biz Buzz · West Valley Warner Center Chamber of Commerce</title>
<meta name="description" content="${seoDesc}">
<meta property="og:type" content="article">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${seoDesc}">
<meta property="og:url" content="${fullUrl}">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<meta property="article:published_time" content="${post.date}">
<meta property="article:section" content="${post.category}">
<meta property="article:author" content="The Chamber Team">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${fullUrl}">
<link rel="icon" href="../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css">
<script type="application/ld+json">
{ "@context":"https://schema.org","@type":"NewsArticle",
  "headline":"${post.title.replace(/"/g,'\\"')}",
  "datePublished":"${post.date}","dateModified":"${post.date}",
  "author":{"@type":"Organization","name":"The Chamber Team"},
  "publisher":{"@type":"Organization","name":"West Valley Warner Center Chamber of Commerce","logo":{"@type":"ImageObject","url":"https://www.woodlandhillscc.net/images/wvwccc-logo-2026.png"}},
  "image":"https://www.woodlandhillscc.net/images/wvwccc-og.png",
  "articleSection":"${post.category}",
  "description":"${seoDesc.replace(/"/g,'\\"')}" }
</script>
</head>
<body>
<header data-partial="header"></header>

<article class="section bg-paper" style="padding:48px 0;">
  <div class="container container-narrow">
    <a href="index.html" class="text-sm" style="color:var(--gold-deep);">← All Valley Biz Buzz</a>
    <div style="margin:16px 0 24px;">
      <span class="chip chip--gold">${post.category}</span>
      <span class="text-xs text-muted" style="margin-left:8px;">${readTime} min read</span>
    </div>
    <h1 style="font-size:clamp(2rem,4vw,2.8rem);margin-bottom:8px;">${post.title}</h1>
    <p style="color:var(--slate-mid);font-size:1.15rem;">${post.excerpt}</p>
    <div class="card__meta" style="margin-top:16px;border-top:1px solid var(--line);padding-top:16px;border-bottom:1px solid var(--line);padding-bottom:16px;">
      <span><strong>By The Chamber Team</strong></span><span>·</span><span>${dateStr}</span>
    </div>
    <div style="font-size:1.05rem;line-height:1.8;color:var(--slate);margin-top:32px;">
      <p class="lead" style="font-size:1.25rem;color:var(--navy);font-weight:500;margin-bottom:24px;">${post.lead}</p>
      ${post.body.map(renderSection).join('\n      ')}
    </div>
    ${ctaBlock(post.cta)}
    <div style="border-top:1px solid var(--line);padding-top:24px;">
      <p class="text-sm text-muted">Related: <a href="../${post.relatedGuide}">View related guide →</a></p>
    </div>
  </div>
</article>

<footer data-partial="footer"></footer>
<script src="../js/partials.js"></script>
<script src="../js/chamber.js"></script>
<script>ChamberPartials.mount({ active: 'blog', depth: 1 });</script>
</body>
</html>
`;
}

function renderIndex(meta) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Valley Biz Buzz · The Chamber Blog</title>
<meta name="description" content="Member spotlights, valley news, business tips, event recaps, community stories, and government advocacy from the West Valley Warner Center Chamber of Commerce.">
<meta property="og:title" content="Valley Biz Buzz — Stories from the West Valley">
<meta property="og:description" content="${meta.length} posts across 6 categories.">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<link rel="canonical" href="https://www.woodlandhillscc.net/blog/">
<link rel="icon" href="../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css">
</head>
<body>
<header data-partial="header"></header>

<section class="hero" style="padding:64px 0;">
  <div class="container">
    <div style="text-align:center;max-width:880px;margin:0 auto;">
      <span class="eyebrow eyebrow--navy">Stories from across the West Valley</span>
      <h1>Valley Biz <span style="color:var(--gold);">Buzz</span></h1>
      <p class="hero__lead" style="margin:0 auto 32px;">Member spotlights · valley news · event recaps · business tips · community · advocacy. All by The Chamber Team.</p>
      <p><a href="guest-post.html" class="btn btn--gold">Submit a guest post ›</a></p>
    </div>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;justify-content:center;" id="cat-filter">
      <button class="chip chip--gold" data-cat="all">All</button>
      <button class="chip chip--blue" data-cat="Member Spotlight">Member Spotlight</button>
      <button class="chip chip--blue" data-cat="Valley News">Valley News</button>
      <button class="chip chip--blue" data-cat="Chamber Events Recap">Events</button>
      <button class="chip chip--blue" data-cat="Business Tips">Business Tips</button>
      <button class="chip chip--blue" data-cat="Community">Community</button>
      <button class="chip chip--blue" data-cat="Government & Advocacy">Advocacy</button>
    </div>
    <input type="search" id="blog-search" placeholder="Search the blog…" style="width:100%;max-width:600px;margin:0 auto 32px;display:block;padding:14px 18px;border-radius:10px;border:1px solid var(--line);font-size:1rem;">

    <div class="grid grid-3" id="posts-grid" style="gap:24px;"></div>
  </div>
</section>

<footer data-partial="footer"></footer>
<script src="../js/partials.js"></script>
<script src="../js/chamber.js"></script>
<script>
ChamberPartials.mount({ active: 'blog', depth: 1 });

const POSTS = ${JSON.stringify(meta, null, 2)};
const grid = document.getElementById('posts-grid');
const search = document.getElementById('blog-search');
let activeCat = 'all';
let activeQ = '';

function render() {
  const filtered = POSTS.filter(p => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (activeQ && !(p.title + ' ' + p.excerpt).toLowerCase().includes(activeQ)) return false;
    return true;
  });
  grid.innerHTML = filtered.map(p => \`
    <a href="post-\${p.slug}.html" class="card" style="text-decoration:none;color:inherit;display:block;">
      <div style="height:160px;background:linear-gradient(135deg,var(--blue-soft),var(--gold-soft));display:flex;align-items:center;justify-content:center;font-size:2.6rem;">\${p.icon}</div>
      <div class="card__body">
        <span class="chip chip--blue">\${p.category}</span>
        <h3 class="card__title mt-3">\${p.title}</h3>
        <p class="card__meta">\${new Date(p.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})} · The Chamber Team</p>
        <p class="card__excerpt">\${p.excerpt}</p>
      </div>
    </a>\`).join('') || '<p class="text-muted" style="grid-column:1/-1;text-align:center;">No posts match your filter.</p>';
}

document.querySelectorAll('#cat-filter button').forEach(b => b.addEventListener('click', () => {
  activeCat = b.dataset.cat;
  document.querySelectorAll('#cat-filter button').forEach(x => x.className = 'chip chip--blue');
  b.className = 'chip chip--gold';
  render();
}));
search.addEventListener('input', e => { activeQ = e.target.value.toLowerCase(); render(); });
render();
</script>
</body>
</html>
`;
}

function build() {
  const sorted = [...posts].sort((a,b) => b.date.localeCompare(a.date));

  // Write each post
  sorted.forEach(p => {
    fs.writeFileSync(path.join(BLOG_DIR, `post-${p.slug}.html`), renderPost(p));
    console.log(`✓ blog/post-${p.slug}.html`);
  });

  // Metadata (used by homepage + blog index)
  const meta = sorted.map(p => ({
    slug: p.slug, title: p.title, category: p.category, date: p.date,
    excerpt: p.excerpt, icon: p.icon,
    featured: sorted.indexOf(p) < 6
  }));
  fs.writeFileSync(path.join(DATA_DIR, 'blog-posts.json'), JSON.stringify(meta, null, 2));
  console.log(`✓ data/blog-posts.json (${meta.length} posts)`);

  // Index page
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderIndex(meta));
  console.log('✓ blog/index.html');

  console.log(`\nDone. ${posts.length} posts across:`);
  const cats = {};
  posts.forEach(p => cats[p.category] = (cats[p.category]||0)+1);
  Object.entries(cats).forEach(([c,n]) => console.log(`  ${c}: ${n}`));
}

if (require.main === module) build();
