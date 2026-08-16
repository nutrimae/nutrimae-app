"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, Check, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { Button } from "@/components/ui/button";

export function BabyPhotoUploadModal({
  babyId,
  onClose,
  onUploaded,
}: {
  babyId: string;
  onClose: () => void;
  onUploaded: (signedUrl: string) => void;
}) {
  const supabase = createClient();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return;
    setError(null);
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");

      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const path = `${user.id}/${babyId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("baby-photos")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      await supabase.from("babies").update({ photo_url: path }).eq("id", babyId);

      const { data: signedData } = await supabase.storage
        .from("baby-photos")
        .createSignedUrl(path, 3600);

      if (signedData?.signedUrl) {
        onUploaded(signedData.signedUrl);
      }
      onClose();
    } catch {
      setError("Não deu para salvar a foto agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-brown-900/40" onClick={onClose}>
      <div
        className="flex w-full flex-col rounded-t-3xl bg-cream p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-brown-800">Foto do bebê</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50"
          >
            <X className="h-5 w-5 text-brown-700" strokeWidth={2} />
          </button>
        </div>

        {!imageSrc ? (
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-100 text-center">
            <ImageIcon className="h-8 w-8 text-primary-600" strokeWidth={1.75} />
            <span className="font-semibold text-brown-800">Selecionar foto</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <>
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-brown-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <label className="mt-4 block text-sm font-semibold text-brown-700">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-1 w-full accent-primary-500"
            />

            {error && <p className="mt-3 text-sm font-medium text-terracotta-600">{error}</p>}

            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5" strokeWidth={2} />
                {saving ? "Salvando..." : "Salvar foto"}
              </Button>
              <Button variant="ghost" onClick={() => setImageSrc(null)} disabled={saving}>
                Escolher outra foto
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
