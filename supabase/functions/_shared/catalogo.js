// Lo que se cobra en la web y a cuánto (en euros) — FUENTE ÚNICA.
// Lo importan la web, para pintar los precios (src/data.js), y la función
// `pagos`, para cobrar: el importe nunca viaja desde el navegador.
//
// Si tocas este archivo, redespliega la función para que cobre lo mismo que
// anuncia la web:
//   supabase functions deploy pagos --no-verify-jwt

// Paquetes de clases online: nombre y precio.
// ⚠️ Precios de EJEMPLO — ajústalos antes de publicar.
export const PAQUETES_VENTA = {
  "premama":       { nombre: "Pilates Premamá",   precio: 39 },
  "postparto":     { nombre: "Pilates Postparto", precio: 39 },
  "sculpt-i":      { nombre: "Pilates Sculpt I",  precio: 29 },
  "animal-flow-i": { nombre: "Animal Flow I",     precio: 29 },
  "mat-i":         { nombre: "Pilates Mat I",     precio: 25 },
  "flow-i":        { nombre: "Pilates Flow I",    precio: 25 },
};

// Eventos de pago: precio de la plaza, por el slug de su página
// (#/evento/<slug>). El nombre, la fecha y el aforo salen de su sesión en el
// calendario (class_sessions). Un evento que no esté aquí no se reserva
// pagando: su página lleva al formulario de contacto.
export const EVENTOS_PRECIO = {
  "pilates-and-wine": 35,
  "tardeo-pilates":   35,
};
