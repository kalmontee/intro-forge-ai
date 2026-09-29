import { describe, expect, it } from 'vitest';
import { BRIEF_FIELDS, FIELD_LIMITS, validateBrief, type BriefFieldName } from '@/lib/intro-request-fields';
import { introRequestSchema } from '@/lib/intro-request';

const validBrief = {
  name: 'Ada Lovelace',
  selfIntroduction: 'Software engineer with four years of experience.',
  role: 'Staff Engineer',
  company: 'Acme',
  recipient: 'Sarah',
  messageType: 'cold_message',
  tone: 'formal',
  additionalContext: 'Led the payments migration.',
};

describe('validateBrief', () => {
  it('accepts a fully valid brief', () => {
    expect(validateBrief(validBrief)).toEqual({});
  });

  it.each(['name', 'selfIntroduction', 'role', 'recipient', 'messageType', 'tone'])('rejects a missing required field: %s', field => {
    const errors = validateBrief({ ...validBrief, [field]: '' });
    expect(errors[field]).toBeTruthy();
  });

  it('accepts missing optional fields', () => {
    const errors = validateBrief({ ...validBrief, company: '', additionalContext: '' });
    expect(errors).toEqual({});
  });

  it('rejects whitespace-only required fields as required', () => {
    const errors = validateBrief({ ...validBrief, selfIntroduction: '   \n\t ' });
    expect(errors.selfIntroduction).toEqual(['Self-introduction is required']);
  });

  it('enforces the two-character minimum on name and recipient', () => {
    const errors = validateBrief({ ...validBrief, name: 'A', recipient: 'B' });
    expect(errors.name).toEqual(['Name must be at least 2 characters long']);
    expect(errors.recipient).toEqual(['Recipient must be at least 2 characters long']);
  });

  it.each(Object.entries(FIELD_LIMITS))('accepts %s at exactly its cap and rejects one over', (field, limit) => {
    const atCap = validateBrief({ ...validBrief, [field]: 'a'.repeat(limit) });
    expect(atCap[field]).toBeUndefined();

    const overCap = validateBrief({ ...validBrief, [field]: 'a'.repeat(limit + 1) });
    const label = BRIEF_FIELDS[field as BriefFieldName].label;
    expect(overCap[field]).toEqual([`${label} must be at most ${limit} characters`]);
  });

  it.each([
    ['tone', 'evil'],
    ['messageType', 'phishing_email'],
  ])('rejects an unsupported %s value', (field, value) => {
    const errors = validateBrief({ ...validBrief, [field]: value });
    expect(errors[field]).toBeTruthy();
  });

  it('trims surrounding whitespace before checking length', () => {
    expect(validateBrief({ ...validBrief, name: '  Ada  ' })).toEqual({});
  });
});

describe('validateBrief / zod schema parity', () => {
  const cases: Record<string, unknown>[] = [
    validBrief,
    { ...validBrief, company: '', additionalContext: '' },
    { ...validBrief, name: '' },
    { ...validBrief, name: 'A' },
    { ...validBrief, selfIntroduction: '   ' },
    { ...validBrief, messageType: 'not_a_type' },
    { ...validBrief, tone: '' },
    { ...validBrief, role: 'a'.repeat(FIELD_LIMITS.role + 1) },
  ];

  it.each(cases.map((brief, index) => [index, brief] as const))('case %i agrees on accept/reject', (_index, brief) => {
    const briefValid = Object.keys(validateBrief(brief as Record<string, string>)).length === 0;
    const schemaValid = introRequestSchema.safeParse(brief).success;
    expect(briefValid).toBe(schemaValid);
  });
});
