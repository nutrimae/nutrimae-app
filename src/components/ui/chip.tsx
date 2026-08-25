import { HTMLAttributes, ReactNode } from "react";

type ChipColor = "sage" | "primary" | "amber" | "neutral";
type ChipVariant = "soft" | "solid";

const COLOR_CLASSES: Record<ChipVariant, Record<ChipColor, string>> = {
  soft: {
    sage: "bg-sage-50 text-sage-700",
    primary: "bg-primary-50 text-primary-500",
    amber: "bg-amber-50 text-amber-600",
    neutral: "bg-gray-50 text-brown-700",
  },
  solid: {
    sage: "bg-sage-500 text-white",
    primary: "bg-primary-500 text-white",
    amber: "bg-amber-500 text-white",
    neutral: "bg-brown-700 text-white",
  },
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
  variant?: ChipVariant;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Selo de fase/destaque em pílula — ver DESIGN.md "Named Rules: No-Sharp-
 * Corner" (sempre rounded-full) e a família de cores sage/primary/amber/
 * neutral já usada em 8+ telas antes desta extração.
 */
export function Chip({ color = "neutral", variant = "soft", icon, children, className = "", ...props }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight ${COLOR_CLASSES[variant][color]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
