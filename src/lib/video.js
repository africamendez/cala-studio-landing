// Normaliza el campo `video` de una clase a URL de reproductor y a miniatura.
// Acepta:
//   { provider: "youtube", id: "XXXXXXXXXXX" }
//   { provider: "vimeo",   id: "123456789" }
//   "https://www.youtube.com/embed/XXXXXXXXXXX"  (una URL ya hecha)

function parse(video) {
  if (!video) return null;
  if (typeof video === "string") {
    const yt = video.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{11})/);
    if (yt) return { provider: "youtube", id: yt[1] };
    const vm = video.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { provider: "vimeo", id: vm[1] };
    return { provider: "url", url: video };
  }
  return video;
}

// URL para el <iframe> del reproductor
export function embedUrl(video) {
  const v = parse(video);
  if (!v) return "";
  if (v.provider === "youtube") return `https://www.youtube.com/embed/${v.id}?rel=0`;
  if (v.provider === "vimeo") return `https://player.vimeo.com/video/${v.id}`;
  return v.url || "";
}

// Miniatura para las tarjetas. YouTube la sirve directa; para el resto se
// devuelve null y la tarjeta cae a un marcador con el nombre de la clase.
export function thumbUrl(video) {
  const v = parse(video);
  if (v?.provider === "youtube") return `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
  return null;
}
