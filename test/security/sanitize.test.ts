import { describe, expect, it } from 'vitest';
import {
  stripControlCharacters,
  escapeHtml,
  redactSecrets,
  normalizeUnicode,
} from '../../src/lib/security/sanitize';

describe('stripControlCharacters', () => {
  it('should remove ASCII control characters', () => {
    expect(stripControlCharacters('hello\x00world')).toBe('helloworld');
    expect(stripControlCharacters('test\x1Fstring')).toBe('teststring');
  });

  it('should remove zero-width spaces', () => {
    expect(stripControlCharacters('he\u200Bllo')).toBe('hello');
    expect(stripControlCharacters('world\u200D')).toBe('world');
  });

  it('should return empty string for empty inputs', () => {
    expect(stripControlCharacters('')).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape special HTML characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('should return empty string for empty inputs', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('redactSecrets', () => {
  it('should redact passwords', () => {
    expect(redactSecrets('{"password": "secret123"}')).toBe('{"password": "[REDACTED]"}');
  });

  it('should redact emails', () => {
    expect(redactSecrets('contact us at test@example.com')).toBe('contact us at [EMAIL_REDACTED]');
  });

  it('should redact keys in query strings', () => {
    expect(redactSecrets('key=mysecretkey')).toBe('key=[REDACTED]');
  });

  it('should return empty string for empty inputs', () => {
    expect(redactSecrets('')).toBe('');
  });
});

describe('normalizeUnicode', () => {
  it('should normalize decomposed unicode to NFC form', () => {
    const decomposed = 'e\u0301'; // é decomposed
    const normalized = normalizeUnicode(decomposed);
    expect(normalized).toBe('é');
    expect(normalized.length).toBe(1);
  });

  it('should return empty string for empty inputs', () => {
    expect(normalizeUnicode('')).toBe('');
  });
});
