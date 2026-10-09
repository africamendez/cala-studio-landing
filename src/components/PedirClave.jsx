import { useState } from "react";
import { useAcceso } from "../hooks/useAcceso.jsx";
import { irAContacto } from "../lib/nav.js";
import { EMAIL_RE } from "../lib/cuenta.js";
import MultiLine from "./MultiLine.jsx";

function mensajeDe(err) {
  // El correo que trae Supabase de serie solo escribe al equipo del proyecto:
  // para las clientas hace falta un servidor de correo (ver supabase/README.md)
  if (err.code === "email_address_not_authorized") return "Ahora mismo no podemos enviarte el email · escríbenos y te la cambiamos";
  if (err.status === 429) return "Demasiados intentos · espera unos minutos y vuelve a probar";
  if (err.code === "email_address_invalid" || err.code === "validation_failed") return "Ese email no parece válido";
  return "No hemos podido enviarlo · inténtalo de nuevo en un momento";
}

// Contraseña olvidada: se pide el email y le llega un enlace de un solo uso
// que devuelve a la web con la sesión abierta, lista para elegir la nueva
// (ClavePage). `paquete` es la ficha desde la que se pide, para volver a ella;
// los `children` son los enlaces propios de cada sitio donde se usa.
export default function PedirClave({ titulo, lede, emailInicial = "", paquete, onContacto, children }) {
  const { pedirClave } = useAcceso();
  const [email, setEmail]     = useState(emailInicial);
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState("");
  const [enviado, setEnviado] = useState(false);
  const mail = email.trim();

  const enviar = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const { error: err } = await pedirClave(mail, paquete);
    if (err) setError(mensajeDe(err)); else setEnviado(true);
    setBusy(false);
  };

  const enlaces = (
    <div className="pq-links">
      {children}
      {(enviado || error) && (
        <button type="button" className="pq-link" onClick={onContacto ?? (() => irAContacto("cuenta"))}>
          {enviado ? "¿No te llega? Escríbenos" : "Escríbenos"}
        </button>
      )}
    </div>
  );

  // Supabase no dice si el email tiene cuenta (así nadie puede ir probando
  // direcciones), y el aviso tampoco lo da por hecho
  if (enviado) {
    return (
      <div className="ev-wl">
        <p className="ev-wl-done">
          ✓ Mira tu email
          <span>Si {mail} tiene cuenta, le hemos enviado un enlace para elegir contraseña nueva</span>
          <span>Tarda un momento y a veces cae en spam</span>
        </p>
        {enlaces}
      </div>
    );
  }

  return (
    <form className="ev-wl" onSubmit={enviar}>
      <span className="ev-wl-title">{titulo}</span>
      <MultiLine className="ev-wl-lede" text={lede} />
      <div className="ev-wl-fields">
        <input className="ev-wl-f wide" type="email" inputMode="email" placeholder="Email"
               autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="ev-wl-b" disabled={!EMAIL_RE.test(mail) || busy}>
        {busy ? "…" : "Enviar enlace"}
      </button>
      {error && <span className="ev-wl-err">{error}</span>}
      {enlaces}
    </form>
  );
}
