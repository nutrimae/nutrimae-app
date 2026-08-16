import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** subtle = cards secundários, medium = cards principais (padrão) */
  depth?: "subtle" | "medium";
}

const depthShadow: Record<NonNullable<CardProps["depth"]>, string> = {
  subtle: "shadow-[var(--shadow-subtle)]",
  medium: "shadow-[var(--shadow-medium)]",
};

export function Card({ className = "", depth = "medium", ...props }: CardProps) {
  return (
    <div
      className={`lift-on-hover rounded-2xl bg-white p-5 ${depthShadow[depth]} ${className}`}
      {...props}
    />
  );
}
