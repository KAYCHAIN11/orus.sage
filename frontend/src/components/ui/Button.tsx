import React from 'react';
import { orusColors } from '@/lib/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: `
    bg-blue-600 text-white
    hover:bg-blue-700
    active:bg-blue-800
    disabled:bg-gray-300 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  secondary: `
    bg-green-500 text-white
    hover:bg-green-600
    active:bg-green-700
    disabled:bg-gray-300 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  ghost: `
    bg-transparent text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-800
    active:bg-gray-200 dark:active:bg-gray-700
    disabled:text-gray-400 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  outline: `
    border-2 border-blue-600 text-blue-600
    hover:bg-blue-50 dark:hover:bg-blue-900/20
    active:bg-blue-100 dark:active:bg-blue-900/40
    disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700
    active:bg-red-800
    disabled:bg-gray-300 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-base font-medium rounded-lg',
  lg: 'px-6 py-3 text-lg font-semibold rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className || ''}
          flex items-center justify-center gap-2
          font-inter
        `}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
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
