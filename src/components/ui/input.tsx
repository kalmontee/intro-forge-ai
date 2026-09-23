import React from 'react';
import { getInputStyles, getFieldStyles, getErrorA11yProps } from '@/styles/className-utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', label, error, id, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && (
        <label htmlFor={id} className={fieldStyles.label}>
          {label}
        </label>
      )}
      <input id={id} className={getInputStyles(error, `h-10 ${className}`)} ref={ref} {...getErrorA11yProps(id, error)} {...props} />
      {error && (
        <p id={id ? `${id}-error` : undefined} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
