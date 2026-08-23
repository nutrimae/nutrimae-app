"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";

export default function PhotoStepPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function goNext() {
    router.push("/onboarding/region");
  }

  async function handleSave() {
    setError(null);

    if (!file) {
      goNext();
      return;
    }

    const babyId = sessionStorage.getItem("nutrimae_onboarding_baby_id");
    if (!babyId) {
      goNext();
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${babyId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("baby-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setLoading(false);
      setError("Não deu para enviar a foto agora. Você pode adicionar depois.");
      return;
    }

    // Guardamos o caminho no storage, não uma URL: o bucket é privado e a
    // exibição da foto gera uma URL assinada (com expiração) sob demanda.
    await supabase.from("babies").update({ photo_url: path }).eq("id", babyId);

    setLoading(false);
    goNext();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center text-center">
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Uma foto do bebê?
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Ela aparece no app para deixar tudo mais afetivo. Totalmente opcional.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[3px] border-dashed border-primary-300/40 bg-white/60 shadow-subtle transition-all duration-200 hover:border-primary-300 hover:bg-white/80"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Prévia da foto do bebê"
              width={160}
              height={160}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <Camera className="h-10 w-10 text-primary-300" strokeWidth={1.5} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 min-h-11 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-hover"
        >
          {preview ? "Escolher outra foto" : "Escolher foto"}
        </button>

        {error && (
          <div className="animate-scale-in mt-4 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={3} total={6} />
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} disabled={loading} variant="brand">
            {loading ? "Enviando..." : file ? "Usar essa foto" : "Continuar"}
          </Button>
          {file && (
            <Button variant="ghost" onClick={goNext} disabled={loading}>
              Pular por enquanto
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
