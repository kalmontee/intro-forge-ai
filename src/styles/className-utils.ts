// Shared className utilities for consistent styling across components

// Base form input styles
export const baseInputStyles = [
  'w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-[14px] text-black',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-50 disabled:text-gray-500',
].join(' ');

// Error state styles
export const errorInputStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';
export const errorTextStyles = 'text-sm text-red-600';

export const labelStyles = 'block text-sm text-[var(--label)] font-semibold text-gray-700';
export const fieldContainerStyles = 'space-y-2';
export const placeholderStyles = 'placeholder-gray-400 placeholder:text-xs';
export const bulletListItemStyles = "pl-5 relative relative pl-6 before:content-['•'] before:absolute before:left-2 before:font-bold";
export const displayMessageStyles = 'whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md overflow-y-auto max-h-full';

// Utility function to combine base styles with conditional error styles
export const getInputStyles = (error?: string, additionalClasses?: string) => {
  const baseClasses = `${baseInputStyles} ${placeholderStyles}`;
  const errorClasses = error ? errorInputStyles : '';
  const extraClasses = additionalClasses || '';

  return `${baseClasses} ${errorClasses} ${extraClasses}`.trim();
};

// Utility function for consistent form field structure classes
export const getFieldStyles = () => ({
  container: fieldContainerStyles,
  label: labelStyles,
  error: errorTextStyles,
});
