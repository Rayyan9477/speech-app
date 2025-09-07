import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onValueChange([newValue]);
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
          "slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:bg-primary slider-thumb:rounded-full slider-thumb:cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`
        }}
      />
    </div>
  );
};

export { Slider };