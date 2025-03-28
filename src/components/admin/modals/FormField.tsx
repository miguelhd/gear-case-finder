import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder = '',
  required = false,
  error,
  options = [],
  min,
  max
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={id}
            rows={3}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border ${
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            name={id}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            value={value}
            onChange={onChange}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            id={id}
            name={id}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border ${
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            max={max}
          />
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
