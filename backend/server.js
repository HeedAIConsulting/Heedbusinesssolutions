const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const Anthropic = require('@anthropic-ai/sdk');
const attachChamberRoutes = require('./chamber-routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  process.env.CHAMBER_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5500'
].filter(Boolean);
app.use(cors({
  origin: function(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// ── Clients ──
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'reachus@heedbusinesssolutions.com';

// ── Email Transporter ──
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// ── Helper: safe scrape ──
async function safeScrape(url) {
  try {
    const result = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });
    return result.markdown || result.content || '';
  } catch (err) {
    console.error('Scrape failed for', url, err.message);
    return null;
  }
}

// ── Helper: safe search ──
async function safeSearch(query, limit) {
  try {
    const result = await firecrawl.search(query, { limit: limit || 3 });
    return result.data || result || [];
  } catch (err) {
    console.error('Search failed for', query, err.message);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/score
// ══════════════════════════════════════════════════════════════
app.post('/api/score', async (req, res) => {
  try {
    const { firm_name, website_url, city, practice_area, email } = req.body;

    if (!firm_name || !website_url || !city || !practice_area || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Step 1: Scrape submitted website
    const siteContent = await safeScrape(website_url);

    // Step 2: Find and scrape top 3 competitors
    const competitorQuery = `${practice_area} firms in ${city}`;
    const competitorResults = await safeSearch(competitorQuery, 5);

    const competitors = [];
    for (const result of competitorResults) {
      const compUrl = result.url || result.link;
      if (!compUrl || compUrl.includes(website_url.replace(/https?:\/\//, '').replace(/\/$/, ''))) continue;
      if (competitors.length >= 3) break;
      const content = await safeScrape(compUrl);
      competitors.push({
        name: result.title || compUrl,
        url: compUrl,
        content: content ? content.substring(0, 3000) : 'Could not scrape'
      });
    }

    // Step 3: Find review data
    const reviewQuery = `${firm_name} ${city} reviews`;
    const reviewResults = await safeSearch(reviewQuery, 3);
    const reviewData = reviewResults.map(r => ({
      title: r.title,
      url: r.url || r.link,
      snippet: r.description || r.snippet || ''
    }));

    // Step 4: Claude analysis
    const analysisPrompt = `Analyze this professional service firm for high-value client acquisition readiness.

FIRM: ${firm_name}
WEBSITE URL: ${website_url}
CITY: ${city}
PRACTICE AREA: ${practice_area}

WEBSITE CONTENT:
${siteContent ? siteContent.substring(0, 5000) : 'Website could not be scraped. Score should reflect that the firm has limited or inaccessible web presence.'}

COMPETITORS FOUND:
${competitors.map((c, i) => `${i + 1}. ${c.name} (${c.url})\n${c.content.substring(0, 1500)}`).join('\n\n')}

REVIEW/REPUTATION DATA:
${reviewData.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Score this firm on a 0-100 scale across five dimensions. Be honest and critical. High-value clients in ${practice_area} in ${city} have many options. Return ONLY valid JSON with no markdown, no backticks, no preamble, no explanation.

Required JSON structure:
{
  "overall_score": 0,
  "dimensions": {
    "geo_readiness": { "score": 0, "finding": "one sentence" },
    "intake_speed": { "score": 0, "finding": "one sentence" },
    "competitive_differentiation": { "score": 0, "finding": "one sentence" },
    "messaging_alignment": { "score": 0, "finding": "one sentence" },
    "reputation": { "score": 0, "finding": "one sentence" }
  },
  "priority_actions": ["action one", "action two", "action three"],
  "firm_name": "${firm_name}",
  "competitors_found": ["name1", "name2", "name3"]
}`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are a client acquisition analyst specializing in high-value professional service firms in Los Angeles. You evaluate firms on their ability to attract, convert, and retain high-value clients who are slow to trust and have high expectations. Analyze the provided website and competitive data. Return ONLY valid JSON with no markdown, no backticks, no preamble, no explanation.',
      messages: [{ role: 'user', content: analysisPrompt }]
    });

    const rawText = claudeResponse.content[0].text.trim();
    let scoreData;
    try {
      scoreData = JSON.parse(rawText);
    } catch (parseErr) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scoreData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Claude returned invalid JSON');
      }
    }

    // Step 5: Email notification
    try {
      const transporter = createTransporter();
      const dims = scoreData.dimensions || {};
      const dimHtml = Object.entries(dims).map(([key, val]) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;text-transform:capitalize;">${key.replace(/_/g, ' ')}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">${val.score}/100</td><td style="padding:8px;border:1px solid #ddd;">${val.finding}</td></tr>`
      ).join('');

      const actionsHtml = (scoreData.priority_actions || []).map(a => `<li>${a}</li>`).join('');
      const compsHtml = (scoreData.competitors_found || []).map(c => `<li>${c}</li>`).join('');

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: NOTIFICATION_EMAIL,
        cc: email,
        subject: `New Readiness Score — ${firm_name} — ${scoreData.overall_score}/100`,
        html: `
          <h2>Client Experience Readiness Score</h2>
          <p><strong>Firm:</strong> ${firm_name}<br/>
          <strong>Website:</strong> ${website_url}<br/>
          <strong>City:</strong> ${city}<br/>
          <strong>Practice Area:</strong> ${practice_area}<br/>
          <strong>Email:</strong> ${email}</p>
          <h3>Overall Score: ${scoreData.overall_score}/100</h3>
          <table style="border-collapse:collapse;width:100%;margin:1rem 0;">
            <tr style="background:#1C2B38;color:#fff;">
              <th style="padding:8px;border:1px solid #ddd;">Dimension</th>
              <th style="padding:8px;border:1px solid #ddd;">Score</th>
              <th style="padding:8px;border:1px solid #ddd;">Finding</th>
            </tr>
            ${dimHtml}
          </table>
          <h3>Priority Actions</h3>
          <ol>${actionsHtml}</ol>
          <h3>Competitors Found</h3>
          <ul>${compsHtml}</ul>
          <hr/>
          <p style="color:#888;font-size:12px;">Generated by Heed Business Solutions Client Intelligence System</p>
        `
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    // Step 6: Return results
    res.json(scoreData);

  } catch (err) {
    console.error('Score endpoint error:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /api/auth/verify
// ══════════════════════════════════════════════════════════════
app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  const correct = password === process.env.PROSPECT_TOOL_PASSWORD;
  res.json({ authorized: correct });
});

// ══════════════════════════════════════════════════════════════
// POST /api/prospects
// ══════════════════════════════════════════════════════════════
app.post('/api/prospects', async (req, res) => {
  try {
    const { industry, city, count } = req.body;

    if (!industry || !city) {
      return res.status(400).json({ error: 'Industry and city are required.' });
    }

    const limit = Math.min(parseInt(count, 10) || 10, 50);

    // Search for businesses
    const query = `${industry} in ${city}`;
    const searchResults = await safeSearch(query, limit);

    if (!searchResults.length) {
      return res.json([]);
    }

    // Scrape each result for contact details
    const prospects = [];
    for (const result of searchResults.slice(0, limit)) {
      const url = result.url || result.link || '';
      let scrapedContent = '';
      if (url) {
        const content = await safeScrape(url);
        scrapedContent = content ? content.substring(0, 1500) : '';
      }
      prospects.push({
        business_name: result.title || 'Unknown',
        website: url,
        snippet: result.description || result.snippet || '',
        scraped: scrapedContent
      });
    }

    // Send to Claude for qualification
    const qualPrompt = `You are evaluating these ${industry} businesses in ${city} for high-value client acquisition readiness gaps. For each business, provide a one-line qualification note focused on what a consulting firm could help them improve in attracting high-value clients.

Return ONLY a valid JSON array. Each object must have: business_name, website, phone (extract from scraped content or "N/A"), address (extract from scraped content or "N/A"), review_count (number or null), average_rating (number or null), qualification_note (one sentence).

BUSINESSES:
${prospects.map((p, i) => `${i + 1}. ${p.business_name}
   URL: ${p.website}
   Snippet: ${p.snippet}
   Content: ${p.scraped.substring(0, 800)}`).join('\n\n')}

Return ONLY the JSON array, no markdown, no backticks, no explanation.`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: 'You are a business intelligence analyst. Extract contact details and provide qualification notes for professional service firms. Return ONLY valid JSON arrays with no markdown, no backticks, no preamble.',
      messages: [{ role: 'user', content: qualPrompt }]
    });

    const rawText = claudeResponse.content[0].text.trim();
    let prospectData;
    try {
      prospectData = JSON.parse(rawText);
    } catch (parseErr) {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        prospectData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Claude returned invalid JSON for prospects');
      }
    }

    res.json(prospectData);

  } catch (err) {
    console.error('Prospects endpoint error:', err);
    res.status(500).json({ error: 'Prospect search failed.', details: err.message });
  }
});

// ── Mount Chamber routes ──
attachChamberRoutes(app);

// ── Health check ──
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Heed Business Solutions API' });
});

app.listen(PORT, () => {
  console.log(`Heed API running on port ${PORT}`);
});
