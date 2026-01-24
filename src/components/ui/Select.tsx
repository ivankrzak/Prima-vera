"use client";

import { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className = "", label, error, options, placeholder, id, ...props },
    ref,
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-lg border bg-[var(--color-bg)] px-3 py-2.5 text-[var(--color-text)] transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-[var(--color-border)] focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
