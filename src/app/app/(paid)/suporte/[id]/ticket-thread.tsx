"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "admin";
  body: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed";
  user_email?: string;
}

export function TicketThread({ ticketId, isAdminView }: { ticketId: string; isAdminView: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    if (isAdminView) {
      const res = await fetch(`/api/admin/support?ticketId=${ticketId}`).then((r) => r.json());
      setTicket(res.ticket);
      setMessages(res.messages ?? []);
    } else {
      const [ticketRes, messagesRes] = await Promise.all([
        supabase.from("support_tickets").select("*").eq("id", ticketId).single(),
        supabase
          .from("support_messages")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true }),
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data ?? []);

      // Marca mensagens do admin como lidas ao abrir a conversa.
      await supabase
        .from("support_messages")
        .update({ read_by_user: true })
        .eq("ticket_id", ticketId)
        .eq("sender", "admin")
        .eq("read_by_user", false);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);

    if (isAdminView) {
      await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message: body.trim() }),
      });
    } else {
      await supabase.from("support_messages").insert({
        ticket_id: ticketId,
        sender: "user",
        body: body.trim(),
      });
    }

    setBody("");
    await load();
    setSending(false);
  }

  const backHref = isAdminView ? "/app/suporte/admin" : "/app/suporte";

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando conversa...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <Link
        href={backHref}
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Voltar
      </Link>

      <div>
        <h1 className="font-heading text-xl font-bold text-brown-800">{ticket?.subject}</h1>
        {isAdminView && ticket?.user_email && (
          <p className="text-sm text-brown-700/70">{ticket.user_email}</p>
        )}
        <p className="text-xs text-brown-700/60">
          {ticket?.status === "open" ? "Em aberto" : "Encerrado"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {messages.map((m) => {
          const fromAdmin = m.sender === "admin";
          const mine = isAdminView ? fromAdmin : !fromAdmin;
          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl p-3 ${
                mine ? "self-end bg-sage-500 text-white" : "self-start bg-white/80 text-brown-800 shadow-sm shadow-brown-900/5"
              }`}
            >
              <p className="text-xs font-semibold opacity-70">
                {fromAdmin ? "Equipe NutriMãe" : "Você"}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva sua mensagem..."
          className="w-full rounded-2xl border-2 border-sage-100 bg-white p-4 text-lg text-brown-800 outline-none focus:border-sage-400"
        />
        <Button onClick={handleSend} disabled={sending || !body.trim()}>
          {sending ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </main>
  );
}
