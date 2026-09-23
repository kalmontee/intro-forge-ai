// Single source of truth for the fields POST /api accepts. Kept free of zod
// so the client form can import it without pulling the validator into the
// browser bundle; the schema in ./intro-request builds on these values.

export const MESSAGE_TYPE_OPTIONS = [
  { value: 'cold_message', label: 'Cold Message' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'job_inquiry', label: 'Job Inquiry' },
  { value: 'cover_letter', label: 'Cover Letter' },
] as const;

export const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
] as const;

export const FIELD_LIMITS = {
  name: 100,
  selfIntroduction: 2000,
  role: 120,
  company: 120,
  recipient: 100,
  additionalContext: 2000,
} as const;
