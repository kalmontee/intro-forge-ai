import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, isJsonContentType, parseOriginList } from '@/lib/origin';

const request = (headers: Record<string, string>) => new Request('http://internal/api', { method: 'POST', headers });

describe('isJsonContentType', () => {
  it.each(['application/json', 'application/json; charset=utf-8', 'Application/JSON', ' application/json ;charset=UTF-8'])(
    'accepts %j',
    value => {
      expect(isJsonContentType(value)).toBe(true);
    }
  );

  it.each([
    null,
    '',
    'text/plain',
    'text/plain;charset=UTF-8',
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    'application/jsonp',
    'application/json-patch+json',
  ])('rejects %j', value => {
    expect(isJsonContentType(value)).toBe(false);
  });
});

describe('parseOriginList', () => {
  it('normalises trailing slashes, paths and letter case', () => {
    expect(parseOriginList(' https://Example.com/ ,https://www.example.com/path ')).toEqual(
      new Set(['https://example.com', 'https://www.example.com'])
    );
  });

  it('ignores empty and malformed entries', () => {
    expect(parseOriginList(',not a url,, https://ok.example')).toEqual(new Set(['https://ok.example']));
    expect(parseOriginList(undefined)).toEqual(new Set());
  });
});

describe('isAllowedOrigin', () => {
  it('allows a same-origin request', () => {
    expect(isAllowedOrigin(request({ origin: 'https://introforge.example', host: 'introforge.example' }), {})).toBe(true);
  });

  it('allows a same-origin request on localhost with a port', () => {
    expect(isAllowedOrigin(request({ origin: 'http://localhost:3000', host: 'localhost:3000' }), {})).toBe(true);
  });

  it('compares host case-insensitively', () => {
    expect(isAllowedOrigin(request({ origin: 'https://IntroForge.example', host: 'INTROFORGE.example' }), {})).toBe(true);
  });

  it('prefers the first x-forwarded-host entry over host', () => {
    const req = request({
      origin: 'https://deploy-preview-7--introforge.netlify.app',
      host: 'internal-function-host',
      'x-forwarded-host': 'deploy-preview-7--introforge.netlify.app, proxy.internal',
    });
    expect(isAllowedOrigin(req, {})).toBe(true);
  });

  it('rejects a cross-origin request', () => {
    expect(isAllowedOrigin(request({ origin: 'https://evil.example', host: 'introforge.example' }), {})).toBe(false);
  });

  it('rejects a lookalike host that only shares a suffix or prefix', () => {
    expect(isAllowedOrigin(request({ origin: 'https://introforge.example.evil.com', host: 'introforge.example' }), {})).toBe(false);
    expect(isAllowedOrigin(request({ origin: 'https://evilintroforge.example', host: 'introforge.example' }), {})).toBe(false);
  });

  it('rejects the same hostname on a different port', () => {
    expect(isAllowedOrigin(request({ origin: 'http://localhost:4000', host: 'localhost:3000' }), {})).toBe(false);
  });

  it.each([
    ['missing', {}],
    ['"null"', { origin: 'null' }],
    ['malformed', { origin: 'not a url' }],
  ])('rejects a %s Origin', (_label, headers) => {
    expect(isAllowedOrigin(request({ host: 'introforge.example', ...headers }), {})).toBe(false);
  });

  it('allows an origin listed in ALLOWED_ORIGINS, ignoring trailing slash and case', () => {
    const req = request({ origin: 'https://www.introforge.example', host: 'introforge.example' });
    expect(isAllowedOrigin(req, { ALLOWED_ORIGINS: 'https://WWW.introforge.example/' })).toBe(true);
  });

  it('allows the Netlify URL and DEPLOY_PRIME_URL when set', () => {
    const env = { URL: 'https://introforge.example', DEPLOY_PRIME_URL: 'https://main--introforge.netlify.app' };
    expect(isAllowedOrigin(request({ origin: 'https://introforge.example', host: 'fn.internal' }), env)).toBe(true);
    expect(isAllowedOrigin(request({ origin: 'https://main--introforge.netlify.app', host: 'fn.internal' }), env)).toBe(true);
    expect(isAllowedOrigin(request({ origin: 'https://other--introforge.netlify.app', host: 'fn.internal' }), env)).toBe(false);
  });

  it('allows nothing but the same origin when no extra origins are configured', () => {
    const env = { ALLOWED_ORIGINS: '', URL: undefined, DEPLOY_PRIME_URL: undefined };
    expect(isAllowedOrigin(request({ origin: 'https://introforge.example', host: 'introforge.example' }), env)).toBe(true);
    expect(isAllowedOrigin(request({ origin: 'https://evil.example', host: 'introforge.example' }), env)).toBe(false);
  });
});
