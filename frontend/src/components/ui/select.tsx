import React from 'react';
import clsx from 'clsx';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className,
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${selectId}-label`;

  return (
    <select
      id={selectId}
      value={value}
      onChange={handleChange}
      aria-label="Please select an option from the dropdown menu"
      title="Select an option from the available choices"
      role="combobox"
      aria-expanded="false"
      aria-haspopup="listbox"
      className={clsx(
        'block w-full bg-input border border-border text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm',
        className
      )}
    >
        <option value="" disabled hidden aria-hidden="true">
          Select an option...
        </option>
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