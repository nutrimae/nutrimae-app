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
    router.push("/onboarding/tour");
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

    const {
      data: { publicUrl },
    } = supabase.storage.from("baby-photos").getPublicUrl(path);

    await supabase.from("babies").update({ photo_url: publicUrl }).eq("id", babyId);

    setLoading(false);
    goNext();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-cream px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center text-center">
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Uma foto do bebê?
        </h1>
        <p className="mt-2 text-brown-700">
          Ela aparece no app para deixar tudo mais afetivo. Totalmente opcional.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-sage-200 bg-white transition-colors hover:border-sage-400"
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
            <Camera className="h-10 w-10 text-sage-400" strokeWidth={1.5} />
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
          className="mt-4 min-h-12 text-base font-semibold text-sage-600"
        >
          {preview ? "Escolher outra foto" : "Escolher foto"}
        </button>

        {error && <p className="mt-4 text-sm font-medium text-terracotta-600">{error}</p>}
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={2} total={4} />
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} disabled={loading}>
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
