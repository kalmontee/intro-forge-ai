import React from 'react';
import { getInputStyles, getDescriptionA11yProps } from '@/styles/className-utils';
import { Field } from './field';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', label, hint, error, options, children, id, ...props }, ref) => (
  <Field id={id} label={label} hint={hint} error={error}>
    <select
      id={id}
      className={getInputStyles(error, `select-chevron h-10 cursor-pointer appearance-none pr-10 ${className}`)}
      ref={ref}
      {...getDescriptionA11yProps(id, error, hint)}
      {...props}
    >
      {children ||
        options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
    </select>
  </Field>
));

Select.displayName = 'Select';

export { Select };
