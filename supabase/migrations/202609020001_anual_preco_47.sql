-- Reduz o preco do Anual de R$97 para R$47 (mesma faixa "low-ticket" ja
-- validada no Sai do Vermelho), ampliando a distancia de valor percebido
-- contra o Mensal recorrente (R$29,90/mes = R$358,80/ano).
update public.offers set price_cents = 4700, updated_at = now() where slug = 'nutrimae-anual';
