import { useState, useEffect, useRef } from "react";
import { SUMMER_MODE } from "../config.js";
import { CONTACT_INTERES } from "../data.js";

// Formulario de contacto / dudas. Envía por email vía Formspree.
// (Reservar plaza NO pasa por aquí: eso vive en el calendario, #/reservar.)
const FORMSPREE_ID = "xnjkglwj";

const DRAFT_KEY = "cala.contactDraft";

// Interés por defecto: "duda" en verano, "acceso anticipado" en la plataforma.
const DEFAULT_INTERES = SUMMER_MODE ? "duda" : "acceso";

export const initialForm = {
  nombre: "",
  email: "",
  telefono: "",
  interes: DEFAULT_INTERES,
  mensaje: "",
  consent: false,
};

const labelFor = (v) => CONTACT_INTERES.find(o => o.value === v)?.label ?? v;

const INTERES_VALIDOS = CONTACT_INTERES.map(o => o.value);

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = { ...initialForm, ...JSON.parse(raw) };
      // Un borrador de otra temporada puede traer un interés que ya no existe
      if (!INTERES_VALIDOS.includes(draft.interes)) draft.interes = DEFAULT_INTERES;
      return draft;
    }
  } catch {}
  return initialForm;
}

function validate(form) {
  const e = {};
  if (!form.nombre.trim()) e.nombre = "Indica tu nombre";
  if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email no válido";
  if (!form.telefono.trim() || form.telefono.replace(/\D/g, "").length < 9) e.telefono = "Teléfono no válido";
  if (!form.consent) e.consent = "Necesitamos tu consentimiento";
  return e;
}

export function useContactForm() {
  const [form, setForm]       = useState(readDraft);
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState("");
  const [sending, setSending] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  // Prefill del interés al llegar desde otra página (p.ej. una clase de
  // miembros → "acceso anticipado"). Se consume una sola vez.
  useEffect(() => {
    try {
      const pre = sessionStorage.getItem("cala.interes");
      if (pre) {
        sessionStorage.removeItem("cala.interes");
        if (INTERES_VALIDOS.includes(pre)) setForm(f => ({ ...f, interes: pre }));
      }
    } catch {}
  }, []);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const flash = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) { flash("Revisa los campos marcados"); return; }

    const submission = {
      _subject: `Contacto web · ${labelFor(form.interes)}`,
      interesLabel: labelFor(form.interes),
      createdAt: new Date().toISOString(),
      ...form,
    };

    setSending(true);
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!res.ok) throw new Error();
      localStorage.removeItem(DRAFT_KEY);
      setForm(initialForm);
      flash("Mensaje enviado · te escribimos pronto");
    } catch {
      flash("No se ha podido enviar · inténtalo otra vez o escríbenos por Instagram");
    } finally {
      setSending(false);
    }
  };

  return { form, errors, toast, sending, upd, submit };
}
