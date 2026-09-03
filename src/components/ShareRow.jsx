// Fila de "Compartir" — WhatsApp abre el selector de contacto, Instagram no
// tiene enlace directo a un chat (se copia el enlace y se abre Direct; en móvil
// la hoja nativa ya ofrece Instagram), y "Copiar enlace" para el resto.
// La usan la página de evento (#/evento/<slug>) y la de clase (#/clase/<slug>).

const svgProps = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
};
const IconWhatsApp = () => (
  <svg {...svgProps}><path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z" /><path d="M8.7 9c.3 1.4 1.3 2.9 2.5 4 .9.8 2 1.4 3.1 1.7" /></svg>
);
const IconInstagram = () => (
  <svg {...svgProps}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" /></svg>
);
const IconLink = () => (
  <svg {...svgProps}><path d="M10 13a5 5 0 0 0 7.5.5l2-2A5 5 0 0 0 12.5 4.5l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2A5 5 0 0 0 11.5 19.5l1.2-1.2" /></svg>
);

// Copia al portapapeles con caída atrás para contextos sin permiso/https
export async function copiar(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch { /* seguimos con el plan B */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

export default function ShareRow({ url, texto, onAviso }) {
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${texto}\n${url}`)}`;

  const instagram = () => {
    if (navigator.share) {
      navigator.share({ title: texto.split("\n")[0], text: texto, url }).catch(() => {});
      return;
    }
    copiar(url).then(ok => onAviso(ok ? "Enlace copiado · pégalo en tu Direct" : "Copia el enlace de la barra del navegador"));
    window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener");
  };

  const enlace = async () => {
    const ok = await copiar(url);
    onAviso(ok ? "Enlace copiado" : "No se pudo copiar, hazlo desde la barra del navegador");
  };

  return (
    <div className="ev-share">
      <span className="ev-share-k">Compartir</span>
      <div className="ev-share-row">
        <a className="ev-share-b" href={waHref} target="_blank" rel="noopener">
          <IconWhatsApp />WhatsApp
        </a>
        <button type="button" className="ev-share-b" onClick={instagram}>
          <IconInstagram />Instagram
        </button>
        <button type="button" className="ev-share-b" onClick={enlace}>
          <IconLink />Copiar enlace
        </button>
      </div>
    </div>
  );
}
