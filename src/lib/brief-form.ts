import { EMPTY_BRIEF, validateBrief, type BriefFieldName, type IntroBrief } from './intro-request-fields';

export interface BriefFormState {
  values: IntroBrief;
  errors: Record<string, string[]>;
}

export const initialBriefFormState: BriefFormState = { values: EMPTY_BRIEF, errors: {} };

export type BriefFormAction =
  | { type: 'change'; field: BriefFieldName; value: string }
  | { type: 'load'; values: IntroBrief }
  | { type: 'clear' }
  | { type: 'validate' };

// Pure state transitions for the intro brief form. Persisting to storage
// (save on change, load on mount, clear) is useBriefForm's job — it
// dispatches these same actions alongside its own storage calls, so this
// reducer never performs I/O.
export function briefFormReducer(state: BriefFormState, action: BriefFormAction): BriefFormState {
  switch (action.type) {
    case 'change': {
      const errors = { ...state.errors };
      delete errors[action.field];
      return { values: { ...state.values, [action.field]: action.value }, errors };
    }
    case 'load':
      return { values: action.values, errors: {} };
    case 'clear':
      return { values: { ...EMPTY_BRIEF }, errors: {} };
    case 'validate':
      return { ...state, errors: validateBrief(state.values) };
  }
}

// The order fields appear in the rendered form. Deliberately not
// Object.keys(BRIEF_FIELDS)'s table order, which groups role/company before
// recipient: this order drives which invalid field gets focus after a
// failed submit, and that should follow tab order, not the table.
export const BRIEF_FORM_FIELD_ORDER: readonly BriefFieldName[] = [
  'name',
  'selfIntroduction',
  'recipient',
  'role',
  'company',
  'messageType',
  'tone',
  'additionalContext',
];

export function firstInvalidField(
  errors: Record<string, string[]>,
  order: readonly BriefFieldName[] = BRIEF_FORM_FIELD_ORDER
): BriefFieldName | undefined {
  return order.find(field => (errors[field]?.length ?? 0) > 0);
}
