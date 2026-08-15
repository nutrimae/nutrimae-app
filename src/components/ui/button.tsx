import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 disabled:bg-sage-200 disabled:text-sage-50",
  secondary:
    "bg-peach-200 text-brown-800 hover:bg-peach-300 active:bg-peach-400 disabled:bg-peach-100 disabled:text-brown-700/50",
  ghost:
    "bg-transparent text-brown-700 hover:bg-sage-50 active:bg-sage-100 disabled:text-brown-700/40",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`min-h-14 w-full rounded-2xl px-6 text-lg font-semibold font-heading transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
