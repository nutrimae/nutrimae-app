"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/back-button";

const whatsappSupportUrl = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_URL;

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed";
  last_message_at: string;
  unread: boolean;
}

export default function SuportePage() {
  const supabase = useMemo(() => createClient(), []);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ticketRows } = await supabase
      .from("support_tickets")
      .select("id, subject, status, last_message_at")
      .order("last_message_at", { ascending: false });

    const { data: unreadRows } = await supabase
      .from("support_messages")
      .select("ticket_id")
      .eq("sender", "admin")
      .eq("read_by_user", false);

    const unreadTicketIds = new Set((unreadRows ?? []).map((r) => r.ticket_id));

    setTickets(
      (ticketRows ?? []).map((t) => ({
        ...t,
        unread: unreadTicketIds.has(t.id),
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(subject: string, firstMessage: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject })
      .select("id")
      .single();

    if (error || !ticket) return;

    await supabase
      .from("support_messages")
      .insert({ ticket_id: ticket.id, sender: "user", body: firstMessage });

    setShowForm(false);
    load();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <h1 className="font-heading text-2xl font-bold text-brown-800">Suporte</h1>
      <p className="text-brown-700">
        Fale com a nossa equipe. Respondemos por aqui — você não precisa esperar online.
      </p>

      {whatsappSupportUrl && (
        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-sage-500 p-4 text-white"
        >
          <MessageSquare className="h-6 w-6 shrink-0" strokeWidth={2} />
          <div>
            <p className="font-semibold">Falar no WhatsApp</p>
            <p className="text-xs text-white/80">Resposta rápida, direto com a nossa equipe.</p>
          </div>
        </a>
      )}

      <Button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2">
        <Plus className="h-5 w-5" strokeWidth={2} />
        Novo ticket
      </Button>

      {loading ? (
        <p className="text-center text-brown-700/60">Carregando...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-brown-700/60">Você ainda não abriu nenhum ticket.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/app/suporte/${t.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5"
            >
              <MessageSquare className="h-6 w-6 shrink-0 text-sage-500" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="font-semibold text-brown-800">{t.subject}</p>
                <p className="text-xs text-brown-700/60">
                  {t.status === "open" ? "Em aberto" : "Encerrado"}
                </p>
              </div>
              {t.unread && <span className="h-3 w-3 shrink-0 rounded-full bg-terracotta-500" />}
            </Link>
          ))}
        </div>
      )}

      {showForm && <NewTicketSheet onClose={() => setShowForm(false)} onCreate={handleCreate} />}
    </main>
  );
}

function NewTicketSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (subject: string, message: string) => Promise<void>;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-brown-900/30" onClick={onClose}>
      <div className="w-full animate-fade-in-up rounded-t-3xl bg-cream p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-brown-800">Novo ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50"
          >
            <X className="h-5 w-5 text-brown-700" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            id="ticket-subject"
            label="Assunto"
            placeholder="Ex.: Dúvida sobre minha assinatura"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <div>
            <label htmlFor="ticket-message" className="mb-2 block text-base font-semibold text-brown-700">
              Mensagem
            </label>
            <textarea
              id="ticket-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border-2 border-sage-100 bg-white p-4 text-lg text-brown-800 outline-none focus:border-sage-400"
            />
          </div>
          <Button
            onClick={async () => {
              if (!subject.trim() || !message.trim()) return;
              setSaving(true);
              await onCreate(subject.trim(), message.trim());
              setSaving(false);
            }}
            disabled={saving || !subject.trim() || !message.trim()}
          >
            {saving ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
