import React from 'react';
import { getInputStyles, getFieldStyles } from '@/styles/className-utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', label, error, options, children, ...props }, ref) => {
  const fieldStyles = getFieldStyles();

  return (
    <div className={fieldStyles.container}>
      {label && <label className={fieldStyles.label}>{label}</label>}
      <select className={getInputStyles(error, `cursor-pointer appearance-none py-[7px] px-[12px] ${className}`)} ref={ref} {...props}>
        {children ||
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {error && <p className={fieldStyles.error}>{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
