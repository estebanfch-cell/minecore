export const LIME = "#b8ff3c";
export const PLATFORM_TOP = 0.3;
/** Every desk faces the camera (local +Z → world +X/+Z). */
export const YAW = Math.PI / 4;
export const SEAT_LOCAL_Z = -0.1;
export const DESK_LOCAL_Z = 0.52;
export const HUB = { x: 0, z: 0 };
export const RING_RADIUS = 5.45;

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
  sri: { app: "SRI", accent: "#5b8cff", host: "srienlinea.sri.gob.ec" },
  inflow: { app: "inFlow", accent: "#3ec6ff", host: "inflowinventory.com" },
  liq: { app: "Liquidación", accent: "#b8ff3c", host: "liq.minecore.ec" },
  gh: { app: "GitHub", accent: "#e6edf3", host: "github.com" },
};

const ZONE_META = {
  manuelito: {
    title: "WHATSAPP",
    detail: "Hub WA",
    accent: "#2ad4b0",
    lines: ["Canal con Majo", "PDFs inbound"],
  },
  cote: {
    title: "COSTEO",
    detail: "Semanal",
    accent: "#e2b15a",
    lines: ["OC y packing", "Aprobación Stratega"],
  },
  law: {
    title: "JUICIO RUMI",
    detail: "Legal",
    accent: "#d07bff",
    lines: ["Expediente abierto", "Oficios PDF"],
  },
  secre: {
    title: "RETENCIONES",
    detail: "SRI · pagos",
    accent: "#6b93ff",
    lines: ["Portal SRI", "Banco Kluane"],
  },
  finance: {
    title: "INFLOW",
    detail: "CFO",
    accent: "#3ec6ff",
    lines: ["Comprobantes", "Stamp PAID"],
  },
  marketing: {
    title: "LIQUIDACIÓN",
    detail: "Campañas",
    accent: "#b8ff3c",
    lines: ["liq.minecore.ec", "Deploy EFCH"],
  },
  "stock-devops": {
    title: "STOCK / DEVOPS",
    detail: "Admin App",
    accent: "#ff8a3d",
    lines: ["Sync de stock", "CI y PRs"],
  },
};

/** Neighbors keep real handoffs adjacent: SECRE–FINANCE, COTE–MANUELITO, STOCK–MARKETING. */
const RING = ["law", "secre", "finance", "marketing", "stock-devops", "manuelito", "cote"];

export function localToWorld(px, pz, lx, lz) {
  const c = Math.cos(YAW);
  const s = Math.sin(YAW);
  return {
    x: px + lx * c + lz * s,
    z: pz - lx * s + lz * c,
  };
}

export const ZONES = RING.map((id, i) => {
  const deg = -90 + i * (360 / RING.length);
  const a = (deg * Math.PI) / 180;
  const meta = ZONE_META[id];
  const position = {
    x: Math.cos(a) * RING_RADIUS,
    z: Math.sin(a) * RING_RADIUS,
  };
  return {
    id,
    ...meta,
    position,
    seat: localToWorld(position.x, position.z, 0, SEAT_LOCAL_Z),
  };
});

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const HOMES = Object.fromEntries(ZONES.map((z) => [z.id, z.seat]));

export const MEETING_SPOTS = AGENTS.map((_, i) => {
  const a = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
  const r = 1.2;
  return { x: HUB.x + Math.cos(a) * r, z: HUB.z + Math.sin(a) * r };
});

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
    mission: "CI, PRs, stock sync y que el Admin App quede verde.",
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
    skin: "#f0c09a",
    glasses: false,
    beard: false,
    mustache: false,
  },
  cote: {
    shirt: "#c4a574",
    vest: true,
    coverall: false,
    hair: "#9a9a9a",
    skin: "#efc29e",
    glasses: true,
    beard: false,
    mustache: false,
  },
  law: {
    shirt: "#161616",
    vest: true,
    coverall: false,
    hair: "#1a1a1a",
    skin: "#e8b894",
    glasses: false,
    beard: true,
    mustache: false,
  },
  secre: {
    shirt: "#f2f2f4",
    vest: true,
    coverall: false,
    hair: "#5a3a28",
    skin: "#f3c4a2",
    glasses: false,
    beard: false,
    mustache: false,
  },
  finance: {
    shirt: "#1f6f82",
    vest: true,
    coverall: false,
    hair: "#1b1b1b",
    skin: "#f0c09a",
    glasses: false,
    beard: false,
    mustache: false,
  },
  marketing: {
    shirt: "#3f8f34",
    vest: true,
    coverall: false,
    hair: "#3a2418",
    skin: "#e8b894",
    glasses: false,
    beard: false,
    mustache: true,
  },
  "stock-devops": {
    shirt: "#ff7a18",
    vest: false,
    coverall: true,
    hair: "#1b1b1b",
    skin: "#e8b894",
    glasses: false,
    beard: false,
    mustache: false,
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
    activity: "Admin App en espera de heartbeat",
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
  if (agent?.meeting) return "En el núcleo";
  if (agent?.walking) return "En tránsito";
  if (agent?.typing) return "En el escritorio";
  return "En el piso";
}

export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift) => {
    const ca = (pa >> shift) & 255;
    const cb = (pb >> shift) & 255;
    return Math.round(ca + (cb - ca) * t);
  };
  const r = channel(16);
  const g = channel(8);
  const bl = channel(0);
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function beside(id, side = 1) {
  const home = HOMES[id];
  const c = Math.cos(YAW);
  const s = Math.sin(YAW);
  return {
    x: home.x + c * 0.9 * side,
    z: home.z - s * 0.9 * side,
  };
}

export function hubGate(id) {
  const home = HOMES[id];
  const dx = HUB.x - home.x;
  const dz = HUB.z - home.z;
  const len = Math.hypot(dx, dz) || 1;
  return {
    x: HUB.x - (dx / len) * 1.25,
    z: HUB.z - (dz / len) * 1.25,
  };
}
