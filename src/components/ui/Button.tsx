"use client";

import { forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] focus:ring-[var(--color-brand)]",
        secondary:
          "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] focus:ring-[var(--color-brand)]",
        ghost:
          "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)] focus:ring-[var(--color-brand)]",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        success:
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] focus:ring-[var(--color-accent)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant, size, isLoading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled ?? isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
