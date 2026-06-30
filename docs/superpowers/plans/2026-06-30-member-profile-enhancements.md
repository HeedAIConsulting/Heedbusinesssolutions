# Member Profile Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let chamber members write/AI-improve their listing description, choose whether a logo or a personal photo represents the listing, add more social links (Nextdoor + LinkedIn personal/business), and optionally introduce their team — all through the existing self-edit pipeline, publishing immediately.

**Architecture:** Additive. New pure logic lives in a small new module `backend/profile-helpers.js` (testable with `node:test`). The existing `sanitizeProfile()` in `backend/chamber-routes.js` consumes it; a new `POST /api/me/profile/ai-rewrite` endpoint calls the existing Gemini-first `llm.complete()`. The member portal (`member/profile.html` + `member/member.js`), the public render (`js/chamber.js`), and the admin editor (`admin/admin.js`) gain matching UI. No new fields require migration — member edits persist as JSONB via `repo.setMemberEdit`.

**Tech Stack:** Node 20 ESM, Express, plain browser JS (no bundler — `<script>` tags), `node:test` for unit tests, Postgres (optional; JSON store fallback when `DATABASE_URL` is unset), Google Gemini via `backend/llm.js`.

---

## Background facts (verified against the codebase)

- The active server is **root `server.js`** (ESM, `"type":"module"`). `backend/server.js` is legacy CommonJS and unused. Run with `npm run dev` (= `node server.js`).
- Member edits flow: portal → `PATCH /api/me/profile` → `sanitizeProfile()` ([backend/chamber-routes.js:146](../../../backend/chamber-routes.js)) → `repo.setMemberEdit(mid, patch)` → JSONB (Postgres) or `data/_store/member-profiles.json` (local store).
- Persistence does **top-level key replacement** (`data || EXCLUDED.data` jsonb merge). So the portal must always submit the **complete** `social` object and `team` array, never partial. (The portal already does this for `social`.)
- `/api/members` projects each member through `PUBLIC_FIELDS` ([backend/chamber-routes.js:101](../../../backend/chamber-routes.js)) — a field not listed there never reaches the public page.
- The admin profile editor PATCHes `/api/admin/members/:id/profile`, which calls the **same** `sanitizeProfile` ([backend/chamber-routes.js:831](../../../backend/chamber-routes.js)). So once the sanitizer learns the new fields, admin data handling is automatic — admin work is UI only.
- The single directory-card builder is `memberTile(m, depth)` ([js/chamber.js:33](../../../js/chamber.js)); its image is chosen at line 46. The public profile is `initProfile()` ([js/chamber.js:696](../../../js/chamber.js)); social map at 720, sidebar image at 738.
- `llm.complete()` is Gemini-first; its `gemini()` helper hardcodes `gemini-flash-latest`. We add an optional `model` param to pin `gemini-2.5-flash`.
- `POST /api/me/asset` already accepts an arbitrary `kind`; team headshots upload with `kind: 'headshot'` — no asset-endpoint change needed.

## File Structure

- **Create** `backend/profile-helpers.js` — pure, dependency-light: `SOCIAL_KEYS`, `clampUrl`, `sanitizePrimaryImage`, `sanitizeTeam`, `buildRewritePrompt`, `parseRewriteResponse`.
- **Create** `backend/test/profile-helpers.test.mjs` — `node:test` unit tests for the above.
- **Create** `backend/test/sanitize-profile.test.mjs` — `node:test` test importing the real `sanitizeProfile`.
- **Modify** `backend/chamber-routes.js` — import helpers; extend `sanitizeProfile` + `PUBLIC_FIELDS`; add the AI-rewrite endpoint; named-export `sanitizeProfile`.
- **Modify** `backend/llm.js` — thread an optional `model` through `complete()` → `gemini()`.
- **Modify** `member/profile.html` — AI button, primary-image toggle, new social inputs, team section.
- **Modify** `member/member.js` — load/serialize team, primary-image radio, AI handler.
- **Modify** `js/chamber.js` — `cardImage()` resolver, extended `SOCIAL` map, "Meet the team" render.
- **Modify** `css/chamber.css` — small "Meet the team" spacing rule.
- **Modify** `admin/admin.js` — mirror new fields in the profile-editor modal.

---

### Task 1: Pure profile helpers + unit tests (TDD)

**Files:**
- Create: `backend/profile-helpers.js`
- Test: `backend/test/profile-helpers.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `backend/test/profile-helpers.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SOCIAL_KEYS, clampUrl, sanitizePrimaryImage, sanitizeTeam,
  buildRewritePrompt, parseRewriteResponse,
} from '../profile-helpers.js';

test('SOCIAL_KEYS includes the new platforms', () => {
  for (const k of ['facebook', 'instagram', 'linkedin', 'linkedinPersonal', 'x', 'youtube', 'tiktok', 'nextdoor']) {
    assert.ok(SOCIAL_KEYS.includes(k), `missing ${k}`);
  }
});

test('clampUrl trims and caps length', () => {
  assert.equal(clampUrl('  https://x.com  '), 'https://x.com');
  assert.equal(clampUrl('a'.repeat(700)).length, 600);
  assert.equal(clampUrl(null), '');
});

test('sanitizePrimaryImage allows only logo|person', () => {
  assert.equal(sanitizePrimaryImage('logo'), 'logo');
  assert.equal(sanitizePrimaryImage('person'), 'person');
  assert.equal(sanitizePrimaryImage('banana'), undefined);
  assert.equal(sanitizePrimaryImage(''), undefined);
});

test('sanitizeTeam drops nameless rows, caps 8, validates photo', () => {
  const out = sanitizeTeam([
    { name: 'Ann', title: 'CEO', bio: 'Leads.', photo: '/api/assets/asset-1' },
    { title: 'no name' },
    { name: 'Bob', photo: 'javascript:alert(1)' },
    { name: 'Cal', photo: 'https://cdn.example.com/c.jpg' },
  ]);
  assert.equal(out.length, 3);
  assert.deepEqual(out[0], { name: 'Ann', title: 'CEO', bio: 'Leads.', photo: '/api/assets/asset-1' });
  assert.equal(out[1].name, 'Bob');
  assert.equal(out[1].photo, undefined, 'bad scheme rejected');
  assert.equal(out[2].photo, 'https://cdn.example.com/c.jpg');
  assert.equal(sanitizeTeam(new Array(20).fill({ name: 'x' })).length, 8);
  assert.deepEqual(sanitizeTeam('nope'), []);
});

test('buildRewritePrompt returns system+prompt and honors field + current overrides', () => {
  const r = buildRewritePrompt(
    { name: 'Acme', category: 'Bakery', neighborhood: 'Tarzana', description: 'old' },
    { field: 'tagline', current: { description: 'fresh bread daily' } });
  assert.match(r.system, /JSON/);
  assert.match(r.prompt, /Acme/);
  assert.match(r.prompt, /fresh bread daily/, 'uses current override over stored');
  assert.match(r.prompt, /tagline/i);
});

test('parseRewriteResponse handles fenced JSON, rejects mock/garbage, clamps', () => {
  const ok = parseRewriteResponse('```json\n{"tagline":"Hi","description":"There."}\n```');
  assert.deepEqual(ok, { tagline: 'Hi', description: 'There.' });
  assert.equal(parseRewriteResponse('{"_mock":true,"answer":"x"}'), null);
  assert.equal(parseRewriteResponse('not json at all'), null);
  const long = parseRewriteResponse(JSON.stringify({ tagline: 't'.repeat(300), description: 'd'.repeat(900) }));
  assert.equal(long.tagline.length, 160);
  assert.equal(long.description.length, 600);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test backend/test/profile-helpers.test.mjs`
Expected: FAIL — `Cannot find module '../profile-helpers.js'`.

- [ ] **Step 3: Write the implementation**

Create `backend/profile-helpers.js`:

```js
/* ============================================================
   Pure, dependency-light helpers for member profile editing.
   Kept separate from chamber-routes.js so they can be unit-tested
   without pulling in Express / pg / the LLM client.
   ============================================================ */

// Social platforms a member may set. `linkedin` = business/company page;
// `linkedinPersonal` = the owner's personal profile. Yelp/Google live in
// `reviewLinks` (handled in chamber-routes), not here.
export const SOCIAL_KEYS = ['facebook', 'instagram', 'linkedin', 'linkedinPersonal', 'x', 'youtube', 'tiktok', 'nextdoor'];

export const clampUrl = (s) => String(s == null ? '' : s).trim().slice(0, 600);

export function sanitizePrimaryImage(v) {
  return (v === 'logo' || v === 'person') ? v : undefined;
}

// Team list (max 8). Each entry: { name, title?, bio?, photo? }.
// Rows without a name are dropped. Photos must be an http(s) URL or an
// /api/assets/ path (blocks javascript: and other schemes).
export function sanitizeTeam(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const t of raw) {
    if (!t || typeof t !== 'object') continue;
    const name = String(t.name || '').trim().slice(0, 80);
    if (!name) continue;
    const entry = { name };
    const title = String(t.title || '').trim().slice(0, 80);
    const bio = String(t.bio || '').trim().slice(0, 600);
    const photo = clampUrl(t.photo);
    if (title) entry.title = title;
    if (bio) entry.bio = bio;
    if (photo && /^(https?:\/\/|\/api\/assets\/)/.test(photo)) entry.photo = photo;
    out.push(entry);
    if (out.length >= 8) break;
  }
  return out;
}

// Build the Gemini prompt for rewriting a member's tagline/description.
// opts.field: 'tagline' | 'description' | 'both' (default 'both').
// opts.current: { tagline?, description? } — unsaved edits from the form,
// which take precedence over the stored record.
export function buildRewritePrompt(member = {}, opts = {}) {
  const field = ['tagline', 'description', 'both'].includes(opts.field) ? opts.field : 'both';
  const cur = (opts.current && typeof opts.current === 'object') ? opts.current : {};
  const name = String(member.name || 'This business');
  const category = String(member.category || '');
  const area = String(member.neighborhood || member.city || '');
  const tagline = String(cur.tagline != null ? cur.tagline : (member.tagline || '')).slice(0, 200);
  const description = String(cur.description != null ? cur.description : (member.description || '')).slice(0, 1200);
  const tone = String(opts.tone || '').slice(0, 120);

  const system = [
    'You write warm, concrete copy for a local Chamber of Commerce member directory.',
    'Voice: friendly, community-minded, specific. No hype, no buzzwords, no superlatives like "best" or "leading".',
    'Do not use em dashes. Stay factual to what the business tells you; never invent awards, years, or claims.',
    'Return ONLY valid JSON: {"tagline": string, "description": string}.',
    'tagline: one sentence, max 160 characters. description: 2 to 4 sentences, max 600 characters.',
  ].join(' ');

  const prompt = [
    `Business name: ${name}`,
    category ? `Category: ${category}` : '',
    area ? `Area: ${area}` : '',
    `Current tagline: ${tagline || '(none yet)'}`,
    `Current description: ${description || '(none yet)'}`,
    tone ? `Extra guidance: ${tone}` : '',
    field === 'tagline' ? 'Rewrite the tagline; keep the description close to the current one.'
      : field === 'description' ? 'Rewrite the description; keep the tagline close to the current one.'
      : 'Improve both the tagline and the description.',
  ].filter(Boolean).join('\n');

  return { system, prompt };
}

// Parse the model's reply into { tagline?, description? } or null if unusable.
export function parseRewriteResponse(text) {
  if (!text || typeof text !== 'string') return null;
  let raw = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let obj;
  try { obj = JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { obj = JSON.parse(m[0]); } catch { return null; }
  }
  if (!obj || typeof obj !== 'object' || obj._mock) return null;
  const out = {};
  if (typeof obj.tagline === 'string' && obj.tagline.trim()) out.tagline = obj.tagline.trim().slice(0, 160);
  if (typeof obj.description === 'string' && obj.description.trim()) out.description = obj.description.trim().slice(0, 600);
  return (out.tagline || out.description) ? out : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test backend/test/profile-helpers.test.mjs`
Expected: PASS — all 6 tests ok.

- [ ] **Step 5: Commit**

```bash
git add backend/profile-helpers.js backend/test/profile-helpers.test.mjs
git commit -m "WVWCCC: profile helpers (team/social/AI-prompt) + unit tests"
```

---

### Task 2: Wire helpers into sanitizeProfile + PUBLIC_FIELDS (TDD)

**Files:**
- Modify: `backend/chamber-routes.js` (imports; `PUBLIC_FIELDS` ~line 101; `sanitizeProfile` ~line 146-173; named export near end)
- Test: `backend/test/sanitize-profile.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `backend/test/sanitize-profile.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProfile } from '../chamber-routes.js';

test('sanitizeProfile accepts new social keys', () => {
  const p = sanitizeProfile({ social: { linkedin: 'https://lnkd.in/co', linkedinPersonal: 'https://lnkd.in/me', nextdoor: 'https://nextdoor.com/x', bogus: 'https://no' } });
  assert.equal(p.social.linkedin, 'https://lnkd.in/co');
  assert.equal(p.social.linkedinPersonal, 'https://lnkd.in/me');
  assert.equal(p.social.nextdoor, 'https://nextdoor.com/x');
  assert.equal(p.social.bogus, undefined);
});

test('sanitizeProfile validates primaryImage and team', () => {
  const p = sanitizeProfile({
    primaryImage: 'person',
    team: [{ name: 'Ann', title: 'Owner' }, { title: 'skip' }],
  });
  assert.equal(p.primaryImage, 'person');
  assert.equal(p.team.length, 1);
  assert.equal(p.team[0].name, 'Ann');
  assert.equal(sanitizeProfile({ primaryImage: 'nope' }).primaryImage, undefined);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test backend/test/sanitize-profile.test.mjs`
Expected: FAIL — `sanitizeProfile` is not an export (or new keys are dropped).

- [ ] **Step 3a: Add the import**

In `backend/chamber-routes.js`, after the existing import block (after `import * as email from './email.js';`), add:

```js
import { SOCIAL_KEYS, sanitizePrimaryImage, sanitizeTeam, buildRewritePrompt, parseRewriteResponse } from './profile-helpers.js';
```

- [ ] **Step 3b: Extend PUBLIC_FIELDS**

In the `PUBLIC_FIELDS` array (~line 101-106), append `'team', 'primaryImage'` to the final line so it reads:

```js
  'logo', 'photos', 'social', 'reviewLinks', 'ctaLinks', 'video', 'team', 'primaryImage'];
```

- [ ] **Step 3c: Use SOCIAL_KEYS in the social loop**

In `sanitizeProfile` (~line 157), replace:

```js
    for (const k of ['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'tiktok']) if (b.social[k]) out[k] = clampUrl(b.social[k]);
```

with:

```js
    for (const k of SOCIAL_KEYS) if (b.social[k]) out[k] = clampUrl(b.social[k]);
```

- [ ] **Step 3d: Add primaryImage + team to the patch**

In `sanitizeProfile`, immediately before `return patch;` (~line 172), add:

```js
  if (b.primaryImage !== undefined) { const p = sanitizePrimaryImage(b.primaryImage); if (p) patch.primaryImage = p; }
  if (Array.isArray(b.team)) patch.team = sanitizeTeam(b.team);
```

- [ ] **Step 3e: Named-export sanitizeProfile**

At the end of `backend/chamber-routes.js`, immediately before `export default router;`, add:

```js
export { sanitizeProfile };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test backend/test/sanitize-profile.test.mjs`
Expected: PASS — both tests ok.

(Note: this test imports the full router module. With no `DATABASE_URL` set it loads fine — `pg` is imported but never connects.)

- [ ] **Step 5: Commit**

```bash
git add backend/chamber-routes.js backend/test/sanitize-profile.test.mjs
git commit -m "WVWCCC: sanitizeProfile learns team, primaryImage, new social keys"
```

---

### Task 3: Add optional model param to llm.complete (TDD)

**Files:**
- Modify: `backend/llm.js` (`complete()` and `gemini()`)
- Test: `backend/test/llm-model.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `backend/test/llm-model.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { complete } from '../llm.js';

// With no GEMINI_API_KEY/ANTHROPIC_API_KEY in the env, complete() returns the
// deterministic mock string. We only assert the signature accepts `model`
// without throwing — i.e. the param is threaded through, not rejected.
test('complete accepts a model param and still resolves to a string', async () => {
  const out = await complete({ prompt: 'hi', json: true, model: 'gemini-2.5-flash' });
  assert.equal(typeof out, 'string');
});
```

- [ ] **Step 2: Run the test to verify it fails or passes-by-accident**

Run: `GEMINI_API_KEY= ANTHROPIC_API_KEY= node --test backend/test/llm-model.test.mjs`
Expected: PASS even before the change (extra param is ignored) — that's fine; this test guards the signature. Proceed to make the param actually take effect.

- [ ] **Step 3a: Thread `model` through `complete()`**

In `backend/llm.js`, change the `complete` signature and the gemini call:

```js
export async function complete({ system = '', prompt, json = false, maxTokens = 700, model } = {}) {
  const which = provider();
  try {
    if (which === 'gemini') return await gemini(system, prompt, json, maxTokens, model);
    if (which === 'anthropic') return await anthropic(system, prompt, json, maxTokens);
  } catch (e) {
    console.error(`[llm:${which}]`, e.message);
    // fall through to mock on provider error
  }
  return mock(prompt);
}
```

- [ ] **Step 3b: Honor `model` in `gemini()`**

In `backend/llm.js`, change the `gemini` signature and URL:

```js
async function gemini(system, prompt, json, maxTokens, model) {
  // Default to the known-good alias; callers may pin e.g. 'gemini-2.5-flash'.
  const id = model || 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent?key=${GEMINI_KEY()}`;
```

(Leave the rest of `gemini()` unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `GEMINI_API_KEY= ANTHROPIC_API_KEY= node --test backend/test/llm-model.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/llm.js backend/test/llm-model.test.mjs
git commit -m "WVWCCC: llm.complete supports a model override (pin Gemini 2.5 Flash)"
```

---

### Task 4: AI-rewrite endpoint

**Files:**
- Modify: `backend/chamber-routes.js` (add module-scoped cooldown map; add route after the `PATCH /me/profile` handler ~line 191)

- [ ] **Step 1: Add the cooldown map**

In `backend/chamber-routes.js`, near the other module-scoped state (just below `const router = express.Router();`), add:

```js
// Per-member cooldown for the AI rewrite endpoint (simple in-memory guard).
const aiRewriteCooldown = new Map();
```

- [ ] **Step 2: Add the endpoint**

Immediately after the `router.patch('/me/profile', ...)` handler (ends ~line 191), add:

```js
// AI draft for tagline/description. Never saves — returns a suggestion the
// member edits, then saves via PATCH /me/profile. Gemini 2.5 Flash.
router.post('/me/profile/ai-rewrite', auth.requireAuth(), async (req, res) => {
  const mid = req.user.mid;
  if (!mid) return res.status(400).json({ error: 'No member listing is linked to this account.' });
  const now = Date.now();
  if (now - (aiRewriteCooldown.get(mid) || 0) < 8000) {
    return res.status(429).json({ error: 'Please wait a few seconds before trying again.' });
  }
  aiRewriteCooldown.set(mid, now);
  try {
    const member = (await loadMembersFull()).members.find((x) => x.id === mid);
    if (!member) return res.status(404).json({ error: 'Listing not found.' });
    if (!llm.enabled()) {
      return res.json({ unavailable: true, message: 'AI writing is not configured yet. You can still write your description by hand.' });
    }
    const { system, prompt } = buildRewritePrompt(member, req.body || {});
    const text = await llm.complete({ system, prompt, json: true, maxTokens: 500, model: 'gemini-2.5-flash' });
    const parsed = parseRewriteResponse(text);
    if (!parsed) return res.json({ unavailable: true, message: 'Could not draft a suggestion just now. Please try again.' });
    res.json({ ok: true, ...parsed });
  } catch (e) {
    console.error('ai-rewrite', e);
    res.status(500).json({ error: 'Could not generate a suggestion.' });
  }
});
```

- [ ] **Step 3: Verify the module still loads (no syntax errors)**

Run: `node --check backend/chamber-routes.js`
Expected: no output (exit 0). If `node --check` complains about ESM, instead run `node -e "import('./backend/chamber-routes.js').then(()=>console.log('ok'))"` from the repo root — expected output `ok`.

- [ ] **Step 4: Commit**

```bash
git add backend/chamber-routes.js
git commit -m "WVWCCC: add POST /api/me/profile/ai-rewrite (Gemini, no auto-save)"
```

---

### Task 5: Portal markup — AI button, image toggle, social, team

**Files:**
- Modify: `member/profile.html`

- [ ] **Step 1: Add the AI button to the Description field**

Replace this line:

```html
        <div class="field"><label>Description</label><textarea data-field="description" rows="4"></textarea></div>
```

with:

```html
        <div class="field"><label>Description
          <button type="button" id="aiRewrite" class="btn btn--ghost btn--sm" style="float:right">✨ Improve with AI</button></label>
          <textarea data-field="description" rows="4"></textarea>
          <div id="aiPreview" hidden style="margin-top:var(--s-3)"></div>
        </div>
```

- [ ] **Step 2: Add the primary-image toggle**

Directly after the video preview block:

```html
        <div id="videoPreview" class="mt-3"></div>
```

insert:

```html
        <div class="field mt-4"><label>Which image represents your listing?</label>
          <div class="radio-group" style="display:flex;gap:var(--s-4)">
            <label><input type="radio" name="primaryImage" data-primary value="logo" /> Logo</label>
            <label><input type="radio" name="primaryImage" data-primary value="person" /> My photo (from team)</label>
          </div>
          <div class="member-tile__meta">Pick which one shows on your directory card. If you only add one image, that one is used automatically.</div>
        </div>
```

- [ ] **Step 3: Replace the social block (new labels + Nextdoor + LinkedIn personal)**

Replace the whole `<h3 class="mt-5">Links &amp; social</h3>` block and its two grids with:

```html
        <h3 class="mt-5">Links &amp; social</h3>
        <div class="grid grid-2" style="gap:var(--s-3)">
          <div class="field"><label>Facebook</label><input data-social="facebook" type="url" placeholder="https://" /></div>
          <div class="field"><label>Instagram</label><input data-social="instagram" type="url" placeholder="https://" /></div>
          <div class="field"><label>LinkedIn (business)</label><input data-social="linkedin" type="url" placeholder="https://" /></div>
          <div class="field"><label>LinkedIn (personal)</label><input data-social="linkedinPersonal" type="url" placeholder="https://" /></div>
          <div class="field"><label>YouTube</label><input data-social="youtube" type="url" placeholder="https://" /></div>
          <div class="field"><label>Nextdoor</label><input data-social="nextdoor" type="url" placeholder="https://" /></div>
        </div>
        <div class="grid grid-2" style="gap:var(--s-3)">
          <div class="field"><label>Google reviews link</label><input data-review="google" type="url" placeholder="https://" /></div>
          <div class="field"><label>Yelp</label><input data-review="yelp" type="url" placeholder="https://" /></div>
        </div>
```

- [ ] **Step 4: Add the team section**

Directly before the `<p id="profileMsg" ...>` / submit button at the end of the form, insert:

```html
        <h3 class="mt-5">Team members <span class="member-tile__meta">(optional)</span></h3>
        <p class="member-tile__meta">Introduce the people behind your business. The first person appears as "Meet…" on your public page. Skip this entirely if you'd rather not.</p>
        <div id="teamRows"></div>
        <button type="button" id="addTeam" class="btn btn--ghost btn--sm mt-3">+ Add team member</button>
```

- [ ] **Step 5: Commit**

```bash
git add member/profile.html
git commit -m "WVWCCC: portal form — AI button, image toggle, new social, team section"
```

---

### Task 6: Portal logic — team, primary image, AI handler

**Files:**
- Modify: `member/member.js` (`initProfile`, ~line 89-179)

- [ ] **Step 1: Add team state + rendering**

In `initProfile`, after the photos block (after `renderPhotos();` and its `photoInput` listener, ~line 144), add:

```js
    // ── Team members (optional) ──
    let team = Array.isArray(m.team) ? m.team.slice(0, 8) : [];
    const teamWrap = document.getElementById('teamRows');
    const teamRowHtml = (t, i) => `
      <div class="card" data-team-row="${i}" style="padding:var(--s-4);margin-bottom:var(--s-3)">
        <div class="grid grid-2" style="gap:var(--s-3)">
          <div class="field"><label>Name</label><input data-team-name value="${esc(t.name || '')}" /></div>
          <div class="field"><label>Title</label><input data-team-title value="${esc(t.title || '')}" /></div>
        </div>
        <div class="field"><label>Short bio</label><textarea data-team-bio rows="2">${esc(t.bio || '')}</textarea></div>
        <div class="grid grid-2" style="gap:var(--s-4);align-items:center">
          <div class="field"><label>Photo</label><input type="file" accept="image/*" data-team-photo-file /></div>
          <div>${t.photo ? `<img src="${esc(t.photo)}" alt="" style="width:64px;height:64px;border-radius:50%;object-fit:cover">` : '<span class="member-tile__meta">No photo</span>'}</div>
        </div>
        <input type="hidden" data-team-photo value="${esc(t.photo || '')}" />
        <div style="text-align:right">
          ${i === 0 ? '<span class="member-tile__meta" style="margin-right:8px">Primary — shown as “Meet…”</span>' : ''}
          <button type="button" class="btn btn--ghost btn--sm" data-team-remove>Remove</button>
        </div>
      </div>`;
    const collectRow = (i) => {
      const row = teamWrap.querySelector(`[data-team-row="${i}"]`);
      if (!row) return team[i] || {};
      return {
        name: row.querySelector('[data-team-name]').value.trim(),
        title: row.querySelector('[data-team-title]').value.trim(),
        bio: row.querySelector('[data-team-bio]').value.trim(),
        photo: row.querySelector('[data-team-photo]').value.trim(),
      };
    };
    const collectTeam = () => team.map((_, i) => collectRow(i)).filter((t) => t.name);
    function renderTeam() {
      if (!teamWrap) return;
      teamWrap.innerHTML = team.length
        ? team.map(teamRowHtml).join('')
        : '<p class="member-tile__meta">No team members yet. They appear in a “Meet the team” section on your public page.</p>';
      teamWrap.querySelectorAll('[data-team-remove]').forEach((b, i) =>
        b.addEventListener('click', () => { team = collectTeam(); team.splice(i, 1); renderTeam(); }));
      teamWrap.querySelectorAll('[data-team-photo-file]').forEach((inp, i) =>
        inp.addEventListener('change', async (e) => {
          const f = e.target.files[0]; if (!f) return;
          try { const url = await uploadImage(f, 'headshot'); team = collectTeam(); team[i] = { ...(team[i] || {}), photo: url }; renderTeam(); }
          catch (err) { msg.hidden = false; msg.style.borderColor = 'var(--red)'; msg.textContent = 'Photo upload failed (PNG/JPG, max ~2.5MB).'; }
        }));
    }
    renderTeam();
    const addTeamBtn = document.getElementById('addTeam');
    if (addTeamBtn) addTeamBtn.addEventListener('click', () => {
      team = collectTeam();
      if (team.length >= 8) return;
      team.push({ name: '', title: '', bio: '', photo: '' });
      renderTeam();
    });
```

- [ ] **Step 2: Set the primary-image radio**

Immediately after `renderTeam();` (the first call), add:

```js
    // primary image preference (default to whichever image exists)
    const primaryDefault = m.primaryImage || (m.logo ? 'logo' : ((team[0] && team[0].photo) ? 'person' : 'logo'));
    form.querySelectorAll('[data-primary]').forEach((r) => { r.checked = (r.value === primaryDefault); });
```

- [ ] **Step 3: Add the AI rewrite handler**

After Step 2, add:

```js
    // ── AI: draft a tagline + description (does not save) ──
    const aiBtn = document.getElementById('aiRewrite');
    const aiPrev = document.getElementById('aiPreview');
    const descEl = form.querySelector('[data-field="description"]');
    const tagEl = form.querySelector('[data-field="tagline"]');
    if (aiBtn) aiBtn.addEventListener('click', async () => {
      aiBtn.disabled = true; const orig = aiBtn.textContent; aiBtn.textContent = 'Thinking…';
      try {
        const r = await api('/api/me/profile/ai-rewrite', {
          method: 'POST',
          body: JSON.stringify({ field: 'both', current: { tagline: tagEl.value, description: descEl.value } }),
        });
        if (r.unavailable) {
          aiPrev.hidden = false; aiPrev.className = 'notice'; aiPrev.textContent = r.message || 'AI is unavailable right now.';
          return;
        }
        aiPrev.hidden = false; aiPrev.className = 'card'; aiPrev.style.padding = 'var(--s-4)';
        aiPrev.innerHTML = `
          <div class="member-tile__meta">Suggested tagline</div><p>${esc(r.tagline || '(unchanged)')}</p>
          <div class="member-tile__meta">Suggested description</div><p>${esc(r.description || '(unchanged)')}</p>
          <div class="btn-row" style="margin-top:var(--s-3)">
            <button type="button" class="btn btn--forest btn--sm" data-ai-use>Use this</button>
            <button type="button" class="btn btn--ghost btn--sm" data-ai-cancel>Cancel</button>
          </div>`;
        aiPrev.querySelector('[data-ai-use]').addEventListener('click', () => {
          if (r.tagline) tagEl.value = r.tagline;
          if (r.description) descEl.value = r.description;
          aiPrev.hidden = true;
        });
        aiPrev.querySelector('[data-ai-cancel]').addEventListener('click', () => { aiPrev.hidden = true; });
      } catch (e) {
        aiPrev.hidden = false; aiPrev.className = 'notice'; aiPrev.textContent = 'Could not reach the AI service.';
      } finally { aiBtn.disabled = false; aiBtn.textContent = orig; }
    });
```

- [ ] **Step 4: Include team + primaryImage in the saved patch**

In the submit handler, after the line `patch.logo = logoUrl; patch.photos = photos;` (~line 171), add:

```js
      patch.team = collectTeam();
      const primarySel = form.querySelector('[data-primary]:checked');
      if (primarySel) patch.primaryImage = primarySel.value;
```

(The existing `[data-social]` loop already serializes `nextdoor` and `linkedinPersonal` automatically, since it iterates every `[data-social]` input — no change needed there.)

- [ ] **Step 5: Verify (preview render of the form structure)**

Start the dev server and confirm the new controls exist in the page markup:

Run (preview tooling): `preview_start` on the repo root (`npm run dev`), then open `http://localhost:3000/member/profile.html`.
Because the portal redirects unauthenticated users to login after its `/api/me` fetch, verify the **static structure** instead: `preview_snapshot` immediately, or assert the file contains the controls:

Run: `grep -c 'data-team-name\|id="aiRewrite"\|data-primary\|data-social="nextdoor"\|data-social="linkedinPersonal"' member/profile.html`
Expected: a count ≥ 5 (each new control present).

Full logged-in e2e is exercised in Task 10’s overlay verification for the public side; the portal save path is covered by the backend sanitizer tests (Task 2).

- [ ] **Step 6: Commit**

```bash
git add member/member.js
git commit -m "WVWCCC: portal logic — team editor, image toggle, AI rewrite handler"
```

---

### Task 7: Public render — card image, social chips, Meet the team

**Files:**
- Modify: `js/chamber.js` (`cardImage` new helper before line 33; `memberTile` line 46; `SOCIAL` map line 720; `initProfile` sidebar line 738 + team block)

- [ ] **Step 1: Add the `cardImage` resolver**

Immediately before `function memberTile(m, depth) {` (~line 33), add:

```js
  // Resolve the image for directory cards + the profile sidebar. The member
  // picks logo vs. their (team) photo; fall back to whatever image exists.
  function cardImage(m) {
    const logo = m.logo || '';
    const person = (Array.isArray(m.team) && m.team[0] && m.team[0].photo) || '';
    if (m.primaryImage === 'person' && person) return person;
    if (m.primaryImage === 'logo' && logo) return logo;
    return logo || person || (m.photos && m.photos[0]) || '';
  }
```

- [ ] **Step 2: Use it in `memberTile`**

Replace (~line 46):

```js
    const photo = m.logo || (m.photos && m.photos[0]) || '';
```

with:

```js
    const photo = cardImage(m);
```

- [ ] **Step 3: Extend the SOCIAL label map**

Replace (~line 720):

```js
    const SOCIAL = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', youtube: 'YouTube', tiktok: 'TikTok' };
```

with:

```js
    const SOCIAL = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', linkedinPersonal: 'LinkedIn (personal)', x: 'X', youtube: 'YouTube', tiktok: 'TikTok', nextdoor: 'Nextdoor' };
```

- [ ] **Step 4: Use `cardImage` for the sidebar seal**

Replace (~line 738-740):

```js
    const seal = m.logo
      ? `<img src="${esc(m.logo)}" alt="${esc(m.name)} logo" style="width:120px;height:120px;border-radius:var(--r-lg);object-fit:cover;margin:0 auto var(--s-4);box-shadow:var(--sh-sm)">`
      : `<div class="member-tile__seal" style="width:100px;height:100px;font-size:2.8rem;margin:0 auto var(--s-4)">${esc(m.seal || m.name[0])}</div>`;
```

with:

```js
    const primaryImg = cardImage(m);
    const seal = primaryImg
      ? `<img src="${esc(primaryImg)}" alt="${esc(m.name)}" style="width:120px;height:120px;border-radius:var(--r-lg);object-fit:cover;margin:0 auto var(--s-4);box-shadow:var(--sh-sm)">`
      : `<div class="member-tile__seal" style="width:100px;height:100px;font-size:2.8rem;margin:0 auto var(--s-4)">${esc(m.seal || m.name[0])}</div>`;
```

- [ ] **Step 5: Build the "Meet the team" block**

Immediately after the `facts` constant (the `.filter(Boolean).map(...).join('')` ending ~line 735, before `const seal`/`const primaryImg`), add:

```js
    const teamArr = Array.isArray(m.team) ? m.team.filter((t) => t && t.name) : [];
    const personCard = (t, primary) => {
      const sz = primary ? 96 : 64;
      const ph = t.photo
        ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;flex:none">`
        : `<div class="member-tile__seal" style="width:${sz}px;height:${sz}px;flex:none">${esc((t.name || '?')[0])}</div>`;
      return `<div style="display:flex;gap:var(--s-4);align-items:flex-start">
        ${ph}
        <div><strong>${esc(t.name)}</strong>${t.title ? `<div class="member-tile__meta">${esc(t.title)}</div>` : ''}
        ${t.bio ? `<p${primary ? '' : ' class="member-tile__meta"'} style="margin:6px 0 0">${esc(t.bio)}</p>` : ''}</div>
      </div>`;
    };
    const teamHtml = teamArr.length ? `
      <div class="meet-team mt-6">
        <h3>Meet the team</h3>
        ${personCard(teamArr[0], true)}
        ${teamArr.length > 1 ? `<div class="grid grid-2 mt-4">${teamArr.slice(1).map((t) => personCard(t, false)).join('')}</div>` : ''}
      </div>` : '';
```

- [ ] **Step 6: Insert the team block into the profile template**

In the `el.innerHTML = ...` template, find the line:

```js
          ${facts ? `<ul class="grid grid-3 mt-5" style="list-style:none;gap:var(--s-4)">${facts}</ul>` : ''}
```

and insert `${teamHtml}` on the next line, before `${video}`:

```js
          ${facts ? `<ul class="grid grid-3 mt-5" style="list-style:none;gap:var(--s-4)">${facts}</ul>` : ''}
          ${teamHtml}
          ${video}
```

- [ ] **Step 7: Syntax check**

Run: `node --check js/chamber.js`
Expected: no output (exit 0).

- [ ] **Step 8: Commit**

```bash
git add js/chamber.js
git commit -m "WVWCCC: public profile — primary-image resolution, new social chips, Meet the team"
```

---

### Task 8: CSS for the team section

**Files:**
- Modify: `css/chamber.css` (append)

- [ ] **Step 1: Append the styles**

Add to the end of `css/chamber.css`:

```css
/* ── Member profile: Meet the team ── */
.meet-team h3 { margin-bottom: var(--s-4); }
.meet-team .member-tile__seal { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; }
@media (max-width: 640px) {
  .meet-team .grid-2 { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/chamber.css
git commit -m "WVWCCC: styles for Meet the team section"
```

---

### Task 9: Admin parity — mirror new fields in the editor modal

**Files:**
- Modify: `admin/admin.js` (`openProfileEditor`, ~line 252-298)

- [ ] **Step 1: Add fields to the modal markup**

In `openProfileEditor`, after the Description textarea field (the `<div class="field" style="grid-column:1/-1;margin:0"><label>Description</label> ... </div>`, ~line 272-273), insert these fields inside the same grid:

```js
            <div class="field" style="margin:0"><label>Primary image</label>
              <select name="primaryImage">
                <option value="">Auto</option>
                <option value="logo" ${m.primaryImage === 'logo' ? 'selected' : ''}>Logo</option>
                <option value="person" ${m.primaryImage === 'person' ? 'selected' : ''}>Person photo</option>
              </select></div>
            <div class="field" style="margin:0"><label>LinkedIn (business)</label><input name="s_linkedin" value="${esc((m.social || {}).linkedin || '')}" /></div>
            <div class="field" style="margin:0"><label>LinkedIn (personal)</label><input name="s_linkedinPersonal" value="${esc((m.social || {}).linkedinPersonal || '')}" /></div>
            <div class="field" style="margin:0"><label>Nextdoor</label><input name="s_nextdoor" value="${esc((m.social || {}).nextdoor || '')}" /></div>
            <div class="field" style="grid-column:1/-1;margin:0"><label>Team (JSON: [{"name","title","bio","photo"}])</label>
              <textarea name="team" rows="4">${esc(JSON.stringify(m.team || []))}</textarea></div>
```

- [ ] **Step 2: Build the structured body on submit**

In the modal's submit handler, replace:

```js
        const fd = new FormData(e.target);
        const body = Object.fromEntries([...fd.entries()].filter(([, v]) => true));
```

with:

```js
        const fd = new FormData(e.target);
        const body = Object.fromEntries([...fd.entries()]);
        // Preserve existing social keys; override the three admin-editable ones.
        body.social = { ...(m.social || {}) };
        for (const k of ['linkedin', 'linkedinPersonal', 'nextdoor']) {
          if (body['s_' + k]) body.social[k] = body['s_' + k]; else delete body.social[k];
          delete body['s_' + k];
        }
        try { body.team = body.team ? JSON.parse(body.team) : []; } catch (parseErr) { body.team = m.team || []; }
        if (!body.primaryImage) delete body.primaryImage;
```

- [ ] **Step 3: Syntax check**

Run: `node --check admin/admin.js`
Expected: no output (exit 0).

- [ ] **Step 4: Commit**

```bash
git add admin/admin.js
git commit -m "WVWCCC: admin profile editor mirrors team, primaryImage, new social"
```

---

### Task 10: End-to-end verification (public render) + cleanup

This exercises the **real** merge → `PUBLIC_FIELDS` → render path with no auth, using the local JSON store overlay.

**Files:** none modified (temporary fixture only)

- [ ] **Step 1: Run all backend unit tests**

Run: `node --test backend/test/`
Expected: all tests across the three `.mjs` files PASS.

- [ ] **Step 2: Start the dev server**

Use the preview tooling to start `npm run dev` (root). Confirm it serves `http://localhost:3000/` (or the port it logs).

- [ ] **Step 3: Pick a real member id and write a store overlay**

Get the first member id from the running API, then write an edit overlay for it:

```bash
ID=$(curl -s http://localhost:3000/api/members | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).members[0].id))")
echo "using $ID"
node -e "const fs=require('fs');const p='data/_store/member-profiles.json';let cur={};try{cur=JSON.parse(fs.readFileSync(p,'utf8'))}catch{};cur['$ID']={...(cur['$ID']||{}),primaryImage:'person',social:{linkedin:'https://linkedin.com/company/x',linkedinPersonal:'https://linkedin.com/in/y',nextdoor:'https://nextdoor.com/z'},team:[{name:'Jordan Lee',title:'Owner',bio:'Runs the shop and knows every regular by name.',photo:'/images/wvwccc-logo.png'},{name:'Sam Rivera',title:'Manager',bio:'Keeps the team on track.',photo:'/images/wvwccc-logo.png'}]};fs.mkdirSync('data/_store',{recursive:true});fs.writeFileSync(p,JSON.stringify(cur,null,2));console.log('overlay written for '+'$ID')"
```

Restart the dev server so it re-reads the store (preview restart).

- [ ] **Step 4: Verify the public profile**

Open `http://localhost:3000/members/profile.html?id=$ID` (substitute the printed id). Use `preview_snapshot` and confirm:
- A "Meet the team" heading with **Jordan Lee — Owner** and the bio, plus **Sam Rivera** in the grid.
- Social chips include **LinkedIn**, **LinkedIn (personal)**, and **Nextdoor**.
- The sidebar image is the person photo (`/images/wvwccc-logo.png`), because `primaryImage: 'person'`.

Take a `preview_screenshot` to attach as proof.

- [ ] **Step 5: Verify the directory card**

Open `http://localhost:3000/members/directory.html`, find that member’s card (search by name if needed), and confirm via `preview_snapshot` that the card image is the person photo (primaryImage honored on the card too).

- [ ] **Step 6: Remove the fixture overlay**

```bash
node -e "const fs=require('fs');const p='data/_store/member-profiles.json';let cur={};try{cur=JSON.parse(fs.readFileSync(p,'utf8'))}catch{};delete cur['$ID'];if(Object.keys(cur).length)fs.writeFileSync(p,JSON.stringify(cur,null,2));else fs.unlinkSync(p);console.log('overlay removed')"
```

Confirm `git status` shows no changes under `data/_store/` (it is gitignored, but verify nothing tracked changed).

- [ ] **Step 7: Final commit (if any incidental tracked changes)**

Only if `git status` shows tracked changes beyond what previous tasks committed:

```bash
git add -A
git commit -m "WVWCCC: member profile enhancements — verification pass"
```

---

## Self-Review

**Spec coverage:**
- Feature 1 (descriptions + AI improve): Tasks 1 (prompt/parse), 4 (endpoint), 6 (button + preview). ✔
- Feature 2 (logo vs. personal photo as the listing image): Tasks 1/2 (`primaryImage`), 5/6 (toggle), 7 (`cardImage` on card + sidebar). ✔
- Feature 3 (Nextdoor, Yelp, LinkedIn business+personal): Tasks 1/2 (`SOCIAL_KEYS`), 5 (inputs; Yelp stays in `reviewLinks`), 7 (chip labels). ✔
- Feature 4 (Gemini, revise before commit): Tasks 3 (model param), 4 (Gemini 2.5 Flash, no save), 6 (Use this / Cancel; fills fields, manual Save). ✔
- Feature 5 (optional team, member adds teammates, display-only): Tasks 1/2 (`sanitizeTeam`), 5/6 (team editor), 7 (Meet the team). No logins/approval. ✔
- Admin parity: Task 9. Acceptance criteria → Task 10. ✔

**Placeholder scan:** No TBD/TODO; every code step contains full code; every run step has an expected result. ✔

**Type/name consistency:** `cardImage`, `sanitizeTeam`, `buildRewritePrompt`, `parseRewriteResponse`, `SOCIAL_KEYS`, `primaryImage`, `team`, `linkedinPersonal`, `nextdoor`, `aiRewriteCooldown`, `collectTeam`/`collectRow` are used identically across tasks. Portal posts `{ field, current }`; `buildRewritePrompt` reads `opts.field`/`opts.current`. Endpoint passes `model: 'gemini-2.5-flash'`; `complete`/`gemini` accept `model`. ✔

**Note on local AI testing:** With no `GEMINI_API_KEY` set locally, the rewrite endpoint returns `{ unavailable: true }` and the portal shows the graceful message — that path is verifiable offline. Live Gemini output requires the key in the deploy env; the prompt/parse logic itself is unit-tested in Task 1.
