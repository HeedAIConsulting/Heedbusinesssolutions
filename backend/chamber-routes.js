/* ============================================================
   West Valley · Warner Center Chamber of Commerce — API routes
   Mounted onto Express via attachChamberRoutes(app).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Site lives at the repo root — adjust if relocated.
const SITE_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(SITE_ROOT, 'data');

// In-memory stores (replace with D1/Postgres in prod). Persist to disk for demo continuity.
const STORE_DIR = path.join(SITE_ROOT, 'data', '_store');
if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

function loadJson(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch {
    return fallback;
  }
}
function appendStore(name, record) {
  const file = path.join(STORE_DIR, name + '.jsonl');
  fs.appendFileSync(file, JSON.stringify({ ...record, _ts: new Date().toISOString() }) + '\n');
}
function readStore(name) {
  const file = path.join(STORE_DIR, name + '.jsonl');
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
}

// Models — Opus 4.7 for the staff agent (heavy reasoning, drafting),
// Sonnet 4.6 for the public Concierge (quality + cost balance, "break the bank" per user req).
const MODEL_CONCIERGE = 'claude-sonnet-4-6';
const MODEL_STAFF     = 'claude-opus-4-7';

function attachChamberRoutes(app) {
  // ── Health ─────────────────────────────────────────────
  app.get('/api/chamber', (_req, res) => res.json({
    status: 'ok',
    service: 'West Valley · Warner Center Chamber of Commerce API',
    timestamp: new Date().toISOString(),
    models: { concierge: MODEL_CONCIERGE, staff: MODEL_STAFF }
  }));

  // ── Public data ────────────────────────────────────────
  app.get('/api/members', (_req, res) => res.json(loadJson('members.json')));
  app.get('/api/directory', (_req, res) => res.json(loadJson('directory.json')));
  app.get('/api/directory/stats', (_req, res) => res.json(loadJson('directory-stats.json', {})));
  app.get('/api/events', (_req, res) => res.json(loadJson('events.json')));
  app.get('/api/guides', (_req, res) => res.json(loadJson('guides.json')));
  app.get('/api/blog-posts', (_req, res) => res.json(loadJson('blog-posts.json')));
  app.get('/api/networking-groups', (_req, res) => res.json(loadJson('networking-groups.json', [])));
  app.get('/api/loyalty-partners', (_req, res) => res.json(loadJson('loyalty-partners.json', [])));
  app.get('/api/newsletters', (_req, res) => res.json(loadJson('newsletters.json', [])));

  app.get('/api/members/:id', (req, res) => {
    const dir = loadJson('directory.json');
    const m = dir.find(x => x.id === req.params.id) || loadJson('members.json').find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m);
  });

  // ── AI Concierge (public) ──────────────────────────────
  // Uses Sonnet 4.6 — strong model so the chamber's resident-facing AI is useful.
  app.post('/api/concierge', async (req, res) => {
    try {
      const { message, page, history = [] } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message required' });

      // Sample the directory aggressively to keep prompt size bounded.
      const dir = loadJson('directory.json').length ? loadJson('directory.json') : loadJson('members.json');
      const featured = dir.filter(m => m.chamberMember && (m.tier === 'platinum' || m.tier === 'gold')).slice(0, 30);
      const allMembers = dir.filter(m => m.chamberMember).slice(0, 200);
      const events = loadJson('events.json').slice(0, 15);
      const guides = loadJson('guides.json');
      const groups = loadJson('networking-groups.json', []);
      const loyalty = loadJson('loyalty-partners.json', []);

      const system = `You are the Chamber Concierge for the **West Valley · Warner Center Chamber of Commerce**, serving Tarzana, Woodland Hills, Reseda, and Warner Center since 1930.

Your job: help residents and visitors find the right member business, event, guide, networking group, or loyalty offer. ALWAYS recommend Chamber MEMBERS first (chamberMember: true), prioritized by tier: platinum > gold > silver > bronze > supporter > friend > member.

Voice: warm, concise, locally-grounded, "concierge for the Valley" — never robotic. 3-5 sentences max in the reply field.

If no member matches the request, politely say so and suggest the closest alternatives — never fabricate businesses.

Return ONLY valid JSON of shape:
{
  "reply": "your conversational reply",
  "cards": [{ "title": "...", "meta": "category · neighborhood · phone", "body": "tagline or short useful info", "href": "...", "badge": "Chamber Member" or null }],
  "actions": [{ "label": "Book on OpenTable", "url": "..." }, { "label": "Get directions", "url": "..." }]
}

For card hrefs: members → 'members/profile.html?id={id}' · events → 'events/index.html#{id}' · guides → 'guides/{slug}.html' · groups → 'community/connection-circles.html#{id}'`;

      const ctx = `FEATURED CHAMBER MEMBERS (top tiers):
${featured.map(m => `- [${m.tier}] ${m.name} | ${m.category||''} | ${m.neighborhood||'West Valley'} | ${m.tagline||''} | ${m.phone||''} | id: ${m.id}`).join('\n')}

OTHER CHAMBER MEMBERS (sampled):
${allMembers.slice(30).slice(0, 60).map(m => `- ${m.name} | ${m.category||''} | id: ${m.id}`).join('\n')}

UPCOMING EVENTS:
${events.map(e => `- ${e.date} ${e.time||''} | ${e.title} | ${e.location||''} | ${e.category||''} | $${e.price||0} | id: ${e.id}`).join('\n')}

GUIDES:
${guides.map(g => `- ${g.title} (slug: ${g.slug}) — ${g.tagline}`).join('\n')}

NETWORKING GROUPS:
${groups.map(g => `- ${g.name}: ${g.description}`).join('\n')}

LOYALTY OFFERS (West Valley Loyalty Card):
${loyalty.slice(0, 20).map(l => `- ${l.business}: ${l.offer}`).join('\n')}`;

      const messages = [
        ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: `User is on page: ${page || '/'}\n\nUser: ${message}\n\nDirectory context:\n${ctx}` }
      ];

      const response = await anthropic.messages.create({
        model: MODEL_CONCIERGE,
        max_tokens: 1400,
        system,
        messages
      });

      const raw = response.content[0].text.trim();
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch {
        const m = raw.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : { reply: raw, cards: [], actions: [] };
      }

      // Log the conversation for staff dashboard insights.
      appendStore('concierge', { message, reply: parsed.reply, page, model: MODEL_CONCIERGE });
      res.json(parsed);
    } catch (err) {
      console.error('Concierge error:', err.message);
      res.status(500).json({
        reply: "I'm having trouble reaching the Chamber's directory right now. Browse the Member Directory or Events calendar from the menu — I'll be back shortly.",
        cards: [], actions: []
      });
    }
  });

  // ── Staff AI Assistant — Opus 4.7 (best reasoning) ─────
  app.post('/api/staff-assistant', async (req, res) => {
    try {
      const { message, history = [] } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message required' });

      const dir = loadJson('directory.json');
      const events = loadJson('events.json');
      const concierge = readStore('concierge').slice(-30);
      const referrals = readStore('referrals');
      const onboarding = readStore('onboarding');

      const system = `You are the AI Staff Assistant for **Diana Williams**, CEO of the West Valley · Warner Center Chamber of Commerce. You also support Felicia (Executive Assistant) and the rest of the team.

You help Diana run a 800+ member organization. You can:
• Draft newsletters, social posts, blog articles, member emails
• Summarize what needs Diana's attention right now
• Answer operational questions (membership, billing, events, programs)
• Propose actions (schedule events, send dunning sequences, create reports)
• Analyze member churn, sponsorship pipeline, concierge insights, loyalty program redemptions
• Generate outreach sequences for prospective members
• Draft RFPs, sponsor decks, board summaries

Always address Diana by name (or "Diana" / "Diana Williams"). Be specific, concise, and action-oriented. When proposing actions, structure them as numbered options Diana can pick. When drafting content, write in the Chamber's voice: warm, professional, hyper-local. Use "chamber of commerce" instead of "chamber" in formal copy (Diana's preference).

Return plain text — no JSON wrapping. Use markdown for structure when helpful.`;

      const ctx = `Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

Active directory entries: ${dir.length}
- Chamber members: ${dir.filter(m => m.chamberMember).length}
- Community businesses: ${dir.filter(m => !m.chamberMember).length}

Upcoming events: ${events.length}
Recent concierge questions (last 30):
${concierge.slice(-10).map(c => `- "${c.message.slice(0, 80)}"`).join('\n')}

Pending referrals: ${referrals.length}
Pending onboarding applications: ${onboarding.filter(o => o.status === 'pending').length}

Top members by tier: ${dir.filter(m => m.tier === 'platinum').slice(0, 5).map(m => m.name).join(', ')}

Next 5 events:
${events.slice(0, 5).map(e => `- ${e.date} ${e.title} (${e.category||''})`).join('\n')}`;

      const messages = [
        ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: `Context:\n${ctx}\n\nDiana asks: ${message}` }
      ];

      const response = await anthropic.messages.create({
        model: MODEL_STAFF,
        max_tokens: 2400,
        system,
        messages
      });

      res.json({ reply: response.content[0].text.trim(), model: MODEL_STAFF });
    } catch (err) {
      console.error('Staff assistant error:', err.message);
      res.status(500).json({ reply: "Connection issue with the AI provider. Check ANTHROPIC_API_KEY in the env." });
    }
  });

  // ── Outreach Workflow — agentic for prospective new members ──
  // Diana clicks "Reach out" on a prospect and this generates a 3-email sequence
  // tailored to their business type + membership benefits + an event invite.
  app.post('/api/outreach/draft', async (req, res) => {
    try {
      const { businessName, contactName, category, neighborhood, source } = req.body || {};
      const events = loadJson('events.json').slice(0, 5);

      const system = `You are drafting a 3-email outreach sequence for the West Valley · Warner Center Chamber of Commerce, signed by Diana Williams (CEO) or Felicia Paust (Executive Assistant).

Output JSON shape:
{
  "subject1": "...", "body1": "...",
  "subject2": "...", "body2": "...",
  "subject3": "...", "body3": "...",
  "channel": "email",
  "cadence": "Day 0, Day 4, Day 11",
  "notes": "any context for Diana"
}

Email 1: warm intro, reference how we found them (${source||'public listing / event'}), 2-3 specific Chamber benefits relevant to their vertical, single soft CTA (15-min coffee or visit a free networking event).
Email 2: value-add — share a specific event coming up that fits their business, or a free resource (guide, deal page).
Email 3: short check-in, low-friction ask, mention a peer member in the same vertical they could meet.

Voice: warm, locally-grounded, no fluff, no hype. Specific to Tarzana/Woodland Hills/Reseda/Warner Center.

Use "chamber of commerce" rather than "chamber" in formal sentences (Diana's preference).`;

      const ctx = `Prospect:
- Business: ${businessName}
- Contact: ${contactName || 'there'}
- Category: ${category || 'unknown'}
- Neighborhood: ${neighborhood || 'West Valley'}
- Source: ${source || 'directory enrichment'}

Upcoming events to mention if relevant:
${events.map(e => `- ${e.date} ${e.title} | ${e.location} | ${e.category}`).join('\n')}`;

      const response = await anthropic.messages.create({
        model: MODEL_STAFF,
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: ctx }]
      });

      const raw = response.content[0].text.trim();
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { const m = raw.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : { error: 'parse failed', raw }; }
      appendStore('outreach', { businessName, contactName, ...parsed });
      res.json(parsed);
    } catch (err) {
      console.error('Outreach error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Automated Onboarding (new member) ──────────────────
  // Step 1: payment captured (Square). Step 2: onboarding form. Step 3: auto-or-human approval. Step 4: listed within 1 hour.
  app.post('/api/onboarding/start', (req, res) => {
    const { tier, customer } = req.body || {};
    const id = 'onb_' + Date.now();
    appendStore('onboarding', {
      id, tier, customer,
      status: 'payment_pending',
      stage: 'payment',
      createdAt: new Date().toISOString()
    });
    res.json({ ok: true, onboardingId: id, nextStep: 'payment' });
  });

  app.post('/api/onboarding/complete', async (req, res) => {
    const {
      onboardingId, businessName, contactName, email, phone, website,
      category, neighborhood, address, tagline, description, tags, logo,
      socialLinks, hours, photos, deals, autoApprove
    } = req.body || {};

    // Trust signals for auto-approval
    const knownVerticals = ['restaurant', 'retail', 'professional', 'healthcare', 'home', 'beauty', 'fitness'];
    const trustScore =
      (website ? 1 : 0) +
      (phone ? 1 : 0) +
      (description && description.length > 80 ? 1 : 0) +
      (tagline ? 1 : 0) +
      (knownVerticals.some(v => (category||'').toLowerCase().includes(v)) ? 1 : 0);

    const auto = autoApprove !== false && trustScore >= 4;
    const status = auto ? 'auto_approved' : 'pending_review';

    appendStore('onboarding', {
      onboardingId, businessName, contactName, email, phone, website,
      category, neighborhood, address, tagline, description, tags, logo,
      socialLinks, hours, photos, deals,
      trustScore, status, stage: auto ? 'live' : 'review',
      eta: auto ? 'live within 5 minutes' : 'human review within 1 business hour',
      completedAt: new Date().toISOString()
    });

    // If auto-approved, write directly into the live directory file.
    if (auto) {
      try {
        const dir = loadJson('directory.json');
        const slug = (businessName || 'new-member').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!dir.find(x => x.id === slug)) {
          dir.unshift({
            id: slug, name: businessName, contactName, email, phone, website,
            category, neighborhood: neighborhood || 'West Valley', address,
            tagline, description, tier: 'member', chamberMember: true,
            tags: tags || [], logo: logo || (businessName||'?').charAt(0),
            featured: false, autoApproved: true,
            createdAt: new Date().toISOString()
          });
          fs.writeFileSync(path.join(DATA_DIR, 'directory.json'), JSON.stringify(dir, null, 2));
        }
      } catch (e) { console.error('Auto-approve directory write failed:', e.message); }
    }

    res.json({ ok: true, status, trustScore, eta: auto ? '5 minutes' : '1 business hour' });
  });

  // ── Optional upgrades (sponsorships, newsletter spotlights, email blasts) ──
  app.post('/api/upgrades/purchase', (req, res) => {
    const { onboardingId, items, amount } = req.body || {};
    appendStore('upgrades', { onboardingId, items, amount });
    res.json({ ok: true, message: 'Upgrade pending payment confirmation. Square checkout will be triggered next.' });
  });

  // ── Loyalty Program ────────────────────────────────────
  app.post('/api/loyalty/enroll', (req, res) => {
    const { businessId, businessName, offer, terms } = req.body || {};
    appendStore('loyalty_enrollments', { businessId, businessName, offer, terms });
    res.json({ ok: true, message: 'Loyalty offer enrolled. In-store materials kit ships within 5 business days.' });
  });
  app.post('/api/loyalty/redeem', (req, res) => {
    const { cardId, businessId, amount, offer } = req.body || {};
    appendStore('loyalty_redemptions', { cardId, businessId, amount, offer });
    res.json({ ok: true, redemptionId: 'rd_' + Date.now() });
  });
  app.post('/api/loyalty/issue-card', (req, res) => {
    const { name, email, phone } = req.body || {};
    const cardId = 'WV' + Math.random().toString(36).slice(2, 10).toUpperCase();
    appendStore('loyalty_cards', { cardId, name, email, phone });
    res.json({ ok: true, cardId, walletPassUrl: `https://www.woodlandhillscc.net/loyalty/wallet?id=${cardId}` });
  });

  // ── Resource-specific newsletters ──────────────────────
  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email, lists, source } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    appendStore('newsletter_subs', { email, lists: lists || ['weekly'], source });
    res.json({ ok: true, message: 'Subscribed to ' + (lists||['West Valley Weekly']).join(', ') + '.' });
  });
  app.get('/api/newsletter/lists', (_req, res) => res.json([
    { id: 'weekly',   name: 'The West Valley Weekly',     desc: 'Friday roundup of events, member spotlights, what to do this weekend.' },
    { id: 'parents',  name: 'Valley Parents',              desc: 'Monthly — schools, kid activities, pediatric & family services.' },
    { id: 'dining',   name: 'Dine SFV',                    desc: 'Bi-weekly — restaurant openings, deals, chef interviews.' },
    { id: 'business', name: 'Valley Biz Brief',            desc: 'Weekly — small-business tips, regulation updates, AI tools.' },
    { id: 'wellness', name: 'Wellness Network Digest',     desc: 'Monthly — spas, fitness, healthcare, mental wellness.' },
    { id: 'events',   name: 'This Week in the Valley',     desc: 'Sundays — every Chamber event in the next 7 days.' },
    { id: 'sponsors', name: 'Sponsor Insider',             desc: 'Quarterly — for sponsors only, performance + opportunities.' },
    { id: 'realestate', name: 'Valley Real Estate',        desc: 'Monthly — listings, market data, member realtor spotlights.' }
  ]));

  // ── Networking Groups (members only) ───────────────────
  app.post('/api/networking-groups/join', (req, res) => {
    const { groupId, memberId } = req.body || {};
    appendStore('group_joins', { groupId, memberId });
    res.json({ ok: true, message: 'Joined. Group leader will reach out within 2 business days.' });
  });

  // ── Referrals ──────────────────────────────────────────
  app.post('/api/referrals', (req, res) => {
    const ref = req.body || {};
    appendStore('referrals', ref);
    res.json({ ok: true, message: 'Referral logged. We\'ll reach out within 1 business day and credit your account when they join.' });
  });

  // ── Bookings (Square, OpenTable, Calendly patterns) ────
  app.post('/api/bookings/initiate', (req, res) => {
    const { provider, memberId, payload } = req.body || {};
    appendStore('bookings', { provider, memberId, payload });
    // In production: call provider API and return redirect URL or embed token.
    const map = {
      square: { redirect: 'https://squareup.com/appointments/book' },
      opentable: { redirect: 'https://www.opentable.com/r/' + (memberId||'') },
      resy: { redirect: 'https://resy.com/cities/la/venues/' + (memberId||'') },
      calendly: { redirect: 'https://calendly.com/' + (memberId||'') },
      yelp: { redirect: 'https://www.yelp.com/biz/' + (memberId||'') }
    };
    res.json({ ok: true, ...(map[provider] || {}), provider });
  });

  // ── Payments (Square) ──────────────────────────────────
  app.post('/api/payments/charge', async (req, res) => {
    const { sourceId, amount, currency, idempotencyKey, metadata } = req.body || {};
    appendStore('charges', { sourceId, amount, currency, idempotencyKey, metadata });
    /* PROD:
       const { Client, Environment } = require('square');
       const sq = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: Environment.Production });
       const r = await sq.paymentsApi.createPayment({
         sourceId, idempotencyKey: idempotencyKey || crypto.randomUUID(),
         amountMoney: { amount: Math.round(amount*100), currency: currency||'USD' }
       });
       return res.json({ ok: true, payment: r.result.payment });
    */
    res.json({
      ok: true, stub: true,
      payment: { id: `demo_${Date.now()}`, status: 'COMPLETED', amount, currency: currency||'USD', metadata: metadata||{} }
    });
  });

  app.post('/api/memberships/subscribe', (req, res) => {
    const { tier, customer } = req.body || {};
    appendStore('memberships', { tier, customer });
    res.json({ ok: true, stub: true, tier, customer });
  });

  // ── Content / blog ─────────────────────────────────────
  app.post('/api/blog/pitch', (req, res) => {
    appendStore('blog_pitches', req.body || {});
    res.json({ ok: true, message: 'Pitch received. The editor will review within 2 business days.' });
  });

  app.post('/api/members/lead', (req, res) => {
    appendStore('member_leads', req.body || {});
    res.json({ ok: true, message: 'Lead routed to member + logged.' });
  });

  // ── Auth (stubs — wire to real provider in prod) ───────
  app.post('/api/auth/member-login', (_req, res) => res.json({ ok: true, stub: true, token: 'demo.member.jwt', role: 'member' }));
  app.post('/api/auth/staff-login',  (_req, res) => res.json({ ok: true, stub: true, token: 'demo.staff.jwt',  role: 'staff', name: 'Diana Williams' }));

  // ── Admin queues for the Staff Desktop Assistant ───────
  app.get('/api/admin/queues', (_req, res) => res.json({
    onboarding: readStore('onboarding').filter(o => o.status === 'pending_review'),
    referrals: readStore('referrals'),
    blog_pitches: readStore('blog_pitches'),
    member_leads: readStore('member_leads'),
    upgrades: readStore('upgrades'),
    loyalty_enrollments: readStore('loyalty_enrollments')
  }));

  // ── Ad Inventory & Revenue ─────────────────────────────
  app.get('/api/admin/ads', (req, res) => {
    const inv = loadJson('ad-inventory.json');
    const sold = inv.filter(i => i.status === 'sold');
    const mrr = sold.reduce((s, i) => s + (i.term === 'annual' ? i.pricing.introAnnual / 12 : i.pricing.introMonthly), 0);
    const arr = sold.reduce((s, i) => s + (i.term === 'annual' ? i.pricing.introAnnual : i.pricing.introMonthly * 12), 0);
    const potentialAnnual2026 = inv.reduce((s, i) => s + i.pricing.introAnnual, 0);
    const potentialAnnual2027 = inv.reduce((s, i) => s + i.pricing.newAnnual, 0);
    res.json({
      inventory: inv,
      summary: {
        total: inv.length,
        sold: sold.length,
        available: inv.length - sold.length,
        soldPct: inv.length ? +((sold.length / inv.length) * 100).toFixed(1) : 0,
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        potentialAnnual2026: potentialAnnual2026,
        potentialAnnual2027: potentialAnnual2027,
        introExpires: '2026-12-31',
        newPricingStarts: '2027-01-01'
      }
    });
  });

  app.post('/api/admin/ads/:id/sell', (req, res) => {
    const { buyer, term, termStart, termEnd, notes } = req.body || {};
    if (!buyer) return res.status(400).json({ error: 'buyer required' });
    try {
      const inv = loadJson('ad-inventory.json');
      const idx = inv.findIndex(i => i.id === req.params.id);
      if (idx < 0) return res.status(404).json({ error: 'Ad space not found' });
      inv[idx].status = 'sold';
      inv[idx].buyer = buyer;
      inv[idx].term = term || 'annual';
      inv[idx].termStart = termStart || new Date().toISOString().slice(0, 10);
      inv[idx].termEnd = termEnd;
      inv[idx].notes = notes || '';
      fs.writeFileSync(path.join(DATA_DIR, 'ad-inventory.json'), JSON.stringify(inv, null, 2));
      appendStore('ad_sales', inv[idx]);
      res.json({ ok: true, item: inv[idx] });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/ads/:id/release', (req, res) => {
    try {
      const inv = loadJson('ad-inventory.json');
      const idx = inv.findIndex(i => i.id === req.params.id);
      if (idx < 0) return res.status(404).json({ error: 'Not found' });
      inv[idx].status = 'available';
      inv[idx].buyer = null;
      inv[idx].termStart = null; inv[idx].termEnd = null; inv[idx].term = null;
      fs.writeFileSync(path.join(DATA_DIR, 'ad-inventory.json'), JSON.stringify(inv, null, 2));
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ── Member account operations (Diana's portal) ─────────
  // List + filter + paginate members for the admin members page.
  app.get('/api/admin/members', (req, res) => {
    const { q = '', category, neighborhood, tier, chamberOnly, limit = 100, offset = 0 } = req.query;
    let dir = loadJson('directory.json');
    const ql = String(q).toLowerCase();
    if (ql) dir = dir.filter(m => [m.name, m.category, m.contactName, m.email, m.tagline].filter(Boolean).join(' ').toLowerCase().includes(ql));
    if (category) dir = dir.filter(m => m.category === category);
    if (neighborhood) dir = dir.filter(m => m.neighborhood === neighborhood);
    if (tier) dir = dir.filter(m => m.tier === tier);
    if (chamberOnly === '1' || chamberOnly === 'true') dir = dir.filter(m => m.chamberMember);
    const total = dir.length;
    const page = dir.slice(+offset, +offset + +limit);
    res.json({ total, returned: page.length, members: page });
  });

  // Single-member view with full activity history.
  app.get('/api/admin/members/:id', (req, res) => {
    const dir = loadJson('directory.json');
    const m = dir.find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });

    const id = req.params.id;
    const charges = readStore('charges').filter(c => (c.metadata && c.metadata.memberId) === id);
    const upgrades = readStore('upgrades').filter(u => u.onboardingId === id || u.memberId === id);
    const refsOut = readStore('referrals').filter(r => r.referrerMemberId === id || r.referrerEmail === m.email);
    const refsIn  = readStore('referrals').filter(r => r.referredEmail === m.email);
    const groupJoins = readStore('group_joins').filter(g => g.memberId === id);
    const loyaltyEnrolls = readStore('loyalty_enrollments').filter(l => l.businessId === id || l.businessName === m.name);
    const concierge = readStore('concierge').filter(c => (c.memberId || '') === id).slice(-20);

    res.json({
      member: m,
      history: {
        charges,
        upgrades,
        referralsOut: refsOut, referralsIn: refsIn,
        groupJoins,
        loyaltyEnrollments: loyaltyEnrolls,
        recentConciergeMentions: concierge
      },
      summary: {
        totalSpend: charges.reduce((s, c) => s + (+c.amount || 0), 0),
        upgradeCount: upgrades.length,
        referralsClosed: refsOut.filter(r => r.status === 'joined').length,
        joinedDate: m.createdAt || null
      }
    });
  });

  // Add a feature/upgrade to a member's account (called when they purchase).
  app.post('/api/admin/members/:id/features', (req, res) => {
    const id = req.params.id;
    const { feature, expiresAt, notes } = req.body || {};
    if (!feature) return res.status(400).json({ error: 'feature required' });

    appendStore('member_features', { memberId: id, feature, expiresAt, notes, addedAt: new Date().toISOString() });

    // Optionally mutate the directory entry to reflect the upgrade.
    try {
      const dir = loadJson('directory.json');
      const idx = dir.findIndex(x => x.id === id);
      if (idx >= 0) {
        dir[idx].features = dir[idx].features || [];
        if (!dir[idx].features.includes(feature)) dir[idx].features.push(feature);
        if (feature === 'premium_listing') dir[idx].featured = true;
        if (feature.startsWith('tier_upgrade_')) dir[idx].tier = feature.replace('tier_upgrade_', '');
        fs.writeFileSync(path.join(DATA_DIR, 'directory.json'), JSON.stringify(dir, null, 2));
      }
    } catch (e) { console.error('Feature persistence error:', e.message); }

    res.json({ ok: true });
  });

  // Upgrade tier (atomic).
  app.post('/api/admin/members/:id/tier', (req, res) => {
    const id = req.params.id;
    const { tier } = req.body || {};
    if (!['friend','member','bronze','silver','gold','platinum','supporter'].includes(tier)) {
      return res.status(400).json({ error: 'invalid tier' });
    }
    try {
      const dir = loadJson('directory.json');
      const idx = dir.findIndex(x => x.id === id);
      if (idx < 0) return res.status(404).json({ error: 'Not found' });
      const oldTier = dir[idx].tier;
      dir[idx].tier = tier;
      fs.writeFileSync(path.join(DATA_DIR, 'directory.json'), JSON.stringify(dir, null, 2));
      appendStore('tier_changes', { memberId: id, from: oldTier, to: tier });
      res.json({ ok: true, from: oldTier, to: tier });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Public member-facing self-service: see my own portal data.
  app.get('/api/members/me/:idOrEmail', (req, res) => {
    const key = decodeURIComponent(req.params.idOrEmail);
    const dir = loadJson('directory.json');
    const m = dir.find(x => x.id === key || (x.email && x.email.toLowerCase() === key.toLowerCase()));
    if (!m) return res.status(404).json({ error: 'Not found' });
    const upgrades = readStore('upgrades').filter(u => u.email === m.email || u.memberId === m.id);
    const features = readStore('member_features').filter(f => f.memberId === m.id);
    const refsOut = readStore('referrals').filter(r => r.referrerEmail === m.email);
    res.json({ member: m, features, upgrades, referrals: refsOut });
  });

  console.log('✓ Chamber routes mounted (Concierge: Sonnet 4.6, Staff: Opus 4.7)');
}

module.exports = attachChamberRoutes;
