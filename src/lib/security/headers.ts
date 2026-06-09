/**
 * Security headers configuration object compliant with industry standards
 * and OWASP recommendations. Can be integrated into dev servers, hosting configuration,
 * or proxy server rules.
 */
export const SECURITY_HEADERS = {
  // Strict Content Security Policy (CSP) configuration
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://images.unsplash.com; " +
    "connect-src 'self'; " +
    "object-src 'none'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;",

  // Strict-Transport-Security (HSTS) - force HTTPS for 2 years (63072000 seconds) including subdomains and preloading
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Prevent framing to protect against Clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME-sniffing attacks
  'X-Content-Type-Options': 'nosniff',

  // Referrer-Policy: only send origin header for cross-origin requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Lockdown permissions to protect privacy and device sensors
  'Permissions-Policy': 
    'camera=(), ' +
    'microphone=(), ' +
    'geolocation=(), ' +
    'payment=(), ' +
    'usb=(), ' +
    'display-capture=()',

  // Prevent browser-based Cross-Site Scripting (XSS) filters (Legacy support)
  'X-XSS-Protection': '1; mode=block'
};

/**
 * Utility helper function to get headers as a list of key-value pairs suitable for Vite dev server configurations
 */
export function getSecurityHeadersArray(): Array<{ key: string; value: string }> {
  return Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
    key,
    value,
  }));
}
