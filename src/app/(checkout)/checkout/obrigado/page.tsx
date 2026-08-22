import Link from "next/link";
import { Loader2, PartyPopper } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Revalida no servidor — nunca confia no "status" que o navegador trouxe
 * da resposta síncrona do checkout. "orders.status"/"subscriptions.status"
 * só viram "paid"/"active" quando o webhook do Pagar.me confirma (ver
 * src/app/api/webhooks/pagarme/route.ts); até lá, mesmo com um cartão
 * aprovado na hora, mostramos "processando".
 *
 * Aceita `orderId` (fluxo Anual/downsell, pagamento único) OU
 * `subscriptionId` (fluxo Mensal/NutriBot VIP, recorrente) — nunca os
 * dois ao mesmo tempo.
 */
export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; subscriptionId?: string }>;
}) {
  const { orderId, subscriptionId } = await searchParams;
  const admin = createAdminClient();

  if (subscriptionId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id, status")
      .eq("id", subscriptionId)
      .maybeSingle();

    if (!subscription) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
          <p className="text-center text-sm text-gray-500">Assinatura não encontrada.</p>
        </main>
      );
    }

    if (subscription.status !== "active") {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <p className="text-sm text-gray-600">Ainda estamos confirmando sua assinatura.</p>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
        <PartyPopper className="h-10 w-10 text-rose-600" strokeWidth={1.75} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assinatura confirmada!</h1>
          <p className="mt-2 text-sm text-gray-600">Seu acesso já foi liberado. Confira seu e-mail para os próximos passos.</p>
        </div>
        <Link
          href="/app"
          className="min-h-14 w-full max-w-xs rounded-2xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a]"
        >
          Continuar
        </Link>
      </main>
    );
  }

  const order = orderId
    ? (await admin.from("orders").select("id, status, payment_method").eq("id", orderId).maybeSingle()).data
    : null;

  if (!order) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-sm text-gray-500">Pedido não encontrado.</p>
      </main>
    );
  }

  if (order.status !== "paid") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          <p className="text-sm text-gray-600">
            {order.payment_method === "pix"
              ? "Ainda estamos confirmando seu Pix. Isso pode levar alguns instantes."
              : "Ainda estamos confirmando seu pagamento."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <PartyPopper className="h-10 w-10 text-rose-600" strokeWidth={1.75} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-gray-600">Seu acesso já foi liberado. Confira seu e-mail para os próximos passos.</p>
      </div>
      <Link
        href={`/upsell?orderId=${order.id}`}
        className="min-h-14 w-full max-w-xs rounded-2xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a]"
      >
        Continuar
      </Link>
    </main>
  );
}
