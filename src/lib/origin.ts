// Request-origin checks for POST /api.
//
// These stop other websites from using the endpoint through their visitors'
// browsers: a browser always sends Origin on a cross-origin POST and cannot
// forge it or Host. Non-browser clients can send any headers they like, so
// this is not a substitute for rate limiting.

// Only application/json is accepted. text/plain, form-urlencoded and
// multipart are CORS "simple" types another site can POST without a
// preflight.
export function isJsonContentType(value: string | null): boolean {
  if (!value) return false;
  return value.split(';')[0].trim().toLowerCase() === 'application/json';
}

// Normalises a comma-separated list of origins ("https://a.com, https://b.com/")
// to a set of canonical origins. Entries that are not valid URLs are ignored.
export function parseOriginList(value: string | undefined): Set<string> {
  const origins = new Set<string>();
  for (const entry of (value ?? '').split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      origins.add(new URL(trimmed).origin);
    } catch {
      // Skip malformed entries rather than failing every request.
    }
  }
  return origins;
}

type OriginEnv = Record<string, string | undefined>;

// Same-origin requests are always allowed: the Origin host must equal the
// host the request was sent to. ALLOWED_ORIGINS, plus Netlify's URL and
// DEPLOY_PRIME_URL when set, add extra origins on top of that.
export function isAllowedOrigin(req: Request, env: OriginEnv = process.env): boolean {
  const origin = req.headers.get('origin');
  if (!origin || origin === 'null') return false;

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  const requestHost = (req.headers.get('x-forwarded-host') ?? req.headers.get('host'))?.split(',')[0].trim().toLowerCase();
  if (requestHost && parsed.host === requestHost) return true;

  const extra = parseOriginList([env.ALLOWED_ORIGINS, env.URL, env.DEPLOY_PRIME_URL].filter(Boolean).join(','));
  return extra.has(parsed.origin);
}
