import { useEffect, useRef, useState, useCallback } from "react";
import { getPaquete, clasesDePaquete, NIVELES } from "../data.js";
import { posterUrl } from "../lib/video.js";
import { useAcceso } from "../hooks/useAcceso.jsx";
import CompraPaquete from "./CompraPaquete.jsx";
import ShareRow from "./ShareRow.jsx";
import MultiLine from "./MultiLine.jsx";
import BrandMark from "./BrandMark.jsx";
import LockIcon from "./ui/LockIcon.jsx";

const nivLabel = (slug) => NIVELES.find((n) => n.slug === slug)?.label || slug;

// Clase incluida en el paquete. Bloqueada: miniatura con velo y candado, sin
// enlace. Con el paquete comprado, la miniatura limpia lleva a su reproductor.
function ClaseIncluida({ clase, bloqueada }) {
  const { videoDe } = useAcceso();
  const thumb = posterUrl(clase, videoDe(clase));
  const dentro = (
    <>
      <span className={"cl-card__thumb pq-clase__thumb" + (bloqueada ? " is-locked" : "")}>
        {thumb && <img src={thumb} alt="" loading="lazy" />}
        {bloqueada && (
          <span className="cl-card__lock">
            <span className="cl-card__lock-ic"><LockIcon /></span>
          </span>
        )}
      </span>
      <span className="pq-clase__body">
        <span className="pq-clase__title">{clase.titulo}</span>
        <span className="pq-clase__meta">{nivLabel(clase.nivel)} · {clase.duracion}</span>
      </span>
    </>
  );
  return (
    <li>
      {bloqueada
        ? <div className="pq-clase">{dentro}</div>
        : <a className="pq-clase" href={`#/clase/${clase.slug}`}>{dentro}</a>}
    </li>
  );
}

// Página de compra de un paquete (#/paquete/<slug>). Misma estructura
// editorial que la de evento: a la izquierda lo que incluye, a la derecha el
// panel con el precio y el pago online (CompraPaquete).
export default function PaquetePage({ slug }) {
  const paquete = getPaquete(slug);
  const { bloqueada } = useAcceso();
  const [aviso, setAviso] = useState("");
  const avisoTimer = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const toast = useCallback((m) => {
    setAviso(m);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(""), 2800);
  }, []);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const goHome   = (e) => { e.preventDefault(); window.location.hash = ""; };
  const goClases = (e) => { e.preventDefault(); window.location.hash = "#/clases"; };

  if (!paquete) {
    return (
      <main className="evento-page ev-404">
        <div className="ev-404-in">
          <span className="ev-eyebrow">Paquete</span>
          <h1 className="ev-404-title">Este paquete no está disponible</h1>
          <a href="#/clases" className="ev-cta" onClick={goClases}>Ver todas las clases</a>
        </div>
      </main>
    );
  }

  const clases = clasesDePaquete(paquete.slug);
  const minutos = clases.reduce((t, c) => t + (parseInt(c.duracion, 10) || 0), 0);
  const niveles = NIVELES.filter((n) => clases.some((c) => c.nivel === n.slug)).map((n) => n.label);
  const nClases = `${clases.length} ${clases.length === 1 ? "clase" : "clases"}`;

  const nombre = paquete.nombre;
  const tituloBase = paquete.nombreEm && nombre.endsWith(paquete.nombreEm)
    ? nombre.slice(0, nombre.length - paquete.nombreEm.length).trim()
    : nombre;

  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#/paquete/${paquete.slug}`
    : "";
  const shareText = `${nombre} · ${nClases} en vídeo\nUn paquete de cala.studio`;

  return (
    <main className="clase-page paquete-page">
      <aside className="clp-visual">
        <div className="clp-top">
          <a href="#top" className="clp-brand" onClick={goHome}>
            <BrandMark size={20} className="brand-mark" />
            <span>cala<span className="d">.</span>studio</span>
          </a>
          <a href="#/clases" className="clp-back" onClick={goClases}>‹ Clases</a>
        </div>

        <div className="pq-incluye">
          <span className="clp-more__k">Incluye {nClases}</span>
          <ul className="pq-list">
            {clases.map((c) => <ClaseIncluida key={c.slug} clase={c} bloqueada={bloqueada(c)} />)}
          </ul>
        </div>
      </aside>

      <section className="ev-panel">
        <div className="ev-panel__in">
          <header className="ev-head">
            <span className="ev-eyebrow">Paquete · {nClases}</span>
            <h1 className="ev-title">
              {tituloBase} {paquete.nombreEm && <em>{paquete.nombreEm}</em>}
            </h1>
            <MultiLine text={paquete.lede} className="ev-lede" />
          </header>

          <MultiLine text={paquete.descr} className="ev-descr" />

          <ul className="ev-meta">
            <li><span className="ev-meta-k">Incluye</span><span className="ev-meta-v">{nClases} en vídeo</span></li>
            {minutos > 0 && <li><span className="ev-meta-k">Duración</span><span className="ev-meta-v">{minutos} min en total</span></li>}
            {niveles.length > 0 && <li><span className="ev-meta-k">Nivel</span><span className="ev-meta-v">{niveles.join(" · ")}</span></li>}
          </ul>

          <div className="ev-reserva">
            <CompraPaquete paquete={paquete} primeraClase={clases[0]} />
            <ShareRow url={pageUrl} texto={shareText} onAviso={toast} />
          </div>
        </div>
      </section>

      {aviso && <div className="ev-toast" role="status">{aviso}</div>}
    </main>
  );
}
