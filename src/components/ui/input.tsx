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
            className="mb-2 block text-base font-semibold text-brown-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`min-h-14 w-full rounded-2xl border-2 border-sage-100 bg-white px-5 text-lg text-brown-800 placeholder:text-brown-700/40 outline-none transition-colors focus:border-sage-400 ${
            error ? "border-terracotta-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm font-medium text-terracotta-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
