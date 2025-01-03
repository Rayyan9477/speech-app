import React from 'react';
import clsx from 'clsx';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={clsx(
        'block w-full bg-input border border-border text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm',
        className
      )}
    >
      {children}
    </select>
  );
};

export const SelectTrigger: React.FC<{ className?: string }> = ({ children, className }) => (
  <div className={clsx('relative', className)}>
    {children}
  </div>
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="block truncate">{placeholder}</span>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute mt-1 w-full bg-white border border-border rounded-md shadow-lg z-10">
    {children}
  </div>
);

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => (
  <option value={value} className="block w-full px-4 py-2 text-left text-foreground hover:bg-muted">
    {children}
  </option>
);