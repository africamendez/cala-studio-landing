// Lo justo de Stripe, sin SDK: llamar a su API y comprobar que un aviso
// (webhook) viene de verdad de Stripe.

// Con `params` es un POST de formulario; sin ellos, un GET.
export async function stripe(clave: string, path: string, params?: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: { "Authorization": `Bearer ${clave}` },
    body: params ? new URLSearchParams(params) : undefined,
  });
  return { ok: res.ok, status: res.status, json: await res.json() };
}

function hexABytes(hex: string) {
  if (hex.length === 0 || hex.length % 2 || /[^0-9a-f]/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// La cabecera Stripe-Signature trae `t=<segundos>,v1=<firma>`: la firma es el
// HMAC-SHA256 de "<t>.<cuerpo tal cual llegó>" con el secreto del endpoint
// (whsec_…). Se rechaza también un aviso de hace más de 5 minutos, para que
// nadie pueda reenviar uno viejo que haya capturado.
export async function firmaValida(
  cuerpo: string, cabecera: string | null, secreto: string | undefined, ahora = Date.now(),
): Promise<boolean> {
  if (!cabecera || !secreto) return false;

  let t = "";
  const firmas: string[] = [];
  for (const parte of cabecera.split(",")) {
    const i = parte.indexOf("=");
    if (i < 0) continue;
    const k = parte.slice(0, i).trim(), v = parte.slice(i + 1).trim();
    if (k === "t") t = v;
    else if (k === "v1") firmas.push(v);
  }
  if (!/^\d+$/.test(t) || !firmas.length) return false;
  if (ahora / 1000 - Number(t) > 300) return false;

  const enc = new TextEncoder();
  const clave = await crypto.subtle.importKey(
    "raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["verify"],
  );
  const firmado = enc.encode(`${t}.${cuerpo}`);
  for (const f of firmas) {
    const bytes = hexABytes(f);
    // `verify` compara en tiempo constante
    if (bytes && await crypto.subtle.verify("HMAC", clave, bytes, firmado)) return true;
  }
  return false;
}
