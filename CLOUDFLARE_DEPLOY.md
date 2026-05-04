# Cloudflare Pages Deployment

This site deploys to Cloudflare Pages directly from the GitHub repo. No build step, no FTP, no manual upload.

We're doing this in **two phases**:
1. **Preview phase** — host on `wvwccoc.heedaisolutions.com` (or whichever subdomain you pick) for Diana to review and approve. Existing `woodlandhillscc.net` stays untouched on Bluehost.
2. **Production phase** — once approved, point `www.woodlandhillscc.net` at the same Cloudflare Pages project. Bluehost email keeps working; only the website moves.

---

## PHASE 1 — Preview deploy (~5 min)

### 1. Connect Cloudflare Pages to the repo

1. https://dash.cloudflare.com → sidebar → **Workers & Pages**
2. **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare's GitHub app on the `HeedAIConsulting` org (one-time consent)
4. Pick repo: `HeedAIConsulting/Heedbusinesssolutions`
5. **Project name:** `wvwccc-chamber` (this becomes `wvwccc-chamber.pages.dev`)
6. **Production branch:** `claude/hopeful-hellman-6f7a38`

### 2. Build settings

| Field | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave blank)* |
| Build output directory | `/` |
| Root directory | `websites/WVchamber/.claude/worktrees/hopeful-hellman-6f7a38` |
| Environment variables | *(none needed)* |

> **Important:** the "Root directory" tells Cloudflare where the chamber site files live within the larger `Heedbusinesssolutions` repo. Without it, Cloudflare deploys the wrong folder.

### 3. Deploy
- Click **Save and Deploy**
- ~30 seconds later: `https://wvwccc-chamber.pages.dev` is live
- Visit it to confirm everything works

### 4. Add the preview subdomain

Pick a subdomain of `heedaisolutions.com`. Recommendation: **`wvwccoc.heedaisolutions.com`** (short, clear, reusable for future client chamber previews).

In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain** → enter `wvwccoc.heedaisolutions.com`.

What happens next depends on where heedaisolutions.com's DNS is:

**If heedaisolutions.com is on Cloudflare DNS** (nameservers `*.ns.cloudflare.com`):
- Cloudflare auto-creates the CNAME record in the heedaisolutions.com zone
- HTTPS cert auto-issued
- Live in ~30 seconds

**If heedaisolutions.com is NOT on Cloudflare DNS** (e.g., Bluehost DNS):
- Cloudflare gives you a CNAME target like `wvwccc-chamber.pages.dev`
- Add a CNAME record at heedaisolutions.com's DNS provider:
  ```
  Type: CNAME
  Name: wvwccoc
  Target: wvwccc-chamber.pages.dev
  TTL: Auto (or 3600)
  ```
- Wait 5–15 minutes for propagation
- Cloudflare auto-issues HTTPS cert when DNS resolves

### 5. Share with Diana
Send her `https://wvwccoc.heedaisolutions.com` for review.

---

## After this initial setup — every future iteration is automatic

- I push a commit → Cloudflare auto-deploys → ~30-second turnaround
- Every commit also gets its own preview URL like `f035ec3.wvwccc-chamber.pages.dev` for A/B comparison
- Diana finds something to fix? I edit + commit + push, she refreshes, sees the new version

---

## Rollback (when something goes wrong)

1. Cloudflare Pages → your project → **Deployments**
2. Find the last good deploy
3. **⋯** menu → **Rollback to this deployment**
4. Live within 30 seconds

---

## PHASE 2 — Production cutover (when Diana approves)

### Add the real domain (in addition to the preview subdomain)
1. Cloudflare Pages → your project → **Custom domains**
2. **Add domain** → `www.woodlandhillscc.net`
3. Then add the apex too: `woodlandhillscc.net`
4. Cloudflare gives you DNS records to add at the chamber's registrar

### Update DNS at the registrar (wherever woodlandhillscc.net lives — likely Bluehost)
- Add the CNAME record(s) Cloudflare provides
- Typically 5–15 minutes for DNS to propagate
- Cloudflare auto-issues SSL cert

### Bluehost stays for email
- Email at @woodlandhillscc.net (Diana, Felicia, etc.) is unaffected
- Only the website's A/CNAME records change
- MX records (email) stay on Bluehost

### Optional: keep the preview subdomain
You can leave `wvwccoc.heedaisolutions.com` pointing at the same Pages project — it becomes a permanent preview/staging URL, useful for testing changes before they hit production. Or remove it after the production cutover. Either way.

---

## What Cloudflare Pages auto-handles

- HTTPS (free Let's Encrypt cert, auto-renewed)
- Global CDN (every request served from the closest edge)
- HTTP/3 + QUIC
- Brotli compression
- DDoS protection
- Per-commit preview URLs
- Free for chamber-scale traffic

---

## What our config files do

- **`_headers`** — Cache rules (HTML short, CSS/JS long, JSON medium) + security headers (HSTS, X-Frame-Options, microphone permission for ElevenLabs)
- **`_redirects`** — Nice URLs (`/about` → `/about.html`), legacy redirects, blocks public access to `/scripts/`, `/backend/`, `/raw/`

Both are read automatically by Cloudflare Pages — nothing else to configure.

---

## Verification checklist (after first deploy)

Visit each on `https://wvwccoc.heedaisolutions.com` and confirm 200 OK + page renders:

- [ ] `/` — homepage with logo + 8-language stats + ElevenLabs widget
- [ ] `/members/directory.html` — 851 entries load (check the count in the toolbar)
- [ ] `/guides/cityloop.html` — flagship guide renders
- [ ] `/loyalty.html` — loyalty page renders
- [ ] `/admin/index.html` — Diana's Console renders
- [ ] `/es/`, `/ru/`, `/hy/`, `/zh/` — language landings render with proper fonts
- [ ] `/data/directory.json` — returns JSON (not HTML 404)
- [ ] ElevenLabs widget appears bottom-right on homepage
- [ ] Inline Concierge launchers visible on homepage hero, contact page, guide pages
- [ ] `/scripts/build-blog.js` returns 404 (the `_redirects` rule blocks dev folders)

If `/data/directory.json` 404s → the **Root directory** in build settings is wrong. Make sure it points at the worktree path where the JSON lives.

---

## When you're ready

Tell me you've connected Cloudflare to the repo, paste the `wvwccoc.heedaisolutions.com` URL once it's deployed, and I'll run the verification checklist for you.

Or — say "use Claude in Chrome" and I'll spin up the browser and walk you through the Cloudflare UI in real time.
