import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAcceso } from "../hooks/useAcceso.jsx";
import { irAContacto, limpiarParametros } from "../lib/nav.js";
import MultiLine from "./MultiLine.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLAVE_MIN = 8;

function mensajeDe(err) {
  // Sin error pero sin sesión: Supabase está pidiendo confirmar el email
  if (!err) return "Cuenta creada · confírmala desde el email que te hemos enviado y vuelve a entrar";
  if (err.code === "invalid_credentials") return "Email o contraseña incorrectos";
  if (err.code === "weak_password") return "Esa contraseña es demasiado fácil · prueba con otra más larga";
  if (err.code === "email_address_invalid" || err.code === "validation_failed") return "Ese email no parece válido";
  if (err.status === 429) return "Demasiados intentos · espera un minuto y vuelve a probar";
  return "No hemos podido entrar · inténtalo de nuevo en un momento";
}

// Caja de compra de la ficha de un paquete: precio y botón de pago (Stripe
// Checkout). Para pagar hace falta cuenta, que se crea aquí mismo con email y
// contraseña; la compra queda ligada a ella y abre el paquete en cualquier
// dispositivo.
export default function CompraPaquete({ paquete, primeraClase }) {
  const { user, cargando, tiene, recargar, signUp, signIn, signOut } = useAcceso();
  const mio = tiene(paquete.slug);

  // ¿Venimos de pagar este paquete? Stripe devuelve con ?pago=ok&paquete=<slug>
  const [vieneDePagar] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return q.get("pago") === "ok" && q.get("paquete") === paquete.slug;
  });
  const [vuelta, setVuelta] = useState(vieneDePagar ? "confirmando" : null);   // confirmando | tarda | null

  const [form, setForm]         = useState(null);   // null | { modo: "crear" | "entrar", pagar: boolean }
  const [email, setEmail]       = useState("");
  const [clave, setClave]       = useState("");
  const [verClave, setVerClave] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { limpiarParametros("pago", "paquete"); }, []);

  // De vuelta del pago, useAcceso ya ha preguntado a Stripe al cargar. Si el
  // cobro todavía no consta (hay pagos que tardan en confirmarse), se insiste
  // un poco antes de avisar
  useEffect(() => {
    if (vuelta !== "confirmando" || cargando || mio) return;
    let intentos = 0;
    const id = setInterval(async () => {
      intentos += 1;
      const abiertos = await recargar();
      if (!abiertos.has(paquete.slug) && intentos >= 4) { clearInterval(id); setVuelta("tarda"); }
    }, 3000);
    return () => clearInterval(id);
  }, [vuelta, cargando, mio, paquete.slug, recargar]);

  // Al volver atrás desde Stripe el navegador restaura la página tal como
  // estaba, con el botón a medias: se libera
  useEffect(() => {
    const on = (e) => { if (e.persisted) setBusy(false); };
    window.addEventListener("pageshow", on);
    return () => window.removeEventListener("pageshow", on);
  }, []);

  // Abre el pago en Stripe. La compra se da por buena al volver (useAcceso)
  const pagar = async () => {
    setBusy(true); setError("");
    const { data, error: err } = await supabase.functions.invoke("pagos", {
      body: { accion: "paquete", paquete: paquete.slug },
    });
    if (data?.url) { window.location.assign(data.url); return; }

    let codigo = "";
    try { codigo = (await err.context.json()).error; } catch {}
    if (codigo === "YA_COMPRADO") await recargar();
    else setError("No hemos podido abrir el pago · inténtalo de nuevo en un momento");
    setBusy(false);
  };

  const abrir = (modo, pagarDespues) => { setForm({ modo, pagar: pagarDespues }); setError(""); };

  const entrar = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const mail = email.trim();
    let { data, error: err } = form.modo === "crear" ? await signUp(mail, clave) : await signIn(mail, clave);

    // Crear cuenta con un email que ya tiene una: si la contraseña es la suya, entra
    if (err?.code === "user_already_exists") {
      ({ data, error: err } = await signIn(mail, clave));
      if (err) {
        setForm((f) => ({ ...f, modo: "entrar" }));
        setError("Ya hay una cuenta con este email · entra con su contraseña");
        setBusy(false);
        return;
      }
    }
    if (err || !data.session) { setError(mensajeDe(err)); setBusy(false); return; }

    const pagarDespues = form.pagar;
    setForm(null); setClave("");
    const abiertos = await recargar();
    if (pagarDespues && !abiertos.has(paquete.slug)) await pagar();
    else setBusy(false);
  };

  const cuenta = user ? (
    <p className="pq-cuenta">
      {user.email}
      <button type="button" className="pq-link" onClick={signOut}>Cerrar sesión</button>
    </p>
  ) : !form && (
    <button type="button" className="pq-link" onClick={() => abrir("entrar", false)}>
      ¿Ya lo compraste? Entra en tu cuenta
    </button>
  );

  if (mio) {
    return (
      <>
        <p className="ev-wl-done">
          ✓ {vieneDePagar ? "Pago recibido · el paquete ya es tuyo" : "Este paquete es tuyo"}
          <span>Tienes todas sus clases abiertas</span>
        </p>
        {primeraClase && (
          <a className="ev-cta" href={`#/clase/${primeraClase.slug}`}>
            Empezar por la primera clase<span className="ev-cta-arw" aria-hidden="true" />
          </a>
        )}
        {cuenta}
      </>
    );
  }

  if (vuelta === "confirmando") {
    return <p className="ev-wl-done">Pago recibido<span>Estamos abriendo tu paquete…</span></p>;
  }

  const crear = form?.modo === "crear";
  const listo = EMAIL_RE.test(email.trim()) && clave.length >= (crear ? CLAVE_MIN : 1);

  return (
    <>
      <span className="ev-precio">
        {paquete.precio}€<span className="ev-precio-k">paquete completo</span>
      </span>

      {vuelta === "tarda" && (
        <MultiLine
          className="ev-aviso"
          text={"Tu pago todavía no nos consta\nvuelve a entrar en unos minutos y, si el paquete sigue cerrado, escríbenos"}
        />
      )}

      {form && !user ? (
        <form className="ev-wl" onSubmit={entrar}>
          <span className="ev-wl-title">{crear ? "Crea tu cuenta" : "Entra en tu cuenta"}</span>
          <MultiLine
            className="ev-wl-lede"
            text={crear
              ? "Con ella abres tus clases desde cualquier dispositivo\nDespués pasas al pago"
              : "Con el email y la contraseña de tu cuenta"}
          />
          <div className="ev-wl-fields">
            <input className="ev-wl-f wide" type="email" inputMode="email" placeholder="Email"
                   autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            <span className="pq-clave">
              <input className="ev-wl-f" type={verClave ? "text" : "password"}
                     placeholder={crear ? `Contraseña · mínimo ${CLAVE_MIN} caracteres` : "Contraseña"}
                     autoComplete={crear ? "new-password" : "current-password"}
                     value={clave} onChange={e => setClave(e.target.value)} />
              <button type="button" className="pq-clave__ver" onClick={() => setVerClave(v => !v)}>
                {verClave ? "Ocultar" : "Ver"}
              </button>
            </span>
          </div>
          <button className="ev-wl-b" disabled={!listo || busy}>
            {busy ? "…" : form.pagar ? "Continuar al pago" : "Entrar"}
          </button>
          {error && <span className="ev-wl-err">{error}</span>}
          <div className="pq-links">
            <button type="button" className="pq-link" onClick={() => abrir(crear ? "entrar" : "crear", form.pagar)}>
              {crear ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
            </button>
            {!crear && (
              <a href="#contacto" className="pq-link" onClick={e => { e.preventDefault(); irAContacto("cuenta"); }}>
                ¿Contraseña olvidada? Escríbenos
              </a>
            )}
          </div>
        </form>
      ) : (
        <>
          <button type="button" className={"ev-cta" + (busy || cargando ? " is-cargando" : "")}
                  disabled={busy || cargando} onClick={user ? pagar : () => abrir("crear", true)}>
            {busy ? "Abriendo el pago…" : "Comprar paquete"}
            <span className="ev-cta-arw" aria-hidden="true" />
          </button>
          <span className="ev-fine">Pago seguro con tarjeta a través de Stripe</span>
          {error && <span className="ev-wl-err">{error}</span>}
        </>
      )}

      {cuenta}
    </>
  );
}
