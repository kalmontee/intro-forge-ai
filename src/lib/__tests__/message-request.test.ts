import { describe, expect, it, vi } from 'vitest';
import { requestMessage } from '@/lib/message-request';
import type { IntroBrief } from '@/lib/intro-request-fields';

const brief: IntroBrief = {
  name: 'Ada Lovelace',
  selfIntroduction: 'Software engineer with four years of experience.',
  role: 'Staff Engineer',
  company: 'Acme',
  recipient: 'Sarah',
  messageType: 'cold_message',
  tone: 'formal',
  additionalContext: 'Led the payments migration.',
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const unparseableResponse = (status: number) => new Response('not json', { status, headers: { 'content-type': 'application/json' } });

describe('requestMessage', () => {
  it('returns the connection message when fetch rejects', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('network down');
    });

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: false, error: "Couldn't reach the server. Check your connection, then try again." });
  });

  it('joins field errors from a non-ok response', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse(422, { error: 'Invalid request', fieldErrors: { name: ['Name is required'], role: ['Role is required'] } })
    );

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: false, error: 'Name is required. Role is required.' });
  });

  it('uses the top-level error message from a non-ok response with no fieldErrors', async () => {
    const fetchFn = vi.fn(async () => jsonResponse(500, { error: 'Message generation is temporarily unavailable.' }));

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: false, error: 'Message generation is temporarily unavailable.' });
  });

  it('falls back to a status-based message when a non-ok body is unparseable', async () => {
    const fetchFn = vi.fn(async () => unparseableResponse(502));

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: false, error: "Couldn't write your message (the server returned 502). Try again in a moment." });
  });

  it("returns the couldn't-read message when an ok response body is unparseable", async () => {
    const fetchFn = vi.fn(async () => unparseableResponse(200));

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: false, error: "Couldn't read the server's response. Try again in a moment." });
  });

  it('returns the generated message on success', async () => {
    const fetchFn = vi.fn(async () => jsonResponse(200, { output: 'Hello Sarah,' }));

    const result = await requestMessage(brief, fetchFn);

    expect(result).toEqual({ ok: true, message: 'Hello Sarah,' });
    expect(fetchFn).toHaveBeenCalledWith('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });
  });
});
