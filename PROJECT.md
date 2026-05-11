# West Valley · Warner Center Chamber of Commerce — Project

**Status:** Demo approved by Diana Williams (CEO) · transitioning to production build
**Last update:** May 8, 2026
**Production target:** 4 weeks from kick-off
**Repo:** `HeedAIConsulting/Heedbusinesssolutions`, branch `claude/hopeful-hellman-6f7a38`
**Demo URL:** https://wvwccc-chamber-api.onrender.com/
**Production URL:** https://woodlandhillscc.net (to be cut over)

---

## 1. Project summary

Complete rebuild of the West Valley · Warner Center Chamber of Commerce website
— a modern, AI-powered, multilingual, fully monetized platform delivered at $0
build cost to the chamber. Heed Business Solutions hosts, operates, and continues
development in exchange for a **15% revenue share** on transactions processed
through the site.

The chamber owns the data, the brand, and the URL. Either side can terminate
with 60 days notice. Heed scales: the same platform clones to other chambers
(Beverly Hills, LA Area, Greater San Fernando Valley, Calabasas, Encino, etc.)
in 2-week increments after this one is proven.

---

## 2. Stakeholders

| Role | Person | Email |
|---|---|---|
| Chamber CEO / decision maker | Diana Williams | diana@woodlandhillscc.net *(to verify)* |
| Chamber staff (M365 owner) | Wendy | wendy@woodlandhillscc.net |
| Vendor / build lead | Michael Bowers (Heed AI Solutions) | mbowers@heedconsulting.ai |
| Vendor support | Heed Support team | support@heedbusinesssolutions.com |

---

## 3. What has been built (demo state)

### Public site
- **Homepage** with hero (real chamber board photo background), 6-tile quick-find row, sponsor partners section, events preview, guides preview, member CTAs, newsletter signup
- **Member directory** — 851 entries, searchable, filterable by tier / category / neighborhood. ~30 are real chamber members; the remaining ~820 are placeholder data to be replaced from real chamber roster on go-live.
- **Ten community resource guides**: Restaurants, Spas & Wellness, Home Maintenance, Parents, CityLoop (flagship), Education, Family Activities, Professional Services, Business Solutions, plus the hub
- **Events calendar** with list + grid view, search/filter, working Add-to-Calendar buttons (real RFC-5545 `.ics` + Google Calendar + Outlook deep links), native + fallback share menu
- **Blog** with 50 placeholder posts authored by "The Chamber Team" (to be replaced with real content calendar)
- **Newsletter system** with 8 topic-specific subscription lists
- **Five fully translated language landings** — English (default), Spanish, Russian, Armenian, Chinese (AI-translated, pending native-speaker review)
- **Sponsorship pages** — Friend ($295) through Platinum ($5,000+), plus event-specific menus from $500 ribbon-cutting host to $25K Food & Wine presenting sponsor
- **Loyalty program** scaffold — partner directory, member-side redemption, plastic-card upgrade path
- **Member onboarding flow** — tier picker, profile setup, listing customization
- **Static informational pages** — About, Board, Staff, History, Demographics, Wellness Network, Letters, Contact, Donate, Join, Benefits, Member Deals, Networking Groups, Referral Program, Grateful Hearts, Ambassadors, Leaders, Partnerships

### AI features
- **Public AI Concierge** — embedded ElevenLabs ConvAI widget on every page, plus inline launch cards on hero, contact page, and guide pages. Voice + text, 8 languages (EN/ES/RU/HY/ZH written, plus VI/JA/UK voice). Pulls real member context for recommendations.
- **AI Staff Assistant** — collapsible floating widget on every admin page. Drafts content, summarizes inboxes, answers operational questions. Powered by Google Gemini (`gemini-flash-latest`) with Anthropic Claude as automatic fallback and a smart mock for offline demos.
- **Outreach drafting** — `/api/outreach/draft` generates personalized 3-email sequence per prospect, signed by Diana, branded in chamber voice.

### Admin console ("Diana's Console")
- **Dashboard** — member count, revenue MTD/YTD, AI session count, lead attribution, "needs your attention" queue
- **AI Assistant** chat page with conversation history
- **Approvals** queue
- **Members** management
- **Events** management
- **Guides** management
- **Blog** editor
- **Outreach** — bulk-draft generator wired to Microsoft 365 (filter members → Gemini writes per-recipient → drafts land in Outlook)
- **Renewals** queue
- **Billing** — Heed revenue share at 15%, auto-remit
- **Newsletter** scheduling
- **Social** — Connect-button state for Instagram / Facebook / LinkedIn / X (none connected yet; UI true to state)
- **Sponsorships** ledger
- **Staff** management
- **Settings** — live integration state (M365, Gemini, Anthropic) with Connect/Disconnect controls
- **Ad inventory** — 245 ad spaces × 5 languages priced for 2026/2027 ($736K potential ARR)
- **Leads** routing

### Integrations (live)
- ✅ **Google Gemini** — `gemini-flash-latest` for all AI roles. Free-tier quota sufficient for chamber scale. Anthropic Claude as fallback if Gemini key missing.
- ✅ **Microsoft 365 Graph (delegated OAuth)** — sign in once at `/admin/settings.html`, then list inbox / create drafts / send / reply-as-draft / bulk-draft to filtered member lists. App registration: "WVWCC Chamber Site" in chamber's Azure AD tenant.
- ✅ **ElevenLabs ConvAI** — agent ID `agent_8201kqnjhzyrfpdvtqwgf9e0034y`, voice + text, 8 languages
- ⚠️ **Cloudflare Pages** — static frontend at `wvwccc-chamber.pages.dev`. Has minor cross-origin Connect-button quirk (working around it by using Render URL for demo)
- ⚠️ **Render** — Node Express backend at `wvwccc-chamber-api.onrender.com`. Free tier with 15-min idle sleep (acceptable for demo, must upgrade for production)

### Site-wide features
- **Self-guided tour** — 16 steps across public site + admin, accessible from top bar of every page (`▶ Take the tour`) and from homepage hero. Persists across page navigations via sessionStorage. Skip / resume anytime.
- **Full WCAG 2.1 AA accessibility widget** (♿ in bottom-left corner) — text size, line/letter/word spacing, contrast modes (high/dark/inverted), saturation, link/heading highlight, dyslexia-friendly font, big cursor, animation pause, reading guide, image hide, reset. Settings persist in localStorage.
- **Accessibility statement page** at `/accessibility.html` covering WCAG 2.1 AA, ADA Title III, Section 508, Unruh Civil Rights Act
- **Real share buttons** — native Web Share API + fallback Twitter/Facebook/LinkedIn/Email/copy-URL menu
- **Real .ics calendar generation** — RFC-5545 compliant
- **Real chamber crest logo** (224×224 green circular badge with oak tree + city skyline + neighborhood names)
- **Real hero board-members photo** with navy gradient overlay

### Frontend architecture
- Pure HTML / CSS / vanilla JS — no React, no build step
- `js/partials.js` injects header/footer + AI Concierge + share-calendar + tour + accessibility into every public page via `ChamberPartials.mount({active, depth, lang})`
- `admin/admin.js` does the same for admin pages via `AdminShell.mount({active})`
- `js/api-base.js` resolves the API origin (localhost → `/api`, anywhere else → Render URL)
- CSS design system in `css/chamber.css` — brand vars (`--navy #0B2545`, `--gold #C9A227`), spacing scale, radii, shadows, typography (Source Serif Pro / Inter / JetBrains Mono), responsive grids

### Backend architecture
- **Express** + Node 18+
- **`server.js`** — boot, static serving, CORS, mounts `backend/chamber-routes.js`
- **`backend/chamber-routes.js`** — all `/api/*` endpoints
- **`backend/llm.js`** — provider-agnostic LLM wrapper (Gemini → Anthropic → mock)
- **`backend/m365.js`** — Microsoft Graph wrapper with MSAL delegated OAuth + token store
- **Data**: JSON files on disk in `data/` (851 members, events, guides, etc.) + `data/_store/` (in-memory append-only JSONL for concierge logs, referrals, onboarding, outreach, bulk-draft history, M365 tokens)
- **No database yet** — file-based for demo; Postgres for production

---

## 4. Technical decisions made

| Decision | Rationale |
|---|---|
| Static HTML/CSS/JS, no framework | Speed of build, zero build step, ironclad reliability, easy for any dev to maintain |
| Cloudflare Pages for frontend | Free, fast CDN, automatic HTTPS, per-commit preview URLs |
| Render for backend | Free tier good enough for demo; cheap upgrade path; familiar Node environment |
| Google Gemini Flash for primary AI | Free-tier quota of 1500 req/day covers chamber load; Anthropic stays as fallback |
| ElevenLabs ConvAI for voice/chat | Multi-lingual, off-the-shelf, replaces custom build |
| Microsoft 365 delegated OAuth (not application) | Application permissions need tenant admin consent which the chamber's M365 user can't grant. Delegated requires only the user's own consent — works immediately. |
| 15% revenue share | Updated from initial 5% based on cost-of-platform analysis; covers hosting + AI + ongoing dev with margin for the 80-chamber scale-out |
| Real Add-to-Calendar via `.ics` blob download + Google/Outlook deep links | No third-party JS dependency, no privacy leak, works on every device |
| Custom accessibility widget (not UserWay/Accessibe) | Free, no third-party script tax, no privacy leak, no annual subscription |
| Self-guided tour custom-built (not Shepherd.js/Driver.js) | Tiny code footprint, cross-page persistence via sessionStorage, full control over UX |

---

## 5. Outstanding work (production blockers + roadmap)

### Pre-launch blockers (★ must-have before public)

1. ★ **Real member roster** — replace 851 placeholder entries with real chamber records
2. ★ **Real events** (60-day forward calendar minimum)
3. ★ **Real staff bios + photos**
4. ★ **Real sponsor logos** (collected from each tier member)
5. ★ **Real social handles** (research/confirm; remove the wrong-account links)
6. ★ **Real OG share image** (1200×630)
7. ★ **DNS cutover** — `woodlandhillscc.net` apex + www → production hosting; keep MX records on Bluehost for email
8. ★ **SPF / DKIM / DMARC** for sending email from chamber domain
9. ★ **SSL cert** (Cloudflare auto-issues)
10. ★ **Render upgrade to Standard** ($7/mo) — eliminates cold-start
11. ★ **Database** — Postgres for members/events/transactions/audit; JSON file → DB migration
12. ★ **Real auth** — Auth0 or Clerk or Supabase replacing the demo JWT stubs
13. ★ **Payment processor** — Stripe or Square wired to chamber's bank, with refund/dunning/auto-renewal/tax handling
14. ★ **15% revenue share automation** — log + remit on every successful charge
15. ★ **Privacy policy** + **Terms of Service** + **Cookie consent**
16. ★ **Signed revenue-share contract** between chamber and Heed
17. ★ **Rotate credentials** — M365 client secret, Gemini key, Anthropic key (all pasted in chat during setup)
18. ★ **Error tracking** (Sentry) + **uptime monitoring** + **secret rotation policy**
19. ★ **Member portal real implementation** — listing edit, deal posting, RSVPs, loyalty redemption
20. ★ **Staff RBAC** + 2FA enforcement
21. ★ **GA4** + **Microsoft Clarity** wired with real measurement IDs
22. ★ **Sitemap.xml** regenerated from real content
23. ★ **Native-speaker review** of ES, RU, HY, ZH translations
24. ★ **Diana + Wendy training session** (live, recorded)
25. ★ **Staging environment** + **CI/CD** (push to main → prod; push to staging-branch → preview)

### Soon-after-launch (▲ first 30 days post-public)

26. ▲ **Job board** real implementation
27. ▲ **Real blog content calendar** (drop the 50 demo posts or replace)
28. ▲ **Annual chamber awards** voting interface
29. ▲ **Committee signup** real flow
30. ▲ **Document repository** (bylaws, minutes — member-only)
31. ▲ **Weekly automated report** to Diana from real DB
32. ▲ **Member-side analytics** (each member sees listing views)
33. ▲ **Member-to-member messaging** (light touch)
34. ▲ **Receipt + invoice emails** (auto from payment processor)
35. ▲ **Tax handling** (CA sales tax, 1099-K for sponsors)
36. ▲ **Calendar API write** — Add-to-Calendar buttons also push to Diana's calendar
37. ▲ **Press release + ribbon cutting + member announcement**

### Long-tail (◇ ongoing)

38. ◇ **Quarterly content review**
39. ◇ **Annual ADA audit** (axe-core in CI + manual)
40. ◇ **Annual feature roadmap review**
41. ◇ **Member-exclusive premium content**
42. ◇ **80-chamber scale-out** (Beverly Hills, LA Area, Greater SFV, Calabasas, etc.)

---

## 6. Cost model

### Build cost
$0 to chamber. Heed absorbs build time as the cost of acquiring the chamber as the first reference customer.

### Ongoing platform cost (monthly, Heed-absorbed)
| Item | Cost |
|---|---|
| Cloudflare Pages | $0 (free tier) |
| Render Standard | $7/mo |
| Postgres (Render or Supabase) | $7-25/mo |
| Domain renewal | ~$15/yr |
| Sentry | $0 (free tier) |
| UptimeRobot | $0 (free tier) |
| Microsoft Graph API | $0 (delegated) |
| Gemini API | $0-50/mo depending on usage |
| ElevenLabs ConvAI | Per-usage; estimate $30-150/mo at chamber scale |
| Auth0 / Clerk | $0-25/mo (free up to 7.5k MAU) |
| **Total Heed cost** | **~$50-300/mo** |

### Revenue projection (Year 1, conservative)
| Stream | Revenue |
|---|---|
| Membership dues (800 × $850 avg) | $680,000 |
| +20% lift from automated onboarding | $136,000 |
| Sponsorships, ads, blasts, premium listings | $90,000 |
| **Chamber gross revenue** | **$906,000** |
| **Heed 15% share** | **$136,000/yr** |
| **Heed net after platform costs (~$3K/yr)** | **~$133,000/yr** |

### Scale-out math (Year 3)
80 chambers × $35K avg revenue share = **$2.8M ARR**

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Diana / board doesn't approve final cutover | Low (verbal commit secured) | High | Soft-launch to members first; gather feedback; iterate |
| Chamber roster CSV not provided in time | Medium | High | Use the current ~30 verified entries; mark new sign-ups as "verified by chamber" |
| Payment processor approval delays | Medium | High | Use Stripe (faster underwriting) or chamber's existing Square account |
| AI cost overrun | Low | Low | Rate limit per IP + per session; Gemini Flash free tier covers expected volume |
| ADA compliance lawsuit (drive-by) | Low (mitigated by widget + statement) | High | WCAG 2.1 AA + statement page + auto-axe-core in CI |
| Member data breach | Low | High | DB encryption at rest; encrypted tokens; secrets in env vars; cybersec insurance |
| Render cold-start visible during demo | Medium | Low | Upgrade to Standard pre-launch; warm-ping cron in interim |
| M365 admin consent never granted | High | Low | Delegated flow works without; only loses bulk-send-as-shared-mailbox feature |
| Translations are wrong | Medium | Medium | Native-speaker review before launch; remove language switcher for any language we can't validate |

---

## 8. Operational playbook (post-launch)

| When | Who | What |
|---|---|---|
| Daily | Auto | Render uptime ping, error alerts to Sentry, DB backup |
| Weekly | Diana | Approve pending listings (AI-pre-screened), review concierge logs, send newsletter |
| Weekly | Heed | Review Sentry errors, deploy improvements |
| Monthly | Heed | Quarterly invoice + 15% remit report to chamber |
| Quarterly | Diana + Heed | Content review walkthrough; flag stale items |
| Annually | Heed | ADA audit, secrets rotation, dependency updates, content refresh |

---

## 9. Timeline (4-week production sprint)

**Week 1 (May 11-17, 2026)**
- Real data import — full member roster CSV → DB migration script
- Real events for 60 days forward
- Real staff bios + photos
- Payment processor selection + sandbox setup
- DNS plan finalized

**Week 2 (May 18-24)**
- Auth migration (Auth0 or Clerk)
- DB migration to Postgres
- Stripe/Square production wiring
- Secrets rotation
- Real OG image, sponsor logos collected
- Native-speaker translation review

**Week 3 (May 25-31)**
- Privacy/ToS legal review + publish
- GA4 + Sentry + UptimeRobot wired
- Staging environment + CI/CD
- Diana + Wendy training (live, recorded)
- Soft-launch invite list (chamber members only)

**Week 4 (June 1-7)**
- Soft launch to chamber members
- Press release drafted
- Member announcement email
- Bug fixes from soft-launch feedback
- **Public launch + ribbon cutting June 7**

---

## 10. Commit history highlights

Key push points captured for institutional memory:

| SHA | Date | What |
|---|---|---|
| `0c8e7ed` | May 4 | Bluehost FTPS deploy infra (later superseded by Render) |
| `2e7dcf2` | May 7 | Render deployment config (Web Service, blank root, npm install, node server.js) |
| `11de81e` | May 7 | **Gemini + M365 + calendar/share/Render config bundle** — backend foundation |
| `fda1037` | May 7 | Collapsible Staff Assistant chat |
| `aa0df93` | May 7 | Top nav uniformity (white-space nowrap, tightened spacing) |
| `fda8afb` | May 8 | Real board-members photo as hero background |
| `4806d33` | May 8 | `_redirects` rules — drop Cloudflare-conflicting `.html` rewrites |
| `44f0c8d` | May 8 | **16-step self-guided tour** with cross-page persistence |
| `15f0a8b` | May 8 | Concierge card contrast fix (white-on-white root cause) |
| `88c0341` | May 8 | Strip all `wvwcc.org` fake email refs; surface tour + M365 prominently |
| `7a7baac` | May 8 | **Gemini Pro free-tier quota=0 fix** — switched all roles to Flash; logos restored; 15% revenue share |
| `a3e1299` | May 8 | **Full ADA / WCAG 2.1 AA accessibility widget** + statement page |

---

## 11. Files and folders (key reference)

```
/
├── PROJECT.md                              ← this file
├── README.md
├── PITCH.md                                 ← business case + revenue model
├── _DEMO_GUIDE.md
├── ELEVENLABS_SYSTEM_PROMPT.md             ← concierge persona
├── CLOUDFLARE_DEPLOY.md
├── BLUEHOST_DEPLOY.md
├── render.yaml                              ← Render blueprint
├── package.json                             ← Node deps (Express, MSAL, Graph, Gemini SDK, etc.)
├── server.js                                ← Express boot + CORS + chamber-routes mount
├── backend/
│   ├── chamber-routes.js                   ← all /api/* endpoints
│   ├── llm.js                              ← provider-agnostic Gemini/Anthropic wrapper
│   └── m365.js                             ← Graph delegated-OAuth wrapper
├── css/chamber.css                          ← brand system + responsive
├── js/
│   ├── partials.js                          ← header/footer + ChamberPartials.mount
│   ├── chamber.js                           ← page-level helpers
│   ├── api-base.js                          ← API origin resolver
│   ├── share-calendar.js                    ← .ics + share button engine
│   ├── tour.js                              ← 16-step guided walkthrough
│   └── accessibility.js                    ← WCAG 2.1 AA widget
├── admin/
│   ├── admin.js + admin.css                ← admin shell + sidebar + chat widget
│   ├── index.html (dashboard) + 13 sub-pages
├── auth/                                    ← member-login + staff-login (stubs, to replace)
├── data/
│   ├── directory.json                       ← 851 members (replace with real roster)
│   ├── events.json, guides.json, blog-posts.json, etc.
│   └── _store/                              ← runtime append-only JSONL stores
├── es/ ru/ hy/ zh/                          ← language landings
├── guides/                                  ← 10 community resource guides
├── members/                                 ← directory + profile pages
├── events/ blog/ community/ about/          ← content sections
├── images/
│   ├── wvwccc-logo-2026.png                ← real green crest
│   └── board-members.jpg                    ← real board photo
└── .env.local                               ← local creds (gitignored)
```

---

## 12. Open questions for Diana

1. Confirm chamber's primary email (`info@woodlandhillscc.net`?)
2. Confirm phone, address, hours
3. Real social handles (or "none yet" so we don't link to wrong account)
4. Real staff list with emails (so we can wire real auth)
5. Real upcoming events for 60 days forward
6. Real chamber roster CSV
7. Preferred payment processor — Stripe or Square?
8. Where is `woodlandhillscc.net` DNS hosted today?
9. Cybersecurity insurance — does the chamber carry it?
10. Board approval timeline — when do you need the signed Heed agreement?

---

*This document is the source of truth for the rebuild. Update on every milestone.*
