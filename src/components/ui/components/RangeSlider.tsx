import React from 'react';

interface RangeSliderProps {
  id: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  showValue = true,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {showValue && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>
        )}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

export default RangeSlider;
