// cala.studio · pagos
// Todo lo que se cobra en la web, con Stripe Checkout: los paquetes de clases
// online (hace falta cuenta) y las plazas de los eventos (sin cuenta).
//
// Desde la web — POST con JSON:
//   { accion: "paquete", paquete }         → { url }           con la sesión de la clienta
//   { accion: "mis-paquetes" }             → { paquetes }      con la sesión de la clienta
//   { accion: "evento", evento, sesion? }  → { url, sesion }
//   { accion: "reserva", sesion }          → { estado }
// Desde Stripe — su aviso (webhook), que llega con la cabecera Stripe-Signature:
//   checkout.session.completed / checkout.session.async_payment_succeeded
//
// Un pago se da por bueno por dos caminos que hacen lo mismo y no se pisan: el
// aviso de Stripe y, al volver del pago, la propia web preguntando aquí (que
// a su vez lo comprueba en Stripe). Con uno basta; el otro es la red.
// Los precios salen de _shared/catalogo.js, nunca del navegador.
//
// Desplegar con --no-verify-jwt: Stripe no trae token de Supabase, y la sesión
// de la clienta, cuando hace falta, se comprueba aquí dentro.
// Secretos (supabase secrets set): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PAQUETES_VENTA, EVENTOS_PRECIO } from "../_shared/catalogo.js";
import { stripe as llamarStripe, firmaValida } from "./stripe.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const WEBHOOK_SECRET    = Deno.env.get("STRIPE_WEBHOOK_SECRET");
// Adónde puede devolver Stripe después del pago: la dirección de la web. Si hay
// más de una (con y sin www), separadas por comas; la primera es la principal.
const SITIOS = (Deno.env.get("SITE_URL") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const stripe = (path: string, params?: Record<string, string>) => llamarStripe(STRIPE_SECRET_KEY, path, params);

const PAQUETES = PAQUETES_VENTA as Record<string, { nombre: string; precio: number }>;
const EVENTOS  = EVENTOS_PRECIO as Record<string, number>;
const DIA = 24 * 60 * 60 * 1000;
// La página de pago de un evento caduca a los 31 min (Stripe no deja menos de
// 30). La plaza apartada deja de contar a los 35: ver 0015_eventos_pago.sql.
const MINUTOS_PARA_PAGAR = 31;

const fecha = new Intl.DateTimeFormat("es-ES", {
  weekday: "long", day: "numeric", month: "long",
  hour: "2-digit", minute: "2-digit",
  timeZone: "Europe/Madrid",
});

type Respuesta = { status: number; body: unknown };
// deno-lint-ignore no-explicit-any
type SesionStripe = any;   // la Checkout Session tal como la devuelve Stripe

const esSesionStripe = (v: unknown): v is string => typeof v === "string" && /^cs_[A-Za-z0-9_]+$/.test(v);
const cobro = (s: SesionStripe) => (typeof s.payment_intent === "string" ? s.payment_intent : null);

// La vuelta del pago solo puede ser a nuestra web o, en desarrollo, a
// localhost: nunca a la dirección que diga quien llama.
function baseDeRetorno(origin: string | null): string {
  if (origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return `${origin}/`;
  const origenDe = (u: string) => { try { return new URL(u).origin; } catch { return ""; } };
  const sitio = SITIOS.find((s) => origenDe(s) === origin) ?? SITIOS[0];
  if (!sitio) throw new Error("Falta el secreto SITE_URL");
  return sitio.replace(/\/*$/, "/");
}

// ── Paquetes de clases online ────────────────────────────────────────────

async function pagarPaquete(user: { id: string; email?: string }, paquete: unknown, origin: string | null): Promise<Respuesta> {
  if (typeof paquete !== "string" || !Object.hasOwn(PAQUETES, paquete)) {
    return { status: 404, body: { error: "PAQUETE_DESCONOCIDO" } };
  }
  const venta = PAQUETES[paquete];

  const { data: ya, error: errYa } = await admin.from("compras").select("id")
    .eq("user_id", user.id).eq("paquete", paquete).eq("estado", "pagado").limit(1);
  if (errYa) throw errYa;   // sin tabla de compras no se manda a pagar a nadie
  if (ya.length) return { status: 409, body: { error: "YA_COMPRADO" } };

  const base = baseDeRetorno(origin);
  const importe = Math.round(venta.precio * 100);   // Stripe cobra en céntimos
  const sesion = await stripe("checkout/sessions", {
    "mode": "payment",
    "locale": "es",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(importe),
    "line_items[0][price_data][product_data][name]": venta.nombre,
    "client_reference_id": user.id,
    ...(user.email ? { "customer_email": user.email } : {}),
    "metadata[tipo]": "paquete",
    "metadata[paquete]": paquete,
    "success_url": `${base}?pago=ok&paquete=${paquete}`,
    "cancel_url": `${base}?paquete=${paquete}`,
  });
  if (!sesion.ok) throw new Error(`Stripe ${sesion.status}: ${sesion.json?.error?.message}`);

  // La compra queda apuntada ANTES de mandar a pagar: si esto falla no se
  // devuelve la página de pago, así nadie paga algo que luego no se le abre.
  const { error } = await admin.from("compras").insert({
    user_id: user.id,
    email: user.email ?? null,
    paquete,
    importe,
    stripe_session_id: sesion.json.id,
  });
  if (error) throw error;

  return { status: 200, body: { url: sesion.json.url } };
}

// Da por pagada la compra de esa página de pago. Repetirlo no cambia nada.
async function darPorPagadaCompra(s: SesionStripe) {
  const { error } = await admin.from("compras")
    .update({
      estado: "pagado",
      pagado_at: new Date().toISOString(),
      importe: s.amount_total,
      stripe_payment_intent: cobro(s),
    })
    .eq("stripe_session_id", s.id).in("estado", ["pendiente", "caducada"]);
  if (error) throw error;
}

// Pregunta a Stripe por las compras a medias de la cuenta y devuelve los
// paquetes que ya son suyos.
async function misPaquetes(userId: string): Promise<Respuesta> {
  const { data: pendientes, error } = await admin.from("compras")
    .select("id, stripe_session_id, created_at")
    .eq("user_id", userId).eq("estado", "pendiente")
    .order("created_at", { ascending: false }).limit(10);
  if (error) throw error;

  for (const c of pendientes) {
    const s = await stripe(`checkout/sessions/${c.stripe_session_id}`);
    if (s.ok && s.json.payment_status === "paid") {
      await darPorPagadaCompra(s.json);
    } else if (
      s.status === 404 ||                                   // Stripe no la conoce (p. ej. era del modo de pruebas)
      (s.ok && s.json.status === "expired") ||              // se fue sin pagar y la página caducó
      Date.now() - new Date(c.created_at).getTime() > 30 * DIA
    ) {
      // Nadie la va a pagar ya: deja de preguntarse por ella
      const { error: errUp } = await admin.from("compras").update({ estado: "caducada" }).eq("id", c.id);
      if (errUp) throw errUp;
    }
  }

  const { data: pagadas, error: errPagadas } = await admin.from("compras")
    .select("paquete").eq("user_id", userId).eq("estado", "pagado");
  if (errPagadas) throw errPagadas;

  return { status: 200, body: { paquetes: [...new Set(pagadas.map((c) => c.paquete))] } };
}

// ── Plazas de eventos ────────────────────────────────────────────────────

async function reservarEvento(evento: unknown, anterior: unknown, origin: string | null): Promise<Respuesta> {
  if (typeof evento !== "string" || !Object.hasOwn(EVENTOS, evento)) {
    return { status: 404, body: { error: "EVENTO_DESCONOCIDO" } };
  }
  const base = baseDeRetorno(origin);

  // ¿Abrió el pago hace un momento y volvió sin pagar? Sigue con la misma
  // página de pago: su plaza ya está apartada y no hay que apartar otra.
  if (esSesionStripe(anterior)) {
    const { data: previa } = await admin.from("evento_reservas").select("estado")
      .eq("stripe_session_id", anterior).limit(1);
    if (previa?.[0]?.estado === "pendiente") {
      const s = await stripe(`checkout/sessions/${anterior}`);
      if (s.ok && s.json.status === "open" && s.json.metadata?.evento === evento && s.json.url) {
        return { status: 200, body: { url: s.json.url, sesion: anterior } };
      }
    }
  }

  // Aparta la plaza (si queda) y comprueba que el evento sigue abierto
  const importe = Math.round(EVENTOS[evento] * 100);
  const { data: apartada, error: errApartar } = await admin
    .rpc("evento_abrir_reserva", { p_evento_slug: evento, p_importe: importe });
  if (errApartar) {
    const motivo = ["EVENTO_DESCONOCIDO", "EVENTO_CERRADO", "EVENTO_COMPLETO", "PLAZAS_EN_PAGO"]
      .find((m) => errApartar.message?.includes(m));
    if (!motivo) throw errApartar;
    return { status: motivo === "EVENTO_DESCONOCIDO" ? 404 : 409, body: { error: motivo } };
  }
  const { reserva_id, titulo, starts_at } = apartada[0];

  const sesion = await stripe("checkout/sessions", {
    "mode": "payment",
    "locale": "es",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(importe),
    // Nombre y fecha en la línea: es lo que sale en el recibo que envía Stripe
    "line_items[0][price_data][product_data][name]": `${titulo} · ${fecha.format(new Date(starts_at))}`,
    "phone_number_collection[enabled]": "true",
    "client_reference_id": reserva_id,
    "metadata[tipo]": "evento",
    "metadata[evento]": evento,
    "metadata[reserva]": reserva_id,
    "expires_at": String(Math.floor(Date.now() / 1000) + MINUTOS_PARA_PAGAR * 60),
    "success_url": `${base}?pago=ok&evento=${evento}&sesion={CHECKOUT_SESSION_ID}`,
    "cancel_url": `${base}?evento=${evento}`,
  });
  if (!sesion.ok) {
    // No hay página de pago: la plaza apartada se suelta ya
    await admin.from("evento_reservas").delete().eq("id", reserva_id);
    throw new Error(`Stripe ${sesion.status}: ${sesion.json?.error?.message}`);
  }

  const { error } = await admin.from("evento_reservas")
    .update({ stripe_session_id: sesion.json.id }).eq("id", reserva_id);
  if (error) throw error;

  return { status: 200, body: { url: sesion.json.url, sesion: sesion.json.id } };
}

// Da por pagada la reserva: la persona entra en la lista del evento con los
// datos que dio al pagar. Repetirlo no la apunta dos veces (lo garantiza la
// función SQL, que bloquea la fila).
async function darPorPagadaReserva(s: SesionStripe) {
  const { error } = await admin.rpc("evento_confirmar_reserva", {
    p_reserva_id: s.metadata?.reserva,
    p_nombre: s.customer_details?.name ?? null,
    p_email: s.customer_details?.email ?? null,
    p_telefono: s.customer_details?.phone ?? null,
    p_importe: s.amount_total ?? null,
    p_payment_intent: cobro(s),
  });
  if (error) throw error;
}

// Al volver del pago: ¿cómo quedó esa reserva? Se comprueba en Stripe.
async function estadoReserva(sesion: unknown): Promise<Respuesta> {
  if (!esSesionStripe(sesion)) return { status: 404, body: { error: "RESERVA_DESCONOCIDA" } };
  const s = await stripe(`checkout/sessions/${sesion}`);
  if (!s.ok || s.json.metadata?.tipo !== "evento") return { status: 404, body: { error: "RESERVA_DESCONOCIDA" } };

  if (s.json.payment_status === "paid") {
    await darPorPagadaReserva(s.json);
    return { status: 200, body: { estado: "pagado" } };
  }
  return { status: 200, body: { estado: s.json.status === "expired" ? "caducada" : "pendiente" } };
}

// ── Aviso de Stripe (webhook) ────────────────────────────────────────────

async function avisoDeStripe(req: Request): Promise<Response> {
  const cuerpo = await req.text();   // sin parsear: la firma va sobre el texto exacto
  if (!(await firmaValida(cuerpo, req.headers.get("stripe-signature"), WEBHOOK_SECRET))) {
    return new Response("firma no válida", { status: 400 });
  }

  try {
    const aviso = JSON.parse(cuerpo);
    const cobrado = aviso.type === "checkout.session.completed" ||
      aviso.type === "checkout.session.async_payment_succeeded";
    const s = aviso.data?.object;
    // Con pagos que tardan en confirmarse, `completed` llega antes del cobro
    // (payment_status "unpaid"); el bueno es el `async_payment_succeeded`.
    if (cobrado && s?.payment_status === "paid") {
      if (s.metadata?.tipo === "evento") await darPorPagadaReserva(s);
      else if (s.metadata?.tipo === "paquete") await darPorPagadaCompra(s);
    }
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });   // Stripe lo reintenta más tarde
  }
}

// ── Entrada ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.headers.has("stripe-signature")) return avisoDeStripe(req);

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers")
      ?? "authorization, x-client-info, apikey, content-type",
  };
  const responder = ({ status, body }: Respuesta) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const origin = req.headers.get("origin");
    const { accion, paquete, evento, sesion } = await req.json().catch(() => ({}));

    // Eventos: sin cuenta
    if (accion === "evento")  return responder(await reservarEvento(evento, sesion, origin));
    if (accion === "reserva") return responder(await estadoReserva(sesion));

    // Paquetes: con cuenta, que es a quien se le apunta la compra
    if (accion === "paquete" || accion === "mis-paquetes") {
      const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
      const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } };
      if (!user) return responder({ status: 401, body: { error: "SIN_SESION" } });
      return responder(accion === "paquete"
        ? await pagarPaquete(user, paquete, origin)
        : await misPaquetes(user.id));
    }

    return responder({ status: 400, body: { error: "ACCION_DESCONOCIDA" } });
  } catch (e) {
    console.error(e);
    return responder({ status: 500, body: { error: "ERROR" } });
  }
});
