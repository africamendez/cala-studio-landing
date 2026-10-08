import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.js";

// Cuenta + paquetes comprados: lo que decide si una clase sale con candado o
// con su reproductor. Un único proveedor en la raíz (main.jsx) para que
// tarjetas y páginas compartan sesión y compras.
//
// El candado de la web es solo el dibujo: lo que de verdad cierra una clase es
// que su vídeo no está en el código. Lo guarda la base de datos (`clase_videos`)
// y solo se lo entrega a las cuentas con el paquete pagado.
const AccesoContext = createContext(null);

export function AccesoProvider({ children }) {
  const { user, loading: cargandoSesion, signUp, signIn, signOut } = useAuth();
  const uid = user?.id ?? null;
  const [paquetes, setPaquetes] = useState(() => new Set());
  const [videos, setVideos] = useState({});                // slug de clase → su vídeo
  const [leidoPara, setLeidoPara] = useState(undefined);   // cuenta cuyas compras ya están leídas
  const turno = useRef(0);

  // Lee las compras de la cuenta (la RLS ya devuelve solo las suyas). Si hay
  // alguna a medias —recién pagada, o con el pago sin terminar— la función
  // `pagos` le pregunta a Stripe cómo quedó. Devuelve los paquetes
  // abiertos; la sesión se lee del cliente, no del estado, para que valga
  // también justo después de entrar.
  const recargar = useCallback(async () => {
    const n = ++turno.current;
    const { data: { session } } = await supabase.auth.getSession();
    const id = session?.user?.id ?? null;
    let slugs = [];
    if (id) {
      const { data } = await supabase.from("compras")
        .select("paquete, estado").in("estado", ["pagado", "pendiente"]);
      const compras = data ?? [];
      slugs = compras.filter((c) => c.estado === "pagado").map((c) => c.paquete);
      if (compras.some((c) => c.estado === "pendiente")) {
        const { data: r } = await supabase.functions.invoke("pagos", { body: { accion: "mis-paquetes" } });
        if (r?.paquetes) slugs = r.paquetes;
      }
    }
    // Los vídeos de sus clases: la RLS devuelve solo los de paquetes pagados
    const suyos = {};
    if (slugs.length) {
      const { data: filas } = await supabase.from("clase_videos").select("clase, provider, video_id");
      for (const f of filas ?? []) suyos[f.clase] = { provider: f.provider, id: f.video_id };
    }
    const abiertos = new Set(slugs);
    // Si entre medias se ha lanzado otra lectura, manda la última
    if (n === turno.current) { setPaquetes(abiertos); setVideos(suyos); setLeidoPara(id); }
    return abiertos;
  }, []);

  useEffect(() => { if (!cargandoSesion) recargar(); }, [cargandoSesion, uid, recargar]);

  const cargando = cargandoSesion || leidoPara !== uid;
  const tiene = (slug) => paquetes.has(slug);
  // Abierta si es de muestra (`gratis`) o si su paquete está comprado
  const bloqueada = (clase) => !clase.gratis && !paquetes.has(clase.paquete);
  // El vídeo de una clase: el que lleva en su ficha si es de muestra, o el que
  // la base de datos le ha entregado a esta cuenta. null si no lo tiene
  const videoDe = (clase) => clase.video ?? videos[clase.slug] ?? null;

  return (
    <AccesoContext.Provider value={{ user, cargando, tiene, bloqueada, videoDe, recargar, signUp, signIn, signOut }}>
      {children}
    </AccesoContext.Provider>
  );
}

export const useAcceso = () => useContext(AccesoContext);
