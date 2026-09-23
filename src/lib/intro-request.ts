import { z } from 'zod';
import { FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS } from './intro-request-fields';

export { FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS };

// Largest body a valid request can produce (six capped fields, worst-case
// 4-byte UTF-8, plus JSON overhead) fits comfortably under this.
export const MAX_BODY_BYTES = 32 * 1024;

type EnumValues<T extends readonly { value: string }[]> = [T[number]['value'], ...T[number]['value'][]];

const toValues = <T extends readonly { value: string }[]>(options: T) => options.map(o => o.value) as EnumValues<T>;

// The type check runs as its own step: zod 4 otherwise keeps running the
// length checks against a non-string input and reports misleading errors.
const text = (label: string) =>
  z.string({ error: issue => (issue.input === undefined ? `${label} is required` : `${label} must be text`) });

const requiredText = (label: string, max: number, min = 1) =>
  text(label).pipe(
    z
      .string()
      .trim()
      .min(min, min > 1 ? `${label} must be at least ${min} characters long` : `${label} is required`)
      .max(max, `${label} must be at most ${max} characters`)
  );

const optionalText = (label: string, max: number) =>
  text(label)
    .pipe(z.string().trim().max(max, `${label} must be at most ${max} characters`))
    .optional()
    .default('');

const choiceError = (label: string, input: unknown) =>
  input === undefined || input === '' ? `${label} is required` : `${label} is not supported`;

export const introRequestSchema = z.object({
  name: requiredText('Name', FIELD_LIMITS.name, 2),
  selfIntroduction: requiredText('Self-introduction', FIELD_LIMITS.selfIntroduction),
  role: requiredText('Role', FIELD_LIMITS.role),
  company: optionalText('Company', FIELD_LIMITS.company),
  recipient: requiredText('Recipient', FIELD_LIMITS.recipient, 2),
  messageType: z.enum(toValues(MESSAGE_TYPE_OPTIONS), { error: issue => choiceError('Message type', issue.input) }),
  tone: z.enum(toValues(TONE_OPTIONS), { error: issue => choiceError('Tone', issue.input) }),
  additionalContext: optionalText('Additional context', FIELD_LIMITS.additionalContext),
});

export type IntroRequest = z.infer<typeof introRequestSchema>;

export type ParseResult =
  | { ok: true; data: IntroRequest }
  | { ok: false; status: 400 | 413 | 422; error: string; fieldErrors?: Record<string, string[]> };

// Streams the body and stops as soon as it exceeds maxBytes, so a chunked
// request without Content-Length cannot force a large buffer. Returns null
// when the limit is exceeded.
async function readBodyWithLimit(req: Request, maxBytes: number): Promise<string | null> {
  if (!req.body) return '';

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

// Reads, size-checks and validates a request body. Unknown keys are stripped,
// so only schema fields ever reach the prompt.
export async function parseIntroRequest(req: Request): Promise<ParseResult> {
  const declaredLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'Request body too large' };
  }

  const raw = await readBodyWithLimit(req, MAX_BODY_BYTES);
  if (raw === null) {
    return { ok: false, status: 413, error: 'Request body too large' };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: 'Request body must be valid JSON' };
  }

  const result = introRequestSchema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      status: 422,
      error: 'Invalid request',
      fieldErrors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
    };
  }

  return { ok: true, data: result.data };
}
