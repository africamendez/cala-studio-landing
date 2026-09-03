// Voz sin puntos: cada idea en su línea, separadas con salto de línea (\n).
// Pinta un <p> con <br> entre líneas; si el texto viene vacío, no pinta nada.
export default function MultiLine({ text, className }) {
  const lines = (text || "").split("\n");
  if (lines.length === 1 && lines[0] === "") return null;
  return (
    <p className={className}>
      {lines.map((l, i, a) => (
        <span key={i}>{l}{i < a.length - 1 && <br />}</span>
      ))}
    </p>
  );
}
