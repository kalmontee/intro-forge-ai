import React from 'react';
import { getInputStyles, getDescriptionA11yProps } from '@/styles/className-utils';
import { Field } from './field';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', label, hint, error, id, ...props }, ref) => (
  <Field id={id} label={label} hint={hint} error={error}>
    <textarea
      id={id}
      className={getInputStyles(error, `block resize-y min-h-24 py-2.5 leading-normal ${className}`)}
      ref={ref}
      {...getDescriptionA11yProps(id, error, hint)}
      {...props}
    />
  </Field>
));

Textarea.displayName = 'Textarea';

export { Textarea };
