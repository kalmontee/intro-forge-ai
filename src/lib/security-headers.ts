// Response headers applied to every route via next.config.ts.
//
// script-src allows 'unsafe-inline' because Next.js injects inline bootstrap
// scripts; a nonce-based CSP would need middleware and dynamic rendering of
// every page. The app renders no user-controlled HTML, which keeps the risk
// of 'unsafe-inline' low. style-src needs 'unsafe-inline' for the style tags
// Next.js and next/font inject.

export function contentSecurityPolicy(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // React and Turbopack use eval() for dev-only tooling (HMR, error overlay).
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

export function securityHeaders(isDev: boolean): { key: string; value: string }[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(isDev) },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ];
}
