# Chamber Demo — Click-Through Guide

A suggested order for walking the Chamber through the demo.

## How to launch on Windows
Double-click **`start-preview.bat`**. Browser opens to the homepage.
(Requires Python or Node.js on the PC. Most dev machines have one.)

## How to launch on Mac
Open Terminal in this folder and run: `bash start-preview.sh`

---

## Click-through (≈ 8 minutes)

### 1. The homepage — `/`
- Hero: "The West Valley's community engine is now AI-powered"
- Note the gold AI Concierge widget bottom-right (always present)
- Scroll: Featured Guides → Events → Leaders (tiered) → Blog → Newsletter

### 2. AI Concierge — bottom-right widget OR `/ai-concierge.html`
- Click a suggested chip ("Find a plumber", "What's happening this week?")
- Show the structured cards it returns
- Open `/ai-concierge.html` for the full-screen experience

### 3. Member Directory — `/members/directory.html`
- Search "spa", filter by Tarzana, filter by Gold tier
- Click any member → full profile with gallery, deals, reviews, lead form

### 4. Events — `/events/index.html`
- Toggle List / Calendar (top-right)
- Click an event with a price → checkout flow with Square card form
- Note: free events route to RSVP, paid to ticketing

### 5. Resource Guides — `/guides/index.html`
- Open the Restaurant Guide (the flagship)
- Show the gold "Premium Sponsor" placement at top of section
- Show the "Ask the Concierge" card embedded in every guide
- Bottom: "Get featured" upsell to monetization

### 6. Monetization — show the revenue map
- `/join.html` → 6 membership tiers + Square checkout
- `/sponsor.html` → Event sponsorships + Premium Listings
- `/advertise.html` → Newsletter, banner, social, AI Concierge ads
- `/donate.html` → 501(c)(3) Foundation + tax-deductible receipts

### 7. Member Portal — `/auth/member-login.html`
- Sign in (any creds in demo) → goes to portal
- Show: lead-attribution stats, Concierge referrals, attributed revenue
- "This is what every member sees about THEIR own performance"

### 8. Staff Desktop Assistant — `/auth/staff-login.html`
- Sign in → `/admin/index.html`
- **Dashboard:** revenue, leads, "Needs your attention", Concierge insights
- **Approvals:** AI pre-screened queue (1-click approve)
- **Members / Events / Guides:** every record manageable
- **Social Media Manager:** AI Content Studio that drafts captions per platform
- **Billing:** full Square integration view + Heed revenue share line item
- **AI Staff Assistant:** full conversational ops co-pilot
  - Try: "Draft this Friday's newsletter"
  - Try: "What needs my attention before end of day?"

---

## The pitch (one sentence)

> "We rebuild your site for free, plug in AI Concierge + automated commerce, and earn 5% of transactions through Square. You get a modern site, a 24/7 concierge, eight resource guides, and an AI staff assistant that lets two people run the Chamber. Want to see the dashboard?"

---

## What to follow up with

1. Walk to `admin/billing.html` → show the **Heed revenue share line**
2. Walk to `admin/settings.html` → show the **integrations** + **Heed partnership**
3. Close on the **template story**: same architecture redeploys to other chambers across SoCal at zero marginal cost
