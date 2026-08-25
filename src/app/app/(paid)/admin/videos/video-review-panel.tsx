"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Video,
  XCircle,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { FOODS } from "@/lib/foods";
import { useToast } from "@/components/toast-provider";

export interface VideoRecord {
  id: string;
  food_id: string;
  baby_age_months?: number;
  video_url: string;
  video_tipo: "motion_graphic" | "comunidade";
  video_status: "pendente_moderacao" | "aprovado" | "rejeitado";
  user_id?: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

type StatusFilter = "pendente_moderacao" | "aprovado" | "rejeitado" | "all";

export function VideoReviewPanel() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pendente_moderacao");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<VideoRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function loadVideos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao carregar vídeos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, [statusFilter]);

  async function handleApprove(video: VideoRecord) {
    setActionLoading(video.id);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: video.id,
          action: "aprovar",
        }),
      });
      if (res.ok) {
        showToast("✓ Vídeo aprovado com sucesso!");
        loadVideos();
      } else {
        const data = await res.json();
        showToast(data.error || "Erro ao aprovar.");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao processar aprovação.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      showToast("Informe o motivo da rejeição.");
      return;
    }

    setActionLoading(rejectingItem.id);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectingItem.id,
          action: "rejeitar",
          rejection_reason: rejectionReason.trim(),
        }),
      });
      if (res.ok) {
        showToast("Vídeo rejeitado e registrado.");
        setRejectingItem(null);
        setRejectionReason("");
        loadVideos();
      } else {
        const data = await res.json();
        showToast(data.error || "Erro ao rejeitar.");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao processar rejeição.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(video: VideoRecord) {
    if (!confirm("Tem certeza que deseja excluir este vídeo definitivamente?")) return;

    setActionLoading(video.id);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: video.id,
          action: "excluir",
        }),
      });
      if (res.ok) {
        showToast("Vídeo excluído com sucesso.");
        loadVideos();
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao excluir vídeo.");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = useMemo(() => {
    return videos.filter((v) => v.video_status === "pendente_moderacao").length;
  }, [videos]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-brown-800">
            Moderação de Vídeos
          </h1>
          <button
            type="button"
            onClick={loadVideos}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-brown-700 active:bg-gray-200"
            title="Recarregar lista"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="mt-1 text-sm text-brown-700/90">
          Aprove ou rejeite vídeos enviados pela comunidade para as fichas de corte seguro.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter("pendente_moderacao")}
          className={`min-h-11 shrink-0 rounded-2xl px-4 text-xs font-bold transition-all ${
            statusFilter === "pendente_moderacao"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-50 text-brown-700"
          }`}
        >
          Pendentes
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("aprovado")}
          className={`min-h-11 shrink-0 rounded-2xl px-4 text-xs font-bold transition-all ${
            statusFilter === "aprovado"
              ? "bg-sage-600 text-white shadow-sm"
              : "bg-sage-50 text-brown-700"
          }`}
        >
          Aprovados
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("rejeitado")}
          className={`min-h-11 shrink-0 rounded-2xl px-4 text-xs font-bold transition-all ${
            statusFilter === "rejeitado"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 text-brown-700"
          }`}
        >
          Rejeitados
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`min-h-11 shrink-0 rounded-2xl px-4 text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-brown-800 text-white shadow-sm"
              : "bg-gray-100 text-brown-700"
          }`}
        >
          Todos
        </button>
      </div>

      {/* Videos List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-brown-700">
          <p>Carregando vídeos para moderação...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-3xl bg-white/80 p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto h-12 w-12 text-sage-500" />
          <h3 className="mt-3 font-heading text-lg font-bold text-brown-800">
            Nenhum vídeo nesta categoria
          </h3>
          <p className="mt-1 text-sm text-brown-700/90">
            {statusFilter === "pendente_moderacao"
              ? "Tudo em dia! Não há vídeos pendentes de revisão no momento."
              : "Não foram encontrados registros para o filtro selecionado."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => {
            const food = FOODS.find((f) => f.id === video.food_id);
            const foodName = food?.name || video.food_id;
            const foodEmoji = food?.emoji || "🍽️";

            return (
              <div
                key={video.id}
                className="overflow-hidden rounded-3xl bg-white/90 p-5 shadow-sm border border-brown-900/5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{foodEmoji}</span>
                    <div>
                      <h4 className="font-heading text-base font-bold text-brown-800">
                        {foodName}
                      </h4>
                      <p className="text-xs text-brown-700/90">
                        Bebê de {video.baby_age_months || "?"} meses · {video.video_tipo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                      video.video_status === "aprovado"
                        ? "bg-sage-100 text-sage-800"
                        : video.video_status === "rejeitado"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {video.video_status.replace("_", " ")}
                  </span>
                </div>

                {/* Video Player Preview */}
                <div className="mt-3 overflow-hidden rounded-2xl bg-black aspect-video">
                  <video
                    src={video.video_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Info / Terms */}
                <div className="mt-3 rounded-2xl bg-gray-50 p-3 text-xs text-brown-700">
                  <div className="flex items-center gap-1.5 text-sage-700 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Termo de uso de imagem aceito pelo responsável</span>
                  </div>
                  <p className="mt-1 text-[11px] text-brown-700/86">
                    Enviado em: {new Date(video.created_at).toLocaleString("pt-BR")}
                  </p>
                  {video.rejection_reason && (
                    <div className="mt-2 rounded-xl bg-rose-50 p-2 text-rose-800 border border-rose-100">
                      <strong>Motivo da rejeição:</strong> {video.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(video)}
                    disabled={actionLoading === video.id}
                    className="flex h-10 items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {video.video_status !== "rejeitado" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectingItem(video);
                          setRejectionReason("");
                        }}
                        disabled={actionLoading === video.id}
                        className="text-xs text-rose-600 border border-rose-200 hover:bg-rose-50"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Rejeitar
                      </Button>
                    )}

                    {video.video_status !== "aprovado" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(video)}
                        disabled={actionLoading === video.id}
                        className="bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Aprovar Vídeo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 p-4 backdrop-blur-[2px]"
          onClick={() => setRejectingItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold text-brown-800">
              Registrar Motivo da Rejeição
            </h3>
            <p className="mt-1 text-xs text-brown-700/90">
              Descreva por que o vídeo não pôde ser aprovado (ex: risco de engasgo, criança distraída, corte inadequado).
            </p>

            <textarea
              rows={3}
              autoFocus
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Formato de corte em rodelas representa risco de engasgo nesta idade."
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-brown-800 outline-none focus:border-rose-500 focus:bg-white"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="min-h-12 w-full rounded-2xl bg-rose-600 text-xs font-bold text-white shadow-sm active:bg-rose-700"
              >
                Confirmar Rejeição
              </button>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="min-h-10 text-xs font-semibold text-brown-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
