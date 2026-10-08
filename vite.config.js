import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Sin mapas de código en producción: con ellos el navegador enseña los
  // archivos originales tal cual, con sus comentarios.
  build: { sourcemap: false },
  server: {
    host: "0.0.0.0",
    port: 5173,
    // File watching is flaky on Docker bind mounts (WSL2). Polling is reliable.
    watch: { usePolling: true, interval: 300 },
  },
});
