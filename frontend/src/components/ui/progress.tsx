import React from 'react';
import clsx from 'clsx';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={clsx('w-full bg-muted rounded-full h-2', className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
