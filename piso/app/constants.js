export const LIME = "#b8ff3c";

export const AGENTS = [
  { id: "manuelito", name: "MANUELITO", role: "WhatsApp", popupKind: "wa" },
  { id: "cote", name: "COTE", role: "Costeo", popupKind: "gmail" },
  { id: "law", name: "LAW", role: "Legal", popupKind: "pdf" },
  { id: "secre", name: "SECRE", role: "Retenciones", popupKind: "sri" },
  { id: "finance", name: "FINANCE", role: "inFlow", popupKind: "inflow" },
  { id: "marketing", name: "MARKETING", role: "Liquidación", popupKind: "liq" },
  { id: "stock-devops", name: "STOCK / DEVOPS", role: "Ops", popupKind: "gh" },
];

export const POPUPS = {
  wa: ["WA → Majo: montos OK", "PDF inbound +593…", "Alerta retención enviada", "Reply Majo recibido"],
  gmail: ["Gmail: OC pendiente", "Excel costeo semanal", "Aprobación Stratega", "Cruce packing list"],
  pdf: ["Oficio 74310716", "PDF no digitalizado", "Impacto Rumi +/−", "Expediente abierto"],
  sri: ["SRI portal…", "Retenciones OK", "Banco: espera OK_aplicar", "Kluane pagos"],
  inflow: ["inFlow: listo aplicar", "Comprobante pendiente", "Saldo mapeo", "Stamp PAID"],
  liq: ["liq.minecore.ec", "Campaña liquidación", "Links deploy EFCH", "Flyer publicado"],
  gh: ["GitHub PR #42", "Admin App build", "Stock sync OK", "CI passed"],
};

export const POPUP_META = {
  wa: { app: "WhatsApp", accent: "#25d366", host: "wa.me" },
  gmail: { app: "Gmail", accent: "#ea4335", host: "mail.google.com" },
  pdf: { app: "PDF · Legal", accent: "#ffb020", host: "drive" },
  sri: { app: "SRI", accent: "#3d7eff", host: "srienlinea.sri.gob.ec" },
  inflow: { app: "inFlow", accent: "#4cc3ff", host: "inflowinventory.com" },
  liq: { app: "Liquidación", accent: "#b8ff3c", host: "liq.minecore.ec" },
  gh: { app: "GitHub", accent: "#e6edf3", host: "github.com" },
};

/** Sit / stand home in world XZ. Desks sit just behind (−Z). Wide grid so labels do not stack. */
export const HOMES = {
  manuelito: { x: -5.4, z: -3.6 },
  cote: { x: 0, z: -3.6 },
  law: { x: 5.4, z: -3.6 },
  secre: { x: -5.4, z: 1.7 },
  finance: { x: 0, z: 1.7 },
  marketing: { x: 5.4, z: 1.7 },
  "stock-devops": { x: 0, z: 6.5 },
};

export const DESKS = {
  manuelito: { x: -5.4, z: -4.5 },
  cote: { x: 0, z: -4.5 },
  law: { x: 5.4, z: -4.5 },
  secre: { x: -5.4, z: 0.8 },
  finance: { x: 0, z: 0.8 },
  marketing: { x: 5.4, z: 0.8 },
  "stock-devops": { x: 0, z: 5.6 },
};

export const MEETING_SPOTS = [
  { x: -1.7, z: -0.5 },
  { x: -0.6, z: -1.5 },
  { x: 0.6, z: -1.5 },
  { x: 1.7, z: -0.5 },
  { x: 1.25, z: 0.85 },
  { x: 0.0, z: 1.6 },
  { x: -1.25, z: 0.85 },
];

export const DOSSIERS = {
  manuelito: {
    title: "Hub WhatsApp",
    mission:
      "Atiende el canal WA de Minecore: recibe PDFs, avisa retenciones y escribe a Majo cuando hay montos.",
    next: "Esperar reply de Majo y confirmar alerta de retención.",
  },
  cote: {
    title: "Costeo",
    mission:
      "Arma el costeo semanal: cruza Gmail, packing list y deja aprobaciones Stratega listas.",
    next: "Cerrar OC pendiente y cruzar packing list.",
  },
  law: {
    title: "Legal",
    mission:
      "Sigue oficios y expedientes (Rumi y demás). Marca PDFs no digitalizados y el impacto.",
    next: "Digitalizar Oficio 74310716.",
  },
  secre: {
    title: "Retenciones",
    mission:
      "Carga retenciones en SRI, sigue al banco y pasa a Finance cuando hay OK_aplicar.",
    next: "Reintentar SRI y avisar Kluane a Finance.",
  },
  finance: {
    title: "inFlow",
    mission:
      "Aplica comprobantes en inFlow, mapea saldos y deja el stamp PAID cuando hay respaldo.",
    next: "Aplicar el siguiente comprobante en inFlow.",
  },
  marketing: {
    title: "Liquidación",
    mission:
      "Publica campañas en liq.minecore.ec, flyers y espera deploys de EFCH.",
    next: "Publicar flyer cuando el deploy EFCH esté verde.",
  },
  "stock-devops": {
    title: "Ops / GitHub",
    mission:
      "CI, PRs, stock sync y que el Admin App quede verde.",
    next: "Cerrar PR #42 y confirmar stock sync.",
  },
};

export const WORKFLOW_EDGES = [
  ["cote", "manuelito"],
  ["secre", "finance"],
  ["law", "secre"],
  ["stock-devops", "marketing"],
  ["finance", "marketing"],
  ["manuelito", "secre"],
];

export const APPS = [
  { id: "wa", label: "WhatsApp" },
  { id: "gmail", label: "Gmail" },
  { id: "sri", label: "SRI" },
  { id: "inflow", label: "inFlow" },
  { id: "gh", label: "GitHub" },
  { id: "liq", label: "liq.minecore.ec" },
];

export const LOOKS = {
  manuelito: {
    shirt: "#1a2744",
    vest: true,
    coverall: false,
    hair: "#1b1b1b",
    hairStyle: "short",
    skin: "#f0c09a",
    glasses: false,
    beard: false,
    mustache: false,
    accessory: "phone",
  },
  cote: {
    shirt: "#d2b48c",
    vest: true,
    coverall: false,
    hair: "#9a9a9a",
    hairStyle: "side",
    skin: "#efc29e",
    glasses: true,
    beard: false,
    mustache: false,
    accessory: "clipboard",
  },
  law: {
    shirt: "#141414",
    vest: true,
    coverall: false,
    hair: "#1a1a1a",
    hairStyle: "short",
    skin: "#e8b894",
    glasses: false,
    beard: true,
    mustache: false,
    accessory: "gavel",
  },
  secre: {
    shirt: "#f4f4f4",
    vest: true,
    coverall: false,
    hair: "#5a3a28",
    hairStyle: "bob",
    skin: "#f3c4a2",
    glasses: false,
    beard: false,
    mustache: false,
    accessory: "paper",
  },
  finance: {
    shirt: "#2f7d8a",
    vest: true,
    coverall: false,
    hair: "#1b1b1b",
    hairStyle: "short",
    skin: "#f0c09a",
    glasses: false,
    beard: false,
    mustache: false,
    accessory: "coins",
  },
  marketing: {
    shirt: "#4ea33a",
    vest: true,
    coverall: false,
    hair: "#3a2418",
    hairStyle: "short",
    skin: "#e8b894",
    glasses: false,
    beard: false,
    mustache: true,
    accessory: "megaphone",
  },
  "stock-devops": {
    shirt: "#ff7a18",
    vest: false,
    coverall: true,
    hair: "#1b1b1b",
    hairStyle: "short",
    skin: "#e8b894",
    glasses: false,
    beard: false,
    mustache: false,
    accessory: "scanner",
  },
};

export const SEEDS = {
  law: {
    activity: "Oficio 74310716 — PDF no digitalizado",
    status: "pending",
    popup: "Oficio 74310716",
  },
  secre: {
    activity: "Retenciones OK · SRI caído · Kluane espera",
    status: "pending",
    popup: "SRI portal…",
  },
  finance: {
    activity: "Listo para inFlow · sin comprobante nuevo",
    status: "pending",
    popup: "inFlow: listo aplicar",
  },
  manuelito: {
    activity: "Hub WA · alerta retención enviada",
    status: "ok",
    popup: "Alerta retención enviada",
  },
  marketing: {
    activity: "Liq esperando deploy EFCH",
    status: "pending",
    popup: "liq.minecore.ec",
  },
  cote: {
    activity: "Semanal regenerado · Gmail aprobaciones",
    status: "pending",
    popup: "Gmail: OC pendiente",
  },
  "stock-devops": {
    activity: "Sin feed aún",
    status: "pending",
    popup: "GitHub PR #42",
  },
};

export const STATUS_COLOR = {
  ok: "#5dffa8",
  pending: "#ffd35c",
  blocked: "#ff6b6b",
};

export const STATUS_LABEL = {
  ok: "ok",
  pending: "pendiente",
  blocked: "bloqueado",
};

export function actionVerb(agent) {
  if (agent?.meeting) return "En reunión";
  if (agent?.walking) return "Caminando";
  if (agent?.typing) return "En el escritorio";
  return "En el piso";
}
