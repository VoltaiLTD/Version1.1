import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullOnMobile?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullOnMobile = true,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-black/90 focus-visible:ring-black',
    secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100 focus-visible:ring-neutral-400',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500',
    text: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 md:h-10 px-4 md:px-5 text-base md:text-sm',
    lg: 'h-12 px-6 text-lg',
  };
  
  const responsiveClasses = fullOnMobile ? 'w-full md:w-auto' : '';
  
  const computedClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    responsiveClasses,
    className
  );

  return (
    <button 
      ref={ref}
      className={computedClasses} 
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };