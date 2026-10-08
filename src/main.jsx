import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AccesoProvider } from "./hooks/useAcceso.jsx";

// Stripe devuelve a la raíz con ?paquete=<slug> o ?evento=<slug> (y ?pago=ok
// si se cobró): de ahí a su página, que es quien confirma el pago.
const q = new URLSearchParams(window.location.search);
const vuelta = q.get("paquete") ? `#/paquete/${encodeURIComponent(q.get("paquete"))}`
             : q.get("evento")  ? `#/evento/${encodeURIComponent(q.get("evento"))}`
             : null;
if (vuelta && !window.location.hash) window.location.hash = vuelta;

createRoot(document.getElementById("root")).render(
  <AccesoProvider>
    <App />
  </AccesoProvider>
);
