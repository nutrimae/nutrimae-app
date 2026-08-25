"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Plus, X } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { formatAge } from "@/lib/age";

function BabyAvatar({ name, photoUrl, size = 40 }: { name: string; photoUrl: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-primary-200"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary-50 font-heading font-bold text-primary-500 ring-2 ring-primary-200"
      style={{ width: size, height: size, fontSize: size / 2.2 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function BabySwitcher() {
  const { babies, activeBaby, setActiveBabyId } = useActiveBaby();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!activeBaby) return null;
  // A Home possui o cabeçalho completo da referência (avatar, saudação e logo).
  // Evita duplicar informações e preserva mais área útil no primeiro viewport.
  if (pathname === "/app") return null;
  if (pathname.startsWith("/app/alergia")) return null;
  if (pathname.startsWith("/app/sos-desmame")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => babies.length > 1 && setOpen(true)}
          className="flex min-h-11 items-center gap-2.5 rounded-2xl px-1 py-1 transition-colors active:bg-gray-50"
        >
          <BabyAvatar name={activeBaby.name} photoUrl={activeBaby.photo_url} size={36} />
          <div className="text-left">
            <p className="font-heading text-sm font-bold leading-tight text-brown-800">
              {activeBaby.name}
            </p>
            <p className="text-[11px] leading-tight text-brown-700/82">
              {formatAge(activeBaby.birth_date)}
            </p>
          </div>
          {babies.length > 1 && (
            <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-brown-700/30" strokeWidth={2} />
          )}
        </button>

        <Link href="/app" className="shrink-0">
          <Image
            src="/nutrimae-logo.png"
            alt="NutriMãe"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
          />
        </Link>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="w-full animate-fade-in-up rounded-t-3xl bg-white p-6 pb-8 shadow-strong"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-brown-800">Seus bebês</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-brown-700" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  type="button"
                  onClick={() => {
                    setActiveBabyId(baby.id);
                    setOpen(false);
                  }}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 transition-all duration-200 ${
                    baby.id === activeBaby.id
                      ? "bg-primary-50 ring-2 ring-primary-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <BabyAvatar name={baby.name} photoUrl={baby.photo_url} size={48} />
                  <div className="text-left">
                    <p className="font-heading text-lg font-bold text-brown-800">
                      {baby.name}
                    </p>
                    <p className="text-sm text-brown-700/86">{formatAge(baby.birth_date)}</p>
                  </div>
                </button>
              ))}
            </div>

            <Link
              href="/onboarding/baby"
              className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-200 text-base font-semibold text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              Adicionar bebê
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
