"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-sage-200 font-heading font-bold text-sage-700"
      style={{ width: size, height: size, fontSize: size / 2.2 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function BabySwitcher() {
  const { babies, activeBaby, setActiveBabyId } = useActiveBaby();
  const [open, setOpen] = useState(false);

  if (!activeBaby) return null;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sage-100 bg-cream/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => babies.length > 1 && setOpen(true)}
          className="flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1 active:bg-sage-50"
        >
          <BabyAvatar name={activeBaby.name} photoUrl={activeBaby.photo_url} />
          <div className="text-left">
            <p className="font-heading text-lg font-bold leading-tight text-brown-800">
              {activeBaby.name}
            </p>
            <p className="text-sm leading-tight text-brown-700/70">
              {formatAge(activeBaby.birth_date)}
            </p>
          </div>
          {babies.length > 1 && (
            <ChevronDown className="ml-1 h-5 w-5 text-brown-700/60" strokeWidth={2} />
          )}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-brown-900/30" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-3xl bg-cream p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-brown-800">Seus bebês</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50"
              >
                <X className="h-5 w-5 text-brown-700" strokeWidth={2} />
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
                  className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 transition-colors ${
                    baby.id === activeBaby.id ? "bg-sage-100" : "hover:bg-sage-50"
                  }`}
                >
                  <BabyAvatar name={baby.name} photoUrl={baby.photo_url} size={48} />
                  <div className="text-left">
                    <p className="font-heading text-lg font-bold text-brown-800">
                      {baby.name}
                    </p>
                    <p className="text-sm text-brown-700/70">{formatAge(baby.birth_date)}</p>
                  </div>
                </button>
              ))}
            </div>

            <Link
              href="/onboarding/baby"
              className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sage-200 text-base font-semibold text-sage-600"
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
