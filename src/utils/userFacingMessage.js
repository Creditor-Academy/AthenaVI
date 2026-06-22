/**
 * Strip third-party provider branding from strings shown in toasts, alerts,
 * inline errors, and other user-facing status messages.
 * Super admin panels may show provider names intentionally — do not use there.
 */
export function sanitizeUserFacingMessage(message) {
  if (message == null || message === '') return message;

  let text = String(message);

  text = text.replace(/\bHeyGen's\b/gi, 'The service');
  text = text.replace(/\bHeyGen\b/gi, 'avatar video');
  text = text.replace(/\bheygen\b/g, 'avatar video');

  // Tidy common phrasing after replacement
  text = text.replace(/\bavatar video API\b/gi, 'avatar video service');
  text = text.replace(/\bavatar video service service\b/gi, 'avatar video service');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/** @param {unknown} error */
export function getSanitizedErrorMessage(error, fallback = 'Something went wrong') {
  const raw =
    (error && typeof error === 'object' && 'message' in error && error.message) ||
    (typeof error === 'string' ? error : '') ||
    fallback;
  return sanitizeUserFacingMessage(raw);
}
