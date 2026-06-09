import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS, getSecurityHeadersArray } from '../../src/lib/security/headers';

describe('SECURITY_HEADERS', () => {
  it('should contain recommended security headers', () => {
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(SECURITY_HEADERS['Content-Security-Policy']).toBeDefined();
  });
});

describe('getSecurityHeadersArray', () => {
  it('should return security headers formatted as an array', () => {
    const arr = getSecurityHeadersArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThan(0);
    const hasCSP = arr.some(h => h.key === 'Content-Security-Policy');
    expect(hasCSP).toBe(true);
  });
});
