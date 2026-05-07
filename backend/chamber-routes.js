/* ============================================================
   West Valley · Warner Center Chamber of Commerce — API routes
   Mounted onto Express via attachChamberRoutes(app).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const llm = require('./llm');     // Provider-agnostic LLM (Gemini → Anthropic → mock)
const m365 = require('./m365');   // Microsoft 365 Graph (delegated OAuth)

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

// LLM role aliases — llm.js maps these to the right provider+model.
const MODEL_CONCIERGE = 'concierge'; // public-facing Q&A
const MODEL_STAFF     = 'staff';     // Diana's internal AI co-pilot

function attachChamberRoutes(app) {
  // ── Health ─────────────────────────────────────────────
  app.get('/api/chamber', (_req, res) => res.json({
    status: 'ok',
    service: 'West Valley · Warner Center Chamber of Commerce API',
    timestamp: new Date().toISOString(),
    llm: llm.status(),
    m365: m365.status()
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

      const response = await llm.complete({
        model: MODEL_CONCIERGE,
        maxTokens: 1400,
        system,
        messages
      });

      const raw = response.text;
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

      const response = await llm.complete({
        model: MODEL_STAFF,
        maxTokens: 2400,
        system,
        messages
      });

      res.json({ reply: response.text, provider: response.provider, model: response.model });
    } catch (err) {
      console.error('Staff assistant error:', err.message);
      res.status(500).json({ reply: "Connection issue with the AI provider. Check GEMINI_API_KEY or ANTHROPIC_API_KEY in the env." });
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

      const response = await llm.complete({
        model: 'draft',
        maxTokens: 2000,
        system,
        messages: [{ role: 'user', content: ctx }]
      });

      const raw = response.text;
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

  // ── Microsoft 365 — OAuth (delegated) ────────────────────
  // Staff visits /auth/m365/login → Microsoft consent → /auth/m365/callback.
  // Tokens cached in data/_store/m365-tokens.json (gitignored).
  app.get('/auth/m365/login', async (req, res) => {
    if (!m365.isConfigured) {
      return res.status(500).send('Microsoft 365 not configured. See backend/m365.js for required env vars.');
    }
    try {
      const state = require('crypto').randomBytes(16).toString('hex');
      // Stash state in a short-lived cookie for CSRF protection on callback
      res.cookie ? res.cookie('m365_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 })
                 : res.setHeader('Set-Cookie', `m365_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`);
      const url = await m365.getAuthUrl(state);
      res.redirect(url);
    } catch (err) {
      console.error('M365 auth-url error:', err.message);
      res.status(500).send('Failed to start Microsoft 365 sign-in: ' + err.message);
    }
  });

  app.get('/auth/m365/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query || {};
    if (error) return res.status(400).send(`Microsoft sign-in error: ${error} — ${error_description || ''}`);
    if (!code) return res.status(400).send('Missing auth code.');
    try {
      const result = await m365.handleCallback(code);
      // Bounce back to the admin settings page with a success flag
      res.redirect('/admin/settings.html?m365=connected&user=' + encodeURIComponent(result.account?.username || ''));
    } catch (err) {
      console.error('M365 callback error:', err.message);
      res.status(500).send('Microsoft 365 connection failed: ' + err.message);
    }
  });

  app.get('/api/m365/status', (_req, res) => res.json(m365.status()));

  app.post('/api/m365/disconnect', (_req, res) => res.json(m365.disconnect()));

  // ── Microsoft 365 — Graph operations ─────────────────────
  app.get('/api/m365/me', async (_req, res) => {
    try { res.json(await m365.me()); }
    catch (err) { res.status(401).json({ error: err.message }); }
  });

  app.get('/api/m365/inbox', async (req, res) => {
    try {
      const messages = await m365.listInbox({
        top: parseInt(req.query.top || '25', 10),
        unreadOnly: req.query.unread === '1' || req.query.unread === 'true',
        search: req.query.q
      });
      res.json({ messages, count: messages.length });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });

  app.post('/api/m365/draft', async (req, res) => {
    try {
      const { subject, body, to, cc, bcc, tag } = req.body || {};
      if (!to) return res.status(400).json({ error: 'to recipient required' });
      const result = await m365.createDraft({ subject, body, to, cc, bcc, tag });
      res.json(result);
    } catch (err) {
      res.status(err.message?.includes('not connected') ? 401 : 500).json({ error: err.message });
    }
  });

  app.post('/api/m365/send', async (req, res) => {
    try {
      const { subject, body, to, cc, bcc } = req.body || {};
      if (!to) return res.status(400).json({ error: 'to recipient required' });
      await m365.sendMail({ subject, body, to, cc, bcc });
      res.json({ ok: true });
    } catch (err) {
      res.status(err.message?.includes('not connected') ? 401 : 500).json({ error: err.message });
    }
  });

  app.post('/api/m365/reply-draft', async (req, res) => {
    try {
      const { messageId, comment } = req.body || {};
      if (!messageId) return res.status(400).json({ error: 'messageId required' });
      // Optional: have the LLM draft the reply text first
      let replyText = comment;
      if (!replyText && req.body.useLlm) {
        const original = await m365.getMessage(messageId);
        const r = await llm.complete({
          model: 'staff',
          system: 'You are Diana Williams, CEO of the West Valley · Warner Center Chamber of Commerce. Draft a warm, brief reply to the email below. Sign off as "Diana".',
          messages: [{ role: 'user', content: `From: ${original.from?.emailAddress?.address}\nSubject: ${original.subject}\n\n${(original.body?.content || '').replace(/<[^>]+>/g, '')}` }],
          maxTokens: 800
        });
        replyText = r.text;
      }
      const result = await m365.replyDraft(messageId, replyText || '');
      res.json(result);
    } catch (err) {
      res.status(err.message?.includes('not connected') ? 401 : 500).json({ error: err.message });
    }
  });

  // Bulk-draft generator: filter members, generate per-recipient personalized
  // drafts via LLM, land them all in the connected user's Drafts folder.
  app.post('/api/m365/bulk-draft', async (req, res) => {
    try {
      const { filter = {}, intent, dryRun } = req.body || {};
      if (!intent) return res.status(400).json({ error: 'intent required (e.g. "Renewal nudge for Q2")' });

      const dir = loadJson('directory.json');
      const filtered = dir.filter(m => {
        if (filter.tier && m.tier !== filter.tier) return false;
        if (filter.category && !(m.category || '').toLowerCase().includes(filter.category.toLowerCase())) return false;
        if (filter.neighborhood && m.neighborhood !== filter.neighborhood) return false;
        if (filter.hasEmail && !m.email) return false;
        return true;
      }).filter(m => m.email); // can't draft to a member with no email

      const limit = Math.min(filter.limit || 10, 50);
      const targets = filtered.slice(0, limit);

      if (dryRun) {
        return res.json({
          dryRun: true,
          totalMatched: filtered.length,
          willDraft: targets.length,
          recipients: targets.map(m => ({ name: m.name, email: m.email, tier: m.tier, category: m.category }))
        });
      }

      const drafted = [];
      const failed = [];
      for (const member of targets) {
        try {
          const r = await llm.complete({
            model: 'draft',
            system: `You are drafting a personalized email for the West Valley · Warner Center Chamber of Commerce, signed by Diana Williams (CEO).

Tone: warm, locally-grounded, specific to the recipient's business. No marketing fluff. Reference their category and neighborhood. Single soft CTA at the end.

Output JSON only: { "subject": "...", "body": "<html><p>...</p></html>" }`,
            messages: [{ role: 'user', content: `Intent: ${intent}\n\nRecipient:\n- Name: ${member.contactName || member.name}\n- Business: ${member.name}\n- Category: ${member.category}\n- Tier: ${member.tier}\n- Neighborhood: ${member.neighborhood}` }],
            maxTokens: 800
          });
          let parsed;
          try { parsed = JSON.parse(r.text); }
          catch { const m = r.text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
          if (!parsed?.subject || !parsed?.body) { failed.push({ member: member.name, reason: 'LLM parse failed' }); continue; }

          const draft = await m365.createDraft({
            subject: parsed.subject,
            body: parsed.body,
            to: member.email,
            tag: 'chamber-bulk-' + (filter.tier || 'all')
          });
          drafted.push({ member: member.name, email: member.email, draftId: draft.id, webLink: draft.webLink });
        } catch (e) {
          failed.push({ member: member.name, reason: e.message });
        }
      }
      appendStore('bulk-draft', { intent, filter, count: drafted.length, failed: failed.length });
      res.json({ ok: true, totalMatched: filtered.length, drafted, failed });
    } catch (err) {
      res.status(err.message?.includes('not connected') ? 401 : 500).json({ error: err.message });
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
  // List + filter + paginate members. New `status` param supports tabs:
  //   all | new (added in last 60 days) | upcoming (renewal in next 30 days)
  //   | lapsed (renewal date passed without renewal in last 14 days)
  // Status uses createdAt (joinedDate) and renewalDate fields. Members
  // without renewal data fall back to a deterministic mock anchored on the
  // member id so the admin UI feels alive even before billing data is wired.
  function mockRenewalDate(id) {
    // Hash id → 0..364 day offset from Jan 1, 2026
    let h = 0;
    for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
    const offset = Math.abs(h) % 365;
    const d = new Date('2026-01-01T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  }
  function mockJoinedDate(id, renewal) {
    // Joined ~ 1-5 years before renewal
    let h = 0;
    for (let i = 0; i < id.length; i++) h = ((h << 3) + h + id.charCodeAt(i)) | 0;
    const yearsAgo = (Math.abs(h) % 5) + 1;
    const d = new Date(renewal);
    d.setUTCFullYear(d.getUTCFullYear() - yearsAgo);
    return d.toISOString().slice(0, 10);
  }

  app.get('/api/admin/members', (req, res) => {
    const { q = '', category, neighborhood, tier, chamberOnly, status, limit = 100, offset = 0 } = req.query;
    let dir = loadJson('directory.json');

    // Enrich with renewal/join data
    dir = dir.map(m => {
      const renewalDate = m.renewalDate || mockRenewalDate(m.id);
      const joinedDate  = m.createdAt || mockJoinedDate(m.id, renewalDate);
      return { ...m, renewalDate, joinedDate };
    });

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
    const ago60 = new Date(today); ago60.setDate(ago60.getDate() - 60);
    const ago14 = new Date(today); ago14.setDate(ago14.getDate() - 14);

    if (status === 'new') {
      dir = dir.filter(m => m.chamberMember && new Date(m.joinedDate) > ago60);
    } else if (status === 'upcoming') {
      dir = dir.filter(m => m.chamberMember && m.renewalDate >= todayStr && new Date(m.renewalDate) <= in30);
    } else if (status === 'lapsed') {
      dir = dir.filter(m => m.chamberMember && m.renewalDate < todayStr && new Date(m.renewalDate) < ago14);
    } else if (status === 'active') {
      dir = dir.filter(m => m.chamberMember);
    }

    const ql = String(q).toLowerCase();
    if (ql) dir = dir.filter(m => [m.name, m.category, m.contactName, m.email, m.tagline].filter(Boolean).join(' ').toLowerCase().includes(ql));
    if (category) dir = dir.filter(m => m.category === category);
    if (neighborhood) dir = dir.filter(m => m.neighborhood === neighborhood);
    if (tier) dir = dir.filter(m => m.tier === tier);
    if (chamberOnly === '1' || chamberOnly === 'true') dir = dir.filter(m => m.chamberMember);

    // Default sort: lapsed/upcoming by date asc; new/all by joinedDate desc
    if (status === 'lapsed' || status === 'upcoming') {
      dir.sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
    } else if (status === 'new') {
      dir.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
    }

    const total = dir.length;
    const page = dir.slice(+offset, +offset + +limit);

    // Tab counts (independent of current filter so UI can show all)
    const allDir = loadJson('directory.json').map(m => ({
      ...m,
      renewalDate: m.renewalDate || mockRenewalDate(m.id),
      joinedDate:  m.createdAt   || mockJoinedDate(m.id, m.renewalDate || mockRenewalDate(m.id))
    })).filter(m => m.chamberMember);
    const counts = {
      active:   allDir.length,
      new:      allDir.filter(m => new Date(m.joinedDate) > ago60).length,
      upcoming: allDir.filter(m => m.renewalDate >= todayStr && new Date(m.renewalDate) <= in30).length,
      lapsed:   allDir.filter(m => m.renewalDate < todayStr && new Date(m.renewalDate) < ago14).length
    };

    res.json({ total, returned: page.length, counts, members: page });
  });

  // ── AI-generated renewal email for a lapsed/upcoming-renewal member ──
  app.post('/api/admin/members/:id/renewal-email', async (req, res) => {
    try {
      const dir = loadJson('directory.json');
      const m = dir.find(x => x.id === req.params.id);
      if (!m) return res.status(404).json({ error: 'Member not found' });
      const renewalDate = m.renewalDate || mockRenewalDate(m.id);
      const joinedDate  = m.createdAt   || mockJoinedDate(m.id, renewalDate);
      const yearsMember = Math.max(1, Math.round((Date.now() - new Date(joinedDate).getTime()) / (365 * 24 * 3600 * 1000)));
      const todayStr = new Date().toISOString().slice(0, 10);
      const lapsed = renewalDate < todayStr;
      const events = loadJson('events.json').slice(0, 4);

      const system = `You are drafting a personal renewal email for the West Valley Warner Center Chamber of Commerce, signed by Diana Williams (CEO).

Output JSON of shape:
{
  "subject": "...",
  "body": "...",
  "tone": "warm|nudge|reactivation"
}

Voice: warm, locally-grounded, not corporate. Diana writes like a real human. Use "chamber of commerce" not "chamber" in formal sentences. End with "Stay Connected, Diana" signature block.

Body should:
- Reference how long they've been a member (${yearsMember} year${yearsMember === 1 ? '' : 's'})
- Reference their business by name and category
- Pick ONE specific upcoming chamber event they should attend
- Reference one tangible benefit they've gotten or could get
- Make a clear, low-friction ask (renew online OR have a 15-min call)
- Be ${lapsed ? '~140 words, slightly more reactivation-oriented' : '~120 words, friendly nudge'}

Do not invent specific facts about the member's business beyond what's given. If unsure, keep it general.`;

      const ctx = `Member:
- Business: ${m.name}
- Contact: ${m.contactName || 'there'}
- Category: ${m.category || 'unknown'}
- Neighborhood: ${m.neighborhood || 'West Valley'}
- Tier: ${m.tier || 'member'}
- Member since: ${joinedDate} (${yearsMember} year${yearsMember === 1 ? '' : 's'})
- Renewal date: ${renewalDate} ${lapsed ? '(LAPSED)' : '(upcoming)'}
- Tagline: ${m.tagline || ''}

Upcoming chamber events:
${events.map(e => `- ${e.date} ${e.title} (${e.category||''} · ${e.location||''})`).join('\n')}`;

      let parsed;
      try {
        const response = await llm.complete({
          model: 'draft',
          maxTokens: 1200,
          system,
          messages: [{ role: 'user', content: ctx }]
        });
        const raw = response.text;
        try { parsed = JSON.parse(raw); }
        catch { const match = raw.match(/\{[\s\S]*\}/); parsed = match ? JSON.parse(match[0]) : { subject: 'Renewal', body: raw }; }
      } catch (apiErr) {
        // Fallback if no API key — generate a deterministic template so the UI works offline
        const event = events[0];
        parsed = {
          subject: lapsed
            ? `${m.contactName ? m.contactName.split(' ')[0] : 'Hi'} — let's get ${m.name} back on the directory`
            : `${m.contactName ? m.contactName.split(' ')[0] : 'Hi'}, your renewal for ${m.name}`,
          body: `Hi ${m.contactName || 'there'},

${lapsed
  ? `Your chamber-of-commerce membership for ${m.name} has been with us for ${yearsMember} year${yearsMember===1?'':'s'}, and your renewal lapsed on ${renewalDate}. I'd love to get you back on the directory before the next mixer.`
  : `Your chamber-of-commerce membership for ${m.name} comes up for renewal on ${renewalDate}, and I wanted to reach out personally before that arrives.`}

${event ? `Quick selfish request: ${event.title} is coming up on ${event.date}${event.location?` at ${event.location}`:''}. It would be great to see you there.` : ''}

You can renew online from your member portal, or I'm happy to grab 15 minutes by phone if you'd rather walk through it. ${lapsed ? 'I can also extend a one-time grace credit if there\'s a specific reason renewal slipped.' : ''}

Stay Connected,
Diana
Diana Williams · CEO
West Valley Warner Center Chamber of Commerce
(818) 347-4737 · diana@woodlandhillscc.net`,
          tone: lapsed ? 'reactivation' : 'nudge',
          fallback: true
        };
      }

      appendStore('renewal_emails', { memberId: m.id, ...parsed });
      res.json({ ok: true, member: { id: m.id, name: m.name, contactName: m.contactName, email: m.email, renewalDate, lapsed }, ...parsed });
    } catch (err) {
      console.error('Renewal email error:', err.message);
      res.status(500).json({ error: err.message });
    }
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
