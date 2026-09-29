import { GENERATION_UNAVAILABLE, toErrorResponse } from './api-errors';
import type { Generator } from './gemini-adapter';
import { parseIntroRequest } from './intro-request';
import { isAllowedOrigin, isJsonContentType } from './origin';
import type { MessageGenerationResponseBody } from '@/types/message-response';

function json(status: number, body: MessageGenerationResponseBody): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

// The whole POST /api contract, as "a Request in, a Response out": origin and
// content-type checks before the body is read, size and shape validation,
// generation, and the fixed client-facing error mapping. `generator` is null
// when the caller couldn't build one (for example a missing API key); that
// path returns the same fixed message as any other unavailable-generation case.
export async function handleMessageGeneration(req: Request, generator: Generator | null): Promise<Response> {
  if (!isAllowedOrigin(req)) {
    return json(403, { error: 'Forbidden' });
  }

  if (!isJsonContentType(req.headers.get('content-type'))) {
    return json(415, { error: 'Content-Type must be application/json' });
  }

  if (!generator) {
    return json(GENERATION_UNAVAILABLE.status, GENERATION_UNAVAILABLE.body);
  }

  const parsed = await parseIntroRequest(req);
  if (!parsed.ok) {
    return json(parsed.status, { error: parsed.error, fieldErrors: parsed.fieldErrors });
  }

  try {
    const output = await generator(parsed.data);
    return json(200, { output });
  } catch (error) {
    // Full detail stays in server logs; the client only gets a fixed message.
    console.error('Message generation failed:', error);
    const { status, body } = toErrorResponse(error);
    return json(status, body);
  }
}
