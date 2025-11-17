import React from 'react';
import { getInputStyles, getFieldStyles } from '@/styles/className-utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', label, error, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && <label className={fieldStyles.label}>{label}</label>}
      <input className={getInputStyles(error, `h-10 ${className}`)} ref={ref} {...props} />
      {error && <p className={fieldStyles.error}>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
