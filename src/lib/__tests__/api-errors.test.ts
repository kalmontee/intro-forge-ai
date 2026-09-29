import { describe, expect, it } from 'vitest';
import { GenerationFailure } from '@/lib/gemini-adapter';
import { GENERATION_UNAVAILABLE, toErrorResponse } from '@/lib/api-errors';

describe('toErrorResponse', () => {
  it('maps a timeout to 504', () => {
    expect(toErrorResponse(new GenerationFailure('timeout')).status).toBe(504);
  });

  it('maps rate_limited to 429', () => {
    expect(toErrorResponse(new GenerationFailure('rate_limited')).status).toBe(429);
  });

  it('maps upstream_unavailable to 502', () => {
    expect(toErrorResponse(new GenerationFailure('upstream_unavailable')).status).toBe(502);
  });

  it('maps no_output to 502', () => {
    expect(toErrorResponse(new GenerationFailure('no_output')).status).toBe(502);
  });

  it.each([
    ['a plain Error', new Error('ECONNRESET at 10.0.0.1')],
    ['a thrown string', 'something bad'],
    ['undefined', undefined],
    ['null', null],
  ])('maps %s to the fixed unavailable response', (_label, error) => {
    expect(toErrorResponse(error)).toEqual(GENERATION_UNAVAILABLE);
  });

  it('never exposes upstream details in the body', () => {
    const errors: unknown[] = [
      new GenerationFailure('upstream_unavailable'),
      new GenerationFailure('rate_limited'),
      new GenerationFailure('timeout'),
      new GenerationFailure('no_output'),
      new Error('ECONNRESET at 10.0.0.1'),
    ];

    for (const error of errors) {
      const body = JSON.stringify(toErrorResponse(error).body);
      expect(Object.keys(toErrorResponse(error).body)).toEqual(['error']);
      expect(body).not.toMatch(/googleapis|gemini|API_KEY|SAFETY|ECONNRESET|10\.0\.0\.1|Status text|\bat\b.*:\d+/i);
    }
  });
});
