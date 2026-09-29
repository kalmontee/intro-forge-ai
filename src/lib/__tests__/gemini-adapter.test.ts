import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GoogleGenerativeAIAbortError, GoogleGenerativeAIFetchError, GoogleGenerativeAIResponseError } from '@google/generative-ai';
import { createGeminiGenerator, GenerationFailure } from '@/lib/gemini-adapter';
import type { IntroRequest } from '@/lib/intro-request';

const { generateContent, getGenerativeModel } = vi.hoisted(() => {
  const generateContent = vi.fn();
  const getGenerativeModel = vi.fn();
  getGenerativeModel.mockReturnValue({ generateContent });
  return { generateContent, getGenerativeModel };
});

vi.mock('@google/generative-ai', async () => {
  const actual = await vi.importActual<typeof import('@google/generative-ai')>('@google/generative-ai');
  class FakeGoogleGenerativeAI {
    getGenerativeModel(modelParams: unknown, requestOptions?: unknown) {
      return getGenerativeModel(modelParams, requestOptions);
    }
  }
  return {
    ...actual,
    GoogleGenerativeAI: FakeGoogleGenerativeAI,
  };
});

const BRIEF: IntroRequest = {
  name: 'Ada Lovelace',
  selfIntroduction: 'Software engineer with four years of experience.',
  role: 'Staff Engineer',
  company: 'Acme',
  recipient: 'Sarah',
  messageType: 'cold_message',
  tone: 'formal',
  additionalContext: 'Led the payments migration.',
};

describe('createGeminiGenerator', () => {
  beforeEach(() => {
    generateContent.mockReset();
    getGenerativeModel.mockClear();
  });

  it('returns the model output on success', async () => {
    generateContent.mockResolvedValueOnce({ response: { text: () => 'Hello Sarah,' } });

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).resolves.toBe('Hello Sarah,');
  });

  it('maps an abort to a timeout failure', async () => {
    generateContent.mockRejectedValueOnce(new GoogleGenerativeAIAbortError('aborted'));

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).rejects.toMatchObject(new GenerationFailure('timeout'));
  });

  it('maps an upstream 429 to a rate-limited failure', async () => {
    generateContent.mockRejectedValueOnce(new GoogleGenerativeAIFetchError('busy', 429, 'Too Many Requests'));

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).rejects.toMatchObject(new GenerationFailure('rate_limited'));
  });

  it.each([400, 401, 403, 500, 503, undefined])('maps upstream status %s to an upstream-unavailable failure', async status => {
    generateContent.mockRejectedValueOnce(new GoogleGenerativeAIFetchError('bad', status, 'Status text'));

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).rejects.toMatchObject(new GenerationFailure('upstream_unavailable'));
  });

  it('maps a blocked or empty model response to a no-output failure', async () => {
    generateContent.mockRejectedValueOnce(new GoogleGenerativeAIResponseError('blocked'));

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).rejects.toMatchObject(new GenerationFailure('no_output'));
  });

  it('rethrows an unrecognized error unchanged', async () => {
    const unexpected = new Error('ECONNRESET');
    generateContent.mockRejectedValueOnce(unexpected);

    const generator = createGeminiGenerator('test-key');
    await expect(generator(BRIEF)).rejects.toBe(unexpected);
  });

  it('builds the model once per generator with the fixed model name and token limit', () => {
    createGeminiGenerator('test-key');

    expect(getGenerativeModel.mock.calls[0][0]).toEqual(
      expect.objectContaining({ model: 'gemini-3-flash-preview', generationConfig: { maxOutputTokens: 2048 } })
    );
  });
});
