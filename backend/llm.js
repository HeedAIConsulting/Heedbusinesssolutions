/* ============================================================
   Provider-agnostic LLM wrapper.
   Picks Gemini → Anthropic → mock fallback based on which API key
   is in the environment. All callers use the same .complete() signature
   so swapping providers is one env var.

   Usage:
     const llm = require('./llm');
     const text = await llm.complete({
       model: 'staff',           // 'staff' | 'concierge' | 'fast'
       system: 'You are ...',
       messages: [{ role: 'user', content: '...' }],
       maxTokens: 2400
     });
   ============================================================ */

const HAS_GEMINI    = !!process.env.GEMINI_API_KEY;
const HAS_ANTHROPIC = !!process.env.ANTHROPIC_API_KEY;

// Lazy-load SDKs — only require what's actually configured so the server
// boots even if one of them isn't installed.
let geminiClient = null;
let anthropicClient = null;

if (HAS_GEMINI) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (e) {
    console.warn('[llm] @google/generative-ai not installed — run `npm install @google/generative-ai`');
    geminiClient = null;
  }
}

if (HAS_ANTHROPIC) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  } catch (e) {
    anthropicClient = null;
  }
}

// Map our role aliases to provider-specific model names.
// '*-latest' aliases auto-track Google's newest stable model so we don't
// break when an experimental tag is retired.
const GEMINI_MODELS = {
  fast:      'gemini-flash-latest',
  concierge: 'gemini-flash-latest',
  staff:     'gemini-pro-latest',
  draft:     'gemini-pro-latest'
};
const ANTHROPIC_MODELS = {
  fast:      'claude-haiku-4-5',
  concierge: 'claude-sonnet-4-6',
  staff:     'claude-opus-4-7',
  draft:     'claude-opus-4-7'
};

/**
 * Translate Anthropic-style messages into Gemini's contents shape.
 * Anthropic: [{ role: 'user'|'assistant', content: '...' }]
 * Gemini:    [{ role: 'user'|'model',     parts: [{ text: '...' }] }]
 */
function toGeminiContents(messages) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
  }));
}

async function completeGemini({ model, system, messages, maxTokens }) {
  const modelName = GEMINI_MODELS[model] || GEMINI_MODELS.staff;
  const m = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
    generationConfig: { maxOutputTokens: maxTokens || 2400, temperature: 0.7 }
  });
  const result = await m.generateContent({ contents: toGeminiContents(messages) });
  const text = result.response.text();
  return { text: (text || '').trim(), provider: 'gemini', model: modelName };
}

async function completeAnthropic({ model, system, messages, maxTokens }) {
  const modelName = ANTHROPIC_MODELS[model] || ANTHROPIC_MODELS.staff;
  const r = await anthropicClient.messages.create({
    model: modelName,
    max_tokens: maxTokens || 2400,
    system,
    messages
  });
  return { text: r.content[0].text.trim(), provider: 'anthropic', model: modelName };
}

function completeMock({ messages }) {
  // Smart-ish keyword fallback so demos work without any LLM key configured.
  const last = messages[messages.length - 1]?.content || '';
  return Promise.resolve({
    text: `[mock LLM — no provider configured] You asked: "${String(last).slice(0, 200)}". ` +
          `Set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env.local to enable real responses.`,
    provider: 'mock',
    model: 'mock'
  });
}

/**
 * Unified completion API. Returns { text, provider, model }.
 * Order: Gemini if available, else Anthropic, else mock.
 */
async function complete(opts) {
  if (geminiClient)    return completeGemini(opts);
  if (anthropicClient) return completeAnthropic(opts);
  return completeMock(opts);
}

/** What's actually wired right now? Used by /api/chamber health endpoint. */
function status() {
  if (geminiClient)    return { provider: 'gemini',    live: true };
  if (anthropicClient) return { provider: 'anthropic', live: true };
  return { provider: 'mock', live: false };
}

module.exports = { complete, status };
