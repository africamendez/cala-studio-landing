import { useState } from "react";
import { GROUPS, NIVELES } from "../data.js";
import { thumbUrl } from "../lib/video.js";

const modLabel = (slug) => GROUPS.find((g) => g.slug === slug)?.nameEm || slug;
const nivLabel = (slug) => NIVELES.find((n) => n.slug === slug)?.label || slug;

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// Tarjeta de clase — la comparten la tira de la home y la biblioteca (#/clases).
export default function ClaseCard({ clase }) {
  const [thumbOk, setThumbOk] = useState(true);
  const thumb = thumbUrl(clase.video);

  return (
    <a className="cl-card" href={`#/clase/${clase.slug}`}>
      <span className="cl-card__thumb">
        {thumb && thumbOk ? (
          <img src={thumb} alt="" loading="lazy" onError={() => setThumbOk(false)} />
        ) : (
          <span className="cl-card__thumb-ph">{clase.titulo}</span>
        )}
        <span className={"cl-card__badge" + (clase.gratis ? " is-free" : " is-locked")}>
          {clase.gratis ? <><PlayIcon /> Gratis</> : <><LockIcon /> Miembros</>}
        </span>
      </span>

      <span className="cl-card__body">
        <span className="cl-card__tag">{modLabel(clase.modalidad)} · {nivLabel(clase.nivel)}</span>
        <span className="cl-card__title">{clase.titulo}</span>
        <span className="cl-card__dur">{clase.duracion}</span>
      </span>
    </a>
  );
}
