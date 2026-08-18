import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  depth?: "subtle" | "medium";
}

const depthClasses: Record<NonNullable<CardProps["depth"]>, string> = {
  subtle: "shadow-subtle",
  medium: "shadow-medium",
};

export function Card({ className = "", depth = "medium", ...props }: CardProps) {
  return (
    <div
      className={`lift-on-hover glass-card rounded-2xl p-5 ${depthClasses[depth]} ${className}`}
      {...props}
    />
  );
}
