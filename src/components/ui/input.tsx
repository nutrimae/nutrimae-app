import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-semibold text-brown-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`min-h-13 w-full rounded-2xl border-2 border-sage-100/80 bg-white/80 px-4 text-base text-brown-800 placeholder:text-brown-700/30 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_var(--color-primary-glow)] ${
            error ? "border-red-400" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
