import React from 'react';
import { getInputStyles, getDescriptionA11yProps } from '@/styles/className-utils';
import { Field } from './field';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', label, hint, error, id, ...props }, ref) => (
  <Field id={id} label={label} hint={hint} error={error}>
    <input id={id} className={getInputStyles(error, `h-10 ${className}`)} ref={ref} {...getDescriptionA11yProps(id, error, hint)} {...props} />
  </Field>
));

Input.displayName = 'Input';

export { Input };
