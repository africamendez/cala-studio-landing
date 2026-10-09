import { useState, useEffect, useCallback } from "react";
import { SUMMER_MODE } from "./config.js";
import { enlaceClave } from "./lib/supabase.js";
import { useMobile } from "./hooks/useMobile.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Grupos from "./components/Grupos.jsx";
import Modalidades from "./components/Modalidades.jsx";
import Tarifas from "./components/Tarifas.jsx";
import ClasesPreview from "./components/ClasesPreview.jsx";
import Eventos from "./components/Eventos.jsx";
import Contacto from "./components/Contacto.jsx";
import Footer from "./components/Footer.jsx";
import ReservaPage from "./components/ReservaPage.jsx";
import EventoPage from "./components/EventoPage.jsx";
import GestionPage from "./components/GestionPage.jsx";
import ClasesPage from "./components/ClasesPage.jsx";
import ClasePage from "./components/ClasePage.jsx";
import PaquetePage from "./components/PaquetePage.jsx";
import ClavePage from "./components/ClavePage.jsx";
import MobileTopBar from "./components/MobileTopBar.jsx";
import MobileNav from "./components/MobileNav.jsx";

function useHashRoute() {
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : ""));
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  // Cambia de página en el mismo render, sin esperar al hashchange
  const ir = useCallback((h) => { window.location.hash = h; setHash(window.location.hash); }, []);
  return [hash, ir];
}

export default function App() {
  const mobile = useMobile();
  const [hash, ir] = useHashRoute();
  const [clave, setClave] = useState(enlaceClave);   // "valido" | "caducado" | null

  // Vuelta del enlace de "contraseña olvidada": va antes que cualquier página,
  // porque llega a la raíz y sin ruta (el hash lo ocupan las llaves de sesión)
  if (clave) return <ClavePage enlace={clave} onFin={(destino) => { ir(destino); setClave(null); }} />;

  // Biblioteca de clases online (#/clases y #/clases/<modalidad>)
  if (hash.startsWith("#/clases")) {
    const mod = hash.replace(/^#\/clases\/?/, "").split(/[?&#]/)[0] || null;
    return <ClasesPage key={mod || "todas"} modalidadInicial={mod} />;
  }
  // Detalle de una clase (#/clase/<slug>)
  if (hash.startsWith("#/clase/")) {
    const slug = hash.split("/")[2] || "";
    return <ClasePage key={slug} slug={slug} />;
  }
  // Compra de un paquete de clases (#/paquete/<slug>)
  if (hash.startsWith("#/paquete/")) {
    const slug = hash.split("/")[2] || "";
    return <PaquetePage key={slug} slug={slug} />;
  }
  // Detalle de evento dedicado (#/evento/<slug>)
  if (hash.startsWith("#/evento/")) {
    const slug = hash.split("/")[2] || "";
    return <EventoPage key={slug} slug={slug} />;
  }
  // Panel de gestión (con PIN): quién viene a cada clase y a cada evento.
  // Los eventos se reservan todo el año, así que el panel está siempre.
  if (hash.startsWith("#/gestion")) return <GestionPage />;
  // Bloque de verano: reserva de plaza en clase (solo en temporada)
  if (SUMMER_MODE && hash.startsWith("#/reservar")) return <ReservaPage />;

  const Sections = SUMMER_MODE
    ? <><Hero /><Grupos /><Tarifas /><Eventos /><Contacto /><Footer /></>
    : <><Hero /><Modalidades /><ClasesPreview /><Eventos /><Contacto /><Footer /></>;

  if (mobile) {
    return (
      <div className="m3-app">
        <MobileTopBar />
        <main className="m3-main">{Sections}</main>
        <MobileNav />
      </div>
    );
  }

  return (
    <>
      <Nav />
      {Sections}
    </>
  );
}
