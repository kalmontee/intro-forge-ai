import { describe, expect, it } from 'vitest';
import { displayMessageStyles } from '@/styles/className-utils';

describe('test harness', () => {
  it('resolves the @/ path alias', () => {
    expect(typeof displayMessageStyles).toBe('string');
  });
});
