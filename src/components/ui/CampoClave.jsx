import { useState } from "react";

// Campo de contraseña con su botón de ver/ocultar
export default function CampoClave({ value, onChange, placeholder, nueva = false }) {
  const [ver, setVer] = useState(false);
  return (
    <span className="pq-clave">
      <input className="ev-wl-f" type={ver ? "text" : "password"} placeholder={placeholder}
             autoComplete={nueva ? "new-password" : "current-password"}
             value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" className="pq-clave__ver" onClick={() => setVer(v => !v)}>
        {ver ? "Ocultar" : "Ver"}
      </button>
    </span>
  );
}
