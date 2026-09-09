"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";

export function BackButton({
  label,
  fallbackHref = "/app/mais",
  className = "",
}: {
  label?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const resolvedLabel = label ?? (locale === "es" ? "Volver" : "Voltar");

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
      className={`flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-hover ${className}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
      {resolvedLabel}
    </button>
  );
}
