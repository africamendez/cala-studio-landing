import { useEffect, useRef, useState, useCallback } from "react";
import { getClase, CLASES, GROUPS, NIVELES } from "../data.js";
import { embedUrl, thumbUrl } from "../lib/video.js";
import ShareRow from "./ShareRow.jsx";
import MultiLine from "./MultiLine.jsx";
import BrandMark from "./BrandMark.jsx";

const modLabel = (slug) => GROUPS.find((g) => g.slug === slug)?.nameEm || slug;
const nivLabel = (slug) => NIVELES.find((n) => n.slug === slug)?.label || slug;

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// Enlaza a otra clase de la misma modalidad
function MiniClase({ clase }) {
  const thumb = thumbUrl(clase.video);
  return (
    <a className="clp-mini" href={`#/clase/${clase.slug}`}>
      {thumb && <img className="clp-mini__thumb" src={thumb} alt="" loading="lazy" />}
      <span className="clp-mini__body">
        <span className="clp-mini__title">{clase.titulo}</span>
        <span className="clp-mini__meta">{nivLabel(clase.nivel)} · {clase.duracion}</span>
      </span>
    </a>
  );
}

export default function ClasePage({ slug }) {
  const clase = getClase(slug);
  const [aviso, setAviso] = useState("");
  const avisoTimer = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const toast = useCallback((m) => {
    setAviso(m);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(""), 2800);
  }, []);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const goHome    = (e) => { e.preventDefault(); window.location.hash = ""; };
  const goClases  = (e) => { e.preventDefault(); window.location.hash = "#/clases"; };

  // Clase de miembros → al acceso anticipado, con el interés ya elegido
  const goAcceso = (e) => {
    e.preventDefault();
    try { sessionStorage.setItem("cala.interes", "acceso"); } catch {}
    window.location.hash = "#contacto";
  };

  if (!clase) {
    return (
      <main className="evento-page ev-404">
        <div className="ev-404-in">
          <span className="ev-eyebrow">Clase</span>
          <h1 className="ev-404-title">Esta clase no está disponible</h1>
          <a href="#/clases" className="ev-cta" onClick={goClases}>Ver todas las clases</a>
        </div>
      </main>
    );
  }

  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#/clase/${clase.slug}`
    : "";
  const shareText = `${clase.titulo} · Pilates ${modLabel(clase.modalidad)}\nUna clase de cala.studio`;
  const poster = thumbUrl(clase.video);
  const relacionadas = CLASES.filter((c) => c.modalidad === clase.modalidad && c.slug !== clase.slug).slice(0, 3);

  return (
    <main className="clase-page">
      <aside className="clp-visual">
        <div className="clp-top">
          <a href="#top" className="clp-brand" onClick={goHome}>
            <BrandMark size={20} className="brand-mark" />
            <span>cala<span className="d">.</span>studio</span>
          </a>
          <a href="#/clases" className="clp-back" onClick={goClases}>‹ Clases</a>
        </div>

        {clase.gratis ? (
          <div className="clp-video">
            <iframe
              src={embedUrl(clase.video)}
              title={clase.titulo}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="clp-locked" style={poster ? { backgroundImage: `url(${poster})` } : undefined}>
            <span className="clp-locked__veil" aria-hidden="true" />
            <div className="clp-locked__in">
              <span className="clp-locked__icon"><LockIcon /></span>
              <span className="clp-locked__k">Clase para miembros</span>
              <p className="clp-locked__note">
                La plataforma con cuentas y membresías llega pronto<br />
                déjanos tu contacto y serás de las primeras
              </p>
              <a href="#contacto" className="clp-locked__cta" onClick={goAcceso}>
                Apúntame al acceso anticipado<span className="ev-cta-arw" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </aside>

      <section className="ev-panel">
        <div className="ev-panel__in">
          <header className="ev-head">
            <span className="ev-eyebrow">Pilates {modLabel(clase.modalidad)} · {nivLabel(clase.nivel)}</span>
            <h1 className="ev-title">{clase.titulo}</h1>
            <MultiLine text={clase.descr} className="ev-lede" />
          </header>

          <ul className="ev-meta">
            <li><span className="ev-meta-k">Modalidad</span><span className="ev-meta-v">Pilates {modLabel(clase.modalidad)}</span></li>
            <li><span className="ev-meta-k">Nivel</span><span className="ev-meta-v">{nivLabel(clase.nivel)}</span></li>
            <li><span className="ev-meta-k">Duración</span><span className="ev-meta-v">{clase.duracion}</span></li>
            <li><span className="ev-meta-k">Acceso</span><span className="ev-meta-v">{clase.gratis ? "Gratis, sin cuenta" : "Con membresía"}</span></li>
          </ul>

          {relacionadas.length > 0 && (
            <div className="clp-more">
              <span className="clp-more__k">Más Pilates {modLabel(clase.modalidad)}</span>
              <div className="clp-more__list">
                {relacionadas.map((c) => <MiniClase key={c.slug} clase={c} />)}
              </div>
            </div>
          )}

          <div className="ev-reserva">
            <ShareRow url={pageUrl} texto={shareText} onAviso={toast} />
          </div>
        </div>
      </section>

      {aviso && <div className="ev-toast" role="status">{aviso}</div>}
    </main>
  );
}
