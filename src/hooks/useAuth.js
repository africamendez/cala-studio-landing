import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

// Sesión + perfil del usuario. Dos formas de entrar: email y contraseña (la
// de los paquetes online; solo envía un email si se olvida la contraseña) y
// "magic link".
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;

  const loadProfile = useCallback(async () => {
    if (!user) { setProfile(null); return; }
    const { data } = await supabase
      .from("profiles").select("nombre, telefono, is_admin").eq("id", user.id).maybeSingle();
    setProfile(data ?? null);
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Identificación por ENLACE mágico (sin contraseñas). El enlace redirige al
  // origin y App.jsx lleva al calendario ya identificada. El nombre/teléfono
  // viajan como metadata (el trigger los vuelca al perfil de usuarios nuevos).
  const signInWithEmail = (email, { nombre, telefono } = {}) =>
    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, data: { nombre, telefono } },
    });

  // Cuenta con email y contraseña. Con "Confirm email" apagado en Supabase,
  // crear la cuenta ya deja la sesión abierta, sin pasar por el correo.
  const signUp = (email, password) => supabase.auth.signUp({ email, password });
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  // Contraseña olvidada: el único correo que envía la cuenta. Lleva un enlace de
  // un solo uso que devuelve a la web con la sesión abierta, y ahí se elige la
  // nueva (ClavePage). `paquete` es la ficha desde la que se pide, para volver
  // a ella al terminar.
  const pedirClave = (email, paquete) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + (paquete ? `/?paquete=${encodeURIComponent(paquete)}` : ""),
    });
  const cambiarClave = (password) => supabase.auth.updateUser({ password });

  const saveProfile = async ({ nombre, telefono }) => {
    // Coge el usuario del cliente (recién verificado), no del estado del hook,
    // que puede no haberse propagado todavía tras verificar el código.
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return { error: new Error("Sin sesión") };
    const { error } = await supabase.from("profiles")
      .upsert({ id: u.id, nombre, telefono });
    if (!error) await loadProfile();
    return { error };
  };

  const signOut = () => supabase.auth.signOut();

  const profileComplete = !!(profile && profile.nombre && profile.telefono);
  const isAdmin = !!(profile && profile.is_admin);

  return { user, session, loading, profile, profileComplete, isAdmin,
           signInWithEmail, signUp, signIn, pedirClave, cambiarClave, saveProfile, signOut };
}
