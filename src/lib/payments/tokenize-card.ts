/**
 * Tokenização de cartão acontece 100% no navegador, direto contra o
 * Pagar.me (POST /core/v5/tokens, autenticado só com a public_key) — o
 * número/CVV do cartão nunca passam pelo nosso backend, só o token.
 * Compartilhado pelos checkouts de compra única, upsell, downsell e
 * assinatura — mesma chamada em todos.
 */
export async function tokenizeCard(card: {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_PAGARME_PUBLIC_KEY não configurada.");

  const res = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${publicKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "card",
      card: {
        number: card.number.replace(/\s/g, ""),
        holder_name: card.holderName,
        exp_month: card.expMonth,
        exp_year: card.expYear,
        cvv: card.cvv,
      },
    }),
  });

  if (!res.ok) throw new Error("Não foi possível validar o cartão. Confira os dados e tente de novo.");
  const data: { id: string } = await res.json();
  return data.id;
}
