import Section from "./Section.jsx";
import { GROUPS } from "../data.js";

// Las tres modalidades como puerta a la biblioteca. Misma tarjeta que el
// modo verano (Grupos.jsx) pero sin el bloque de horarios: aquí cada tarjeta
// lleva a sus clases en vídeo, #/clases/<slug>.
function ModalidadCard({ group }) {
  return (
    <a href={`#/clases/${group.slug}`} className="group-card">
      <div className="head">
        <span className="num">{group.num}</span>
        <span className="tag">{group.tag}</span>
      </div>
      <h3>{group.name} <b>{group.nameEm}</b></h3>
      <p className="descr">{group.descr}</p>
      <span className="group-card__go">Ver clases<span className="arw" aria-hidden="true" /></span>
    </a>
  );
}

export default function Modalidades() {
  return (
    <Section
      id="modalidades"
      num="I · Modalidades"
      title={<>Tres <em>modalidades</em></>}
      right={<>
        Empieza por Mat si vienes sin experiencia, encadena movimiento en Flow
        y suma resistencia en Sculpt<br />
        Cada clase indica su nivel, tú eliges por dónde entrar
      </>}
    >
      <div className="grid-12">
        {GROUPS.map((g) => <ModalidadCard key={g.slug} group={g} />)}
      </div>
    </Section>
  );
}
