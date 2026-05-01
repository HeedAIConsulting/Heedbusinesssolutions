/* ============================================================
   West Valley ~ Warner Center Chamber of Commerce
   Self-contained Express server (static + API + AI Concierge)

   One process. One port (5500). Everything works.

   - Serves all static HTML/CSS/JS from this folder
   - Mounts /api/* endpoints for concierge, members, events, etc.
   - AI Concierge: real Claude if ANTHROPIC_API_KEY is set,
     otherwise smart keyword-based mock so the demo always feels alive.
   ============================================================ */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Optional .env loading (no error if dotenv missing)
try { require('dotenv').config(); } catch (_) {}

// Optional Anthropic SDK (no error if missing — falls back to mock)
let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); } catch (_) {}

const app = express();
const PORT = parseInt(process.env.PORT || '5500', 10);
const DATA = path.join(__dirname, 'data');

app.use(express.json({ limit: '1mb' }));

// ── Static files ────────────────────────────────────────────────
app.use(express.static(__dirname, { extensions: ['html'] }));

// ── Helpers ─────────────────────────────────────────────────────
function loadJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch (e) { console.error('JSON load failed:', file, e.message); return []; }
}

const anthropic = (Anthropic && process.env.ANTHROPIC_API_KEY)
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ── Health + data endpoints ─────────────────────────────────────
app.get('/api/chamber', (req, res) => res.json({
  status: 'ok',
  service: 'WVWC Chamber API',
  ai: anthropic ? 'live' : 'demo',
  timestamp: new Date().toISOString()
}));
app.get('/api/members', (req, res) => res.json(loadJson('members.json')));
app.get('/api/events',  (req, res) => res.json(loadJson('events.json')));
app.get('/api/guides',  (req, res) => res.json(loadJson('guides.json')));
app.get('/api/members/:id', (req, res) => {
  const m = loadJson('members.json').find(x => x.id === req.params.id);
  m ? res.json(m) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/events/:id', (req, res) => {
  const e = loadJson('events.json').find(x => x.id === req.params.id);
  e ? res.json(e) : res.status(404).json({ error: 'Not found' });
});

// ── AI Concierge (with smart mock fallback) ─────────────────────
function mockConcierge(message) {
  const m = (message || '').toLowerCase();
  const members = loadJson('members.json');
  const events = loadJson('events.json');

  const tierRank = { platinum: 0, gold: 1, silver: 2, bronze: 3, supporter: 4, friend: 5 };
  const sortByTier = arr => [...arr].sort((a, b) => (tierRank[a.tier] - tierRank[b.tier]));

  // Events queries
  if (/\b(event|happen|week|tonight|tomorrow|weekend|networking|mixer|breakfast|calendar|food.*wine)\b/.test(m)) {
    const upcoming = events.slice(0, 4);
    return {
      reply: "Here's what's coming up at the Chamber — click any to RSVP or buy tickets.",
      cards: upcoming.map(e => ({
        title: e.title,
        meta: `${new Date(e.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} · ${e.location} · ${e.price > 0 ? '$' + e.price : 'Free'}`,
        body: e.summary,
        href: `events/index.html#${e.id}`
      }))
    };
  }

  // Membership / join
  if (/\b(join|member|chamber|sign.?up|how.*get.*in|becom)\b/.test(m)) {
    return {
      reply: "Joining is easy. Six tiers from Friend ($120/yr) to Platinum ($6,000/yr). Every tier includes directory listing, event access, and AI Concierge inclusion. Premium Listings and event sponsorships are add-ons.",
      cards: [
        { title: 'See membership tiers', meta: 'Six tiers · annual or monthly', body: 'Transparent pricing.', href: 'join.html' },
        { title: 'Sponsorship menu', meta: 'Premium listings · events · ads', body: 'Higher visibility, more leads.', href: 'sponsor.html' }
      ]
    };
  }

  // Categorical lookups
  let bucket = null;
  if (/\b(plumb|water heater|leak|drain|pipe|burst)\b/.test(m)) bucket = ['Home Services', /plumb/i];
  else if (/\b(electric|electrician|panel|outlet|wiring)\b/.test(m)) bucket = ['Home Services', /electric|wiring|panel/i];
  else if (/\b(hvac|a\/?c|air condit|heating|furnace|cooling)\b/.test(m)) bucket = ['Home Services', /hvac|heat|cool/i];
  else if (/\b(roof|gutter)\b/.test(m)) bucket = ['Home Services', /roof|gutter/i];
  else if (/\b(landscap|garden|yard|lawn)\b/.test(m)) bucket = ['Home Services', /landscap|garden/i];
  else if (/\b(restaurant|dinner|lunch|brunch|food|eat|date.?night|dining|cuisine)\b/.test(m)) bucket = ['Restaurant', null];
  else if (/\b(spa|massage|cryo|wellness|recovery|facial|sauna|skincare|yoga)\b/.test(m)) bucket = ['Health & Wellness', null];
  else if (/\b(preschool|daycare|kid|child|tutor|after.?school|school|montessori)\b/.test(m)) bucket = ['Family & Kids', null];
  else if (/\b(hotel|stay|venue|wedding|catering)\b/.test(m)) bucket = ['Hospitality', null];
  else if (/\b(dental|dentist|doctor|medical|hospital|pediatric|physician)\b/.test(m)) bucket = ['Healthcare', null];
  else if (/\b(cpa|accountant|tax|book.?keep|legal|lawyer|attorney|estate)\b/.test(m)) bucket = ['Professional Services', null];
  else if (/\b(it|computer|tech|cyber|software|network)\b/.test(m)) bucket = ['Technology', null];
  else if (/\b(real.?estate|home.*buy|home.*sell|realtor|agent|broker)\b/.test(m)) bucket = ['Real Estate', null];
  else if (/\b(camera|photo|telescope)\b/.test(m)) bucket = ['Retail', null];
  else if (/\b(bowl|fun|family.*activit|entertain)\b/.test(m)) bucket = ['Entertainment', null];
  else if (/\b(golf|tennis|club|recreation)\b/.test(m)) bucket = ['Recreation', null];

  let matches = [];
  if (bucket) {
    matches = members.filter(x => x.category === bucket[0]);
    if (bucket[1]) {
      const tagFilter = members.filter(x =>
        x.category === bucket[0] &&
        ((x.tags || []).some(t => bucket[1].test(t)) || bucket[1].test(x.tagline || '') || bucket[1].test(x.name))
      );
      if (tagFilter.length) matches = tagFilter;
    }
    matches = sortByTier(matches);
  }

  // Concierge / how-it-works queries
  if (/\b(how.*work|what.*do|help|recommend|find|need)\b/.test(m) && matches.length === 0) {
    matches = sortByTier(members.filter(x => x.featured)).slice(0, 4);
  }

  if (matches.length === 0) {
    return {
      reply: "I'm not sure I matched that perfectly. Try the Member Directory to browse, or ask me about a category — restaurants, plumbers, spas, kids' programs, real estate, and more.",
      cards: [
        { title: 'Member Directory', meta: '450+ businesses', body: 'Searchable, filterable, tier-sorted.', href: 'members/directory.html' },
        { title: 'Events Calendar', meta: 'List + month view', body: 'Networking, mixers, signature events.', href: 'events/index.html' },
        { title: 'Resource Guides', meta: '8 curated guides', body: 'Restaurant, parent, spa, home services, more.', href: 'guides/index.html' }
      ]
    };
  }

  return {
    reply: `Here ${matches.length === 1 ? 'is' : 'are'} ${matches.length === 1 ? 'a Chamber member' : Math.min(matches.length, 4) + ' Chamber members'} I'd recommend${bucket ? ' for ' + bucket[0].toLowerCase() : ''}. Premium Sponsors and Platinum/Gold members surface first.`,
    cards: matches.slice(0, 4).map(x => ({
      title: x.name,
      meta: `${x.tier.toUpperCase()} · ${x.category} · ${x.neighborhood || ''}${x.phone ? ' · ' + x.phone : ''}`,
      body: x.tagline || '',
      href: `members/profile.html?id=${x.id}`
    }))
  };
}

app.post('/api/concierge', async (req, res) => {
  const { message, page } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  // No API key → use smart mock
  if (!anthropic) return res.json(mockConcierge(message));

  // Real Claude path
  try {
    const members = loadJson('members.json');
    const events = loadJson('events.json').slice(0, 20);
    const guides = loadJson('guides.json');

    const system = `You are the Chamber Concierge for the West Valley ~ Warner Center Chamber of Commerce, serving Tarzana, Woodland Hills, Reseda, and Warner Center.

Your job: help residents and visitors find the right member business, event, or community resource. Always recommend Chamber MEMBERS first. Tier priority: platinum > gold > silver > bronze > supporter > friend.

Be warm, concise (3-5 sentences max in the reply field), and useful. If you recommend businesses or events, always include them as structured cards in the cards array.

If no member matches the request, politely say so and suggest alternatives — don't fabricate businesses.

Return ONLY valid JSON with this shape:
{ "reply": "your conversational reply", "cards": [ { "title": "...", "meta": "tier · category · neighborhood · phone", "body": "tagline", "href": "members/profile.html?id={id}" } ] }`;

    const ctx = `MEMBERS (${members.length}):
${members.map(m => `- ${m.name} (${m.tier}) | ${m.category} | ${m.neighborhood} | ${m.tagline||''} | tags: ${(m.tags||[]).join(', ')} | id: ${m.id} | phone: ${m.phone||'n/a'}`).join('\n')}

UPCOMING EVENTS:
${events.map(e => `- ${e.date} ${e.time} | ${e.title} | ${e.location} | ${e.category} | ${e.audience} | $${e.price} | id: ${e.id}`).join('\n')}

GUIDES:
${guides.map(g => `- ${g.title} (slug: ${g.slug}) — ${g.tagline}`).join('\n')}

Card hrefs:
- Member: members/profile.html?id={id}
- Event: events/index.html#{id}
- Guide: guides/{slug}.html`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: `User is on page: ${page || '/'}\n\nUser message: ${message}\n\nContext:\n${ctx}` }]
    });

    const raw = response.content[0].text.trim();
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { const m = raw.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : { reply: raw, cards: [] }; }
    res.json(parsed);
  } catch (err) {
    console.error('Concierge AI error:', err.message);
    res.json(mockConcierge(message));  // graceful degrade
  }
});

// ── Staff AI Assistant ──────────────────────────────────────────
app.post('/api/staff-assistant', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  if (!anthropic) {
    return res.json({
      reply: `Demo mode: I'd handle that request right now in production. Set ANTHROPIC_API_KEY in your .env file (see .env.example) to activate full AI.\n\nFor your request "${message}" I would: look up the relevant data, draft the content or take the action, and queue it for your approval.`
    });
  }

  try {
    const members = loadJson('members.json');
    const events = loadJson('events.json');

    const system = `You are the AI Staff Assistant for the West Valley ~ Warner Center Chamber of Commerce.

You support a 2-3 person staff running a 450-member organization. You can:
- draft newsletters, social posts, blog articles, member emails
- summarize what needs the staff's attention
- answer operational questions (membership, billing, events, programs)
- propose actions (schedule events, send dunning sequences, create reports)
- analyze member churn, sponsorship pipeline, concierge insights

Be specific, concise, action-oriented. When proposing actions, structure them as numbered options.
When drafting content, use the Chamber's voice: warm, professional, hyper-local. Plain text responses (no JSON).`;

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
    console.error('Staff assistant AI error:', err.message);
    res.json({ reply: "Connection issue — but in production I'd have completed that. Check ANTHROPIC_API_KEY." });
  }
});

// ── E-commerce stubs (Square swap-in) ────────────────────────────
app.post('/api/payments/charge', (req, res) => {
  const { amount, currency, metadata } = req.body || {};
  res.json({
    ok: true, stub: true,
    message: 'Demo mode. In production this hits Square /v2/payments and emits webhooks for confirmation, ledger update, and Heed revenue-share remit.',
    payment: { id: `demo_${Date.now()}`, status: 'COMPLETED', amount, currency: currency || 'USD', metadata: metadata || {} }
  });
});
app.post('/api/memberships/subscribe', (req, res) => res.json({ ok: true, stub: true, message: 'Demo mode — Square recurring billing token.' }));
app.post('/api/blog/pitch',          (req, res) => res.json({ ok: true, message: 'Pitch received.' }));
app.post('/api/members/lead',        (req, res) => res.json({ ok: true, message: 'Lead routed to member.' }));
app.post('/api/newsletter/subscribe',(req, res) => res.json({ ok: true, message: 'Subscribed.' }));
app.post('/api/auth/member-login',   (req, res) => res.json({ ok: true, stub: true, role: 'member', token: 'demo.member.jwt' }));
app.post('/api/auth/staff-login',    (req, res) => res.json({ ok: true, stub: true, role: 'staff',  token: 'demo.staff.jwt' }));

// ── Boot ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const line = '═'.repeat(62);
  console.log(`\n  ╔${line}╗`);
  console.log(`  ║  West Valley ~ Warner Center Chamber — Local Preview         ║`);
  console.log(`  ╚${line}╝\n`);
  console.log(`  ▸ Site:        http://localhost:${PORT}/`);
  console.log(`  ▸ AI:          ${anthropic ? '✓ LIVE (Claude connected)' : '⚠ DEMO MODE — set ANTHROPIC_API_KEY in .env to go live'}`);
  console.log(`  ▸ Square:      stub (returns success — see server.js to wire real)`);
  console.log(`\n  Press Ctrl+C to stop the server.\n`);
});
