"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, FileText, Lock, ShieldCheck, Upload, Video, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast-provider";
import { useLocale } from "@/lib/use-locale";

interface CommunityVideoModalProps {
  foodId: string;
  foodName: string;
  babyAgeMonths: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CommunityVideoModal({
  foodId,
  foodName,
  babyAgeMonths,
  isOpen,
  onClose,
  onSuccess,
}: CommunityVideoModalProps) {
  const { showToast } = useToast();
  const { locale } = useLocale();
  const es = locale === "es";
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ageMonths, setAgeMonths] = useState<number>(babyAgeMonths || 12);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast(es ? "Por favor, selecciona un archivo de video (MP4, MOV o WebM)." : "Por favor, selecione um arquivo de vídeo (MP4, MOV ou WebM).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast(es ? "El video debe tener como máximo 50MB (cerca de 10 a 15 segundos)." : "O vídeo deve ter no máximo 50MB (cerca de 10 a 15 segundos).");
      return;
    }

    setUploadingFile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast(es ? "Inicia sesión para enviar un video." : "Faça login para enviar um vídeo.");
        return;
      }

      const fileExt = file.name.split(".").pop() || "mp4";
      const filePath = `${user.id}/${foodId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("food-videos")
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Storage upload error", error);
        showToast(es ? "No fue posible enviar el video. Intenta de nuevo." : "Não foi possível enviar o vídeo. Tente de novo.");
        return;
      }

      // O bucket é privado — guardamos o CAMINHO, nunca uma URL pública.
      // A reprodução (inclusive a prévia aqui no formulário) sempre passa
      // por uma URL assinada de curta duração via /api/videos/[id].
      setUploadedPath(data.path);
      setUploadedFileName(file.name);
      setVideoUrl("");
      showToast(es ? "✓ ¡Video cargado con éxito!" : "✓ Vídeo carregado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast(es ? "Error al procesar el video." : "Erro ao processar vídeo.");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valueToSubmit = uploadedPath || videoUrl.trim();
    if (!valueToSubmit) {
      showToast(es ? "Por favor, indica la URL del video o envía un archivo." : "Por favor, informe a URL do vídeo ou envie um arquivo.");
      return;
    }

    if (!termsAccepted) {
      showToast(es ? "Necesitas aceptar los términos de autorización de uso de imagen." : "Você precisa aceitar os termos de autorização de uso de imagem.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/videos/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_id: foodId,
          baby_age_months: ageMonths,
          video_url: valueToSubmit,
          terms_accepted: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (es ? "Error al enviar el video." : "Erro ao enviar vídeo."));
      }

      setSubmitted(true);
      showToast(es ? "✓ ¡Video enviado para moderación!" : "✓ Vídeo enviado para moderação!");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (es ? "Error al enviar el video." : "Erro ao enviar vídeo.");
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <Video className="h-4 w-4" />
            </span>
            <h3 className="font-heading text-lg font-bold text-brown-800">
              {es ? `Compartir Video de ${foodName}` : `Compartilhar Vídeo de ${foodName}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-brown-700/86"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="mt-3 font-heading text-xl font-bold text-brown-800">
              {es ? "¡Video Recibido con Éxito!" : "Vídeo Recebido com Sucesso!"}
            </h4>
            <p className="mt-2 text-sm text-brown-700">
              {es ? (
                <>Tu video de <strong>{foodName}</strong> entró en la fila de moderación de nuestro equipo técnico de nutricionistas y pediatras.</>
              ) : (
                <>Seu vídeo de <strong>{foodName}</strong> entrou na fila de moderação de nossa equipe técnica de nutricionistas e pediatras.</>
              )}
            </p>
            <p className="mt-1 text-xs text-brown-700/90">
              {es
                ? "En cuanto sea revisado y aprobado con enfoque en seguridad alimentaria, será publicado en la ficha de corte seguro para inspirar a otras familias. Puedes solicitar la eliminación en cualquier momento."
                : "Assim que for revisado e aprovado com foco em segurança alimentar, ele será publicado na ficha de corte seguro para inspirar outras famílias. Você pode solicitar a remoção a qualquer momento."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 min-h-12 w-full rounded-2xl bg-sage-500 font-bold text-white shadow-sm"
            >
              {es ? "Finalizar" : "Concluir"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Guidelines info */}
            <div className="rounded-2xl bg-sage-50 p-3.5 text-xs text-sage-800">
              <div className="flex items-center gap-1.5 font-bold text-sage-900">
                <ShieldCheck className="h-4 w-4 text-sage-600" />
                <span>{es ? "Pautas para aprobación rápida" : "Diretrizes para aprovação rápida"}</span>
              </div>
              <ul className="mt-1.5 list-disc pl-4 space-y-1 text-brown-700/90">
                {es ? (
                  <>
                    <li>Video corto (10 a 15 segundos) mostrando la toma y la masticación.</li>
                    <li>El foco principal es el alimento y el formato del corte (el rostro del bebé es opcional).</li>
                    <li>El niño debe estar bien posicionado (silla 90°), sin juguetes ni pantallas.</li>
                  </>
                ) : (
                  <>
                    <li>Vídeo curto (10 a 15 segundos) mostrando a pega e mastigação.</li>
                    <li>O foco principal é o alimento e o formato do corte (o rosto do bebê é opcional).</li>
                    <li>A criança deve estar bem posicionada (cadeirão 90°), sem brinquedos ou telas.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Baby Age Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-brown-700">
                {es ? "Edad del bebé en el momento de la grabación" : "Idade do bebê no momento da gravação"}
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min={6}
                  max={48}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="min-h-12 w-28 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-center text-base font-bold text-brown-800 focus:border-sage-500 focus:bg-white"
                />
                <span className="text-sm font-semibold text-brown-700">{es ? "meses" : "meses"}</span>
              </div>
            </div>

            {/* Upload or URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-brown-700">
                {es ? "Archivo de Video (10-15s) o Link" : "Arquivo de Vídeo (10-15s) ou Link"}
              </label>

              <div className="mt-1.5 flex flex-col gap-2">
                <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/40 p-3 text-center hover:bg-sage-50">
                  <Upload className="h-5 w-5 text-sage-600" />
                  <span className="mt-1 text-xs font-semibold text-brown-800">
                    {uploadingFile
                      ? (es ? "Cargando archivo..." : "Carregando arquivo...")
                      : uploadedFileName
                        ? `✓ ${uploadedFileName}`
                        : (es ? "Toca para elegir el video del celular" : "Toque para escolher o vídeo do celular")}
                  </span>
                  <span className="text-[11px] text-brown-700/86">{es ? "MP4, MOV hasta 50MB" : "MP4, MOV até 50MB"}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>

                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setUploadedPath(null);
                      setUploadedFileName(null);
                    }}
                    disabled={Boolean(uploadedPath)}
                    placeholder={es ? "O pega la URL directa del video (ej: .mp4)" : "Ou cole a URL direta do vídeo (ex: .mp4)"}
                    className="min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs text-brown-800 focus:border-sage-500 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Image Rights Terms (Must not be pre-checked) */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms_consent"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
                />
                <label htmlFor="terms_consent" className="text-xs text-brown-800 leading-snug cursor-pointer">
                  {es ? (
                    <>Declaro que soy la persona responsable legal del bebé y <strong>autorizo expresamente el uso de la imagen/video</strong> en la aplicación NutriMãe exclusivamente para fines educativos de introducción alimentaria.</>
                  ) : (
                    <>Declaro que sou o(a) responsável legal pelo bebê e <strong>autorizo expressamente o uso da imagem/vídeo</strong> no aplicativo NutriMãe exclusivamente para fins educativos de introdução alimentar.</>
                  )}
                </label>
              </div>

              <button
                type="button"
                onClick={() => setTermsExpanded(!termsExpanded)}
                className="mt-2 text-[11px] font-semibold text-amber-800 underline decoration-amber-400"
              >
                {es
                  ? (termsExpanded ? "Ocultar texto íntegro del término" : "Leer término de autorización completo")
                  : (termsExpanded ? "Ocultar texto integral do termo" : "Ler termo de autorização completo")}
              </button>

              {termsExpanded && (
                <div className="mt-2 max-h-32 overflow-y-auto rounded-xl bg-white p-2.5 text-[11px] text-brown-700/80 border border-amber-100">
                  <p className="font-bold text-brown-800">{es ? "TÉRMINO DE CESIÓN Y AUTORIZACIÓN DE USO DE IMAGEN" : "TERMO DE CESSÃO E AUTORIZAÇÃO DE USO DE IMAGEM"}</p>
                  <p className="mt-1">
                    {es
                      ? "Por el presente instrumento, la persona responsable declara que tiene la patria potestad/guarda del(a) menor y autoriza, a título gratuito y de forma no exclusiva, la exhibición del video enviado en la plataforma NutriMãe. El video pasará por moderación previa y no será comercializado individualmente. La persona responsable podrá, en cualquier momento, revocar este consentimiento y solicitar la eliminación definitiva del contenido a través de los canales de soporte o eliminación en la app."
                      : "Pelo presente instrumento, a pessoa responsável declara que detém o pátrio poder/guarda do(a) menor e autoriza, a título gratuito e de forma não exclusiva, a exibição do vídeo enviado na plataforma NutriMãe. O vídeo passará por moderação prévia e não será comercializado individualmente. A responsável poderá, a qualquer tempo, revogar este consentimento e solicitar a exclusão definitiva do conteúdo através dos canais de suporte ou exclusão no app."}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting || uploadingFile || !(uploadedPath || videoUrl) || !termsAccepted}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-bold text-white shadow-sm disabled:opacity-50"
              >
                {submitting
                  ? (es ? "Enviando..." : "Enviando...")
                  : (es ? "Enviar Video para Moderación" : "Enviar Vídeo para Moderação")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 text-xs font-semibold text-brown-700"
              >
                {es ? "Cancelar" : "Cancelar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
