import React from 'react';
import clsx from 'clsx';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center p-2 bg-primary text-primary-foreground rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;