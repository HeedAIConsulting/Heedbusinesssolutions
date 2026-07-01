# Member Profile Enhancements — Design Spec

**Date:** 2026-06-30
**Project:** WVWCCC chamber site (repo root)
**Status:** Approved for planning

## Goal

Enrich member directory listings so a business can: write/AI-improve its own
description, choose whether a logo or a personal photo represents the listing,
expand its social links, and optionally introduce its people ("meet the team").
All changes flow through the existing member self-edit pipeline and publish
immediately. Solo members get value with near-zero extra effort; the team
feature is fully opt-in.

## Context (existing system this builds on)

- **Self-edit portal:** `member/profile.html` + `member/member.js` →
  `PATCH /api/me/profile`, whitelisted by `sanitizeProfile()` in
  `backend/chamber-routes.js`.
- **Persistence:** member self-edits saved via `repo.setMemberEdit(mid, patch)`
  (Postgres). Merge precedence: base directory seed < member edits < admin
  overrides (`loadMembersFull()`).
- **Public render:** `Chamber.initProfile()` in `js/chamber.js`. Directory
  cards render via the member-tile/card helpers in the same file.
- **Image upload:** `POST /api/me/asset` accepts a data URL + `kind`, stores in
  Postgres, serves at `/api/assets/:id`. `kind` is currently `logo` | `photo`.
- **LLM:** `backend/llm.js` is Gemini-first via `complete()` (model
  `gemini-flash-latest`). A code comment notes `-pro` models have no free-tier
  quota.
- **Social today:** `social` object supports
  facebook/instagram/linkedin/x/youtube/tiktok. `reviewLinks` separately holds
  google/yelp. There is a vestigial `contacts` array (name+email, max 3)
  sanitized but never rendered.

## Decisions (locked)

1. **Team model:** one `team` array; first entry is the primary "person."
2. **Teammate access:** display-only entries. No logins, no invites, no
   per-teammate posting.
3. **Approval:** profile edits go live immediately (unchanged from today). No
   moderation queue.
4. **AI model:** Gemini 2.5 Flash (cheap, free-tier-safe, strong for short
   marketing copy).
5. **Primary image:** member chooses logo vs. personal photo; neither required;
   auto-defaults to whichever single image exists; falls back to initials seal.
6. **Team is opt-in and minimal:** collapsed section; per teammate only name,
   title, optional photo, optional short bio.

## Data model (additive — no rewrite of existing fields)

New/changed fields on a member record, all set through `setMemberEdit`:

- `team`: array, max 8, of `{ name, title, bio, photo }`.
  - `name` ≤ 80 chars, `title` ≤ 80, `bio` ≤ 600, `photo` is a URL
    (`/api/assets/...` or `http(s)://...`). Entries with no name are dropped.
  - First entry = primary person ("Meet [name]"). Order is preserved as
    submitted.
- `primaryImage`: `'logo' | 'person'`. Controls which image represents the
  listing on the directory card and profile sidebar.
  - Resolution: if `primaryImage` set and that source has an image, use it; else
    use whichever of {logo, first team photo} exists; else initials seal.
- `social` gains keys: `nextdoor`, `linkedinPersonal`.
  - Existing `linkedin` is now semantically the **business/company** page.
  - **Yelp:** no new key. Yelp keeps living in `reviewLinks.yelp` (its current
    home, already rendered as a "★ Yelp reviews" chip). The portal simply groups
    the Yelp input visually under the social area per the request. This avoids
    rendering Yelp twice.

`PUBLIC_FIELDS` adds `team` and `primaryImage`. `MEMBER_STR_FIELDS` is unchanged
(team/primaryImage are handled by dedicated sanitizers, not the scalar loop).

## Backend changes (`backend/chamber-routes.js`)

1. **`sanitizeProfile()`**
   - Add `nextdoor`, `linkedinPersonal` to the social key allowlist (Yelp stays
     in the existing `reviewLinks` allowlist — no change there).
   - Add `primaryImage`: accept only `'logo'` or `'person'`.
   - Add a `team` sanitizer: cap at 8, clamp field lengths, validate `photo`
     URL shape, drop entries lacking a name.
2. **`PUBLIC_FIELDS`**: append `team`, `primaryImage`.
3. **New endpoint `POST /api/me/profile/ai-rewrite`** (`auth.requireAuth()`):
   - Input: optional `{ field: 'description' | 'tagline' | 'both' }` (default
     `both`) plus optional `tone` hint; otherwise uses the member's current
     record.
   - Loads the member, builds a chamber-tone system prompt
     (warm, local, concrete; no hype, no em-dashes per house style), passes
     name/category/neighborhood/current description as context.
   - Calls `llm.complete()` pinned to Gemini 2.5 Flash, requesting JSON
     `{ tagline, description }`.
   - Returns the suggestion only. **Does not save.** Includes a lightweight
     per-member rate guard (e.g. in-memory cooldown) to avoid abuse.
   - Falls back gracefully if no AI key is configured (returns a clear message,
     200 with `{ unavailable: true }`).
4. **Asset upload:** no change required; team headshots upload with
   `kind: 'headshot'` (the endpoint already accepts arbitrary kinds and only
   special-cases `'logo'`).

## Frontend — portal (`member/profile.html` + `member/member.js`)

1. **Primary image toggle:** below the logo/photo uploads, a small control
   "Which image represents your listing? ◉ Logo ◯ My photo". Disabled options
   when the corresponding image is absent. Persists as `primaryImage`.
2. **AI assist:** an "✨ Improve with AI" button beside the Description field.
   On click → call `/api/me/profile/ai-rewrite`, show the suggested tagline +
   description in a small preview with **Use this** / **Cancel**. "Use this"
   fills the form fields (does not save). Member edits freely, then the normal
   **Save changes** persists. Button shows loading + handles the `unavailable`
   case.
3. **Social inputs:** add Nextdoor, LinkedIn (business), LinkedIn (personal) via
   `data-social` (keys: `nextdoor`, `linkedin`, `linkedinPersonal`). The Yelp
   input is grouped here visually but continues to write to
   `reviewLinks.yelp` via the existing `data-review="yelp"` logic.
4. **Team section (collapsed, optional):** "Add team members (optional)".
   Repeatable rows: name, title, optional bio, optional headshot upload
   (`kind: 'headshot'`, reuse `uploadImage`). Add/remove buttons. First row
   labeled "Primary contact — shown as 'Meet…' on your public page." On submit,
   serialize to the `team` array in the PATCH body.

## Frontend — public profile (`js/chamber.js`)

1. **Primary image resolution** in `initProfile()` and in the directory card
   builder: compute the card/sidebar image from `primaryImage` + available
   images per the resolution rule above.
2. **"Meet the team" section** in `initProfile()`: render after the
   description/facts. Primary person (team[0]) as a prominent card (headshot +
   name + title + bio); remaining teammates in a compact grid. Section omitted
   entirely when `team` is empty. All output goes through `esc()`.
3. **Social render:** extend the `SOCIAL` label map with `nextdoor` (label
   "Nextdoor"), `linkedin` (label "LinkedIn"), `linkedinPersonal` (label
   "LinkedIn (personal)"). Yelp continues to render from `reviewLinks`.

## Admin parity (`admin/admin.js`)

Mirror the new fields (team, primaryImage, new social keys) in the admin member
editor so staff can view/fix listings. Read + edit parity; no new admin-only
behavior.

## CSS (`css/chamber.css`)

Add styles for the "Meet the team" primary card + teammate grid, and the
primary-image toggle. Reuse existing tokens/utilities; no new design system.

## Out of scope (YAGNI)

- Teammate logins / invites / per-teammate posting.
- Profile-edit moderation queue.
- Removing or migrating the legacy `reviewLinks` structure.
- Gemini Pro / multi-provider rewrite routing.

## Acceptance criteria

- A solo member can upload one image (logo or personal), optionally click
  ✨ to draft a description, edit it, save, and see it live — with no team
  interaction required.
- A member can add 1–8 teammates with name/title/optional photo/optional bio;
  the public profile shows "Meet [team[0].name]" plus a grid; an empty team
  renders nothing.
- The directory card shows the member's chosen primary image (logo or person),
  falling back correctly when one or both are absent.
- Nextdoor, Yelp, LinkedIn (business), and LinkedIn (personal) can be entered in
  the portal and render as chips on the public profile.
- The AI rewrite never auto-saves; it only populates editable fields, and the
  member's edits are what get persisted on Save.
- All new public output is HTML-escaped; team `photo` URLs are validated.
