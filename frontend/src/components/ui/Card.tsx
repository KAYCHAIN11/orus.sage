import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variantClasses = {
      default: `
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-lg
      `,
      elevated: `
        bg-white dark:bg-gray-900
        rounded-lg
        shadow-md dark:shadow-xl
        hover:shadow-lg dark:hover:shadow-2xl
        transition-shadow duration-200
      `,
      outlined: `
        bg-transparent
        border-2 border-blue-600 dark:border-blue-500
        rounded-lg
      `,
    };

    return (
      <div
        ref={ref}
        className={`
          ${variantClasses[variant]}
          p-6
          transition-all duration-200
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
