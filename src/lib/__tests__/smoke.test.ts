import { describe, expect, it } from 'vitest';
import { bulletListItemStyles } from '@/styles/className-utils';

describe('test harness', () => {
  it('resolves the @/ path alias', () => {
    expect(typeof bulletListItemStyles).toBe('string');
  });
});
