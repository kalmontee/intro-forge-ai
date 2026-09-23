import type { IntroForgeFormData } from '@/types/form';

// Persists the intro form in localStorage, in this browser only. Every access
// is wrapped so private mode, disabled storage or a full quota degrade to "not
// saved" instead of breaking the form.

export const STORAGE_PREFIX = 'introForge:';

export const FORM_FIELD_NAMES = [
  'name',
  'selfIntroduction',
  'role',
  'company',
  'recipient',
  'messageType',
  'tone',
  'additionalContext',
] as const satisfies readonly (keyof IntroForgeFormData)[];

export type FormStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export const EMPTY_FORM: IntroForgeFormData = {
  name: '',
  selfIntroduction: '',
  role: '',
  company: '',
  recipient: '',
  messageType: '',
  tone: '',
  additionalContext: '',
};

const storageKey = (field: string) => `${STORAGE_PREFIX}${field}`;

// Returns window.localStorage, or null when it does not exist (server render)
// or the browser refuses access to it.
export function browserStorage(): FormStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

// Earlier versions saved each field under its bare name ("name", "role", ...).
// Move those values to the prefixed keys once so returning users keep their
// saved form, and so clearing only has one set of keys to look for.
function migrateLegacyKeys(storage: FormStorage): void {
  for (const field of FORM_FIELD_NAMES) {
    const legacy = storage.getItem(field);
    if (legacy === null) continue;
    if (storage.getItem(storageKey(field)) === null) {
      storage.setItem(storageKey(field), legacy);
    }
    storage.removeItem(field);
  }
}

export function loadSavedForm(storage: FormStorage | null = browserStorage()): IntroForgeFormData {
  if (!storage) return { ...EMPTY_FORM };

  try {
    migrateLegacyKeys(storage);
    const saved = { ...EMPTY_FORM };

    for (const field of FORM_FIELD_NAMES) {
      saved[field] = storage.getItem(storageKey(field)) ?? '';
    }

    return saved;
  } catch {
    return { ...EMPTY_FORM };
  }
}

// Saves one field; an empty value removes it rather than storing "".
export function saveField(field: string, value: string, storage: FormStorage | null = browserStorage()): void {
  if (!storage) return;

  try {
    if (value === '') {
      storage.removeItem(storageKey(field));
    } else {
      storage.setItem(storageKey(field), value);
    }
  } catch {
    // Quota exceeded or storage disabled: the form keeps working unsaved.
  }
}

// Removes every saved form value, including any legacy unprefixed keys, and
// nothing else stored on this origin.
export function clearSavedForm(storage: FormStorage | null = browserStorage()): void {
  if (!storage) return;

  try {
    const prefixed: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) prefixed.push(key);
    }

    for (const key of prefixed) storage.removeItem(key);
    for (const field of FORM_FIELD_NAMES) storage.removeItem(field);
  } catch {
    // Nothing more can be done if storage refuses access.
  }
}
