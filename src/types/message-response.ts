// The POST /api response body, shared between the server (src/lib/message-generation.ts,
// which constructs it) and the client (src/lib/message-request.ts, which parses it), so the
// two can't drift apart.

export interface MessageGenerationSuccess {
  output: string;
}

export interface MessageGenerationErrorBody {
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type MessageGenerationResponseBody = MessageGenerationSuccess | MessageGenerationErrorBody;
