import { describe, expect, it } from 'vitest';
import {
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai';
import { toErrorResponse } from '@/lib/api-errors';

const UPSTREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const fetchError = (status?: number) =>
  new GoogleGenerativeAIFetchError(`Error fetching from ${UPSTREAM_URL}: [${status}] API_KEY_INVALID quota`, status, 'Status text');

describe('toErrorResponse', () => {
  it('maps a timeout to 504', () => {
    expect(toErrorResponse(new GoogleGenerativeAIAbortError(`Request aborted when fetching ${UPSTREAM_URL}`)).status).toBe(504);
  });

  it('maps an upstream 429 to 429', () => {
    expect(toErrorResponse(fetchError(429)).status).toBe(429);
  });

  it.each([400, 401, 403, 404, 500, 503])('maps upstream %i to 502', status => {
    expect(toErrorResponse(fetchError(status)).status).toBe(502);
  });

  it('maps an upstream error without a status to 502', () => {
    expect(toErrorResponse(fetchError(undefined)).status).toBe(502);
  });

  it('maps a blocked or empty model response to 502', () => {
    expect(toErrorResponse(new GoogleGenerativeAIResponseError('Candidate was blocked due to SAFETY')).status).toBe(502);
  });

  it.each([
    ['a generic SDK error', new GoogleGenerativeAIError('boom')],
    ['a plain Error', new Error('ECONNRESET at 10.0.0.1')],
    ['a thrown string', 'something bad'],
    ['undefined', undefined],
    ['null', null],
  ])('maps %s to 500', (_label, error) => {
    expect(toErrorResponse(error).status).toBe(500);
  });

  it('never exposes upstream details in the body', () => {
    const errors: unknown[] = [
      fetchError(403),
      fetchError(429),
      fetchError(500),
      new GoogleGenerativeAIAbortError(`Request aborted when fetching ${UPSTREAM_URL}`),
      new GoogleGenerativeAIResponseError('Candidate was blocked due to SAFETY'),
      new Error('ECONNRESET at 10.0.0.1'),
    ];

    for (const error of errors) {
      const body = JSON.stringify(toErrorResponse(error).body);
      expect(Object.keys(toErrorResponse(error).body)).toEqual(['error']);
      expect(body).not.toMatch(/googleapis|gemini|API_KEY|SAFETY|ECONNRESET|10\.0\.0\.1|Status text|\bat\b.*:\d+/i);
    }
  });
});
