"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed";
  user_email: string;
  last_message_at: string;
}

export function AdminTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/support")
      .then((r) => r.json())
      .then((data) => {
        setTickets(data.tickets ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <Link
        href="/app/suporte"
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Voltar
      </Link>

      <h1 className="font-heading text-2xl font-bold text-brown-800">
        Tickets de suporte (admin)
      </h1>

      {loading ? (
        <p className="text-center text-brown-700/60">Carregando...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-brown-700/60">Nenhum ticket ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/app/suporte/admin/${t.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5"
            >
              <MessageSquare className="h-6 w-6 shrink-0 text-sage-500" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="font-semibold text-brown-800">{t.subject}</p>
                <p className="text-xs text-brown-700/60">{t.user_email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  t.status === "open" ? "bg-sage-100 text-sage-700" : "bg-brown-700/10 text-brown-700"
                }`}
              >
                {t.status === "open" ? "Aberto" : "Encerrado"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
