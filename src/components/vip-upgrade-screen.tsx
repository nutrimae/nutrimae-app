import Link from "next/link";
import { Check, Crown, Moon, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/products";

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Paywall combinado da Área VIP, mostrado quando a usuária não tem nenhum
 * dos dois módulos ativos. Diferente do UpgradeScreen normal (1 produto),
 * este empilha os dois — SOS Desmame Noturno e Protocolo Intestino Livre —
 * já que os dois vivem sob o mesmo hub /app/vip.
 */
export function VipUpgradeScreen() {
  const weaning = PRODUCTS.sos_desmame_noturno;
  const intestino = PRODUCTS.protocolo_intestino_livre;
  const totalRegular = weaning.regularPrice + intestino.regularPrice;
  const totalPromo = weaning.price + intestino.price;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_8px_20px_rgba(217,164,6,0.3)]">
          <Crown className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
        <div className="mb-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1">
          <Crown className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
          <span className="text-xs font-semibold text-amber-700">Área VIP</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Os dois apoios extras para os momentos mais difíceis</h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Desbloqueie a Área VIP e tenha os dois módulos completos.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a2440]">
            <Moon className="h-4 w-4 text-purple-300" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="font-heading text-base font-bold text-brown-800">{weaning.name}</p>
            <p className="mt-0.5 text-xs text-brown-700/60">Playlist de áudio e rastreador para as madrugadas de desmame</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm text-brown-700/70">{formatPrice(weaning.regularPrice)}</span>
        </div>

        <div className="my-4 border-t border-dashed border-sage-200/60" />

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100">
            <Salad className="h-4 w-4 text-sage-600" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="font-heading text-base font-bold text-brown-800">{intestino.name}</p>
            <p className="mt-0.5 text-xs text-brown-700/60">Semáforo do cocô e receitas para o intestino preso</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm text-brown-700/70">{formatPrice(intestino.regularPrice)}</span>
        </div>

        <div className="my-5 border-t border-dashed border-sage-200/60" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-brown-700/60">Total em valor</span>
          <span className="text-base text-brown-700/60 line-through">{formatPrice(totalRegular)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-brown-800">Área VIP completa por</span>
          <span className="font-heading text-2xl font-bold text-amber-600">{formatPrice(totalPromo)}</span>
        </div>
        <p className="mt-1 text-right text-xs text-brown-700/50">pagamento único, acesso vitalício</p>

        <div className="mt-4 flex items-center gap-2 text-xs text-sage-600">
          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          Também pode comprar cada módulo separadamente
        </div>
      </div>

      <Button disabled>Assinatura em breve por aqui</Button>

      <Link
        href="/app"
        className="min-h-11 text-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-hover"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
