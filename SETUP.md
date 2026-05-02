# Setup · West Valley Warner Center Chamber Site

## 1. Single local version (stop the worktree confusion)

**Right now you have two checkouts:**

- `E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber\` (your main checkout, on the old `claude/rebuild-chamber-website-LXSM5` branch)
- `E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber\.claude\worktrees\hopeful-hellman-6f7a38\` (this worktree, on the new `claude/hopeful-hellman-6f7a38` branch)

**To consolidate into one location:**

```bash
# 1. Open a NEW PowerShell or terminal (not in the worktree)
cd "E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber"

# 2. Make sure you have the latest from origin
git fetch origin

# 3. Switch your main checkout to the new branch
git checkout claude/hopeful-hellman-6f7a38

# 4. Remove the worktree (the parallel checkout you don't need anymore)
git worktree remove .claude/worktrees/hopeful-hellman-6f7a38 --force
```

After this, **one location**: `E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber\`. That's where you serve from, edit from, and where future `git pull` updates land.

If you prefer to merge the new branch into `main` (so going forward `git checkout main` gets it), do this instead:

```bash
cd "E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber"
git fetch origin
git checkout main
git merge claude/hopeful-hellman-6f7a38
git push origin main
git worktree remove .claude/worktrees/hopeful-hellman-6f7a38 --force
```

---

## 2. Run the site locally — what powers what

The chamber site has three layers. The first works standalone; the other two need the backend running.

### Layer 1: Static site (works without anything)

Just serve the folder. Everything except the live AI Concierge works.

```bash
cd "E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber"
npx serve -l 3456 .
# Open http://localhost:3456/
```

What works:
- Homepage, all guides, all blog posts, member directory, profiles, events, loyalty, networking, newsletters, all 5 admin queues (with sample data), all language pages
- The AI Concierge chat **falls back to a client-side keyword search** over the directory + 13,407-business SFV dataset — useful, but no real LLM reasoning

### Layer 2: Backend (Express + endpoints)

Adds the API layer. Member CRUD, ad inventory live ops, admin queues, payment + onboarding stubs, etc.

```bash
cd "E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber"
npm install                    # first time only
node server.js                 # serves static + API on port 5500
# Open http://localhost:5500/
```

Now the admin pages actually pull live data via `/api/admin/queues` and `/api/admin/ads`. The directory and concierge widgets call real endpoints.

### Layer 3: Claude AI Concierge — the real thing

Adds the live LLM-powered chat. Requires an Anthropic API key.

```bash
# Get a key at https://console.anthropic.com — then:
cd "E:\Documents\GitHub\Heedbusinesssolutions\websites\WVchamber"

# Option A: env var (Windows PowerShell)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
node server.js

# Option B: env var (bash / Git Bash)
export ANTHROPIC_API_KEY="sk-ant-..."
node server.js

# Option C: .env file (recommended)
# Create .env in the project root:
#   ANTHROPIC_API_KEY=sk-ant-...
# Then:
npm install dotenv             # if not already installed
node server.js
```

Models in use (configured in `backend/chamber-routes.js`):
- **Public Concierge** — `claude-sonnet-4-6` (smart, fast, reads the directory + SFV businesses + events + guides + loyalty + groups)
- **Diana's Staff Assistant** — `claude-opus-4-7` (best reasoning for drafting newsletters, summaries, outreach)

Cost ballpark at typical chamber traffic (~50 concierge sessions/day, 5 staff queries/day):
- ~$15–35/month at current Anthropic pricing

**Verify Claude is wired:**
```bash
curl http://localhost:5500/api/chamber
# Returns: { "status": "ok", "models": { "concierge": "claude-sonnet-4-6", "staff": "claude-opus-4-7" }, ... }
```

Then test the concierge:
```bash
curl -X POST http://localhost:5500/api/concierge \
  -H "Content-Type: application/json" \
  -d '{"message":"date night with Persian food for 4"}'
# Real Claude reply with cards, not a fallback.
```

---

## 3. Production deploy options

### Option A: Cloudflare Pages + Workers (recommended)

- **Static site** → Cloudflare Pages (free, global CDN, HTTPS)
- **Backend** → A single Cloudflare Worker that proxies `/api/*` to the chamber routes
- **AI key** → Stored as a Worker secret (never in client code)
- **Cost** → Free tier for the site, ~$5/month for the Worker, plus Anthropic API usage

Skeleton steps:
1. `wrangler login` and `wrangler pages create wvwccc-chamber`
2. Push the static folder via `wrangler pages deploy .`
3. Deploy the Worker that wraps `backend/chamber-routes.js` (Cloudflare's Hono pattern)
4. Set `ANTHROPIC_API_KEY` via `wrangler secret put ANTHROPIC_API_KEY`
5. Point `www.woodlandhillscc.net` DNS at the Pages project

### Option B: Render or Railway (one-click Express)

Single service hosting both static + API:
- Connect the GitHub repo
- Build command: `npm install`
- Start command: `node server.js`
- Add `ANTHROPIC_API_KEY` env var
- Free tier covers chamber-scale traffic

### Option C: Single VPS

If you already have hosting:
- Reverse-proxy Nginx → `node server.js` on port 5500
- PM2 or systemd to keep it running
- Let's Encrypt for HTTPS

---

## 4. Build scripts (re-runnable when data changes)

```bash
# After updating the HubSpot CSV at raw/wvwccc_members.csv:
node scripts/build-directory.js          # rebuilds data/directory.json (currently 850 entries)

# After adding new blog content:
node scripts/build-blog.js               # rebuilds 50 posts + index

# After adding a new ad surface or selling/releasing space:
node scripts/build-ad-inventory.js       # rebuilds data/ad-inventory.json (245 spaces)

# After site structure changes:
node scripts/build-sitemap.js            # rebuilds sitemap.xml + robots.txt

# After adding language strings:
node scripts/build-i18n.js               # rebuilds /es/ /ru/ /hy/ /zh/ landing pages

# After updating community pages:
node scripts/build-community-pages.js    # rebuilds 5 neighborhood subpages

# After ingesting a new SFV business dataset:
# (1) Convert XLSX → CSV: npx xlsx-cli source.xlsx > raw/818guide/active_sfv_businesses.csv
node scripts/build-sfv-businesses.js     # filters to West Valley, writes data/sfv-businesses.json (13,407 entries)

# After adding admin sub-pages:
node scripts/build-admin-pages.js
```

---

## 5. Common questions

**"The directory shows 0 of 0 members on the directory page."**
Browser cache. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R). The directory has 850 entries.

**"The AI Concierge says 'I'm having trouble reaching the directory'."**
Either the backend isn't running (start `node server.js`), or `ANTHROPIC_API_KEY` isn't set. The widget falls back to client-side keyword search regardless — that gives useful results without the LLM.

**"Where do I add a new chamber member manually?"**
Either:
- Use the `/onboard.html` flow (preferred — auto-approval logic kicks in)
- Or edit `data/directory.json` directly and re-deploy

**"How do I sell an ad space?"**
- In the admin: `admin/ads.html` → click on a row → "Sell space" (UI to be wired; backend endpoint `/api/admin/ads/:id/sell` already works)
- Or via API directly:
  ```bash
  curl -X POST http://localhost:5500/api/admin/ads/index-html-presenting-en/sell \
    -H "Content-Type: application/json" \
    -d '{"buyer":"Westfield","term":"annual","termStart":"2026-01-01","termEnd":"2026-12-31"}'
  ```

**"What's the Square situation?"**
The site is wired for Square checkout but currently shows pricing with "online checkout coming soon" copy. When ready to go live:
1. Get a Square access token
2. Add `SQUARE_ACCESS_TOKEN` to env vars
3. Uncomment the production payment block in `backend/chamber-routes.js` (commented `/* PROD: ... */` markers)
4. Test with Square sandbox first

---

## 6. File map (where things live)

See [PITCH.md](./PITCH.md) for the full file structure. Quick summary:

- `data/` — JSON data files (directory, events, guides, blog posts, ad inventory, etc.)
- `scripts/` — re-runnable build scripts
- `admin/` — Diana's Console (10 sub-pages)
- `backend/` — Express routes + Claude wiring
- `js/partials.js` — shared header/footer with i18n
- `js/chamber.js` — public AI Concierge widget + client-side fallback
- `css/chamber.css` — full design system
- `images/wvwccc-logo-2026.png` — the new logo
- `raw/` — gitignored (contains PII / source data)
