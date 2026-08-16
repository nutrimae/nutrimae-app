import Link from "next/link";
import { Lock, Check } from "lucide-react";
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-peach-100">
          <Lock className="h-8 w-8 text-terracotta-600" strokeWidth={1.75} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Esse conteúdo é exclusivo
        </h1>
        <p className="mt-2 text-brown-700">
          Desbloqueie {product.name.replace(" (assinatura)", "")} e tudo que vem junto.
        </p>
      </div>

      <div className="rounded-3xl bg-white/80 p-6 shadow-sm shadow-brown-900/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 shrink-0 text-sage-500" strokeWidth={2.5} />
            <span className="font-heading text-lg font-bold text-brown-800">
              {product.name}
            </span>
          </div>
          <span className="whitespace-nowrap text-brown-700">
            {formatPrice(product.regularPrice)}/mês
          </span>
        </div>

        {product.bundled.map((item) => (
          <div key={item.label} className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 shrink-0 text-sage-500" strokeWidth={2.5} />
              <span className="text-brown-800">{item.label}</span>
            </div>
            <span className="whitespace-nowrap text-sm text-brown-700/60">
              de <span className="line-through">{formatPrice(item.originalPrice)}</span>{" "}
              por <span className="font-bold text-sage-600">GRÁTIS</span>
            </span>
          </div>
        ))}

        <div className="my-5 border-t border-dashed border-sage-200" />

        <div className="flex items-center justify-between">
          <span className="text-brown-700">Total em valor</span>
          <span className="text-lg text-brown-700 line-through">{formatPrice(total)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-brown-800">
            Você leva por
          </span>
          <span className="font-heading text-2xl font-bold text-terracotta-600">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="mt-1 text-right text-sm text-brown-700/70">{product.priceNote}</p>
      </div>

      {product.checkoutUrl ? (
        <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
          <Button>Quero desbloquear</Button>
        </a>
      ) : (
        <Button disabled>Assinatura em breve por aqui</Button>
      )}

      <Link
        href="/app"
        className="min-h-12 text-center text-base font-semibold text-sage-600"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
