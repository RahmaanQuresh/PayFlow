import React from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-bold text-destructive">{error}</p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ className = "", error, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border-2 bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-200 ${
          error
            ? "border-destructive focus:border-destructive focus:shadow-[4px_4px_0px_0px_#EF4444]"
            : "border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6]"
        } ${className}`}
        {...props}
      />
    );
  }
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  error?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect({ className = "", options, error, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl border-2 bg-card px-4 py-2.5 text-sm font-medium focus:outline-none transition-all duration-200 ${
          error
            ? "border-destructive focus:border-destructive focus:shadow-[4px_4px_0px_0px_#EF4444]"
            : "border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6]"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  function FormTextarea({ className = "", error, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-xl border-2 bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-200 resize-none ${
          error
            ? "border-destructive focus:border-destructive focus:shadow-[4px_4px_0px_0px_#EF4444]"
            : "border-foreground focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6]"
        } ${className}`}
        {...props}
      />
    );
  }
);
