import React from 'react';

export interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  indeterminate?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  indeterminate = false
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={`flex items-center ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <label htmlFor={id} className={`ml-2 block text-sm text-gray-700 dark:text-gray-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
