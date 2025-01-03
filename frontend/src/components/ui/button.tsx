import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    default:
      'bg-primary text-primary-foreground hover:bg-secondary',
    outline:
      'border border-primary text-primary hover:bg-muted',
    link:
      'text-primary underline-offset-4 hover:underline',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-md',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};