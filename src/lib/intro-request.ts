import { z } from 'zod';
import { BRIEF_FIELDS, FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS, type ChoiceBriefField, type TextBriefField } from './intro-request-fields';

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

// Every rule and message below reads from BRIEF_FIELDS (in ./intro-request-fields),
// the same table validateBrief uses client-side, so the two can't drift apart.
const requiredText = (field: TextBriefField) => {
  const min = field.min ?? 1;
  return text(field.label).pipe(
    z
      .string()
      .trim()
      .min(min, min > 1 ? `${field.label} must be at least ${min} characters long` : `${field.label} is required`)
      .max(field.max, `${field.label} must be at most ${field.max} characters`)
  );
};

const optionalText = (field: TextBriefField) =>
  text(field.label)
    .pipe(z.string().trim().max(field.max, `${field.label} must be at most ${field.max} characters`))
    .optional()
    .default('');

const choiceError = (label: string, input: unknown) =>
  input === undefined || input === '' ? `${label} is required` : `${label} is not supported`;

const choice = (field: ChoiceBriefField) =>
  z.enum(toValues(field.options), { error: issue => choiceError(field.label, issue.input) });

export const introRequestSchema = z.object({
  name: requiredText(BRIEF_FIELDS.name),
  selfIntroduction: requiredText(BRIEF_FIELDS.selfIntroduction),
  role: requiredText(BRIEF_FIELDS.role),
  company: optionalText(BRIEF_FIELDS.company),
  recipient: requiredText(BRIEF_FIELDS.recipient),
  messageType: choice(BRIEF_FIELDS.messageType),
  tone: choice(BRIEF_FIELDS.tone),
  additionalContext: optionalText(BRIEF_FIELDS.additionalContext),
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
