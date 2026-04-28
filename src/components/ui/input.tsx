"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Input ─────────────────────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 text-slate-900",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
          : "border-slate-200 hover:border-slate-300",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };

// ── Label ─────────────────────────────────────────────────────────

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-slate-700 mb-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export { Label };

// ── FieldError ────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

export { FieldError };

// ── FormField — composes Label + Input + FieldError ───────────────

interface FormFieldProps extends InputProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  hint?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, required, error, errorMessage, hint, id, ...inputProps }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-0">
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <Input id={fieldId} ref={ref} error={error} {...inputProps} />
        {hint && !errorMessage && (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        )}
        <FieldError message={errorMessage} />
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
