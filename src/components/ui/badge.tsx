import { HTMLAttributes } from "react";

type Variant = "solid" | "outline" | "soft";

const variantClasses: Record<Variant, string> = {
  solid: "bg-primary-500 text-white",
  outline: "border border-primary-500 text-primary-600 bg-transparent",
  soft: "bg-primary-100 text-primary-600",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "soft", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`type-tiny inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
