import React from 'react';
import { getInputStyles, getFieldStyles } from '@/styles/className-utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', label, error, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && <label className={fieldStyles.label}>{label}</label>}
      <textarea className={getInputStyles(error, `resize-vertical min-h-[60px] ${className}`)} ref={ref} {...props} />
      {error && <p className={fieldStyles.error}>{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
