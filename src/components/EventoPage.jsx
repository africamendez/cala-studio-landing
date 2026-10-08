import { useEffect, useRef, useState, useCallback } from "react";
import { SUMMER_MODE } from "../config.js";
import { supabase } from "../lib/supabase.js";
import { getEvento, EVENTO_AGOTADO } from "../data.js";
import { irASeccion, irAContacto, limpiarParametros } from "../lib/nav.js";
import ShareRow from "./ShareRow.jsx";
import MultiLine from "./MultiLine.jsx";

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Evento completo → en lugar de reservar, deja tu contacto. Va a Supabase
// (waitlist_join) y aparece en el panel de gestión bajo ese evento.
function ListaEspera({ sessionId }) {
  const c = EVENTO_AGOTADO;
  const [open, setOpen]           = useState(false);
  const [nombre, setNombre]       = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tel, setTel]             = useState("");
  const [email, setEmail]         = useState("");
  const [state, setState]         = useState("idle");   // idle | sending | done | error

  const ready = nombre.trim() && apellidos.trim() && tel.trim() && EMAIL_RE.test(email.trim());

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || state === "sending") return;
    setState("sending");
    const { error } = await supabase.rpc("waitlist_join", {
      p_session_id: sessionId,
      p_nombre: `${nombre.trim()} ${apellidos.trim()}`,
      p_telefono: tel.trim(),
      p_email: email.trim(),
    });
    setState(error ? "error" : "done");
  };

  if (state === "done") {
    return (
      <p className="ev-wl-done">{c.esperaOk}<span>{c.esperaOkNota}</span></p>
    );
  }

  if (!open) {
    return (
      <button type="button" className="ev-cta ev-cta-ghost" onClick={() => setOpen(true)}>
        {c.esperaAbrir}<span className="ev-cta-arw" aria-hidden="true" />
      </button>
    );
  }

  return (
    <form className="ev-wl" onSubmit={submit}>
      <span className="ev-wl-title">{c.esperaTitulo}</span>
      <MultiLine text={c.esperaLede} className="ev-wl-lede" />
      <div className="ev-wl-fields">
        <input className="ev-wl-f" placeholder="Nombre" autoComplete="given-name"
               value={nombre} onChange={e => setNombre(e.target.value)} />
        <input className="ev-wl-f" placeholder="Apellidos" autoComplete="family-name"
               value={apellidos} onChange={e => setApellidos(e.target.value)} />
        <input className="ev-wl-f" type="tel" inputMode="tel" placeholder="Teléfono"
               autoComplete="tel" value={tel} onChange={e => setTel(e.target.value)} />
        <input className="ev-wl-f wide" type="email" inputMode="email" placeholder="Email"
               autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="ev-wl-b" disabled={!ready || state === "sending"}>
        {state === "sending" ? "…" : c.esperaBoton}
      </button>
      {state === "error" && <span className="ev-wl-err">{c.esperaError}</span>}
    </form>
  );
}

export default function EventoPage({ slug }) {
  const ev = getEvento(slug);
  const [posterFailed, setPosterFailed] = useState(false);
  const [ses, setSes]     = useState(undefined);   // undefined = cargando · null = sin sesión en el calendario
  const [aviso, setAviso] = useState("");
  const avisoTimer = useRef(null);

  // ¿Venimos de pagar la plaza? Stripe devuelve con
  // ?pago=ok&evento=<slug>&sesion=<su página de pago>
  const [vuelta] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return q.get("pago") === "ok" && q.get("evento") === slug ? q.get("sesion") : null;
  });
  const [pago, setPago]   = useState(vuelta ? "confirmando" : null);   // confirmando | reservada | tarda | null
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { limpiarParametros("pago", "evento", "sesion"); }, []);

  // Estado real del evento (fecha, aforo y "completo") desde el calendario de
  // Supabase. Sin su sesión en el calendario el evento no se puede reservar
  // pagando: la página lleva al formulario de contacto.
  const cargarSesion = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("session_availability").select("*").eq("evento_slug", slug).limit(1);
    setSes(err || !data || !data.length ? null : data[0]);
  }, [slug]);
  useEffect(() => { cargarSesion(); }, [cargarSesion]);

  // De vuelta del pago: se le pregunta a la función `pagos`, que lo comprueba
  // en Stripe y apunta la plaza. Si el cobro aún no consta, se insiste un poco
  useEffect(() => {
    if (!vuelta) return;
    let vivo = true, intentos = 0;
    const preguntar = async () => {
      const { data } = await supabase.functions.invoke("pagos", { body: { accion: "reserva", sesion: vuelta } });
      if (!vivo) return;
      if (data?.estado === "pagado") {
        try { sessionStorage.removeItem(`cala.reserva.${slug}`); } catch {}
        setPago("reservada");
        cargarSesion();
      } else if (++intentos >= 5) setPago("tarda");
      else setTimeout(preguntar, 3000);
    };
    preguntar();
    return () => { vivo = false; };
  }, [vuelta, slug, cargarSesion]);

  // Al volver atrás desde Stripe el navegador restaura la página tal como
  // estaba, con el botón a medias: se libera
  useEffect(() => {
    const on = (e) => { if (e.persisted) setBusy(false); };
    window.addEventListener("pageshow", on);
    return () => window.removeEventListener("pageshow", on);
  }, []);

  const toast = useCallback((m) => {
    setAviso(m);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(""), 2800);
  }, []);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const goHome = (e) => { e.preventDefault(); window.location.hash = ""; };
  const goEventos = (e) => { e.preventDefault(); irASeccion("eventos"); };
  const goContacto = (e) => { e.preventDefault(); irAContacto(SUMMER_MODE ? "evento" : "retiro"); };

  // Abre el pago de la plaza en Stripe. Al abrirlo la plaza queda apartada un
  // rato; si ya lo abrió y volvió sin pagar, sigue con el mismo pago en vez de
  // apartar otra (por eso se recuerda su sesión mientras dure la pestaña).
  const reservar = async () => {
    setBusy(true); setError("");
    const clave = `cala.reserva.${slug}`;
    let anterior = null;
    try { anterior = sessionStorage.getItem(clave); } catch {}
    const { data, error: err } = await supabase.functions.invoke("pagos", {
      body: { accion: "evento", evento: slug, sesion: anterior },
    });
    if (data?.url) {
      try { sessionStorage.setItem(clave, data.sesion); } catch {}
      window.location.assign(data.url);
      return;
    }

    let codigo = "";
    try { codigo = (await err.context.json()).error; } catch {}
    // Completo o ya celebrado: se relee el evento y la página cambia sola
    if (codigo === "EVENTO_COMPLETO" || codigo === "EVENTO_CERRADO") await cargarSesion();
    else setError(codigo === "PLAZAS_EN_PAGO"
      ? "Las últimas plazas se están pagando ahora mismo · prueba otra vez en un rato"
      : "No hemos podido abrir el pago · inténtalo de nuevo en un momento");
    setBusy(false);
  };

  // Evento inexistente → mensaje sobrio con vuelta al estudio
  if (!ev) {
    return (
      <main className="evento-page ev-404">
        <div className="ev-404-in">
          <span className="ev-eyebrow">Evento</span>
          <h1 className="ev-404-title">Este evento no está disponible</h1>
          <a href="#" className="ev-cta" onClick={goHome}>Volver al estudio</a>
        </div>
      </main>
    );
  }

  const nombre = ev.nombre || "";
  const tituloBase = ev.nombreEm && nombre.endsWith(ev.nombreEm)
    ? nombre.slice(0, nombre.length - ev.nombreEm.length).trim()
    : nombre;

  // Enlace absoluto de esta página — es lo que se comparte
  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#/evento/${ev.slug}`
    : "";
  const shareText = ev.compartirMsg || `${ev.nombre} · ${ev.cuando}`;

  // Completo: lo dice el calendario (aforo lleno o marcado a mano en gestión).
  // Un evento ya celebrado no se marca como agotado: su CTA ya mira al siguiente.
  const cargando = ses === undefined;
  const yaPasado = ses ? new Date(ses.starts_at).getTime() <= Date.now() : false;
  const agotado  = !!ses && !yaPasado && ses.is_full;
  // Se reserva pagando si tiene precio en el catálogo y sesión futura en el
  // calendario. Si no (gratis, ya celebrado, sin fecha cerrada), el botón
  // lleva al formulario de contacto.
  const reservable = !!ev.dePago && !!ses && !yaPasado && !agotado;
  const hecho      = pago === "reservada" || pago === "confirmando";

  // Tema por evento → variables CSS que tiñen la página al son de su cartel
  const t = ev.tema || {};
  const themeVars = { "--ev-accent": t.accent, "--ev-accent-deep": t.accentDeep };

  return (
    <main className="evento-page" style={themeVars}>
      {/* Columna del cartel — protagonista, entero sobre su propia crema */}
      <aside className="ev-visual">
        <div className="ev-visual-top">
          <div className="ev-brand">
            <img className="ev-mark" src="assets/cala-isotipo.svg" alt="" />
            <span className="ev-word">cala<span className="d">.</span>studio</span>
          </div>
          <a href="#eventos" className="ev-back" onClick={goEventos}>‹ Volver</a>
        </div>

        <div className="ev-poster-wrap">
          {posterFailed ? (
            <div className="ev-poster ev-poster-ph" role="img" aria-label={`Cartel de ${ev.nombre} — próximamente`}>
              <span className="ev-ph-eyebrow">{ev.eyebrow}</span>
              <span className="ev-ph-title">{ev.nombre}</span>
              <span className="ev-ph-when">{ev.cuando}</span>
              <span className="ev-ph-note">Cartel próximamente</span>
            </div>
          ) : (
            <img className="ev-poster" src={ev.poster} alt={`Cartel de ${ev.nombre}`}
                 onError={() => setPosterFailed(true)} />
          )}
        </div>
      </aside>

      {/* Columna de acompañamiento + CTA de reserva */}
      <section className="ev-panel">
        <div className="ev-panel__in">
          <header className="ev-head">
            <span className="ev-eyebrow">{ev.eyebrow}</span>
            <h1 className="ev-title">
              {tituloBase} {ev.nombreEm && <em>{ev.nombreEm}</em>}
            </h1>
            <MultiLine text={ev.lede} className="ev-lede" />
          </header>

          <MultiLine text={ev.descripcion} className="ev-descr" />

          {/* Esenciales — un eco breve del cartel, sin repetirlo entero */}
          <ul className="ev-meta">
            <li><span className="ev-meta-k">Cuándo</span><span className="ev-meta-v">{ev.cuando} · {ev.hora}</span></li>
            <li><span className="ev-meta-k">Dónde</span><span className="ev-meta-v">{ev.lugar}</span></li>
            {ev.programa && <li><span className="ev-meta-k">Plan</span><span className="ev-meta-v">{ev.programa}</span></li>}
            <li><span className="ev-meta-k">Nivel</span><span className="ev-meta-v">{ev.nivel} · {ev.aforo}</span></li>
          </ul>

          {/* CTA — pagar la plaza si quedan, lista de espera si está agotado,
              formulario de contacto si no se reserva pagando (gratis, ya
              celebrado, sin fecha cerrada) */}
          <div className={"ev-reserva" + (agotado && !hecho ? " is-agotado" : "")}>
            {ev.precio && !hecho && (
              <span className="ev-precio">
                {ev.precio}<span className="ev-precio-k">{ev.precioNota || "por persona"}</span>
              </span>
            )}

            {pago === "reservada" ? (
              <p className="ev-wl-done">
                ✓ Plaza reservada
                <span>Nos vemos el {ev.cuando.toLowerCase()} a las {ev.hora}</span>
              </p>
            ) : pago === "confirmando" ? (
              <p className="ev-wl-done">Pago recibido<span>Estamos apuntando tu plaza…</span></p>
            ) : pago === "tarda" ? (
              /* Sin botón de pago: si ya ha pagado, que no pague dos veces */
              <>
                <MultiLine
                  className="ev-aviso"
                  text={"Tu pago todavía no nos consta\nsi ya has pagado, tu plaza queda apuntada en cuanto se confirme"}
                />
                <a className="ev-cta ev-cta-ghost" href="#contacto" onClick={goContacto}>
                  Escríbenos<span className="ev-cta-arw" aria-hidden="true" />
                </a>
              </>
            ) : agotado ? (
              <>
                <div className="ev-agotado">
                  <span className="ev-agotado-tag">{EVENTO_AGOTADO.tag}</span>
                  <span className="ev-agotado-nota">{EVENTO_AGOTADO.nota}</span>
                </div>
                <ListaEspera sessionId={ses.session_id} />
              </>
            ) : reservable || (ev.dePago && cargando) ? (
              /* Mientras se comprueba el aforo el botón espera: así nadie se va
                 a pagar un evento que está agotado */
              <>
                <button type="button" className={"ev-cta" + (cargando || busy ? " is-cargando" : "")}
                        disabled={cargando || busy} onClick={reservar}>
                  {cargando ? "Comprobando plazas…" : busy ? "Abriendo el pago…" : "Reservar plaza"}
                  <span className="ev-cta-arw" aria-hidden="true" />
                </button>
                {!cargando && <span className="ev-fine">Pago seguro con tarjeta a través de Stripe</span>}
                {error && <span className="ev-wl-err">{error}</span>}
              </>
            ) : (
              <a className="ev-cta" href="#contacto" onClick={goContacto}>
                {ev.ctaLabel || (yaPasado ? "Avisadme de la próxima" : "Escríbenos")}
                <span className="ev-cta-arw" aria-hidden="true" />
              </a>
            )}

            <ShareRow url={pageUrl} texto={shareText} onAviso={toast} />
          </div>
        </div>
      </section>

      {aviso && <div className="ev-toast" role="status">{aviso}</div>}
    </main>
  );
}
