-- cala.studio · Compras de paquetes de clases online (pago con Stripe)
--
-- Cada fila es un intento de compra de un paquete por una cuenta. La escribe
-- SOLO la función `pagos` (service role): nace `pendiente` al abrir el
-- pago y pasa a `pagado` cuando Stripe confirma el cobro. La web solo la lee,
-- para saber qué paquetes abrirle a cada cuenta.
--
-- Correr DESPUÉS de 0001-0013. Idempotente.

create table if not exists public.compras (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  email                 text,                                  -- el de la cuenta, para leer la tabla de un vistazo
  paquete               text not null,                         -- slug (supabase/functions/_shared/catalogo.js)
  importe               integer not null,                      -- en céntimos
  moneda                text not null default 'eur',
  estado                text not null default 'pendiente'
                        check (estado in ('pendiente','pagado','caducada','reembolsado')),
  stripe_session_id     text not null unique,                  -- la página de pago de Stripe
  stripe_payment_intent text,                                  -- el cobro, para localizarlo en Stripe
  created_at            timestamptz not null default now(),
  pagado_at             timestamptz
);
create index if not exists compras_user_idx on public.compras (user_id, estado);

-- RLS: cada cuenta ve solo sus compras. Sin políticas de escritura → desde el
-- navegador no se puede crear ni tocar una compra (ni marcarse una como pagada).
alter table public.compras enable row level security;
drop policy if exists compras_self_read on public.compras;
create policy compras_self_read on public.compras
  for select to authenticated using (user_id = auth.uid());

revoke all on public.compras from anon, authenticated;
grant select on public.compras to authenticated;
grant all on public.compras to service_role;

-- Devolución: se devuelve el dinero desde el panel de Stripe y aquí se cierra
-- el acceso a ese paquete:
--   update public.compras set estado = 'reembolsado' where stripe_payment_intent = 'pi_…';
