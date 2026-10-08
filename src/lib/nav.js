// Navegación entre las páginas dedicadas (#/evento, #/paquete…) y la portada.

// Ir a una sección de la portada desde una página dedicada. La portada aún no
// está montada al pulsar, así que el ancla nativa no la encuentra: se fija el
// hash y se baja en cuanto la sección aparece en el DOM.
export function irASeccion(id) {
  window.location.hash = id;
  let tries = 0;
  const tick = () => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView(); return; }
    if (tries++ < 30) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Al formulario de contacto, con el "¿Qué te interesa?" ya elegido
export function irAContacto(interes) {
  try { sessionStorage.setItem("cala.interes", interes); } catch {}
  irASeccion("contacto");
}

// Quita parámetros de la URL sin recargar. Stripe devuelve con ?pago=ok&…:
// se leen una vez y se retiran, para que recargar o compartir no los arrastre.
export function limpiarParametros(...claves) {
  const q = new URLSearchParams(window.location.search);
  if (!claves.some((k) => q.has(k))) return;
  claves.forEach((k) => q.delete(k));
  const resto = q.toString();
  window.history.replaceState(null, "", window.location.pathname + (resto ? `?${resto}` : "") + window.location.hash);
}
