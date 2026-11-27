/**
 * API errors → what a user can read (HEYGEN_VIDEO_EDITOR_FRONTEND_FIXES F1).
 *
 * The backend sends `{ success: false, message, errors[] }` on every failure. Users must see
 * `errors[0]` or `message`, never the body itself, a HeyGen payload or a stack trace.
 */

const PLAN_GATE_RE = /avatar\s*6/i;
const CREDITS_RE = /insufficient (workspace )?credits|not enough credits/i;

export class ApiError extends Error {
  /**
   * @param {string} message user-readable text
   * @param {{ status?: number, body?: unknown, kind?: string }} [info]
   */
  constructor(message, { status, body, kind } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.kind = kind || classifyApiError(status, body);
  }
}

function firstString(list) {
  if (!Array.isArray(list)) return '';
  const found = list.find((item) => typeof item === 'string' && item.trim());
  if (found) return found.trim();
  const obj = list.find((item) => item && typeof item === 'object' && typeof item.message === 'string');
  return obj ? obj.message.trim() : '';
}

/** `errors[0]` when present, else `message` (also reads `error` / nested `error.message`). */
export function extractApiMessage(body) {
  if (body == null) return '';
  if (typeof body === 'string') return stripRawJson(body);
  if (typeof body !== 'object') return '';
  const fromErrors = firstString(body.errors);
  if (fromErrors) return fromErrors;
  if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
  if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
  if (body.error && typeof body.error === 'object') return extractApiMessage(body.error);
  return '';
}

/** @returns {'credits'|'plan'|'busy'|'auth'|'rate'|'server'|'generic'} */
export function classifyApiError(status, body) {
  const message = typeof body === 'string' ? stripRawJson(body) : extractApiMessage(body);
  const topMessage =
    body && typeof body === 'object' && typeof body.message === 'string' ? body.message : message;
  if ([400, 402, 403].includes(status) && PLAN_GATE_RE.test(message || '')) return 'plan';
  if (status === 402 && CREDITS_RE.test(topMessage || '')) return 'credits';
  if (status === 402) return 'credits';
  if (status === 409) return 'busy';
  if (status === 401) return 'auth';
  if (status === 429) return 'rate';
  if (status >= 500) return 'server';
  return 'generic';
}

export const USER_TEXT_BY_KIND = Object.freeze({
  credits: 'Not enough credits for this action.',
  plan: 'This avatar needs a plan that includes Avatar 6. Please pick another avatar.',
  busy: 'This is already being generated. Hang tight.',
  auth: 'Your session expired. Please sign in again.',
  rate: 'Too many requests. Please try again in a moment.',
  server: 'Something went wrong. You have not been charged. Please try again.',
});

/**
 * Pulls a readable message out of text that embeds a JSON body or a stack trace, e.g.
 * `Failed to generate video: 400 - {"success":false,"message":"Validation error","errors":[…]}`.
 * Text without either is returned unchanged.
 */
export function stripRawJson(text) {
  if (text == null) return '';
  let value = String(text);
  const stackAt = value.search(/\n\s+at\s/);
  if (stackAt > 0) value = value.slice(0, stackAt);
  const start = value.indexOf('{');
  const end = value.lastIndexOf('}');
  if (start === -1 || end <= start) return value.trim();
  try {
    const parsed = JSON.parse(value.slice(start, end + 1));
    const inner = extractApiMessage(parsed);
    if (inner) return inner;
  } catch {
    // not JSON: fall through
  }
  // Braces that aren't a usable body: keep the readable prefix ("Failed to generate video").
  const prefix = value
    .slice(0, start)
    .replace(/[\s:–-]*(\d{3})?[\s:–-]*$/, '')
    .trim();
  return prefix || 'Something went wrong. Please try again.';
}

function statusOf(err) {
  return err?.status ?? err?.statusCode ?? err?.response?.status ?? undefined;
}

function bodyOf(err) {
  return err?.body ?? err?.response?.data ?? err?.data ?? undefined;
}

/**
 * One rule for every HeyGen / speech / credits / export error shown to a user.
 * @returns {{ text: string, kind: 'credits'|'plan'|'busy'|'auth'|'rate'|'server'|'generic' }}
 */
export function toUserMessage(err, fallback = 'Something went wrong. Please try again.') {
  const status = statusOf(err);
  const body = bodyOf(err);
  const kind =
    err?.kind ||
    (err?.code === 'INSUFFICIENT_CREDITS' ? 'credits' : null) ||
    classifyApiError(status, body ?? err?.message);
  if (kind === 'generic' || !USER_TEXT_BY_KIND[kind]) {
    const fromBody = extractApiMessage(body);
    const fromMessage = stripRawJson(err?.message ?? (typeof err === 'string' ? err : ''));
    return { kind: 'generic', text: fromBody || fromMessage || fallback };
  }
  return { kind, text: USER_TEXT_BY_KIND[kind] };
}

/** ApiError from a failed fetch Response (reads the body once). */
export async function apiErrorFromResponse(response, fallback = 'Request failed') {
  let body = null;
  try {
    const text = await response.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
  } catch {
    body = null;
  }
  const status = response.status;
  const kind = classifyApiError(status, body);
  const message =
    kind === 'generic'
      ? extractApiMessage(body) || `${fallback} (${status})`
      : USER_TEXT_BY_KIND[kind];
  return new ApiError(message, { status, body, kind });
}

export function isPlanGateError(err) {
  return err?.kind === 'plan' || toUserMessage(err).kind === 'plan';
}

export function isBusyError(err) {
  return statusOf(err) === 409 || err?.kind === 'busy';
}
