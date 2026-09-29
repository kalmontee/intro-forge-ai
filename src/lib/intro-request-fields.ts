export interface BriefOption {
  value: string;
  label: string; // Title Case; used in the prompt and (via toSentenceCase) the form
  phrase: string; // lowercase prose form, e.g. "follow-up"; used in message-meta's summaries
}

export const MESSAGE_TYPE_OPTIONS: readonly BriefOption[] = [
  { value: 'cold_message', label: 'Cold Message', phrase: 'cold message' },
  { value: 'follow_up', label: 'Follow Up', phrase: 'follow-up' },
  { value: 'introduction', label: 'Introduction', phrase: 'introduction' },
  { value: 'job_inquiry', label: 'Job Inquiry', phrase: 'job inquiry' },
  { value: 'cover_letter', label: 'Cover Letter', phrase: 'cover letter' },
] as const;

export const TONE_OPTIONS: readonly BriefOption[] = [
  { value: 'formal', label: 'Formal', phrase: 'formal' },
  { value: 'casual', label: 'Casual', phrase: 'casual' },
  { value: 'enthusiastic', label: 'Enthusiastic', phrase: 'enthusiastic' },
] as const;

export interface TextBriefField {
  kind: 'text';
  name: string;
  label: string; // used in validation messages, and in the prompt unless promptLabel overrides it
  promptLabel?: string;
  required: boolean;
  min?: number; // only meaningful when required; omit for the default (1)
  max: number;
}

export interface ChoiceBriefField {
  kind: 'choice';
  name: string;
  label: string;
  promptLabel?: string;
  required: boolean;
  options: readonly BriefOption[];
}

type BriefField = TextBriefField | ChoiceBriefField;

export const BRIEF_FIELDS = {
  name: { kind: 'text', name: 'name', label: 'Name', promptLabel: 'From', required: true, min: 2, max: 100 },
  selfIntroduction: { kind: 'text', name: 'selfIntroduction', label: 'Self-introduction', required: true, max: 2000 },
  role: { kind: 'text', name: 'role', label: 'Role', promptLabel: 'Target role', required: true, max: 120 },
  company: { kind: 'text', name: 'company', label: 'Company', promptLabel: 'Target company', required: false, max: 120 },
  recipient: { kind: 'text', name: 'recipient', label: 'Recipient', required: true, min: 2, max: 100 },
  messageType: { kind: 'choice', name: 'messageType', label: 'Message type', required: true, options: MESSAGE_TYPE_OPTIONS },
  tone: { kind: 'choice', name: 'tone', label: 'Tone', required: true, options: TONE_OPTIONS },
  additionalContext: { kind: 'text', name: 'additionalContext', label: 'Additional context', required: false, max: 2000 },
} as const satisfies Record<string, BriefField>;

export type BriefFieldName = keyof typeof BRIEF_FIELDS;

export const FIELD_LIMITS = {
  name: BRIEF_FIELDS.name.max,
  selfIntroduction: BRIEF_FIELDS.selfIntroduction.max,
  role: BRIEF_FIELDS.role.max,
  company: BRIEF_FIELDS.company.max,
  recipient: BRIEF_FIELDS.recipient.max,
  additionalContext: BRIEF_FIELDS.additionalContext.max,
} as const;

// The draft shape: every field is a plain string, including messageType and
// tone before anything is chosen ('' means "not yet chosen"). The validated
// request shape (IntroRequest, in ./intro-request) is stricter.
export type IntroBrief = {
  [K in BriefFieldName]: string;
};

export const EMPTY_BRIEF: IntroBrief = {
  name: '',
  selfIntroduction: '',
  role: '',
  company: '',
  recipient: '',
  messageType: '',
  tone: '',
  additionalContext: '',
};

// Zod-free validation of a draft brief, one entry per field with an error.
// Mirrors the zod schema's rules and wording exactly (see ./intro-request),
// so the client and the server never disagree about what's valid.
export function validateBrief(values: Partial<Record<BriefFieldName, string>>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  // Object.values widens the `as const satisfies` union back to BriefField;
  // the cast just restates what BRIEF_FIELDS's own type already guarantees.
  for (const field of Object.values(BRIEF_FIELDS) as BriefField[]) {
    const value = (values[field.name as BriefFieldName] ?? '').trim();

    if (field.kind === 'choice') {
      if (value === '') {
        if (field.required) errors[field.name] = [`${field.label} is required`];
        continue;
      }
      if (!field.options.some(option => option.value === value)) {
        errors[field.name] = [`${field.label} is not supported`];
      }
      continue;
    }

    if (!field.required) {
      if (value.length > field.max) errors[field.name] = [`${field.label} must be at most ${field.max} characters`];
      continue;
    }

    const min = field.min ?? 1;
    if (value.length < min) {
      errors[field.name] = [min > 1 ? `${field.label} must be at least ${min} characters long` : `${field.label} is required`];
      continue;
    }

    if (value.length > field.max) {
      errors[field.name] = [`${field.label} must be at most ${field.max} characters`];
    }
  }

  return errors;
}
