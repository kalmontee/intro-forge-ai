import { describe, expect, it, vi } from 'vitest';
import { handleMessageGeneration } from '@/lib/message-generation';
import { GenerationFailure, type Generator } from '@/lib/gemini-adapter';
import type { IntroRequest } from '@/lib/intro-request';

const validBody = {
  name: 'Ada Lovelace',
  selfIntroduction: 'Software engineer with four years of experience.',
  role: 'Staff Engineer',
  company: 'Acme',
  recipient: 'Sarah',
  messageType: 'cold_message',
  tone: 'formal',
  additionalContext: 'Led the payments migration.',
};

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request('http://introforge.example/api', {
    method: 'POST',
    headers: { origin: 'https://introforge.example', host: 'introforge.example', 'content-type': 'application/json', ...headers },
    body,
  });

const postJson = (value: unknown, headers?: Record<string, string>) => post(JSON.stringify(value), headers);

const jsonBody = async (response: Response) => JSON.parse(await response.text());

describe('handleMessageGeneration', () => {
  it('rejects a cross-origin request with 403 without calling the generator', async () => {
    const generator = vi.fn<Generator>();
    const req = post(JSON.stringify(validBody), { origin: 'https://evil.example' });

    const response = await handleMessageGeneration(req, generator);

    expect(response.status).toBe(403);
    expect(generator).not.toHaveBeenCalled();
  });

  it('rejects a non-JSON content type with 415', async () => {
    const generator = vi.fn<Generator>();
    const response = await handleMessageGeneration(post(JSON.stringify(validBody), { 'content-type': 'text/plain' }), generator);

    expect(response.status).toBe(415);
    expect(generator).not.toHaveBeenCalled();
  });

  it('rejects an oversized declared body with 413', async () => {
    const generator = vi.fn<Generator>();
    const response = await handleMessageGeneration(postJson(validBody, { 'content-length': String(32 * 1024 + 1) }), generator);

    expect(response.status).toBe(413);
    expect(generator).not.toHaveBeenCalled();
  });

  it('rejects a streamed oversized body with 413 when Content-Length is absent', async () => {
    const generator = vi.fn<Generator>();
    const chunk = new TextEncoder().encode('a'.repeat(8 * 1024));
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(chunk);
      },
    });
    const req = new Request('http://introforge.example/api', {
      method: 'POST',
      headers: { origin: 'https://introforge.example', host: 'introforge.example', 'content-type': 'application/json' },
      body: stream,
      // @ts-expect-error duplex is required by undici for streamed bodies but missing from lib.dom types
      duplex: 'half',
    });

    const response = await handleMessageGeneration(req, generator);

    expect(response.status).toBe(413);
    expect(generator).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 422 and fieldErrors', async () => {
    const generator = vi.fn<Generator>();
    const body: Record<string, unknown> = { ...validBody };
    delete body.name;

    const response = await handleMessageGeneration(postJson(body), generator);

    expect(response.status).toBe(422);
    expect(generator).not.toHaveBeenCalled();
    const parsed = await jsonBody(response);
    expect(parsed.fieldErrors.name).toBeTruthy();
  });

  it('returns the fixed unavailable message when no generator is available', async () => {
    const response = await handleMessageGeneration(postJson(validBody), null);

    expect(response.status).toBe(500);
    const parsed = await jsonBody(response);
    expect(parsed.error).toBe('Message generation is temporarily unavailable. Please try again later.');
  });

  it.each([
    ['timeout', 504],
    ['rate_limited', 429],
    ['upstream_unavailable', 502],
    ['no_output', 502],
  ] as const)('maps a %s failure to %i with no upstream detail', async (kind, status) => {
    const generator: Generator = vi.fn(async () => {
      throw new GenerationFailure(kind);
    });

    const response = await handleMessageGeneration(postJson(validBody), generator);

    expect(response.status).toBe(status);
    const parsed = await jsonBody(response);
    expect(Object.keys(parsed)).toEqual(['error']);
  });

  it('returns the generated output on the happy path, passing the validated request to the generator', async () => {
    const generator: Generator = vi.fn(async () => 'Hello Sarah,');

    const response = await handleMessageGeneration(postJson(validBody), generator);

    expect(response.status).toBe(200);
    const parsed = await jsonBody(response);
    expect(parsed).toEqual({ output: 'Hello Sarah,' });
    expect(generator).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ada Lovelace' } satisfies Partial<IntroRequest>));
  });
});
