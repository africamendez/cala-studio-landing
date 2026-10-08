-- cala.studio · Reservar plaza en un evento pagando online (Stripe)
--
-- Reservar un evento ya no pasa por WhatsApp: se paga en Stripe y la persona
-- queda apuntada sola en la lista del evento (la misma que ves en #/gestion).
--
--   1. Al pulsar "Reservar plaza" se APARTA una plaza mientras dura la página
--      de pago, para que dos personas no paguen la última a la vez.
--   2. Cuando Stripe confirma el cobro, la plaza apartada pasa a ser una
--      persona más en `session_guests` (y el aforo se actualiza solo).
--   3. Si no paga, la plaza apartada deja de contar a los 35 minutos (la página
--      de pago de Stripe caduca a los 31).
--
-- Todo lo hace la función `pagos` (service role). Desde el navegador no se
-- puede leer ni tocar nada de esto.
--
-- Correr DESPUÉS de 0001-0014. Idempotente.

-- ── 1) Una fila por cada vez que alguien abre el pago de una plaza ───────
create table if not exists public.evento_reservas (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references public.class_sessions(id) on delete cascade,
  estado                text not null default 'pendiente'
                        check (estado in ('pendiente','pagado','caducada','reembolsado')),
  importe               integer not null,                      -- en céntimos
  moneda                text not null default 'eur',
  nombre                text,                                  -- los tres los da Stripe al cobrar
  email                 text,
  telefono              text,
  guest_id              uuid references public.session_guests(id) on delete set null,  -- su fila en la lista del evento
  stripe_session_id     text unique,                           -- la página de pago de Stripe
  stripe_payment_intent text,                                  -- el cobro, para localizarlo en Stripe
  created_at            timestamptz not null default now(),
  pagado_at             timestamptz
);
create index if not exists evento_reservas_session_idx on public.evento_reservas (session_id, estado);

-- RLS activada y SIN políticas → nadie lee/escribe la tabla desde el navegador.
alter table public.evento_reservas enable row level security;
revoke all on public.evento_reservas from anon, authenticated;
grant all on public.evento_reservas to service_role;

-- ── 2) Apartar una plaza al abrir el pago ────────────────────────────────
-- EVENTO_COMPLETO = no caben más (aforo lleno o marcado como completo).
-- PLAZAS_EN_PAGO  = las que quedan las está pagando alguien ahora mismo; si
--                   no termina, vuelven a estar libres.
create or replace function public.evento_abrir_reserva(p_evento_slug text, p_importe int)
returns table (reserva_id uuid, titulo text, starts_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare s public.class_sessions%rowtype; v_apartadas int; v_id uuid;
begin
  -- LOCK de la sesión: serializa el aforo, igual que al apuntar a mano
  select cs.* into s from public.class_sessions cs
   where cs.evento_slug = p_evento_slug and cs.published
   for update;
  if not found            then raise exception 'EVENTO_DESCONOCIDO'; end if;
  if s.starts_at <= now() then raise exception 'EVENTO_CERRADO';     end if;
  if s.sold_out or s.reservadas >= s.capacity then raise exception 'EVENTO_COMPLETO'; end if;

  select count(*) into v_apartadas from public.evento_reservas r
   where r.session_id = s.id and r.estado = 'pendiente'
     and r.created_at > now() - interval '35 minutes';
  if s.reservadas + v_apartadas >= s.capacity then raise exception 'PLAZAS_EN_PAGO'; end if;

  insert into public.evento_reservas (session_id, importe) values (s.id, p_importe)
  returning id into v_id;
  return query select v_id, s.titulo, s.starts_at;
end; $$;

-- ── 3) Dar por pagada una reserva: la persona entra en la lista ──────────
-- La llaman el aviso de Stripe (webhook) y la vuelta del pago; la fila se
-- bloquea, así que llegar las dos a la vez —o repetirse— no apunta dos veces.
create or replace function public.evento_confirmar_reserva(
  p_reserva_id uuid, p_nombre text, p_email text, p_telefono text,
  p_importe int, p_payment_intent text
) returns text
language plpgsql security definer set search_path = public as $$
declare r public.evento_reservas%rowtype; v_guest uuid;
begin
  select er.* into r from public.evento_reservas er where er.id = p_reserva_id for update;
  if not found then raise exception 'RESERVA_DESCONOCIDA'; end if;
  if r.estado in ('pagado', 'reembolsado') then return r.estado; end if;

  insert into public.session_guests (session_id, nombre, telefono)
  values (
    r.session_id,
    left(coalesce(nullif(trim(p_nombre), ''), nullif(trim(p_email), ''), 'Reserva online'), 120),
    nullif(trim(p_telefono), '')
  )
  returning id into v_guest;

  update public.evento_reservas set
    estado                = 'pagado',
    pagado_at             = now(),
    guest_id              = v_guest,
    nombre                = nullif(trim(p_nombre), ''),
    email                 = nullif(lower(trim(p_email)), ''),
    telefono              = nullif(trim(p_telefono), ''),
    importe               = coalesce(p_importe, importe),
    stripe_payment_intent = p_payment_intent
  where id = r.id;
  return 'pagado';
end; $$;

-- Solo la función `pagos` (service role) puede llamarlas: apartar plazas o
-- darlas por pagadas desde el navegador sería reservar sin pagar.
revoke all on function public.evento_abrir_reserva(text, int) from public, anon, authenticated;
revoke all on function public.evento_confirmar_reserva(uuid, text, text, text, int, text) from public, anon, authenticated;
grant execute on function public.evento_abrir_reserva(text, int) to service_role;
grant execute on function public.evento_confirmar_reserva(uuid, text, text, text, int, text) to service_role;

-- Devolución de una plaza: devuelve el dinero desde Stripe, quita a la persona
-- de la lista en #/gestion (eso libera la plaza) y deja constancia aquí:
--   update public.evento_reservas set estado = 'reembolsado' where stripe_payment_intent = 'pi_…';
