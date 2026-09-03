import Section from "./Section.jsx";
import ClaseCard from "./ClaseCard.jsx";
import { CLASES } from "../data.js";

// Tira de las clases más recientes en la home. El grid se vuelve carrusel
// deslizable en móvil (mismo patrón que la sección de eventos).
export default function ClasesPreview() {
  const ultimas = [...CLASES]
    .sort((a, b) => (a.publicada < b.publicada ? 1 : -1))
    .slice(0, 6);

  if (!ultimas.length) return null;

  return (
    <Section
      id="clases"
      num="II · Clases"
      title={<>Empieza <em>ahora</em></>}
      right={<>
        Clases nuevas cada semana, por modalidad y nivel<br />
        Las marcadas como gratis se ven sin cuenta
      </>}
    >
      <div className="cl-strip">
        {ultimas.map((c) => <ClaseCard key={c.slug} clase={c} />)}
      </div>
      <a href="#/clases" className="cl-strip__all">
        Ver todas las clases<span className="arw" aria-hidden="true" />
      </a>
    </Section>
  );
}
