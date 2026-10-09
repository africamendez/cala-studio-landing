import { SUMMER_MODE } from "./config.js";
import { PAQUETES_VENTA, EVENTOS_PRECIO } from "../supabase/functions/_shared/catalogo.js";

export const CONTACT = {
  phoneLabel: "+34 644 39 31 85",
  phoneHref: "tel:+34644393185",
  instagramLabel: "@calastudio.es",
  instagramHref: "https://www.instagram.com/calastudio.es/",
};

export const HERO_SLIDES = [
  { img: "assets/carousel-01.png",        label: "Atardecer" },
  { img: "assets/hero.jpg", label: "Mat outdoor · Frente al mar" },
  { img: "assets/carousel-03.png",        label: "Sunrise sessions" },
  { img: "assets/carousel-04.png", label: "Brunch club · Eventos", darkOverlay: true },
];

// Las tres modalidades del método. `schedule` solo se usa en modo verano
// (estudio presencial); `slug` es el que agrupa las clases en la biblioteca
// online (#/clases/<slug>).
export const GROUPS = [
  {
    num: "01",
    slug: "mat",
    tag: "Todos los niveles",
    name: "Pilates",
    nameEm: "Mat",
    descr: "Trabajo en suelo con tu propio peso · control postural, respiración y movilidad",
    schedule: [
      { day: "Martes", hours: "9:00 — 9:50h"},
      { day: "Jueves", hours: "9:00 — 9:50h"},
    ],
  },
  {
    num: "02",
    slug: "flow",
    tag: "Todos los niveles",
    name: "Pilates",
    nameEm: "Flow",
    descr: "Secuencias encadenadas al ritmo de la respiración · movilidad, coordinación y continuidad",
    schedule: [
      { day: "Lunes",     hours: "10:00 — 10:50h"},
      { day: "Miércoles", hours: "10:00 — 10:50h"},
    ],
  },
  {
    num: "03",
    slug: "sculpt",
    tag: "Todos los niveles",
    name: "Pilates",
    nameEm: "Sculpt",
    descr: "Mat intenso con instrumentos de resistencia · fuerza funcional sin perder fluidez",
    schedule: [
      { day: "Lunes",     hours: "9:00 — 9:50h"},
      { day: "Martes",    hours: "10:00 — 10:50h"},
      { day: "Miércoles", hours: "9:00 — 9:50h"},
      { day: "Jueves",    hours: "10:00 — 10:50h"},
    ],
  },
];

// ── Biblioteca de clases online ──────────────────────────────────────────
// Niveles con los que se filtran las clases en #/clases.
export const NIVELES = [
  { slug: "basico",     label: "Básico" },
  { slug: "intermedio", label: "Intermedio" },
  { slug: "avanzado",   label: "Avanzado" },
];

// Paquetes: cada uno agrupa sus clases en vídeo y se compra entero, con pago
// online (Stripe) desde su página, #/paquete/<slug>.
// Aquí va la ficha (los textos). El nombre y el precio de cada uno están en
// supabase/functions/_shared/catalogo.js, que comparten la web y la función
// que cobra: un paquete que no esté allí no sale en la web.
//
// ⚠️ Textos de EJEMPLO — ajústalos antes de publicar.
const PAQUETES_FICHA = [
  {
    slug: "premama",
    nombreEm: "Premamá",
    lede: "Movimiento suave y seguro para acompañar el embarazo\ntrimestre a trimestre",
    descr: "Clases pensadas para cada etapa del embarazo: respiración, suelo pélvico, movilidad de cadera y espalda, y fuerza amable para llegar al parto sintiéndote bien en tu cuerpo",
  },
  {
    slug: "postparto",
    nombreEm: "Postparto",
    lede: "Volver a tu centro sin prisa\nrecuperación progresiva después del parto",
    descr: "Reconecta con el abdomen profundo y el suelo pélvico, recoloca la postura y recupera fuerza paso a paso, con clases cortas que caben en el día a día con un bebé",
  },
  {
    slug: "sculpt-i",
    nombreEm: "Sculpt I",
    lede: "Mat intenso con resistencia\nel primer bloque para ganar fuerza sin perder fluidez",
    descr: "Banda elástica y peso ligero sobre la base del método: tren inferior, tren superior y centro, con el control y la técnica por delante de la carga",
  },
  {
    slug: "animal-flow-i",
    nombreEm: "Flow I",
    lede: "Movimiento cuadrúpedo a ras de suelo\nfuerza, movilidad y coordinación con tu propio peso",
    descr: "Las posiciones y transiciones base de Animal Flow, explicadas desde cero y encadenadas en un primer flow completo",
  },
  {
    slug: "mat-i",
    nombreEm: "Mat I",
    lede: "La base del método en suelo\nrespiración, centro y control postural",
    descr: "El punto de partida si llegas sin experiencia: trabajo en suelo con tu propio peso para entender la respiración, activar el centro y mover la columna con precisión",
  },
  {
    slug: "flow-i",
    nombreEm: "Flow I",
    lede: "Secuencias encadenadas al ritmo de la respiración\nmovilidad y continuidad",
    descr: "Del primer flow corto de mañana a una cadena larga de cuerpo entero, con transiciones que piden coordinación y presencia",
  },
];

export const PAQUETES = PAQUETES_FICHA
  .filter((p) => PAQUETES_VENTA[p.slug])
  .map((p) => ({ ...p, ...PAQUETES_VENTA[p.slug] }));

export function getPaquete(slug) {
  return PAQUETES.find((p) => p.slug === slug) || null;
}

// Catálogo de clases en vídeo. Cada clase pertenece a un `paquete` y sale
// bloqueada (velo + candado) hasta que la cuenta lo compra: al pulsarla lleva
// a la ficha de su paquete.
// `gratis: true` la abre sin candado, por si quieres dejar alguna de muestra.
// `modalidad` es opcional: solo la usan los filtros de #/clases.
//
// El vídeo de una clase de pago NO va aquí: este archivo se descarga entero
// con la web, lo haya comprado o no quien la abre. Va en la tabla
// `clase_videos` de Supabase (0016_clase_videos.sql), que solo se lo entrega a
// las cuentas con el paquete pagado. Para añadir una clase: sube el vídeo a
// YouTube (oculto/no listado) o Vimeo, pon su ficha aquí y su fila allí, con
// el mismo slug.
//
// Solo las de muestra (`gratis: true`) llevan el vídeo aquí, que es público:
//   video: { provider: "youtube", id: "dQw4w9WgXcQ" }
//   video: { provider: "vimeo",   id: "76979871" }
//
// `poster`: la portada de la clase, una imagen propia en public/assets/clases/
// (16:9, mejor de unos 960 px de ancho). Es lo que se ve en su tarjeta, esté
// bloqueada (con un negro translúcido y el candado encima) o ya comprada. La
// miniatura de YouTube no sirve de portada: lleva el ID del vídeo en su
// dirección, así que no se le puede enseñar a quien no lo ha comprado. Sin
// `poster`, la tarjeta sale en negro liso.
//
// ⚠️ Las portadas de ahora son recortes PROVISIONALES de las fotos de la web:
// cámbialas por la imagen de cada clase.
export const CLASES = [
  {
    slug: "mat-suelo-y-respiracion",
    poster: "assets/clases/mat-suelo-y-respiracion.jpg",
    modalidad: "mat",
    paquete: "mat-i",
    nivel: "basico",
    titulo: "Suelo y respiración",
    duracion: "22 min",
    descr: "Una toma de contacto con el método\nrespiración costal, activación del centro y movilidad de columna sin prisa",
    gratis: false,
    publicada: "2026-09-01",
  },
  {
    slug: "mat-abdomen-profundo",
    poster: "assets/clases/mat-abdomen-profundo.jpg",
    modalidad: "mat",
    paquete: "mat-i",
    nivel: "intermedio",
    titulo: "Abdomen profundo",
    duracion: "30 min",
    descr: "Serie de suelo centrada en el core\ncontrol de la pelvis y del transverso, con precisión antes que intensidad",
    gratis: false,
    publicada: "2026-09-08",
  },
  {
    slug: "flow-movilidad-de-manana",
    poster: "assets/clases/flow-movilidad-de-manana.jpg",
    modalidad: "flow",
    paquete: "flow-i",
    nivel: "basico",
    titulo: "Movilidad de mañana",
    duracion: "18 min",
    descr: "Secuencia corta para empezar el día\nencadenas movimiento sin pausa al ritmo de la respiración",
    gratis: false,
    publicada: "2026-09-04",
  },
  {
    slug: "flow-cadena-completa",
    poster: "assets/clases/flow-cadena-completa.jpg",
    modalidad: "flow",
    paquete: "flow-i",
    nivel: "avanzado",
    titulo: "Cadena completa",
    duracion: "40 min",
    descr: "Flow largo de cuerpo entero\ntransiciones exigentes, coordinación y continuidad de principio a fin",
    gratis: false,
    publicada: "2026-09-12",
  },
  {
    slug: "sculpt-piernas-y-gluteo",
    poster: "assets/clases/sculpt-piernas-y-gluteo.jpg",
    modalidad: "sculpt",
    paquete: "sculpt-i",
    nivel: "intermedio",
    titulo: "Piernas y glúteo",
    duracion: "28 min",
    descr: "Mat con banda y peso ligero\nfuerza funcional del tren inferior sin perder la fluidez del método",
    gratis: false,
    publicada: "2026-09-06",
  },
  {
    slug: "sculpt-tren-superior",
    poster: "assets/clases/sculpt-tren-superior.jpg",
    modalidad: "sculpt",
    paquete: "sculpt-i",
    nivel: "avanzado",
    titulo: "Tren superior",
    duracion: "32 min",
    descr: "Resistencia para brazos, espalda y hombros\nmandan el control y la técnica, la carga acompaña",
    gratis: false,
    publicada: "2026-09-15",
  },
  {
    slug: "premama-respiracion-y-suelo-pelvico",
    poster: "assets/clases/premama-respiracion-y-suelo-pelvico.jpg",
    modalidad: "mat",
    paquete: "premama",
    nivel: "basico",
    titulo: "Respiración y suelo pélvico",
    duracion: "20 min",
    descr: "Primer contacto con el trabajo de embarazo\nrespirar, soltar y activar el suelo pélvico con consciencia",
    gratis: false,
    publicada: "2026-10-01",
  },
  {
    slug: "premama-cadera-y-espalda",
    poster: "assets/clases/premama-cadera-y-espalda.jpg",
    modalidad: "mat",
    paquete: "premama",
    nivel: "basico",
    titulo: "Cadera y espalda",
    duracion: "25 min",
    descr: "Movilidad para aliviar la zona lumbar\ncadera libre y espalda acompañada a medida que crece la barriga",
    gratis: false,
    publicada: "2026-10-02",
  },
  {
    slug: "premama-fuerza-amable",
    poster: "assets/clases/premama-fuerza-amable.jpg",
    modalidad: "mat",
    paquete: "premama",
    nivel: "intermedio",
    titulo: "Fuerza amable",
    duracion: "28 min",
    descr: "Piernas, glúteo y brazos para el tercer trimestre\nfuerza útil sin presión sobre el abdomen",
    gratis: false,
    publicada: "2026-10-03",
  },
  {
    slug: "postparto-reconectar-el-centro",
    poster: "assets/clases/postparto-reconectar-el-centro.jpg",
    modalidad: "mat",
    paquete: "postparto",
    nivel: "basico",
    titulo: "Reconectar el centro",
    duracion: "15 min",
    descr: "Las primeras semanas\nrespiración, transverso y suelo pélvico desde lo más sencillo",
    gratis: false,
    publicada: "2026-10-04",
  },
  {
    slug: "postparto-postura-y-espalda",
    poster: "assets/clases/postparto-postura-y-espalda.jpg",
    modalidad: "mat",
    paquete: "postparto",
    nivel: "basico",
    titulo: "Postura y espalda",
    duracion: "22 min",
    descr: "Para las horas de brazos y lactancia\nabre el pecho, descarga el cuello y recoloca la espalda",
    gratis: false,
    publicada: "2026-10-05",
  },
  {
    slug: "postparto-vuelta-a-la-fuerza",
    poster: "assets/clases/postparto-vuelta-a-la-fuerza.jpg",
    modalidad: "mat",
    paquete: "postparto",
    nivel: "intermedio",
    titulo: "Vuelta a la fuerza",
    duracion: "30 min",
    descr: "Cuando el centro ya responde\ncuerpo entero con progresiones seguras",
    gratis: false,
    publicada: "2026-10-06",
  },
  {
    slug: "animal-flow-posiciones-base",
    poster: "assets/clases/animal-flow-posiciones-base.jpg",
    paquete: "animal-flow-i",
    nivel: "basico",
    titulo: "Posiciones base",
    duracion: "20 min",
    descr: "Beast, crab y ape paso a paso\nmuñecas preparadas y apoyos bien colocados",
    gratis: false,
    publicada: "2026-10-07",
  },
  {
    slug: "animal-flow-primer-flow",
    poster: "assets/clases/animal-flow-primer-flow.jpg",
    paquete: "animal-flow-i",
    nivel: "intermedio",
    titulo: "Primer flow",
    duracion: "26 min",
    descr: "Transiciones encadenadas\nunes las posiciones base en una secuencia completa",
    gratis: false,
    publicada: "2026-10-08",
  },
];

export function getClase(slug) {
  return CLASES.find((c) => c.slug === slug) || null;
}

export function clasesDePaquete(slug) {
  return CLASES.filter((c) => c.paquete === slug);
}

// Una clase bloqueada lleva a comprar su paquete; una abierta, a su reproductor.
// Si está bloqueada lo dice useAcceso: depende de lo que tenga comprado la cuenta
export function claseHref(c, bloqueada) {
  return bloqueada && c.paquete ? `#/paquete/${c.paquete}` : `#/clase/${c.slug}`;
}

export const PRICING = [
  {
    label: "Drop-in",
    name: "Tarifa",
    nameEm: "única",
    amount: 18,
    per: "/ clase",
    items: [
      "Clase suelta sin compromiso",
      "Mat y material incluido",
      "Ideal para probar el método",
    ],
    cta: "Reservar clase",
    href: "#/reservar",
  },
  {
    label: "Más popular",
    name: "Mensual",
    nameEm: "1 / semana",
    amount: 50,
    per: "/ mes",
    items: [
      "4 clases al mes",
      "Plaza fija en horario elegido",
      "Prioridad en eventos del estudio",
    ],
    cta: "Quiero mi plaza fija",
    href: "#contacto",
    interes: "mensual-1",
    featured: true,
  },
  {
    label: "Compromiso",
    name: "Mensual",
    nameEm: "2 / semana",
    amount: 80,
    per: "/ mes",
    items: [
      "8 clases al mes",
      "Mat, Flow y Sculpt combinables",
      "Prioridad en eventos del estudio",
    ],
    cta: "Quiero mi plaza fija",
    href: "#contacto",
    interes: "mensual-2",
  },
];

// Tarjetas de la sección Eventos de la home, de más reciente a más antigua:
// lo primero que se ve es siempre lo próximo. Cada cartel lleva su botón de
// "Ver detalle" a #/evento/<slug>. Solo se anuncia la fecha: si un evento ya
// pasó, lo dice su propia fecha.
// La entrada sin cartel sale como banda "Próximamente".
export const EVENT_CARDS = [
  {
    slug: "tardeo-pilates",
    when: "Jueves 20 de agosto",
    name: "Tardeo Pilates",
    place: "O Quinto Pino · Illa da Toxa",
    desc: "Pilates al atardecer en la ría con DJ set en directo y late brunch para rematar",
    poster: "assets/eventos/cartel-tardeo-pilates.png",
  },
  {
    slug: "pilates-and-wine",
    when: "Sábado 15 de agosto",
    name: "Pilates & Wine",
    place: "Bodega Casal Fuentes",
    desc: "Masterclass entre viñas, paseo por la bodega y una copa para brindar",
    poster: "assets/eventos/pilates-and-wine.png",
  },
  {
    slug: "community-sessions-vol-01",
    when: "Viernes 24 de julio",
    name: "Community Sessions",
    place: "Praia de Canelas · Vol. 01",
    desc: "Pilates flow al atardecer sobre la arena, gratis y abierto a todo el mundo",
    poster: "assets/eventos/cartel-community-ed01-2.png",
  },
  {
    proximamente: true,
    when: "Septiembre · 2026",
    desc: "Estamos cerrando la próxima fecha, te la contamos por aquí",
  },
];

// Detalle de cada evento → página dedicada #/evento/<slug>.
// El cartel manda: la página lo muestra entero (sin recortar) y ofrece un
// CTA de reserva claro: la plaza se paga online (Stripe).
// El precio de un evento de pago NO va aquí: está en EVENTOS_PRECIO
// (supabase/functions/_shared/catalogo.js), que comparten la web y la función
// que cobra. Para que se pueda reservar, el evento necesita además su sesión en
// el calendario (fecha y aforo), con este mismo slug. Un evento sin precio allí
// (gratis, o aún por anunciar) lleva al formulario de contacto.
export const EVENTOS = {
  "pilates-and-wine": {
    slug: "pilates-and-wine",
    nombre: "Pilates & Wine",
    nombreEm: "& Wine",           // parte en cursiva/acento del titular
    eyebrow: "Evento de verano · cala × Viña Dogrobe",
    poster: "assets/eventos/pilates-and-wine.png",
    // Acento propio del evento — tiñe eyebrow, título, precio y CTA para
    // armonizar con el cartel. El fondo va siempre en blanco roto.
    tema: {
      accent:     "#C1402E",   // terracota del cartel
      accentDeep: "#9C3020",
    },
    // Datos alineados con el cartel — nada que se contradiga
    cuando: "Sábado 15 de agosto",
    hora: "10:30h",
    lugar: "Bodega Casal Fuentes",
    nivel: "Todos los niveles",
    aforo: "Plazas limitadas",
    lede: "Una mañana entre viñas, la esterilla al aire libre y una copa para brindar",
    // Descripción — da un poco más que el cartel: el porqué, no solo el plan
    descripcion: "Pilates & Wine es nuestra excusa para salir del estudio y encontrarnos en un lugar bonito. Una mañana para movernos al aire libre entre viñas, reconectar con el cuerpo y con la naturaleza, y quedarnos después a charlar entre amigas con una copa en la mano",
    // Programa breve (lo que ya anuncia el cartel, en una línea)
    programa: "Masterclass de pilates · aperitivo con vino · paseo por las viñas",
    // Texto con el que se comparte la página (WhatsApp, Instagram, nativo)
    compartirMsg: "Pilates & Wine · sábado 15 de agosto entre viñas\nTe vienes?",
  },

  "tardeo-pilates": {
    slug: "tardeo-pilates",
    nombre: "Tardeo Pilates",
    nombreEm: "Pilates",
    eyebrow: "Evento de verano · cala × O Quinto Pino",
    poster: "assets/eventos/cartel-tardeo-pilates.png",
    // Azul atardecer del cartel — cielo y ría al caer la tarde
    tema: {
      accent:     "#54748E",
      accentDeep: "#3E5A72",
    },
    cuando: "Jueves 20 de agosto",
    hora: "19:00h",
    lugar: "O Quinto Pino, Illa da Toxa",
    // Early bird para las primeras plazas; al agotarse, pasa a 40€ (actualizar
    // el precio en el catálogo y quitar la nota entonces)
    precioNota: "early bird primeras plazas · después 40€",
    nivel: "Todos los niveles",
    aforo: "Plazas limitadas",
    lede: "Un atardecer en la ría, la esterilla mirando al mar y música sonando hasta el late brunch",
    descripcion: "Nos vamos de tardeo a la ría, junto al puente da Illa da Toxa: pilates al aire libre con la marea de fondo y un DJ set acompañando la sesión, y al acabar nos quedamos de late brunch viendo caer el sol",
    programa: "Pilates al atardecer · DJ set en directo · late brunch",
    compartirMsg: "Tardeo Pilates · jueves 20 de agosto en la Illa da Toxa\nDJ set, brunch y atardecer, te vienes?",
  },

  "community-sessions-vol-01": {
    slug: "community-sessions-vol-01",
    nombre: "Community Sessions",
    nombreEm: "Sessions",
    eyebrow: "Community Sessions · Vol. 01",
    poster: "assets/eventos/cartel-community-ed01-2.png",
    // Granate y crema del cartel — el fondo sigue siendo blanco roto
    tema: {
      accent:     "#6D3738",
      accentDeep: "#53292A",
    },
    // Edición ya celebrada: no se etiqueta como pasada, lo dice su fecha; el
    // CTA mira ya a la siguiente
    cuando: "Viernes 24 de julio",
    hora: "20:30h",
    lugar: "Praia de Canelas, O Grove",
    precio: "Gratis",
    precioNota: "actividad abierta",
    nivel: "Todos los niveles",
    aforo: "Trae tu esterilla",
    lede: "Una tarde de viernes en la arena, la esterilla mirando al mar y la luz cayendo",
    descripcion: "Las Community Sessions nacen para sacar el pilates del estudio y llevarlo a donde ya está la gente en verano: la playa, el atardecer, el rato de después. La Vol. 01 juntó esterillas en Canelas para movernos al aire libre, sin niveles ni compromiso, y quedarnos viendo cómo se iba la luz",
    programa: "Pilates flow al aire libre · movimiento, respiración y conexión",
    ctaLabel: "Avisadme de la Vol. 02",
    compartirMsg: "Community Sessions · pilates al atardecer en la playa\nMira qué plan",
  },
};

// Copy del evento COMPLETO. Cuando la dueña marca el evento como completo en el
// panel de gestión, la página cambia el botón de reservar por esto: el cartel de
// agotado y un formulario para dejar el contacto (nombre y apellidos, teléfono
// y email) y ser de las primeras en enterarse.
export const EVENTO_AGOTADO = {
  tag: "Agotado",
  nota: "Las plazas de esta edición están completas",
  esperaAbrir: "Avisadme si se libera una plaza",
  esperaTitulo: "Lista de espera",
  esperaLede: "Déjanos tu contacto\nTe escribimos si se libera una plaza y serás de las primeras en enterarte de la próxima fecha",
  esperaBoton: "Apuntarme",
  esperaOk: "✓ Te tenemos apuntada",
  esperaOkNota: "Te avisamos si se libera una plaza o en cuanto abramos la próxima fecha",
  esperaError: "No se pudo apuntar, inténtalo de nuevo",
};

export function getEvento(slug) {
  if (!Object.hasOwn(EVENTOS, slug)) return null;
  // Evento de pago: su precio sale del catálogo que comparte con la función que cobra
  const precio = EVENTOS_PRECIO[slug];
  return precio == null ? EVENTOS[slug] : { ...EVENTOS[slug], precio: `${precio}€`, dePago: true };
}

export const BONOS = [
  {
    label: "Flexible",
    name: "Bono",
    nameEm: "5 clases",
    clases: 5,
    amount: 75,
    per: "/ bono",
    items: [
      "5 clases a usar antes del 31 ago",
      "Mat y material incluidos",
      "Combinables Mat, Flow y Sculpt",
    ],
    cta: "Quiero este bono",
    href: "#contacto",
    interes: "bono-5",
  },
  {
    label: "Más ahorro",
    name: "Bono",
    nameEm: "10 clases",
    clases: 10,
    amount: 140,
    per: "/ bono",
    items: [
      "10 clases a usar antes del 31 ago",
      "Mat y material incluidos",
      "Combinables Mat, Flow y Sculpt",
      "Prioridad en eventos del estudio",
    ],
    cta: "Quiero este bono",
    href: "#contacto",
    interes: "bono-10",
    featured: true,
  },
];

// Catálogo de productos para el registro de pagos del panel de gestión.
// Deriva de las tarifas de arriba: los importes salen siempre de PRICING/BONOS,
// así que al cambiar un precio no hay que tocar nada aquí.
export const PRODUCTOS = [...PRICING, ...BONOS].map((p) => ({
  concepto: `${p.name} ${p.nameEm}`,
  importe: p.amount,
}));

// Tipos de bono que ofrece el panel al dar uno de alta. Sale de BONOS, así que
// si cambias el catálogo de tarifas no hay que tocar nada aquí.
export const BONO_TIPOS = BONOS.map((b) => ({
  concepto: `${b.name} ${b.nameEm}`,
  clases: b.clases,
}));

// Por qué alguien tiene una clase pendiente de recuperar
export const MOTIVOS_RECUPERACION = [
  "Cambio de horario",
  "Avisó con tiempo",
  "Lesión o enfermedad",
  "Clase cancelada",
  "Otro",
];

// Opciones del selector "¿Qué te interesa?" del formulario de contacto.
// En modo verano son las del estudio presencial; fuera de temporada, las de
// la plataforma online.
const CONTACT_INTERES_VERANO = [
  { value: "duda",      label: "Una duda general" },
  { value: "mensual-1", label: "Mensualidad · 1 clase/semana" },
  { value: "mensual-2", label: "Mensualidad · 2 clases/semana" },
  { value: "bono-5",    label: "Bono · 5 clases" },
  { value: "bono-10",   label: "Bono · 10 clases" },
  { value: "evento",    label: "Eventos / grupo privado" },
];

const CONTACT_INTERES_ONLINE = [
  { value: "acceso",  label: "Acceso anticipado a la plataforma" },
  { value: "cuenta",  label: "Mi cuenta o una compra" },
  { value: "duda",    label: "Una duda general" },
  { value: "retiro",  label: "Retiros y eventos" },
  { value: "privado", label: "Grupo privado o clase a medida" },
  { value: "colab",   label: "Llevar cala a mi ciudad o profe invitada" },
];

export const CONTACT_INTERES = SUMMER_MODE ? CONTACT_INTERES_VERANO : CONTACT_INTERES_ONLINE;

export const LOCATION = {
  mapSrc: "https://www.openstreetmap.org/export/embed.html?bbox=-8.9339%2C42.4525%2C-8.8939%2C42.4725&layer=mapnik&marker=42.462495%2C-8.913941",
  directionsHref: "https://www.google.com/maps/place/42%C2%B027'45.0%22N+8%C2%B054'50.2%22W/@42.4625093,-8.9323949,15z/data=!3m1!4b1!4m7!1m2!2m1!1scarretera+san+vicente+do+mar+!3m3!8m2!3d42.462495!4d-8.913941?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D",
  address: { street: "Terraza Restaurante Meloxeira Praia", city: "Carretera San Vicente do Mar 1100, 36989 O Grove" },
  partner: {
    name: "Restaurante Meloxeira",
    logo: "assets/logo-nuevo-taberna-meloxeira.png",
  },
};
