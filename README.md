# West Valley ~ Warner Center Chamber of Commerce
### A pitch-ready full-stack rebuild by Heed Business Solutions

---

## What's in this folder

A complete, modern chamber-of-commerce website with AI concierge, e-commerce
checkout, member directory, eight resource guides, blog, member &amp; staff
portals, and a Staff Desktop Assistant admin console.

The architecture is HTML + vanilla CSS + a tiny JS layer for partials and AI
integration, served by the existing Express backend at `/backend` (which we
extended with Chamber-specific routes).

---

## File map

```
websites/chamber/
├─ index.html                        Homepage (hero, guides, events, leaders, blog, newsletter)
├─ about.html                        The Chamber
├─ contact.html                      Contact form
├─ ai-concierge.html                 Dedicated full-page Concierge experience
├─ join.html                         Membership tier picker (6 tiers, monthly/annual)
├─ join-checkout.html                Member onboarding + Square checkout
├─ sponsor.html                      Sponsorship menu (events + premium listings)
├─ advertise.html                    Newsletter, banner, social, Concierge ads
├─ donate.html                       501(c)(3) Foundation donations
│
├─ events/
│   ├─ index.html                    Calendar + list view, filters, RSVP
│   └─ checkout.html                 Square ticket checkout
│
├─ members/
│   ├─ directory.html                Searchable, filterable, tier-sorted
│   └─ profile.html                  Profile with photo gallery, deals, reviews, lead form
│
├─ guides/
│   ├─ index.html                    Guide hub (8 guides)
│   ├─ restaurant.html               Dine West Valley (flagship)
│   ├─ parent-resource.html          Parent Resource Guide
│   ├─ spa.html                      Wellness & Spa Guide
│   ├─ home-maintenance.html         Home Services Guide
│   └─ business-solutions.html       B2B Services Guide
│
├─ blog/
│   ├─ index.html                    Valley Biz Buzz
│   ├─ post-ai-concierge-launch.html Sample post
│   └─ guest-post.html               Pitch-submission flow
│
├─ community/
│   └─ index.html                    Neighborhood landing pages
│
├─ auth/
│   ├─ member-login.html             Member sign-in
│   ├─ staff-login.html              Staff sign-in (with 2FA)
│   └─ member-portal.html            Member dashboard
│
├─ admin/                            Staff Desktop Assistant
│   ├─ index.html                    Dashboard
│   ├─ approvals.html                Approval queue (AI pre-screened)
│   ├─ ai-assistant.html             Full-page AI staff chat
│   ├─ members.html                  Member management
│   ├─ events.html                   Event management
│   ├─ guides.html                   Guide management
│   ├─ leads.html                    Lead-attribution dashboard
│   ├─ renewals.html                 Renewal tracking
│   ├─ sponsorships.html             Sponsorship pipeline
│   ├─ blog.html                     Content + AI generator
│   ├─ social.html                   Social media manager (AI Content Studio)
│   ├─ newsletter.html               Newsletter management
│   ├─ billing.html                  Square integration + revenue
│   ├─ reports.html                  Auto-generated reports
│   ├─ staff.html                    Staff & roles
│   └─ settings.html                 Integrations + Heed partnership
│
├─ css/chamber.css                   Design system
├─ js/chamber.js                     AI concierge widget + helpers
├─ js/partials.js                    Shared header/footer
├─ admin/admin.css                   Admin design system
├─ admin/admin.js                    Admin shell + AI assistant panel
│
└─ data/                             Seed data
    ├─ members.json
    ├─ events.json
    └─ guides.json
```

---

## The pitch (talking points)

### What the Chamber gets
1. **A modern, AI-powered website** — replaces `event_listings.php` and the
   rest of the legacy site.
2. **An always-on AI Concierge** that routes residents to member businesses
   24/7 — built on Claude.
3. **Eight full-featured Resource Guides** that turn the Chamber into the
   community's go-to directory for restaurants, parenting, wellness, home
   services, business services, weddings, seniors, and newcomers.
4. **A Staff Desktop Assistant** so 2 people can run the Chamber: AI drafts
   newsletters/social/blog, manages approvals, runs renewals, generates
   reports, schedules events.
5. **Full e-commerce on Square**: memberships (recurring), event tickets,
   sponsorships, premium listings, donations, ads — automated.
6. **Lead-attribution analytics** for every member so they can see exactly
   what value the Chamber generates.

### What it costs the Chamber
**$0 upfront.** Heed builds and operates it. We earn a 5% revenue share on
all Square transactions — auto-remitted from each payment.

### What Heed gets
- Recurring revenue from Chamber transactions (memberships, tickets,
  sponsorships, ads).
- A marquee case study and reference client.
- Direct exposure to all 450+ Chamber members → pipeline for Heed services.
- A repeatable platform that can be deployed to 100+ similar chambers in
  Southern California for the same revenue-share model.

### Why now
The current chamber site is 15+ years out of date, runs on bare PHP, has no
mobile experience, no e-commerce, no analytics, and no AI. Every other modern
membership organization has these tools. The Chamber's competitive position
declines until they catch up.

---

## Architecture decisions

### Why HTML + vanilla CSS instead of React/Next?
- **Zero build step.** Edit a file, refresh browser. Chamber staff can edit
  HTML directly when needed.
- **Free hosting.** Deployable to GitHub Pages, Cloudflare Pages, Netlify,
  S3 — anywhere static. Backend on Render / Fly / a $7 VPS.
- **No JS framework lock-in.** This site will run unchanged in 2030.
- **Faster.** No client-side hydration, no megabyte React bundle, no
  framework overhead. Lighthouse 95+ achievable.

### Why Express on the existing Heed backend?
- Already exists, already deployed.
- Already has the Anthropic SDK wired up.
- One backend serves both heedbusinesssolutions.com and woodlandhillscc.net cleanly.
- Add Square SDK in 5 minutes when ready.

### Why Square (and not Stripe)?
The user has access to Square already. Square's recurring billing, invoices,
and payouts handle every monetization use case the Chamber has. Stripe can be
added later as an option.

### Why Claude (and not OpenAI)?
- Heed is already an Anthropic shop.
- Claude Haiku 4.5 is fast and cheap — perfect for the high-volume Concierge.
- Claude Sonnet 4.6 powers the Staff Assistant where reasoning quality matters.

---

## Running locally — ONE step

The site is fully self-contained. Frontend, backend, and AI concierge all run
from one Node process on one port.

### Windows
Double-click **`start-preview.bat`** in this folder.

### Mac / Linux
```bash
bash start-preview.sh
```

That's it. The launcher:
1. Verifies Node.js is installed (LTS recommended).
2. Runs `npm install` if needed (~30 sec, one time).
3. Starts the server on **http://localhost:5500/**.
4. Opens your default browser to the homepage.

### To activate live AI (optional)
By default the AI Concierge runs in smart-mock mode — it returns real member
recommendations based on keyword matching, with no API key required.

To upgrade to full Claude responses:
1. Copy `.env.example` to `.env` in this folder.
2. Add your `ANTHROPIC_API_KEY` (get one at https://console.anthropic.com).
3. Restart the launcher.

The startup banner will show `AI: ✓ LIVE (Claude connected)`.

---

## API surface (Chamber routes)

All routes live in `backend/chamber-routes.js`:

| Method | Route                              | Purpose                                       |
| ------ | ---------------------------------- | --------------------------------------------- |
| GET    | `/api/chamber`                     | Health check                                  |
| GET    | `/api/members`                     | List members                                  |
| GET    | `/api/members/:id`                 | Get member                                    |
| GET    | `/api/events`                      | List events                                   |
| GET    | `/api/events/:id`                  | Get event                                     |
| GET    | `/api/guides`                      | List guides                                   |
| POST   | `/api/concierge`                   | Public AI concierge (Claude Haiku 4.5)        |
| POST   | `/api/staff-assistant`             | Internal staff AI (Claude Sonnet 4.6)         |
| POST   | `/api/payments/charge`             | Square payment (stub — swap in Square SDK)    |
| POST   | `/api/memberships/subscribe`       | Membership recurring billing                  |
| POST   | `/api/blog/pitch`                  | Guest-post pitch                              |
| POST   | `/api/members/lead`                | Lead routing to member                        |
| POST   | `/api/newsletter/subscribe`        | Newsletter signup                             |
| POST   | `/api/auth/member-login`           | Member auth (stub)                            |
| POST   | `/api/auth/staff-login`            | Staff auth + 2FA (stub)                       |

### To make payments real
```bash
cd backend
npm install square
```

Then in `chamber-routes.js`, replace the stub with:
```js
const { Client, Environment } = require('square');
const sq = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox
});
```

### To make auth real
Add `bcrypt`, `jsonwebtoken`, and a Postgres or SQLite user store. The auth
endpoints are deliberately small stubs so they're easy to swap in.

---

## Brand & design

- **Navy** `#0B2545` — primary
- **Blue** `#134E8C` — secondary
- **Gold** `#C9A227` — accent (premium, Featured, sponsor)
- **Cream** `#FAF7F0` — page background
- **Sand** `#F2EBDB` — section variation
- Headings: **Source Serif Pro**
- Body: **Inter**
- Mono / labels: **JetBrains Mono**

The aesthetic borrows the Chamber's traditional navy/gold but modernized:
clean typography, generous whitespace, real photography (placeholders here),
mobile-first responsive.

---

## What's not in this demo (and the plan to ship it)

| Stub          | Plan                                                              |
| ------------- | ----------------------------------------------------------------- |
| Real auth     | bcrypt + Postgres + JWT — 1 day                                   |
| Real Square   | Square Node SDK — 1 day, plus Web Payments SDK on each form       |
| Mailchimp/SES | Newsletter API integration — 0.5 day                              |
| Real photos   | Photo shoot or stock licensing — Chamber decision                 |
| Member CMS    | Admin "Edit Listing" wired to write to JSON or Postgres — 1 day   |
| Square webhooks | Confirmation, refund, dispute handling — 1 day                  |
| QuickBooks    | OAuth + ledger sync via Intuit API — 2 days                       |
| Analytics     | GA4 + Plausible — 0.5 day                                         |
| i18n          | Spanish translation pass — Chamber decision                       |

Total to production-ready: **~10 working days** of build + Chamber content
sign-off.

---

## What this wins for Heed

This is a **template**. The same architecture deploys to:
- Tarzana Chamber
- Encino Chamber
- Sherman Oaks Chamber
- Calabasas Chamber
- ...and 80+ similar chambers across SoCal

Same code, different content, recurring revenue from each. The pitch sells
itself: free site, AI concierge, modern e-commerce, and Heed handles all the
ops in exchange for 5% of transactions.

---

## Built with

- HTML5 / vanilla CSS / vanilla JS (no framework)
- Source Serif Pro · Inter · JetBrains Mono (Google Fonts)
- Express.js (backend)
- Anthropic Claude (Haiku 4.5 for Concierge, Sonnet 4.6 for Staff Assistant)
- Square (payments — sandbox-ready, production-ready stub)
- Designed and built by [Heed Business Solutions](https://heedbusinesssolutions.com)
