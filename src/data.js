import { SUMMER_MODE } from "./config.js";

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

// Catálogo de clases en vídeo. Modelo mixto: `gratis: true` se ve y se
// reproduce sin cuenta; `gratis: false` queda bloqueada hasta que abramos
// las membresías.
//
// Para añadir una clase: sube el vídeo a YouTube (oculto/no listado) o Vimeo
// y pega aquí el ID. La miniatura de YouTube sale sola.
//   video: { provider: "youtube", id: "dQw4w9WgXcQ" }
//   video: { provider: "vimeo",   id: "76979871" }
//
// ⚠️ Los IDs de abajo son PLACEHOLDER de ejemplo — sustitúyelos por los reales.
export const CLASES = [
  {
    slug: "mat-suelo-y-respiracion",
    modalidad: "mat",
    nivel: "basico",
    titulo: "Suelo y respiración",
    duracion: "22 min",
    descr: "Una toma de contacto con el método\nrespiración costal, activación del centro y movilidad de columna sin prisa",
    video: { provider: "youtube", id: "ZXsQAXx_ao0" },
    gratis: true,
    publicada: "2026-09-01",
  },
  {
    slug: "mat-abdomen-profundo",
    modalidad: "mat",
    nivel: "intermedio",
    titulo: "Abdomen profundo",
    duracion: "30 min",
    descr: "Serie de suelo centrada en el core\ncontrol de la pelvis y del transverso, con precisión antes que intensidad",
    video: { provider: "youtube", id: "v7AYKMP6rOE" },
    gratis: false,
    publicada: "2026-09-08",
  },
  {
    slug: "flow-movilidad-de-manana",
    modalidad: "flow",
    nivel: "basico",
    titulo: "Movilidad de mañana",
    duracion: "18 min",
    descr: "Secuencia corta para empezar el día\nencadenas movimiento sin pausa al ritmo de la respiración",
    video: { provider: "youtube", id: "inpok4MKVLM" },
    gratis: true,
    publicada: "2026-09-04",
  },
  {
    slug: "flow-cadena-completa",
    modalidad: "flow",
    nivel: "avanzado",
    titulo: "Cadena completa",
    duracion: "40 min",
    descr: "Flow largo de cuerpo entero\ntransiciones exigentes, coordinación y continuidad de principio a fin",
    video: { provider: "youtube", id: "2OEL4P1Rz04" },
    gratis: false,
    publicada: "2026-09-12",
  },
  {
    slug: "sculpt-piernas-y-gluteo",
    modalidad: "sculpt",
    nivel: "intermedio",
    titulo: "Piernas y glúteo",
    duracion: "28 min",
    descr: "Mat con banda y peso ligero\nfuerza funcional del tren inferior sin perder la fluidez del método",
    video: { provider: "youtube", id: "gC_L9qAHVJ8" },
    gratis: true,
    publicada: "2026-09-06",
  },
  {
    slug: "sculpt-tren-superior",
    modalidad: "sculpt",
    nivel: "avanzado",
    titulo: "Tren superior",
    duracion: "32 min",
    descr: "Resistencia para brazos, espalda y hombros\nmandan el control y la técnica, la carga acompaña",
    video: { provider: "youtube", id: "1ZYbU82GVz4" },
    gratis: false,
    publicada: "2026-09-15",
  },
];

export function getClase(slug) {
  return CLASES.find((c) => c.slug === slug) || null;
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
// CTA de reserva claro por WhatsApp (mismo modelo que las clases).
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
    precio: "35€",
    nivel: "Todos los niveles",
    aforo: "Plazas limitadas",
    lede: "Una mañana entre viñas, la esterilla al aire libre y una copa para brindar",
    // Descripción — da un poco más que el cartel: el porqué, no solo el plan
    descripcion: "Pilates & Wine es nuestra excusa para salir del estudio y encontrarnos en un lugar bonito. Una mañana para movernos al aire libre entre viñas, reconectar con el cuerpo y con la naturaleza, y quedarnos después a charlar entre amigas con una copa en la mano",
    // Programa breve (lo que ya anuncia el cartel, en una línea)
    programa: "Masterclass de pilates · aperitivo con vino · paseo por las viñas",
    // CTA de reserva — abre WhatsApp con el mensaje ya escrito
    reservaMsg: "Hola! Quiero reservar plaza para Pilates & Wine (sábado 15 de agosto)",
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
    // precio y quitar la nota entonces)
    precio: "35€",
    precioNota: "early bird primeras plazas · después 40€",
    nivel: "Todos los niveles",
    aforo: "Plazas limitadas",
    lede: "Un atardecer en la ría, la esterilla mirando al mar y música sonando hasta el late brunch",
    descripcion: "Nos vamos de tardeo a la ría, junto al puente da Illa da Toxa: pilates al aire libre con la marea de fondo y un DJ set acompañando la sesión, y al acabar nos quedamos de late brunch viendo caer el sol",
    programa: "Pilates al atardecer · DJ set en directo · late brunch",
    reservaMsg: "Hola! Quiero reservar plaza para el Tardeo Pilates (jueves 20 de agosto)",
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
    reservaMsg: "Hola! Quiero que me aviséis de la próxima Community Session",
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
  return EVENTOS[slug] || null;
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
