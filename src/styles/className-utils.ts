// Shared className utilities for consistent styling across components

// Base form control styles
export const baseInputStyles = [
  'w-full rounded-field border bg-surface px-3 text-ui text-slate transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-1',
  'disabled:bg-canvas disabled:text-muted',
].join(' ');

// Border and focus colors: exactly one of these is applied so they never compete
export const validInputStyles = 'border-line hover:border-muted/50 focus-visible:border-forge focus-visible:outline-forge';
export const errorInputStyles = 'border-error focus-visible:outline-error';
export const errorTextStyles = 'text-meta text-error';

export const labelStyles = 'block text-ui font-medium text-slate';
export const fieldContainerStyles = 'space-y-1.5';
export const placeholderStyles = 'placeholder:text-muted/80';
export const bulletListItemStyles = "pl-5 relative relative pl-6 before:content-['•'] before:absolute before:left-2 before:font-bold";
export const displayMessageStyles = 'whitespace-pre-wrap text-body leading-[1.7] text-slate max-w-[65ch]';

// Utility function to combine base styles with conditional error styles
export const getInputStyles = (error?: string, additionalClasses?: string) => {
  const baseClasses = `${baseInputStyles} ${placeholderStyles}`;
  const stateClasses = error ? errorInputStyles : validInputStyles;
  const extraClasses = additionalClasses || '';

  return `${baseClasses} ${stateClasses} ${extraClasses}`.trim();
};

// Utility function for consistent form field structure classes
export const getFieldStyles = () => ({
  container: fieldContainerStyles,
  label: labelStyles,
  error: errorTextStyles,
});

// Accessibility attributes that link a control to its error message
export const getErrorA11yProps = (id: string | undefined, error?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error && id ? `${id}-error` : undefined,
});
