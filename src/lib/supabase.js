import { createClient } from "@supabase/supabase-js";

// La clave "publishable" es pública por diseño: viaja al navegador.
// La seguridad real la imponen las políticas RLS de la base de datos.
const SUPABASE_URL = "https://iqhbmbecgxticqliiili.supabase.co";
const SUPABASE_KEY = "sb_publishable_ehjl1KXlt6SdYdQE7nDtEA_SNdwWxix";

// El enlace de "contraseña olvidada" devuelve a la web con #…&type=recovery, o
// con #error_code=… si ya se usó o ha caducado. Se apunta aquí, antes de crear
// el cliente, que al arrancar consume ese hash y abre la sesión. El del error
// no lo retira nadie más, así que se limpia ya.
const vuelta = new URLSearchParams(window.location.hash.slice(1));
export const enlaceClave = vuelta.get("type") === "recovery" ? "valido"
                         : vuelta.get("error_code") ? "caducado" : null;
if (enlaceClave === "caducado") {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // procesa el magic link al volver del email
  },
});
