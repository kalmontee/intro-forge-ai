import React from 'react';
import { getFieldStyles } from '@/styles/className-utils';

export interface FieldProps {
  id?: string;
  label?: string;
  labelId?: string; // Set for controls labelled with aria-labelledby instead of <label for>
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

// Shared label, hint, and error layout for form controls.
// Hint and error ids match getDescriptionA11yProps so controls can reference them.
const Field: React.FC<FieldProps> = ({ id, label, labelId, hint, error, children }) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label &&
        (labelId ? (
          <span id={labelId} className={fieldStyles.label}>
            {label}
          </span>
        ) : (
          <label htmlFor={id} className={fieldStyles.label}>
            {label}
          </label>
        ))}
      {children}
      {hint && (
        <p id={id ? `${id}-hint` : undefined} className={fieldStyles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={id ? `${id}-error` : undefined} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  );
};

export { Field };
