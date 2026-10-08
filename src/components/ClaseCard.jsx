import { useState } from "react";
import { GROUPS, NIVELES, getPaquete, claseHref } from "../data.js";
import { posterUrl } from "../lib/video.js";
import { useAcceso } from "../hooks/useAcceso.jsx";
import LockIcon from "./ui/LockIcon.jsx";

const modLabel = (slug) => GROUPS.find((g) => g.slug === slug)?.nameEm || slug;
const nivLabel = (slug) => NIVELES.find((n) => n.slug === slug)?.label || slug;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// Tarjeta de clase — la comparten la tira de la home y la biblioteca (#/clases).
// Bloqueada: velo + candado sobre la miniatura, y el clic lleva a su paquete.
// Abierta (de muestra, o de un paquete comprado): lleva a su reproductor.
export default function ClaseCard({ clase }) {
  const [thumbOk, setThumbOk] = useState(true);
  const { bloqueada, videoDe } = useAcceso();
  const thumb = posterUrl(clase, videoDe(clase));
  const locked = bloqueada(clase);
  const paquete = getPaquete(clase.paquete);

  return (
    <a className="cl-card" href={claseHref(clase, locked)}>
      <span className={"cl-card__thumb" + (locked ? " is-locked" : "")}>
        {thumb && thumbOk ? (
          <img src={thumb} alt="" loading="lazy" onError={() => setThumbOk(false)} />
        ) : !locked && (
          <span className="cl-card__thumb-ph">{clase.titulo}</span>
        )}
        {locked ? (
          <span className="cl-card__lock">
            <span className="cl-card__lock-ic"><LockIcon /></span>
            <span className="cl-card__lock-k">{paquete ? "Ver paquete" : "Bloqueada"}</span>
          </span>
        ) : (
          <span className="cl-card__badge is-free"><PlayIcon /> {clase.gratis ? "Gratis" : "Tuya"}</span>
        )}
      </span>

      <span className="cl-card__body">
        <span className="cl-card__tag">{paquete ? paquete.nombre : modLabel(clase.modalidad)} · {nivLabel(clase.nivel)}</span>
        <span className="cl-card__title">{clase.titulo}</span>
        <span className="cl-card__dur">{clase.duracion}</span>
      </span>
    </a>
  );
}
