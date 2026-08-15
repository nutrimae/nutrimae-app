import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl bg-white/80 p-6 shadow-sm shadow-brown-900/5 ${className}`}
      {...props}
    />
  );
}
