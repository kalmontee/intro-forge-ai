import { describe, expect, it } from 'vitest';
import { describeBrief } from '@/lib/message-meta';

describe('describeBrief', () => {
  it('returns null when the brief has nothing worth summarising', () => {
    expect(describeBrief({})).toBeNull();
  });

  it.each([
    ['cold_message', 'A casual cold message'],
    ['follow_up', 'A casual follow-up'],
    ['job_inquiry', 'A casual job inquiry'],
    ['cover_letter', 'A casual cover letter'],
    ['introduction', 'A casual introduction'],
  ])('phrases %s as "%s"', (messageType, expected) => {
    expect(describeBrief({ messageType, tone: 'casual' })).toBe(expected);
  });

  it('combines recipient, role and company when present', () => {
    expect(describeBrief({ messageType: 'cold_message', tone: 'formal', recipient: 'Sarah', role: 'Engineer', company: 'Acme' })).toBe(
      'A formal cold message to Sarah about the Engineer role at Acme'
    );
  });
});
