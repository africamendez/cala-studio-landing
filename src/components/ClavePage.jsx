import { useState } from "react";
import { useAcceso } from "../hooks/useAcceso.jsx";
import { irAContacto } from "../lib/nav.js";
import { CLAVE_MIN } from "../lib/cuenta.js";
import BrandMark from "./BrandMark.jsx";
import MultiLine from "./MultiLine.jsx";
import PedirClave from "./PedirClave.jsx";
import CampoClave from "./ui/CampoClave.jsx";

function mensajeDe(err) {
  if (err.code === "weak_password") return "Esa contraseña es demasiado fácil · prueba con otra más larga";
  if (err.status === 429) return "Demasiados intentos · espera un minuto y vuelve a probar";
  return "No hemos podido guardarla · inténtalo de nuevo en un momento";
}

// A donde devuelve el enlace de "contraseña olvidada" (PedirClave). Con un
// enlace válido la sesión ya llega abierta y solo queda elegir la contraseña
// nueva; si ya se usó o ha caducado, se pide otro desde aquí mismo.
// No tiene dirección propia: la monta App mientras dura, y `onFin` la cierra
// llevando a la página que se le diga.
export default function ClavePage({ enlace, onFin }) {
  const { user, cargando, cambiarClave } = useAcceso();
  const [clave, setClave] = useState("");
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");
  const [hecha, setHecha] = useState(false);

  // Pedido desde la ficha de un paquete, el enlace vuelve con ?paquete=<slug>
  const [paquete] = useState(() => new URLSearchParams(window.location.search).get("paquete"));
  const destino = paquete ? `#/paquete/${encodeURIComponent(paquete)}` : "#/clases";

  // Sin sesión no hay cuenta a la que cambiarle nada: el enlace no ha valido
  const caducado = enlace === "caducado" || (!cargando && !user);

  const guardar = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const { error: err } = await cambiarClave(clave);
    // Repetir la que ya tenía también vale: es la suya y ya está dentro
    if (err && err.code !== "same_password") setError(mensajeDe(err));
    else setHecha(true);
    setBusy(false);
  };

  return (
    <main className="clave-page">
      <a href="#top" className="clp-brand clave-page__brand" onClick={e => { e.preventDefault(); onFin(""); }}>
        <BrandMark size={20} className="brand-mark" />
        <span>cala<span className="d">.</span>studio</span>
      </a>

      <div className="clave-page__in">
        <header className="ev-head">
          <span className="ev-eyebrow">Tu cuenta</span>
          <h1 className="ev-title">
            {caducado ? <>Enlace <em>caducado</em></> : <>Contraseña <em>nueva</em></>}
          </h1>
        </header>

        {caducado ? (
          <PedirClave
            titulo="Este enlace ya no sirve"
            lede={"Valen una sola vez y caducan pronto\nPide otro y ábrelo en cuanto te llegue"}
            paquete={paquete}
            onContacto={() => { onFin("#contacto"); irAContacto("cuenta"); }}
          >
            <button type="button" className="pq-link" onClick={() => onFin(destino)}>Volver a la web</button>
          </PedirClave>
        ) : hecha ? (
          <>
            <p className="ev-wl-done">
              ✓ Contraseña cambiada
              <span>Ya puedes entrar con ella desde cualquier dispositivo</span>
            </p>
            <button type="button" className="ev-cta" onClick={() => onFin(destino)}>
              {paquete ? "Volver al paquete" : "Ir a las clases"}
              <span className="ev-cta-arw" aria-hidden="true" />
            </button>
          </>
        ) : (
          <form className="ev-wl" onSubmit={guardar}>
            <MultiLine
              className="ev-wl-lede"
              text={(user ? `Para ${user.email}\n` : "") + "Elige la contraseña con la que entrarás desde ahora"}
            />
            <div className="ev-wl-fields">
              <CampoClave nueva value={clave} onChange={setClave}
                          placeholder={`Contraseña nueva · mínimo ${CLAVE_MIN} caracteres`} />
            </div>
            <button className="ev-wl-b" disabled={!user || clave.length < CLAVE_MIN || busy}>
              {busy ? "…" : "Guardar contraseña"}
            </button>
            {error && <span className="ev-wl-err">{error}</span>}
            <button type="button" className="pq-link" onClick={() => onFin(destino)}>Ahora no</button>
          </form>
        )}
      </div>
    </main>
  );
}
