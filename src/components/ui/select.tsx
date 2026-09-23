import React from 'react';
import { getInputStyles, getFieldStyles, getErrorA11yProps } from '@/styles/className-utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', label, error, options, children, id, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && (
        <label htmlFor={id} className={fieldStyles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={getInputStyles(error, `select-chevron h-10 cursor-pointer appearance-none pr-10 ${className}`)}
        ref={ref}
        {...getErrorA11yProps(id, error)}
        {...props}
      >
        {children ||
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {error && (
        <p id={id ? `${id}-error` : undefined} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
