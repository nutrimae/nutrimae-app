-- OTO1 pós-assinatura do Plano Mensal: "Anual por R$37, oferta exclusiva
-- pra você" — substitui o NutriBot VIP nesse slot (ver /upsell/page.tsx).
-- Mesmo product_key do Anual normal (nutrimae_assinatura); preço mais
-- baixo (R$37 vs R$47) só nesta oferta, só alcançável a partir do fluxo
-- pós-checkout do Mensal (parent_subscription_id), nunca anunciada solta.
insert into public.offers (slug, product_key, name, billing_type, price_cents, recurring_price_cents, active)
values ('nutrimae-anual-upsell', 'nutrimae_assinatura', 'NutriMãe — Plano Anual (oferta exclusiva)', 'one_time', 3700, null, true)
on conflict (slug) do update set
  product_key = excluded.product_key,
  name = excluded.name,
  billing_type = excluded.billing_type,
  price_cents = excluded.price_cents,
  recurring_price_cents = excluded.recurring_price_cents,
  active = excluded.active;
