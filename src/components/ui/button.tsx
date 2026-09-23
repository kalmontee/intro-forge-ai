import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const baseStyles = [
  'inline-flex items-center justify-center gap-2 rounded-field font-medium transition-colors cursor-pointer',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');

const variants = {
  primary: 'bg-forge text-white hover:bg-forge-hover disabled:hover:bg-forge',
  secondary: 'bg-slate text-white hover:bg-slate/90',
  outline: 'border border-line bg-surface text-slate hover:bg-canvas',
};

const sizes = {
  sm: 'h-8 px-3 text-meta',
  md: 'h-10 px-4 text-ui',
  lg: 'h-11 px-5 text-ui',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isDisabled} ref={ref} {...props}>
        {loading && (
          <svg className="animate-spin h-4 w-4 motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
