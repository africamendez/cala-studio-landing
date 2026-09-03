import { useEffect, useMemo, useState } from "react";
import BrandMark from "./BrandMark.jsx";
import ClaseCard from "./ClaseCard.jsx";
import { CLASES, GROUPS, NIVELES } from "../data.js";

const MOD_OPCIONES = [{ slug: "todas", label: "Todas" }, ...GROUPS.map((g) => ({ slug: g.slug, label: g.nameEm }))];
const NIV_OPCIONES = [{ slug: "todos", label: "Todos" }, ...NIVELES];

export default function ClasesPage({ modalidadInicial }) {
  const [modalidad, setModalidad] = useState(
    GROUPS.some((g) => g.slug === modalidadInicial) ? modalidadInicial : "todas"
  );
  const [nivel, setNivel] = useState("todos");

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const goHome = (e) => { e.preventDefault(); window.location.hash = ""; };

  const clases = useMemo(() => {
    return [...CLASES]
      .filter((c) => modalidad === "todas" || c.modalidad === modalidad)
      .filter((c) => nivel === "todos" || c.nivel === nivel)
      .sort((a, b) => (a.publicada < b.publicada ? 1 : -1));
  }, [modalidad, nivel]);

  return (
    <main className="clases-page">
      <div className="clp-top">
        <a href="#top" className="clp-brand" onClick={goHome}>
          <BrandMark size={20} className="brand-mark" />
          <span>cala<span className="d">.</span>studio</span>
        </a>
        <a href="#" className="clp-back" onClick={goHome}>‹ Inicio</a>
      </div>

      <header className="clp-head">
        <span className="clp-eyebrow">Wherever movement takes us</span>
        <h1 className="clp-title">Todas las <em>clases</em></h1>
        <p className="clp-lede">
          Filtra por modalidad y nivel<br />
          Las marcadas como gratis se ven sin cuenta, el resto abre con la membresía
        </p>
      </header>

      <div className="clp-filters">
        <div className="clp-filter">
          <span className="clp-filter__k">Modalidad</span>
          <div className="clp-pills">
            {MOD_OPCIONES.map((o) => (
              <button
                key={o.slug}
                className={"clp-pill" + (modalidad === o.slug ? " on" : "")}
                onClick={() => setModalidad(o.slug)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="clp-filter">
          <span className="clp-filter__k">Nivel</span>
          <div className="clp-pills">
            {NIV_OPCIONES.map((o) => (
              <button
                key={o.slug}
                className={"clp-pill" + (nivel === o.slug ? " on" : "")}
                onClick={() => setNivel(o.slug)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {clases.length ? (
        <div className="cl-grid">
          {clases.map((c) => <ClaseCard key={c.slug} clase={c} />)}
        </div>
      ) : (
        <p className="clp-empty">Aún no hay clases con estos filtros<br />prueba con otra combinación</p>
      )}
    </main>
  );
}
