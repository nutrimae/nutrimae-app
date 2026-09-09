-- Pivô de modelo: NutriMãe deixa de vender assinatura recorrente (Mensal) e
-- passa a vender só pagamento único vitalício, em dois planos — Plano
-- Básico (o que era o Mensal, agora pagamento único) e Plano Completo (o
-- que já era o Anual, sem mudança de preço). Quem já é assinante Mensal
-- continua sendo cobrado normalmente até cancelar — só desativamos a
-- oferta na vitrine, não mexemos em `subscriptions` existentes.
update public.offers set active = false where slug = 'nutrimae-mensal';

insert into public.offers (slug, product_key, name, billing_type, price_cents, recurring_price_cents, active)
values ('nutrimae-basico', 'nutrimae_assinatura', 'NutriMãe — Plano Básico', 'one_time', 1990, null, true)
on conflict (slug) do update set
  product_key = excluded.product_key,
  name = excluded.name,
  billing_type = excluded.billing_type,
  price_cents = excluded.price_cents,
  recurring_price_cents = excluded.recurring_price_cents,
  active = excluded.active;

update public.offers set name = 'NutriMãe — Plano Completo' where slug = 'nutrimae-anual';
