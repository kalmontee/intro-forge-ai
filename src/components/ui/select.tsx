import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', label, error, options, children, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500
            text-black
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
        ref={ref}
        {...props}>
        {children ||
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
