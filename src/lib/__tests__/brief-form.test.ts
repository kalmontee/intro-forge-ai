import { describe, expect, it } from 'vitest';
import { BRIEF_FORM_FIELD_ORDER, briefFormReducer, firstInvalidField, initialBriefFormState, type BriefFormState } from '@/lib/brief-form';
import { EMPTY_BRIEF } from '@/lib/intro-request-fields';
import { clearSavedForm, loadSavedForm, saveField, type FormStorage } from '@/lib/form-storage';

// In-memory Storage with the same key()/length semantics as localStorage.
// Duplicated from form-storage.test.ts's fake (DAMP: each test file should
// read standalone) rather than exported from there for one shared helper.
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
}

const validValues = {
  name: 'Ada Lovelace',
  selfIntroduction: 'Software engineer with four years of experience.',
  role: 'Staff Engineer',
  company: 'Acme',
  recipient: 'Sarah',
  messageType: 'cold_message',
  tone: 'formal',
  additionalContext: 'Led the payments migration.',
};

describe('briefFormReducer', () => {
  it('starts from the empty brief with no errors', () => {
    expect(initialBriefFormState).toEqual({ values: EMPTY_BRIEF, errors: {} });
  });

  it('change updates the field value', () => {
    const next = briefFormReducer(initialBriefFormState, { type: 'change', field: 'name', value: 'Ada' });
    expect(next.values.name).toBe('Ada');
  });

  it('change clears that field’s existing error without touching others', () => {
    const state: BriefFormState = { values: EMPTY_BRIEF, errors: { name: ['Name is required'], role: ['Role is required'] } };
    const next = briefFormReducer(state, { type: 'change', field: 'name', value: 'Ada' });
    expect(next.errors.name).toBeUndefined();
    expect(next.errors.role).toEqual(['Role is required']);
  });

  it('load replaces the values and resets errors', () => {
    const state: BriefFormState = { values: EMPTY_BRIEF, errors: { name: ['Name is required'] } };
    const next = briefFormReducer(state, { type: 'load', values: { ...EMPTY_BRIEF, ...validValues } });
    expect(next.values).toEqual({ ...EMPTY_BRIEF, ...validValues });
    expect(next.errors).toEqual({});
  });

  it('clear resets to the empty brief with no errors', () => {
    const state: BriefFormState = { values: { ...EMPTY_BRIEF, ...validValues }, errors: { name: ['Name is required'] } };
    const next = briefFormReducer(state, { type: 'clear' });
    expect(next).toEqual({ values: EMPTY_BRIEF, errors: {} });
  });

  it('validate populates errors for an invalid brief', () => {
    const next = briefFormReducer(initialBriefFormState, { type: 'validate' });
    expect(next.errors.name).toBeTruthy();
    expect(next.errors.recipient).toBeTruthy();
  });

  it('validate produces no errors for a fully valid brief', () => {
    const state: BriefFormState = { values: { ...EMPTY_BRIEF, ...validValues }, errors: {} };
    const next = briefFormReducer(state, { type: 'validate' });
    expect(next.errors).toEqual({});
  });
});

describe('firstInvalidField', () => {
  it('returns the earliest field in form order that has an error', () => {
    // Table order would put role/company before recipient; form order puts recipient first.
    expect(firstInvalidField({ role: ['Role is required'], recipient: ['Recipient is required'] })).toBe('recipient');
  });

  it('returns undefined when there are no errors', () => {
    expect(firstInvalidField({})).toBeUndefined();
  });

  it('respects a custom field order when given one', () => {
    expect(firstInvalidField({ role: ['x'], recipient: ['y'] }, ['role', 'recipient'])).toBe('role');
  });

  it('BRIEF_FORM_FIELD_ORDER lists every brief field exactly once', () => {
    expect([...BRIEF_FORM_FIELD_ORDER].sort()).toEqual(Object.keys(EMPTY_BRIEF).sort());
  });
});

// Proves the pieces useBriefForm (src/hooks/use-brief-form.ts) wires together
// behave correctly end to end. The hook's own useEffect/event-handler wiring
// requires rendering a component to exercise and isn't covered by this
// node-only Vitest setup; that's checked by the manual walkthrough instead.
describe('persistence composition backing useBriefForm', () => {
  it('a changed field is saved and then loaded back', () => {
    const storage = new MemoryStorage();
    saveField('name', 'Ada Lovelace', storage);

    const loaded = briefFormReducer(initialBriefFormState, { type: 'load', values: loadSavedForm(storage) });
    expect(loaded.values.name).toBe('Ada Lovelace');
  });

  it('clearing removes previously saved values', () => {
    const storage = new MemoryStorage({ 'introForge:name': 'Ada Lovelace' });
    clearSavedForm(storage);

    const loaded = briefFormReducer(initialBriefFormState, { type: 'load', values: loadSavedForm(storage) });
    expect(loaded.values.name).toBe('');
  });
});
