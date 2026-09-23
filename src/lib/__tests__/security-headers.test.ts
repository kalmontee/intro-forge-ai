import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from '@/lib/security-headers';

const directive = (csp: string, name: string) =>
  csp
    .split('; ')
    .find(d => d.startsWith(`${name} `))
    ?.slice(name.length + 1);

describe('contentSecurityPolicy', () => {
  const prod = contentSecurityPolicy(false);

  it('starts from default-src self and locks down framing, plugins, base and forms', () => {
    expect(directive(prod, 'default-src')).toBe("'self'");
    expect(directive(prod, 'frame-ancestors')).toBe("'none'");
    expect(directive(prod, 'object-src')).toBe("'none'");
    expect(directive(prod, 'base-uri')).toBe("'self'");
    expect(directive(prod, 'form-action')).toBe("'self'");
  });

  it('only talks to its own origin', () => {
    expect(directive(prod, 'connect-src')).toBe("'self'");
    expect(directive(prod, 'font-src')).toBe("'self'");
  });

  it("allows 'unsafe-eval' only in development", () => {
    expect(directive(prod, 'script-src')).toBe("'self' 'unsafe-inline'");
    expect(directive(contentSecurityPolicy(true), 'script-src')).toBe("'self' 'unsafe-inline' 'unsafe-eval'");
  });

  it('allows no remote hosts or wildcards', () => {
    for (const csp of [prod, contentSecurityPolicy(true)]) {
      expect(csp).not.toMatch(/https?:|\*/);
    }
  });
});

describe('securityHeaders', () => {
  it('sets every expected header', () => {
    const headers = Object.fromEntries(securityHeaders(false).map(h => [h.key, h.value]));
    expect(headers).toEqual({
      'Content-Security-Policy': contentSecurityPolicy(false),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
  });
});
