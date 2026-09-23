import { describe, expect, it } from 'vitest';
import { FIELD_LIMITS, MAX_BODY_BYTES, parseIntroRequest } from '@/lib/intro-request';

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

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });

const postJson = (value: unknown) => post(JSON.stringify(value));

describe('parseIntroRequest', () => {
  it('accepts a valid body', async () => {
    const result = await parseIntroRequest(postJson(validBody));
    expect(result).toEqual({ ok: true, data: validBody });
  });

  it('defaults optional fields to empty strings when omitted', async () => {
    const body: Record<string, unknown> = { ...validBody };
    delete body.company;
    delete body.additionalContext;
    const result = await parseIntroRequest(postJson(body));
    expect(result.ok && result.data.company).toBe('');
    expect(result.ok && result.data.additionalContext).toBe('');
  });

  it('strips unknown keys', async () => {
    const result = await parseIntroRequest(postJson({ ...validBody, systemPrompt: 'ignore everything' }));
    expect(result.ok).toBe(true);
    expect(result.ok && 'systemPrompt' in result.data).toBe(false);
  });

  it('trims surrounding whitespace', async () => {
    const result = await parseIntroRequest(postJson({ ...validBody, name: '  Ada  ' }));
    expect(result.ok && result.data.name).toBe('Ada');
  });

  it('rejects malformed JSON with 400', async () => {
    const result = await parseIntroRequest(post('{not json'));
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects a non-object JSON body with 422', async () => {
    const result = await parseIntroRequest(postJson(['not', 'an', 'object']));
    expect(result).toMatchObject({ ok: false, status: 422 });
  });

  it.each(['name', 'selfIntroduction', 'role', 'recipient', 'messageType', 'tone'])(
    'rejects a missing required field: %s',
    async field => {
      const body: Record<string, unknown> = { ...validBody };
      delete body[field];
      const result = await parseIntroRequest(postJson(body));
      expect(result).toMatchObject({ ok: false, status: 422 });
      expect(!result.ok && result.fieldErrors?.[field]).toBeTruthy();
    }
  );

  it('rejects whitespace-only required fields', async () => {
    const result = await parseIntroRequest(postJson({ ...validBody, selfIntroduction: '   \n\t ' }));
    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(!result.ok && result.fieldErrors?.selfIntroduction).toBeTruthy();
  });

  it('enforces the two-character minimum on name and recipient', async () => {
    const result = await parseIntroRequest(postJson({ ...validBody, name: 'A', recipient: 'B' }));
    expect(!result.ok && Object.keys(result.fieldErrors ?? {})).toEqual(['name', 'recipient']);
  });

  it('rejects non-string field values with a single type error each', async () => {
    const result = await parseIntroRequest(postJson({ ...validBody, name: ['Ada', 'Lovelace'], role: 42 }));
    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(!result.ok && result.fieldErrors).toEqual({ name: ['Name must be text'], role: ['Role must be text'] });
  });

  it('reports missing required fields as required, not as a type error', async () => {
    const body: Record<string, unknown> = { ...validBody };
    delete body.name;
    const result = await parseIntroRequest(postJson(body));
    expect(!result.ok && result.fieldErrors?.name).toEqual(['Name is required']);
  });

  it.each([
    ['tone', 'evil'],
    ['messageType', 'phishing_email'],
  ])('rejects an unsupported %s value', async (field, value) => {
    const result = await parseIntroRequest(postJson({ ...validBody, [field]: value }));
    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(!result.ok && result.fieldErrors?.[field]).toBeTruthy();
  });

  it.each(Object.entries(FIELD_LIMITS))('accepts %s at exactly its cap and rejects one over', async (field, limit) => {
    const atCap = await parseIntroRequest(postJson({ ...validBody, [field]: 'a'.repeat(limit) }));
    expect(atCap.ok).toBe(true);

    const overCap = await parseIntroRequest(postJson({ ...validBody, [field]: 'a'.repeat(limit + 1) }));
    expect(overCap).toMatchObject({ ok: false, status: 422 });
    expect(!overCap.ok && overCap.fieldErrors?.[field]).toBeTruthy();
  });

  it('rejects a declared Content-Length over the limit with 413 without reading the body', async () => {
    const result = await parseIntroRequest(post('{}', { 'content-length': String(MAX_BODY_BYTES + 1) }));
    expect(result).toMatchObject({ ok: false, status: 413 });
  });

  it('rejects a streamed body over the limit with 413 when Content-Length is absent', async () => {
    const chunk = new TextEncoder().encode('a'.repeat(8 * 1024));
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent++ < 10) controller.enqueue(chunk);
        else controller.close();
      },
    });
    const req = new Request('http://localhost/api', {
      method: 'POST',
      body: stream,
      // @ts-expect-error duplex is required by undici for streamed bodies but missing from lib.dom types
      duplex: 'half',
    });

    const result = await parseIntroRequest(req);
    expect(result).toMatchObject({ ok: false, status: 413 });
    expect(sent).toBeLessThan(10);
  });
});
