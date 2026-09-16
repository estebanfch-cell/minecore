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

/** Sit / stand home in world XZ. Desks sit just behind (−Z). */
export const HOMES = {
  manuelito: { x: -2.55, z: -1.55 },
  cote: { x: 0, z: -1.55 },
  law: { x: 2.55, z: -1.55 },
  secre: { x: -2.55, z: 0.85 },
  finance: { x: 0, z: 0.85 },
  marketing: { x: 2.55, z: 0.85 },
  "stock-devops": { x: 0, z: 3.15 },
};

export const DESKS = {
  manuelito: { x: -2.55, z: -2.25 },
  cote: { x: 0, z: -2.25 },
  law: { x: 2.55, z: -2.25 },
  secre: { x: -2.55, z: 0.15 },
  finance: { x: 0, z: 0.15 },
  marketing: { x: 2.55, z: 0.15 },
  "stock-devops": { x: 0, z: 2.45 },
};

export const MEETING_SPOTS = [
  { x: -1.15, z: -0.35 },
  { x: -0.4, z: -1.05 },
  { x: 0.4, z: -1.05 },
  { x: 1.15, z: -0.35 },
  { x: 0.85, z: 0.55 },
  { x: 0.0, z: 1.05 },
  { x: -0.85, z: 0.55 },
];

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
