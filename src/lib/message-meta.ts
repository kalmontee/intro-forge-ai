import { IntroForgeFormData } from '@/types/form';

const messageTypeNames: Record<string, string> = {
  cold_message: 'cold message',
  follow_up: 'follow-up',
  introduction: 'introduction',
  job_inquiry: 'job inquiry',
  cover_letter: 'cover letter',
};

const withArticle = (phrase: string) => `${/^[aeiou]/i.test(phrase) ? 'An' : 'A'} ${phrase}`;

// One-line summary of the brief, e.g. "A casual cold message to Sarah about the Designer role at Stripe".
// Returns null until there is something worth summarising.
export const describeBrief = (brief: Partial<IntroForgeFormData>): string | null => {
  const tone = brief.tone?.trim();
  const type = messageTypeNames[brief.messageType ?? ''] ?? 'message';
  const recipient = brief.recipient?.trim();
  const role = brief.role?.trim();
  const company = brief.company?.trim();

  if (!tone && !brief.messageType && !recipient && !role && !company) {
    return null;
  }

  const parts = [withArticle(tone ? `${tone} ${type}` : type)];

  if (recipient) parts.push(`to ${recipient}`);

  if (role && company) parts.push(`about the ${role} role at ${company}`);
  else if (role) parts.push(`about the ${role} role`);
  else if (company) parts.push(`about roles at ${company}`);

  return parts.join(' ');
};

const WORDS_PER_MINUTE = 200;

// Word count and a rounded reading time, e.g. { words: 112, readTime: 'about 30 sec read' }
export const getMessageStats = (message: string) => {
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const seconds = (words / WORDS_PER_MINUTE) * 60;

  const readTime =
    seconds < 60 ? `about ${Math.max(10, Math.round(seconds / 10) * 10)} sec read` : `about ${Math.round(seconds / 60)} min read`;

  return { words, readTime };
};
