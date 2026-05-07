/* ============================================================
   Microsoft 365 Graph wrapper — delegated OAuth flow.

   App registration: "WVWCC Chamber Site" in West Valley Warner
   Center Chamber of Commerce Azure AD tenant.

   Delegated auth (user OAuth) is the active path:
     - User clicks "Connect Microsoft 365" on /admin/settings.html
     - Browser → /auth/m365/login → Microsoft consent → /auth/m365/callback
     - Refresh token persisted in data/_store/m365-tokens.json (gitignored)
     - All subsequent Graph calls use the user's access token
     - All actions appear in the user's actual Outlook (Sent / Drafts / Inbox)

   Application auth is scaffolded but disabled until tenant admin
   grants consent for Mail.ReadWrite (Application) + Mail.Send (Application).

   Required env:
     MS_GRAPH_TENANT_ID
     MS_GRAPH_CLIENT_ID
     MS_GRAPH_CLIENT_SECRET
     M365_REDIRECT_URI    e.g. http://localhost:5500/auth/m365/callback
   ============================================================ */

require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');

const TENANT_ID     = process.env.MS_GRAPH_TENANT_ID;
const CLIENT_ID     = process.env.MS_GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET;
const REDIRECT_URI  = process.env.M365_REDIRECT_URI || 'http://localhost:5500/auth/m365/callback';

const isConfigured = !!(TENANT_ID && CLIENT_ID && CLIENT_SECRET);

// Delegated scopes the user consents to. offline_access is required to get a
// refresh token so the server can keep working without re-auth every hour.
const DELEGATED_SCOPES = ['Mail.ReadWrite', 'Mail.Send', 'User.Read', 'offline_access'];

let cca = null;
if (isConfigured) {
  cca = new ConfidentialClientApplication({
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      clientSecret: CLIENT_SECRET
    }
  });
}

// ── Token persistence (single-tenant, single-mailbox demo) ──────
// In production this should be per-user with proper encryption (e.g. KMS).
// For Diana's demo we just need refresh tokens to survive process restarts.
const TOKEN_STORE_DIR  = path.join(__dirname, '..', 'data', '_store');
const TOKEN_STORE_FILE = path.join(TOKEN_STORE_DIR, 'm365-tokens.json');

function ensureStoreDir() {
  if (!fs.existsSync(TOKEN_STORE_DIR)) fs.mkdirSync(TOKEN_STORE_DIR, { recursive: true });
}
function readTokens() {
  try { return JSON.parse(fs.readFileSync(TOKEN_STORE_FILE, 'utf8')); }
  catch { return null; }
}
function writeTokens(data) {
  ensureStoreDir();
  fs.writeFileSync(TOKEN_STORE_FILE, JSON.stringify(data, null, 2));
}
function clearTokens() {
  if (fs.existsSync(TOKEN_STORE_FILE)) fs.unlinkSync(TOKEN_STORE_FILE);
}

// ── OAuth: build the consent URL the browser redirects to ──────
async function getAuthUrl(state) {
  if (!cca) throw new Error('M365 not configured: missing MS_GRAPH_* env vars.');
  return cca.getAuthCodeUrl({
    scopes: DELEGATED_SCOPES,
    redirectUri: REDIRECT_URI,
    state,
    prompt: 'select_account' // let staff pick which account to use
  });
}

// ── OAuth: exchange the auth code for tokens, persist them ─────
async function handleCallback(code) {
  if (!cca) throw new Error('M365 not configured.');
  const result = await cca.acquireTokenByCode({
    code,
    scopes: DELEGATED_SCOPES,
    redirectUri: REDIRECT_URI
  });
  // MSAL doesn't return refresh tokens directly — they're stored in the cache.
  // Persist the cache so we survive restarts.
  const cache = cca.getTokenCache().serialize();
  const tokens = {
    account: result.account,           // { username, name, tenantId, ... }
    accessToken: result.accessToken,
    expiresOn: result.expiresOn,
    cache,
    connectedAt: new Date().toISOString()
  };
  writeTokens(tokens);
  return { ok: true, account: result.account };
}

// ── Get a fresh access token, refreshing silently if needed ────
async function getDelegatedToken() {
  if (!cca) throw new Error('M365 not configured.');
  const stored = readTokens();
  if (!stored) throw new Error('M365 not connected. Visit /auth/m365/login first.');

  // Restore the MSAL cache from disk so silent acquisition works
  if (stored.cache) cca.getTokenCache().deserialize(stored.cache);

  const accounts = await cca.getTokenCache().getAllAccounts();
  const account = accounts.find(a => a.username === stored.account.username) || accounts[0];
  if (!account) throw new Error('No cached account in MSAL store. Reconnect M365.');

  try {
    const result = await cca.acquireTokenSilent({
      account,
      scopes: DELEGATED_SCOPES.filter(s => s !== 'offline_access')
    });
    // Re-persist refreshed cache
    const cache = cca.getTokenCache().serialize();
    writeTokens({ ...stored, accessToken: result.accessToken, expiresOn: result.expiresOn, cache });
    return result.accessToken;
  } catch (e) {
    // Refresh token expired or invalidated — caller has to re-auth.
    clearTokens();
    throw new Error('M365 token expired. Reconnect M365.');
  }
}

/** Build a Graph client for the connected user. */
async function userClient() {
  const token = await getDelegatedToken();
  return Client.init({
    authProvider: done => done(null, token),
    defaultVersion: 'v1.0'
  });
}

// ── Graph API: inbox, drafts, send, reply ──────────────────────

async function listInbox(opts = {}) {
  const c = await userClient();
  const top = Math.min(opts.top || 25, 100);
  let req = c.api('/me/messages')
    .top(top)
    .orderby('receivedDateTime DESC')
    .select('id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview,hasAttachments,conversationId,webLink');
  if (opts.unreadOnly) req = req.filter('isRead eq false');
  if (opts.search) req = req.search(`"${opts.search.replace(/"/g, '')}"`);
  const r = await req.get();
  return r.value || [];
}

async function getMessage(messageId) {
  const c = await userClient();
  return c.api(`/me/messages/${messageId}`).get();
}

async function createDraft(message) {
  const c = await userClient();
  const body = typeof message.body === 'string'
    ? { contentType: 'HTML', content: message.body }
    : message.body;
  const payload = {
    subject: message.subject || '(no subject)',
    body,
    toRecipients: toRecipients(message.to),
    ccRecipients: toRecipients(message.cc),
    bccRecipients: toRecipients(message.bcc),
    importance: message.importance || 'normal',
    // Custom property so we can find chamber-generated drafts later
    singleValueExtendedProperties: message.tag ? [{
      id: 'String {00020329-0000-0000-C000-000000000046} Name ChamberTag',
      value: message.tag
    }] : undefined
  };
  const r = await c.api('/me/messages').post(payload);
  return { id: r.id, webLink: r.webLink, conversationId: r.conversationId };
}

async function sendMail(message) {
  const c = await userClient();
  const body = typeof message.body === 'string'
    ? { contentType: 'HTML', content: message.body }
    : message.body;
  await c.api('/me/sendMail').post({
    message: {
      subject: message.subject || '(no subject)',
      body,
      toRecipients: toRecipients(message.to),
      ccRecipients: toRecipients(message.cc),
      bccRecipients: toRecipients(message.bcc)
    },
    saveToSentItems: message.saveToSentItems !== false
  });
  return { ok: true };
}

async function replyDraft(messageId, comment) {
  const c = await userClient();
  const r = await c.api(`/me/messages/${messageId}/createReply`).post({ comment });
  return { id: r.id, webLink: r.webLink };
}

async function me() {
  const c = await userClient();
  return c.api('/me').select('id,displayName,mail,userPrincipalName,jobTitle').get();
}

// ── Helpers ────────────────────────────────────────────────────
function toRecipients(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr.filter(Boolean).map(addr => {
    if (typeof addr === 'string') return { emailAddress: { address: addr } };
    return { emailAddress: { address: addr.email, name: addr.name } };
  });
}

function status() {
  const stored = readTokens();
  return {
    configured: isConfigured,
    tenantId: TENANT_ID ? `${TENANT_ID.slice(0, 8)}…` : null,
    clientId: CLIENT_ID ? `${CLIENT_ID.slice(0, 8)}…` : null,
    redirectUri: REDIRECT_URI,
    connected: !!stored,
    connectedAs: stored?.account?.username || null,
    connectedAt: stored?.connectedAt || null,
    scopes: DELEGATED_SCOPES
  };
}

function disconnect() {
  clearTokens();
  return { ok: true };
}

module.exports = {
  status,
  isConfigured,
  // OAuth
  getAuthUrl,
  handleCallback,
  disconnect,
  // Graph operations (require connected user)
  listInbox,
  getMessage,
  createDraft,
  sendMail,
  replyDraft,
  me
};
