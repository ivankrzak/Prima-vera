"use client";

import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-lg border bg-[var(--color-bg)] px-3 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-[var(--color-border)] focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {hint && !error && (
          <p className="text-sm text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
