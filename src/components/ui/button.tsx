import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "brand" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 disabled:bg-sage-200 disabled:text-sage-50",
  secondary:
    "bg-transparent text-brown-800 border-2 border-primary-300/50 hover:bg-primary-50 active:bg-primary-100 disabled:border-primary-100 disabled:text-brown-700/82",
  ghost:
    "bg-transparent text-brown-700 hover:bg-sage-50 active:bg-sage-100 disabled:text-brown-700/78",
  brand:
    "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_16px_var(--color-primary-shadow)] hover:shadow-[0_6px_24px_var(--color-primary-glow)] active:shadow-sm disabled:from-primary-100 disabled:to-primary-100 disabled:text-white/70 disabled:shadow-none",
  danger:
    "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 disabled:from-red-200 disabled:to-red-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-4 text-sm rounded-xl",
  md: "min-h-12 px-6 text-base rounded-xl",
  lg: "min-h-14 px-8 text-base rounded-2xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "lg", loading = false, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`w-full font-semibold font-heading transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";
