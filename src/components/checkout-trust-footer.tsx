import { ShieldCheck } from "lucide-react";

/**
 * Transparência de empresa no rodapé do checkout — CNPJ real, já publicado
 * no rodapé da landing (landing-nutrimae/index.html). Reforça confiança no
 * momento do pagamento, igual concorrentes fazem, mas sem inventar selo de
 * verificação que não temos.
 */
export function CheckoutTrustFooter() {
  return (
    <div className="flex flex-col items-center gap-1.5 pb-2 pt-1 text-center">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-sage-600">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} /> Compra 100% segura
      </p>
      <p className="text-[11px] text-brown-700/60">NutriMãe · CNPJ 68.580.891/0001-36</p>
    </div>
  );
}
