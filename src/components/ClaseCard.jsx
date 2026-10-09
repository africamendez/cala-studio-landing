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
      <path d="M9 6.5v11l9-5.5z" />
    </svg>
  );
}

// Tarjeta de clase — la comparten la tira de la home y la biblioteca (#/clases).
// La imagen es siempre la portada de la clase (`poster`).
// Bloqueada: un negro translúcido y el candado encima; el clic lleva a su paquete.
// Abierta (de muestra, o de un paquete comprado): la portada limpia con el
// play; lleva a su reproductor.
export default function ClaseCard({ clase }) {
  const [thumbOk, setThumbOk] = useState(true);
  const { bloqueada, videoDe } = useAcceso();
  const thumb = posterUrl(clase, videoDe(clase));
  const conImagen = !!thumb && thumbOk;
  const locked = bloqueada(clase);
  const paquete = getPaquete(clase.paquete);
  const etiqueta = paquete ? "Ver paquete" : "Bloqueada";

  return (
    <a className="cl-card" href={claseHref(clase, locked)}>
      <span className={"cl-card__thumb" + (locked ? " is-locked" : "")}>
        {conImagen && <img src={thumb} alt="" loading="lazy" onError={() => setThumbOk(false)} />}
        {locked ? (
          <span className="cl-card__lock">
            <span className="cl-card__lock-ic"><LockIcon /></span>
            <span className="cl-card__lock-k">{etiqueta}</span>
          </span>
        ) : (
          <>
            <span className="cl-card__play"><PlayIcon /></span>
            {clase.gratis && <span className="cl-card__badge is-free">Gratis</span>}
          </>
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
