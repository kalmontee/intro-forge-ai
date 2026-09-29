import {
  GoogleGenerativeAI,
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai';
import type { IntroRequest } from './intro-request';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './prompt';

const MODEL_NAME = 'gemini-3-flash-preview';

// Upper bound on generated tokens. Gemini 3 models count thinking tokens
// against this limit, so it leaves headroom above the length of a cover letter.
export const MAX_OUTPUT_TOKENS = 2048;

// Abort the Gemini call after this long so a stalled upstream cannot hold the
// function open. gemini-3-flash-preview measured 8-38 s per message
// (2026-09-22), mostly upstream queueing rather than thinking, so a tighter
// bound would cut off ordinary requests.
export const GENERATION_TIMEOUT_MS = 60_000;

export type GenerationErrorKind = 'timeout' | 'rate_limited' | 'upstream_unavailable' | 'no_output';

// Thrown by a generator built with createGeminiGenerator. Callers map `kind`
// to a fixed client-facing response; anything a generator throws that is not
// a GenerationFailure is an unexpected error, not a mapped domain one.
export class GenerationFailure extends Error {
  constructor(public readonly kind: GenerationErrorKind) {
    super(`Generation failed: ${kind}`);
  }
}

export type Generator = (data: IntroRequest) => Promise<string>;

// Builds a generator backed by the Gemini API for one request's lifetime.
// Translates the SDK's error classes into GenerationFailure so callers never
// need to import or branch on the SDK's own types; any other error is
// rethrown unchanged.
export function createGeminiGenerator(apiKey: string): Generator {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  return async (data: IntroRequest) => {
    try {
      const result = await model.generateContent(buildUserPrompt(data), { timeout: GENERATION_TIMEOUT_MS });
      return result.response.text();
    } catch (error) {
      if (error instanceof GoogleGenerativeAIAbortError) {
        throw new GenerationFailure('timeout');
      }
      if (error instanceof GoogleGenerativeAIFetchError) {
        throw new GenerationFailure(error.status === 429 ? 'rate_limited' : 'upstream_unavailable');
      }
      if (error instanceof GoogleGenerativeAIResponseError) {
        throw new GenerationFailure('no_output');
      }
      throw error;
    }
  };
}
