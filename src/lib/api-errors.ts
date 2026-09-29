import { GenerationFailure, type GenerationErrorKind } from './gemini-adapter';

export interface ErrorResponse {
  status: number;
  body: { error: string };
}

export const GENERATION_UNAVAILABLE: ErrorResponse = {
  status: 500,
  body: { error: 'Message generation is temporarily unavailable. Please try again later.' },
};

const RESPONSE_FOR_KIND: Record<GenerationErrorKind, ErrorResponse> = {
  timeout: { status: 504, body: { error: 'Message generation timed out. Please try again.' } },
  rate_limited: { status: 429, body: { error: 'The AI service is busy right now. Please try again in a minute.' } },
  upstream_unavailable: { status: 502, body: { error: 'The AI service could not be reached. Please try again later.' } },
  no_output: { status: 502, body: { error: 'The AI service could not generate a message for these details.' } },
};

// Maps a generator's failure to a fixed client-facing message. Upstream error
// text (URLs, model names, status text, stack traces) never reaches the
// client; callers log the original error server-side. Anything that isn't a
// GenerationFailure (a bug, an unrecognized error) falls back to the same
// message as a generator that couldn't be built at all.
export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof GenerationFailure) {
    return RESPONSE_FOR_KIND[error.kind];
  }

  return GENERATION_UNAVAILABLE;
}
