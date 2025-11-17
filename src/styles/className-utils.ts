// Shared className utilities for consistent styling across components

// Base form input styles
export const baseInputStyles = [
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-50 disabled:text-gray-500 text-black',
].join(' ');

// Error state styles
export const errorInputStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';
export const errorTextStyles = 'text-sm text-red-600';

export const labelStyles = 'block text-sm font-medium text-gray-700';
export const fieldContainerStyles = 'space-y-2';
export const placeholderStyles = 'placeholder-gray-400';

// Focus ring utilities
export const focusRing = {
  blue: 'focus:ring-2 focus:ring-blue-500',
  red: 'focus:ring-2 focus:ring-red-500',
  gray: 'focus:ring-2 focus:ring-gray-500',
} as const;

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
