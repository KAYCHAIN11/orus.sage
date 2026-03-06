import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'error' | 'success';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, variant = 'default', className, ...props }, ref) => {
    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 border rounded-lg
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:bg-gray-100 dark:disabled:bg-gray-700
            disabled:cursor-not-allowed disabled:text-gray-400
            transition-colors duration-200
            ${variantClasses[variant]}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
