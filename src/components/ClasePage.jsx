import { useEffect, useRef, useState, useCallback } from "react";
import { getClase, getPaquete, clasesDePaquete, claseHref, CLASES, GROUPS, NIVELES } from "../data.js";
import { embedUrl, posterUrl } from "../lib/video.js";
import { useAcceso } from "../hooks/useAcceso.jsx";
import ShareRow from "./ShareRow.jsx";
import MultiLine from "./MultiLine.jsx";
import BrandMark from "./BrandMark.jsx";
import LockIcon from "./ui/LockIcon.jsx";

const modLabel = (slug) => GROUPS.find((g) => g.slug === slug)?.nameEm || slug;
const nivLabel = (slug) => NIVELES.find((n) => n.slug === slug)?.label || slug;

// Enlaza a otra clase del mismo paquete (o modalidad)
function MiniClase({ clase }) {
  const { bloqueada, videoDe } = useAcceso();
  const thumb = posterUrl(clase, videoDe(clase));
  return (
    <a className="clp-mini" href={claseHref(clase, bloqueada(clase))}>
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
  const { bloqueada, videoDe, cargando } = useAcceso();
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
  const shareText = `${clase.titulo}\nUna clase de cala.studio`;
  const video = videoDe(clase);
  const poster = posterUrl(clase, video);
  const paquete = getPaquete(clase.paquete);
  const locked = bloqueada(clase);
  // Mientras se leen las compras de la cuenta aún no se sabe si es suya: se
  // enseña el marcador sin más, ni reproductor ni invitación a comprar
  const sinSaber = locked && cargando;
  // Es suya pero su vídeo no ha llegado: falta su fila en `clase_videos`
  const sinVideo = !locked && !video;
  const grupo = paquete ? clasesDePaquete(paquete.slug) : CLASES.filter((c) => c.modalidad === clase.modalidad);
  const relacionadas = grupo.filter((c) => c.slug !== clase.slug).slice(0, 3);
  const familia = paquete ? paquete.nombre : `Pilates ${modLabel(clase.modalidad)}`;

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

        {!locked && video ? (
          <div className="clp-video">
            <iframe
              src={embedUrl(video)}
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
              {!sinVideo && <span className="clp-locked__icon"><LockIcon /></span>}
              {sinVideo && (
                <>
                  <span className="clp-locked__k">Vídeo en camino</span>
                  <p className="clp-locked__note">Esta clase ya es tuya y su vídeo estará disponible muy pronto</p>
                </>
              )}
              {locked && !sinSaber && <span className="clp-locked__k">{paquete ? `Incluida en ${paquete.nombre}` : "Clase bloqueada"}</span>}
              {locked && !sinSaber && paquete && (
                <>
                  <p className="clp-locked__note">
                    Compra el paquete y desbloquea todas sus clases
                  </p>
                  <a href={`#/paquete/${paquete.slug}`} className="clp-locked__cta">
                    Ver paquete · {paquete.precio}€<span className="ev-cta-arw" aria-hidden="true" />
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </aside>

      <section className="ev-panel">
        <div className="ev-panel__in">
          <header className="ev-head">
            <span className="ev-eyebrow">{familia} · {nivLabel(clase.nivel)}</span>
            <h1 className="ev-title">{clase.titulo}</h1>
            <MultiLine text={clase.descr} className="ev-lede" />
          </header>

          <ul className="ev-meta">
            <li><span className="ev-meta-k">{paquete ? "Paquete" : "Modalidad"}</span><span className="ev-meta-v">{familia}</span></li>
            <li><span className="ev-meta-k">Nivel</span><span className="ev-meta-v">{nivLabel(clase.nivel)}</span></li>
            <li><span className="ev-meta-k">Duración</span><span className="ev-meta-v">{clase.duracion}</span></li>
            <li><span className="ev-meta-k">Acceso</span><span className="ev-meta-v">{locked ? "Con el paquete" : clase.gratis ? "Gratis, sin cuenta" : "En tu paquete"}</span></li>
          </ul>

          {relacionadas.length > 0 && (
            <div className="clp-more">
              <span className="clp-more__k">Más de {familia}</span>
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
