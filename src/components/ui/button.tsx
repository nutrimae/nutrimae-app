import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "brand" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 disabled:bg-sage-200 disabled:text-sage-50",
  secondary:
    "bg-transparent text-brown-800 border-2 border-peach-400 hover:bg-peach-100 active:bg-peach-200 disabled:border-peach-200 disabled:text-brown-700/50",
  ghost:
    "bg-transparent text-brown-700 hover:bg-sage-50 active:bg-sage-100 disabled:text-brown-700/40",
  /** Cor do tema do bebê ativo (rosa/azul) — usada em CTAs de destaque. */
  brand:
    "bg-primary-500 text-white shadow-md shadow-primary-500/20 hover:bg-primary-hover active:bg-primary-hover disabled:bg-primary-100 disabled:text-white/70",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-4 text-sm rounded-lg",
  md: "min-h-12 px-6 text-base rounded-xl",
  lg: "min-h-14 px-8 text-lg rounded-xl",
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
        className={`w-full font-semibold font-heading transition-[background-color,transform,box-shadow] duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
