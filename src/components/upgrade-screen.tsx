import Link from "next/link";
import Image from "next/image";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { totalStackedValue, type Product } from "@/lib/products";

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function UpgradeScreen({ product }: { product: Product }) {
  const total = totalStackedValue(product);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/nutrimae-logo.png"
          alt="NutriMãe"
          width={100}
          height={100}
          className="mb-3 h-20 w-20 object-contain drop-shadow-[0_8px_20px_rgba(255,107,157,0.2)]"
        />
        <div className="mb-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1">
          <Crown className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
          <span className="text-xs font-semibold text-amber-700">Conteúdo exclusivo</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Esse conteúdo é exclusivo
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Desbloqueie {product.name.replace(" (assinatura)", "")} e tudo que vem junto.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100">
              <Check className="h-3.5 w-3.5 text-sage-600" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-base font-bold text-brown-800">
              {product.name}
            </span>
          </div>
          <span className="whitespace-nowrap text-sm text-brown-700/70">
            {formatPrice(product.regularPrice)}
            {!product.oneTimePayment && "/mês"}
          </span>
        </div>

        {product.bundled.map((item) => (
          <div key={item.label} className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100">
                <Check className="h-3.5 w-3.5 text-sage-600" strokeWidth={2.5} />
              </div>
              <span className="text-sm text-brown-800">{item.label}</span>
            </div>
            <span className="whitespace-nowrap text-xs text-brown-700/50">
              de <span className="line-through">{formatPrice(item.originalPrice)}</span>{" "}
              por <span className="font-bold text-sage-600">GRÁTIS</span>
            </span>
          </div>
        ))}

        <div className="my-5 border-t border-dashed border-sage-200/60" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-brown-700/60">Total em valor</span>
          <span className="text-base text-brown-700/60 line-through">{formatPrice(total)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-brown-800">
            Você leva por
          </span>
          <span className="font-heading text-2xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-brown-700/50">{product.priceNote}</p>
      </div>

      {/* Plano Mensal recorrente ainda não vendido publicamente (feature
          flag desligada em offers.active) — sem checkout de verdade pra
          linkar aqui ainda. */}
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
