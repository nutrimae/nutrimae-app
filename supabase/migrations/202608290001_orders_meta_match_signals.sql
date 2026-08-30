-- Sinais de correspondência pro Meta Conversions API (cookies _fbc/_fbp do
-- Pixel + IP/user-agent de quem finalizou a compra), capturados no momento
-- do checkout (único ponto com acesso ao navegador) e reaproveitados depois
-- pelo webhook (server-to-server, sem acesso a cookie nenhum) tanto pro
-- evento de InitiateCheckout quanto pro de Purchase.
alter table public.orders add column if not exists fbc text;
alter table public.orders add column if not exists fbp text;
alter table public.orders add column if not exists client_ip text;
alter table public.orders add column if not exists client_user_agent text;
