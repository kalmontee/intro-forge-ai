import { GoogleGenerativeAIAbortError, GoogleGenerativeAIFetchError, GoogleGenerativeAIResponseError } from '@google/generative-ai';

export interface ErrorResponse {
  status: number;
  body: { error: string };
}

export const GENERATION_UNAVAILABLE: ErrorResponse = {
  status: 500,
  body: { error: 'Message generation is temporarily unavailable. Please try again later.' },
};

// Maps any failure from the generation path to a fixed client-facing message.
// Upstream error text (URLs, model names, status text, stack traces) never
// reaches the client; callers log the original error server-side.
export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof GoogleGenerativeAIAbortError) {
    return { status: 504, body: { error: 'Message generation timed out. Please try again.' } };
  }

  if (error instanceof GoogleGenerativeAIFetchError) {
    if (error.status === 429) {
      return { status: 429, body: { error: 'The AI service is busy right now. Please try again in a minute.' } };
    }
    // Any other upstream status, including 400/401/403 from a bad or revoked
    // key, is a server-side problem the client cannot fix.
    return { status: 502, body: { error: 'The AI service could not be reached. Please try again later.' } };
  }

  if (error instanceof GoogleGenerativeAIResponseError) {
    // Thrown when the model returns no usable text, e.g. a safety block.
    return { status: 502, body: { error: 'The AI service could not generate a message for these details.' } };
  }

  return GENERATION_UNAVAILABLE;
}
