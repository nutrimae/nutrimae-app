"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({
  label = "Voltar",
  fallbackHref = "/app/mais",
  className = "",
}: {
  label?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={`flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}
