# Heed Business Solutions — Backend API

Node.js Express backend powering the Client Intelligence System for heedbusinesssolutions.com.

## Endpoints

- **POST /api/score** — Client Experience Readiness Score (scrapes website, finds competitors, AI analysis)
- **POST /api/auth/verify** — Password verification for Prospect Finder
- **POST /api/prospects** — Automated Prospect List Builder (search, scrape, AI qualification)
- **GET /** — Health check

## Local Development

1. Copy `.env.example` to `.env` and fill in all values:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```
   The API runs on `http://localhost:3001` by default.

4. Update the frontend config file at `/js/config.js` to point to your local server:
   ```javascript
   const HEED_API_BASE = 'http://localhost:3001';
   ```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FIRECRAWL_API_KEY` | Yes | API key from firecrawl.dev |
| `ANTHROPIC_API_KEY` | Yes | API key from console.anthropic.com |
| `PROSPECT_TOOL_PASSWORD` | Yes | Password for the prospect finder tool |
| `NOTIFICATION_EMAIL` | No | Where score reports are sent (defaults to reachus@heedbusinesssolutions.com) |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (defaults to 587) |
| `SMTP_USER` | Yes | SMTP login email |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `ALLOWED_ORIGIN` | Yes | Frontend domain for CORS (https://heedbusinesssolutions.com) |

## Deploy to Render.com

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) and create a **New Web Service**
3. Connect your GitHub repo
4. Set the **Root Directory** to `backend`
5. Render will auto-detect the `render.yaml` config
6. Add all environment variables in the Render dashboard under **Environment**
7. Deploy — Render assigns a URL like `https://heed-api.onrender.com`
8. Copy that URL into `/js/config.js` on the frontend:
   ```javascript
   const HEED_API_BASE = 'https://heed-api.onrender.com';
   ```
9. Upload the updated frontend files to Bluehost

## Notes

- No database required — all endpoints are stateless
- Firecrawl handles web scraping and search
- Claude Sonnet handles AI analysis and qualification
- Email sending is best-effort — score results still return to the frontend if email fails
