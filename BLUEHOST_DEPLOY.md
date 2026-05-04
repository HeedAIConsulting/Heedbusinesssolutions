# Bluehost Deploy (preview at heedbusinesssolutions.com/wvwccoc/)

Static-site upload to Bluehost via FTPS for Diana's review.

## One-time setup

### 1. Create `.deploy.env` at the project root

This file is gitignored — **never** commit it, **never** paste the password in chat.

```
BLUEHOST_HOST=ftp.bnd.gbm.mybluehost.me
BLUEHOST_USER=ftp1@heedbusinesssolutions.com
BLUEHOST_PASS=your_password_here
BLUEHOST_PORT=21
BLUEHOST_REMOTE_DIR=/public_html/wvwccoc
BLUEHOST_PUBLIC_URL=https://heedbusinesssolutions.com/wvwccoc/
```

Fill in your actual FTP password from Bluehost cPanel → FTP Accounts.

### 2. Verify (no upload yet)

Confirms which files would be uploaded and which are skipped:

```bash
node scripts/deploy-bluehost.js --dry
```

Should print 180-ish files totaling ~7-8 MB. Excludes: `.git/`, `.claude/`, `_archive_heed/`, `node_modules/`, `raw/`, `scripts/`, `backend/`, `package*.json`, `server.js`, `.deploy.env`, the markdown docs.

## Deploy

```bash
node scripts/deploy-bluehost.js
```

What this does:
1. Connects to Bluehost via FTPS explicit (port 21, AUTH TLS, encrypted)
2. Ensures `/public_html/wvwccoc/` exists
3. Uploads all production files (creating subfolders as needed)
4. Waits 5 seconds for filesystem to settle
5. Runs verification curls against the live URLs
6. Prints summary

Typical run: **2-4 minutes** for the full ~180 files.

## Verify only (no re-upload)

```bash
node scripts/deploy-bluehost.js --verify
```

Useful after a manual change in cPanel or to check nothing broke.

## What gets uploaded

```
✓ All HTML pages (root + about/ + admin/ + auth/ + blog/ + community/ +
                   downloads/ + es/ + ru/ + hy/ + zh/ + events/ +
                   guides/ + landing/ + loyalty/ + members/ +
                   newsletters/ + profiles/)
✓ css/chamber.css
✓ js/chamber.js + js/partials.js
✓ images/ (logo + any other images)
✓ data/ (directory.json, members.json, events.json, etc. — 11 JSON files)
✓ sitemap.xml + robots.txt
✓ _headers + _redirects (Cloudflare-specific, harmless on Apache)
```

## What's excluded

```
✗ .git, .github, .claude, .cache, _archive_heed, node_modules, raw,
  scripts, backend, dist
✗ .deploy.env, .env*, package*.json, server.js, start-preview.*
✗ ELEVENLABS_SYSTEM_PROMPT.md, PITCH.md, README.md, SETUP.md,
  CLOUDFLARE_DEPLOY.md, BLUEHOST_DEPLOY.md, _DEMO_GUIDE.md
✗ *.log, .DS_Store, Thumbs.db
```

## Verification checklist (run after every deploy)

The script auto-runs these against `heedbusinesssolutions.com/wvwccoc/`:

- [ ] `/` → 200 (homepage)
- [ ] `/index.html` → 200
- [ ] `/members/directory.html` → 200
- [ ] `/guides/cityloop.html` → 200
- [ ] `/loyalty.html` → 200
- [ ] `/data/directory.json` → 200 (851-entry JSON, NOT an HTML 404)
- [ ] `/css/chamber.css?v=6` → 200
- [ ] `/js/partials.js?v=6` → 200
- [ ] `/es/index.html` → 200
- [ ] `/admin/index.html` → 200

If `/data/directory.json` returns HTML or 404 → the upload missed the `data/` folder. Re-run the deploy.

## Path notes

The `admin/members.html` page uses `../data/...` and `../api/...` relative paths so it works correctly from a subfolder URL like `/wvwccoc/admin/members.html`. All other public pages use relative paths throughout.

The ElevenLabs widget is loaded from `https://unpkg.com/...` (absolute external URL) and works regardless of subfolder.

## Subsequent deploys

Just run `node scripts/deploy-bluehost.js` again. It uploads only changed files, deletes any remote files no longer in the local build (so the remote stays clean).

## Going to production later

When Diana approves and you point `woodlandhillscc.net` at this content:
1. Either move the files from `/public_html/wvwccoc/` → `/public_html/` on the production hosting
2. Or use Cloudflare Pages instead (recommended — see `CLOUDFLARE_DEPLOY.md`)

If staying on Bluehost for production: `admin/members.html` will need to switch back to absolute `/data/...` paths (or stay relative — both work at root). Easy to reverse.
