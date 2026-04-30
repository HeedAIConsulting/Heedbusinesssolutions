/* ============================================================
   West Valley ~ Warner Center Chamber — API routes
   Mounted onto the main Heed Express app from server.js
   ============================================================ */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DATA_DIR = path.join(__dirname, '..', 'websites', 'chamber', 'data');

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch (e) {
    console.error('Could not load', file, e.message);
    return [];
  }
}

function attachChamberRoutes(app) {
  // ── Health ──────────────────────────────────────────
  app.get('/api/chamber', (req, res) => {
    res.json({ status: 'ok', service: 'WVWC Chamber API', timestamp: new Date().toISOString() });
  });

  // ── Public data endpoints ────────────────────────────
  app.get('/api/members', (req, res) => res.json(loadJson('members.json')));
  app.get('/api/events', (req, res) => res.json(loadJson('events.json')));
  app.get('/api/guides', (req, res) => res.json(loadJson('guides.json')));

  app.get('/api/members/:id', (req, res) => {
    const m = loadJson('members.json').find(x => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m);
  });

  app.get('/api/events/:id', (req, res) => {
    const e = loadJson('events.json').find(x => x.id === req.params.id);
    if (!e) return res.status(404).json({ error: 'Not found' });
    res.json(e);
  });

  // ── AI Concierge ─────────────────────────────────────
  // Public-facing AI: routes residents/visitors to members, events, guides.
  app.post('/api/concierge', async (req, res) => {
    try {
      const { message, page } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message required' });

      const members = loadJson('members.json');
      const events = loadJson('events.json').slice(0, 20);
      const guides = loadJson('guides.json');

      const system = `You are the Chamber Concierge for the West Valley ~ Warner Center Chamber of Commerce, serving Tarzana, Woodland Hills, Reseda, and Warner Center.

Your job: help residents and visitors find the right member business, event, or community resource. Always recommend Chamber MEMBERS first. Tier priority: platinum > gold > silver > bronze > supporter > friend.

Be warm, concise (3-5 sentences max in the reply field), and useful. If you recommend businesses or events, always include them as structured cards in the cards array.

If no member matches the request, politely say so and suggest alternatives — don't fabricate businesses.

Return ONLY valid JSON with this shape:
{ "reply": "your conversational reply", "cards": [ { "title": "...", "meta": "category · neighborhood · phone", "body": "tagline", "href": "..." } ] }`;

      const ctx = `MEMBERS (${members.length}):
${members.map(m => `- ${m.name} (${m.tier}) | ${m.category} | ${m.neighborhood} | ${m.tagline||''} | tags: ${(m.tags||[]).join(', ')} | id: ${m.id}`).join('\n')}

UPCOMING EVENTS:
${events.map(e => `- ${e.date} ${e.time} | ${e.title} | ${e.location} | ${e.category} | ${e.audience} | $${e.price} | id: ${e.id}`).join('\n')}

GUIDES:
${guides.map(g => `- ${g.title} (slug: ${g.slug}) — ${g.tagline}`).join('\n')}

For card hrefs:
- Member: members/profile.html?id={id}
- Event: events/index.html#{id}
- Guide: guides/{slug}.html`;

      const userMsg = `User is on page: ${page || '/'}\n\nUser message: ${message}\n\nContext:\n${ctx}`;

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: userMsg }]
      });

      const raw = response.content[0].text.trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { reply: raw, cards: [] };
      }
      res.json(parsed);
    } catch (err) {
      console.error('Concierge error:', err.message);
      res.status(500).json({
        reply: "I'm having trouble reaching the Chamber's directory right now. Try the Member Directory or Events page from the menu, and I'll be back online shortly.",
        cards: []
      });
    }
  });

  // ── Staff AI Assistant ───────────────────────────────
  // Internal AI for chamber staff: drafts content, answers ops questions, queues actions.
  app.post('/api/staff-assistant', async (req, res) => {
    try {
      const { message } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message required' });

      const members = loadJson('members.json');
      const events = loadJson('events.json');

      const system = `You are the AI Staff Assistant for the West Valley ~ Warner Center Chamber of Commerce.

You support a 2-3 person staff running a 450-member organization. You can:
- draft newsletters, social posts, blog articles, member emails
- summarize what needs the staff's attention
- answer operational questions (membership, billing, events, programs)
- propose actions (schedule events, send dunning sequences, create reports)
- analyze member churn, sponsorship pipeline, concierge insights

Be specific, concise, and action-oriented. When proposing actions, structure them as numbered options the staff can pick. When drafting content, write in the Chamber's voice: warm, professional, hyper-local.

Return plain text — no JSON wrapping.`;

      const ctx = `Active members: ${members.length}
Upcoming events: ${events.length}
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

Top members by tier: ${members.filter(m => m.tier === 'platinum').map(m => m.name).join(', ')}

Next 5 events:
${events.slice(0, 5).map(e => `- ${e.date} ${e.title} (${e.category})`).join('\n')}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: `Context:\n${ctx}\n\nStaff request: ${message}` }]
      });

      res.json({ reply: response.content[0].text.trim() });
    } catch (err) {
      console.error('Staff assistant error:', err.message);
      res.status(500).json({ reply: "Connection issue with the AI provider. The route is /api/staff-assistant — check ANTHROPIC_API_KEY." });
    }
  });

  // ── Payments (Square) ────────────────────────────────
  // STUB — In production, swap in @square/web-payments-sdk-types on the front-end
  // and the Square Node.js SDK here. The shape below mirrors what we'd use.
  app.post('/api/payments/charge', async (req, res) => {
    const { sourceId, amount, currency, idempotencyKey, metadata } = req.body || {};
    // Real implementation:
    // const { Client, Environment } = require('square');
    // const sq = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: Environment.Production });
    // const r = await sq.paymentsApi.createPayment({ sourceId, idempotencyKey, amountMoney: { amount: amount*100, currency } });
    res.json({
      ok: true,
      stub: true,
      message: 'Demo mode. In production this hits Square /v2/payments and emits webhook events for confirmation, ledger update, and Heed revenue-share remit.',
      payment: { id: `demo_${Date.now()}`, status: 'COMPLETED', amount, currency: currency || 'USD', metadata: metadata || {} }
    });
  });

  app.post('/api/memberships/subscribe', (req, res) => {
    const { tier, customer } = req.body || {};
    res.json({ ok: true, stub: true, message: 'Demo mode. Square recurring billing token would be created and stored.', tier, customer });
  });

  // ── Content / blog / pitches ─────────────────────────
  app.post('/api/blog/pitch', (req, res) => {
    res.json({ ok: true, message: 'Pitch received. Emailed to the editor queue.' });
  });

  app.post('/api/members/lead', (req, res) => {
    res.json({ ok: true, message: 'Lead routed to member + logged in admin.' });
  });

  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    res.json({ ok: true, message: 'Subscribed. Welcome to the West Valley Weekly.' });
  });

  // ── Auth (stub) ──────────────────────────────────────
  app.post('/api/auth/member-login', (req, res) => {
    // Real: validate credentials against members table, issue JWT
    res.json({ ok: true, stub: true, token: 'demo.member.jwt', role: 'member' });
  });

  app.post('/api/auth/staff-login', (req, res) => {
    // Real: validate credentials + 2FA, issue JWT with staff role
    res.json({ ok: true, stub: true, token: 'demo.staff.jwt', role: 'staff' });
  });

  // ── Static file serving for the chamber site (optional) ──
  // If you want the same Express server to serve the chamber site directly:
  // app.use('/', express.static(path.join(__dirname, '..', 'websites', 'chamber')));

  console.log('✓ Chamber routes mounted at /api/...');
}

module.exports = attachChamberRoutes;
