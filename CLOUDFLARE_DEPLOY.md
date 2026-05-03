# Cloudflare Pages Deployment

This site deploys to Cloudflare Pages directly from the GitHub repo. No build step, no FTP, no manual upload.

## One-time setup (you do this once, ~10 min)

### 1. Cloudflare account
- Sign in at https://dash.cloudflare.com — or sign up if you don't have one (free)

### 2. Create the Pages project
1. Sidebar → **Workers & Pages**
2. **Create application** → **Pages** → **Connect to Git**
3. **Connect GitHub** — authorize Cloudflare's GitHub app on the `HeedAIConsulting` organization (one-time consent)
4. Pick repo: `HeedAIConsulting/Heedbusinesssolutions`
5. **Project name:** `wvwccc` (this becomes the preview subdomain → `wvwccc.pages.dev`)
6. **Production branch:** `claude/hopeful-hellman-6f7a38` (we'll move to `main` later when merged)

### 3. Build settings
| Field | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave blank)* |
| Build output directory | `/` |
| Root directory | `websites/WVchamber/.claude/worktrees/hopeful-hellman-6f7a38` |
| Environment variables | *(none needed for static deploy)* |

> **Important:** the "Root directory" matters because the chamber site sits inside the worktree path within the larger Heed repo. If you've merged the chamber site into a dedicated repo or branch root, leave Root directory blank.

### 4. Deploy
- Click **Save and Deploy**
- Cloudflare runs the build (no-op since we're static) and deploys
- ~30 seconds later you have `https://wvwccc.pages.dev`

### 5. Share with Diana
Send her `https://wvwccc.pages.dev` for review.

---

## After this initial setup — every future deploy is automatic

- I push a commit to the branch → Cloudflare auto-deploys
- ~30-second turnaround
- Every commit gets its own preview URL too (e.g., `f035ec3.wvwccc.pages.dev`) so you can A/B-compare

---

## Rollback (when something goes wrong)

1. Cloudflare Pages → your project → **Deployments**
2. Find the last good deploy
3. Click the **⋯** menu → **Rollback to this deployment**
4. Live within 30 seconds

---

## Going to production (when Diana approves)

### Add the real domain
1. Cloudflare Pages → your project → **Custom domains**
2. **Add domain** → `www.woodlandhillscc.net`
3. Cloudflare gives you DNS records to add at the chamber's registrar

### Update DNS at the registrar (wherever woodlandhillscc.net lives — likely Bluehost or similar)
- Add the CNAME record Cloudflare provides (something like `wvwccc.pages.dev` as the target)
- Typically takes 5-15 minutes for DNS to propagate
- Cloudflare auto-issues an SSL certificate

### Bluehost stays for email
- Email at @woodlandhillscc.net (Diana, Felicia, etc.) is unaffected
- Only the website's A/CNAME record changes
- MX records (email) stay as-is

---

## What Cloudflare Pages auto-handles

- HTTPS (free Let's Encrypt cert)
- Global CDN (every request served from the closest edge)
- HTTP/3 + QUIC
- Brotli compression
- Image optimization (if you turn it on)
- DDoS protection
- Per-commit preview URLs
- Analytics (basic)
- Free for chamber-scale traffic — paid tier kicks in well above what you'll need

---

## What our config files do

- **`_headers`** — Cache rules (HTML short, CSS/JS long, JSON medium) + security headers (HSTS, X-Frame-Options, microphone permission for ElevenLabs)
- **`_redirects`** — Nice URLs (`/about` → `/about.html`), legacy redirects, blocks public access to `/scripts/`, `/backend/`, `/raw/`

Both are read automatically by Cloudflare Pages — nothing else to configure.

---

## Verification checklist (after first deploy)

Visit each and confirm 200 OK + page renders:

- [ ] `https://wvwccc.pages.dev/` — homepage with logo + 8-language stats
- [ ] `/members/directory` — 851 entries load (check the count in the toolbar)
- [ ] `/guides/cityloop` — flagship guide renders
- [ ] `/loyalty` — loyalty page renders
- [ ] `/admin/index.html` — Diana's Console renders (basic auth handled separately)
- [ ] `/es/`, `/ru/`, `/hy/`, `/zh/` — language landings render with proper fonts
- [ ] `/data/directory.json` — returns JSON, not HTML 404
- [ ] ElevenLabs widget appears bottom-right on homepage

If `/data/directory.json` 404s, the most likely cause is the Root directory in the build settings — make sure it points at the worktree where the JSON files actually live.

---

## When you're ready

Tell me you've connected Cloudflare to the repo, paste the `wvwccc.pages.dev` URL once it's deployed, and I'll run the verification checklist for you.
