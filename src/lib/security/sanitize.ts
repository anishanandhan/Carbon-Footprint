/**
 * Sanitizes input text by removing control characters, non-printable characters,
 * and zero-width spaces (e.g. \u200B, \u200C, etc.) to prevent encoding-based bypasses.
 * 
 * @param input Raw input string
 * @returns Cleaned string
 */
export function stripControlCharacters(input: string): string {
  if (!input) return '';
  // Match ASCII control characters and zero-width/space unicode characters
  /* eslint-disable-next-line no-control-regex */
  const controlRegex = /[\x00-\x1F\x7F-\x9F]/g;
  return input
    .replace(controlRegex, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Escapes characters that have special meaning in HTML to prevent
 * Cross-Site Scripting (XSS) injections.
 * 
 * @param input Raw HTML/text string
 * @returns Escaped HTML-safe string
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  const htmlReplacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };
  return input.replace(/[&<>"'`/]/g, (char) => htmlReplacements[char]);
}

/**
 * Redacts potential credentials, secrets, API keys, and email/password pairs
 * from log lines or trace payloads to prevent data leakages.
 * 
 * @param logLine Raw log string or payload
 * @returns Log line with credentials redacted
 */
export function redactSecrets(logLine: string): string {
  if (!logLine) return '';
  let cleaned = logLine;
  
  // Redact password values in JSON or key-value structures
  cleaned = cleaned.replace(/(password["'\s]*:?\s*["'])([^"']*)(["'])/gi, '$1[REDACTED]$3');
  
  // Redact email values
  cleaned = cleaned.replace(/([\w.-]+)@([\w-]+\.)+[\w-]{2,4}/gi, '[EMAIL_REDACTED]');

  // Redact specific keys in query strings
  cleaned = cleaned.replace(/(password|secret|token|key|pass)=([^&\s]+)/gi, '$1=[REDACTED]');

  return cleaned;
}

/**
 * Normalizes input strings using Unicode Normalization Form C (NFC)
 * to ensure consistent character representation and prevent normalization bypasses.
 * 
 * @param input Raw string
 * @returns NFC Normalized string
 */
export function normalizeUnicode(input: string): string {
  if (!input) return '';
  return input.normalize('NFC');
}
