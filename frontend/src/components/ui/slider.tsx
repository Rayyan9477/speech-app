import React from 'react';
import clsx from 'clsx';

interface SliderProps {
  value: [number];
  onValueChange: (value: number[]) => void;
  max: number;
  step?: number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  max,
  step = 1,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange([newValue]);
  };

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={clsx(
        'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
        className
      )}
    />
  );
};
