import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, FormStorage, STORAGE_PREFIX, clearSavedForm, loadSavedForm, saveField } from '@/lib/form-storage';

// In-memory Storage with the same key()/length semantics as localStorage.
class MemoryStorage implements FormStorage {
  private items = new Map<string, string>();

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.items.set(key, value);
  }

  get length() {
    return this.items.size;
  }

  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  snapshot() {
    return Object.fromEntries(this.items);
  }
}

const throwingStorage: FormStorage = {
  get length(): number {
    throw new Error('SecurityError');
  },
  key: () => {
    throw new Error('SecurityError');
  },
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('saveField and loadSavedForm', () => {
  it('round-trips values under prefixed keys', () => {
    const storage = new MemoryStorage();
    saveField('name', 'Ada Lovelace', storage);
    saveField('tone', 'formal', storage);

    expect(storage.snapshot()).toEqual({ [`${STORAGE_PREFIX}name`]: 'Ada Lovelace', [`${STORAGE_PREFIX}tone`]: 'formal' });
    expect(loadSavedForm(storage)).toEqual({ ...EMPTY_FORM, name: 'Ada Lovelace', tone: 'formal' });
  });

  it('removes a field when saved with an empty value', () => {
    const storage = new MemoryStorage();
    saveField('role', 'Engineer', storage);
    saveField('role', '', storage);
    expect(storage.snapshot()).toEqual({});
  });

  it('returns an empty form when nothing is saved or storage is unavailable', () => {
    expect(loadSavedForm(new MemoryStorage())).toEqual(EMPTY_FORM);
    expect(loadSavedForm(null)).toEqual(EMPTY_FORM);
  });

  it('ignores unrelated keys on the same origin', () => {
    const storage = new MemoryStorage({ theme: 'dark', [`${STORAGE_PREFIX}role`]: 'Engineer' });
    expect(loadSavedForm(storage)).toEqual({ ...EMPTY_FORM, role: 'Engineer' });
  });
});

describe('legacy key migration', () => {
  it('moves values saved under bare field names to prefixed keys', () => {
    const storage = new MemoryStorage({ name: 'Ada Lovelace', company: 'Acme', theme: 'dark' });

    expect(loadSavedForm(storage)).toEqual({ ...EMPTY_FORM, name: 'Ada Lovelace', company: 'Acme' });
    expect(storage.snapshot()).toEqual({
      theme: 'dark',
      [`${STORAGE_PREFIX}name`]: 'Ada Lovelace',
      [`${STORAGE_PREFIX}company`]: 'Acme',
    });
  });

  it('keeps the prefixed value when both exist', () => {
    const storage = new MemoryStorage({ role: 'Old role', [`${STORAGE_PREFIX}role`]: 'New role' });
    expect(loadSavedForm(storage).role).toBe('New role');
    expect(storage.snapshot()).toEqual({ [`${STORAGE_PREFIX}role`]: 'New role' });
  });
});

describe('clearSavedForm', () => {
  it('removes prefixed and legacy form keys and nothing else', () => {
    const storage = new MemoryStorage({
      theme: 'dark',
      tone: 'casual',
      [`${STORAGE_PREFIX}name`]: 'Ada Lovelace',
      [`${STORAGE_PREFIX}additionalContext`]: 'Led the migration',
    });

    clearSavedForm(storage);

    expect(storage.snapshot()).toEqual({ theme: 'dark' });
    expect(loadSavedForm(storage)).toEqual(EMPTY_FORM);
  });

  it('does nothing when storage is unavailable', () => {
    expect(() => clearSavedForm(null)).not.toThrow();
  });
});

describe('storage that throws', () => {
  it('never throws from any operation', () => {
    expect(loadSavedForm(throwingStorage)).toEqual(EMPTY_FORM);
    expect(() => saveField('name', 'Ada', throwingStorage)).not.toThrow();
    expect(() => saveField('name', '', throwingStorage)).not.toThrow();
    expect(() => clearSavedForm(throwingStorage)).not.toThrow();
  });
});
