import React from 'react';
import { getInputStyles, getFieldStyles, getErrorA11yProps } from '@/styles/className-utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', label, error, id, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && (
        <label htmlFor={id} className={fieldStyles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={getInputStyles(error, `block resize-y min-h-24 py-2.5 leading-normal ${className}`)}
        ref={ref}
        {...getErrorA11yProps(id, error)}
        {...props}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
