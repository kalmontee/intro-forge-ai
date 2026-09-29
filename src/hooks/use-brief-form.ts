'use client';

import { useEffect, useReducer } from 'react';
import { briefFormReducer, initialBriefFormState } from '@/lib/brief-form';
import { browserStorage, clearSavedForm, loadSavedForm, saveField, type FormStorage } from '@/lib/form-storage';
import { validateBrief, type BriefFieldName, type IntroBrief } from '@/lib/intro-request-fields';

export interface UseBriefFormResult {
  values: IntroBrief;
  errors: Record<string, string[]>;
  change: (field: BriefFieldName, value: string) => void;
  clear: () => void;
  validate: () => Record<string, string[]>;
}

export function useBriefForm(storage: FormStorage | null = browserStorage()): UseBriefFormResult {
  const [state, dispatch] = useReducer(briefFormReducer, initialBriefFormState);

  useEffect(() => {
    dispatch({ type: 'load', values: loadSavedForm(storage) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (field: BriefFieldName, value: string) => {
    saveField(field, value, storage);
    dispatch({ type: 'change', field, value });
  };

  const clear = () => {
    clearSavedForm(storage);
    dispatch({ type: 'clear' });
  };

  const validate = (): Record<string, string[]> => {
    dispatch({ type: 'validate' });
    return validateBrief(state.values);
  };

  return { values: state.values, errors: state.errors, change, clear, validate };
}
