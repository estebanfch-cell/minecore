export const LIME = "#b8ff3c";
export const PLATFORM_TOP = 0.3;
/** Every desk faces the camera (local +Z → world +X/+Z). */
export const YAW = Math.PI / 4;
export const SEAT_LOCAL_Z = -0.1;
export const DESK_LOCAL_Z = 0.52;
export const HUB = { x: 0, z: 0 };
export const ISLAND_SCALE = 0.48;

export const AGENTS = [
  { id: "chief", name: "MINECORE CHIEF", role: "Orquestador", popupKind: "brief", grokId: "865dd2df-e29f-40a4-9631-41ca5624e03e" },
  { id: "manuelito", name: "MANUELITO", role: "WhatsApp", popupKind: "wa", grokId: "a6cb20b6-70e6-429d-9737-cc2e1a5c4ae1" },
  { id: "cote", name: "MINECORE COTE", role: "Costeo", popupKind: "gmail", grokId: "ca3b12a2-90aa-41c6-bdca-995384ed931d" },
  { id: "law", name: "MINECORE LAW", role: "Legal", popupKind: "pdf", grokId: "155d5508-70d9-4d5a-95e4-619da13d5a44" },
  { id: "secre", name: "MINECORE SECRE", role: "Retenciones", popupKind: "sri", grokId: "3823e65f-b1cf-4561-ab73-8f0c00a5f0da" },
  { id: "finance", name: "MINECORE FINANCE", role: "inFlow", popupKind: "inflow", grokId: "4c8dbbed-7889-4328-9121-d8a5883f2139" },
  { id: "marketing", name: "MINECORE MARKETING", role: "Liquidación", popupKind: "liq", grokId: "5ebf12eb-13d0-463b-85d0-2634b273de79" },
  { id: "stock-pilot", name: "MINECORE STOCK PILOT", role: "Stock", popupKind: "stock", grokId: "b9f678f9-a153-4cc0-9046-16125fb928fb" },
  { id: "devops", name: "MINECORE DEVOPS", role: "DevOps", popupKind: "gh", grokId: "3411110b-4ab8-4687-8df2-831b21505adf" },
  { id: "comunicados", name: "Minecore Comunicados", role: "Comunicados", popupKind: "nota", grokId: "d2f25820-f66c-4e61-a859-fb6616cc4a9d" },
  { id: "personal", name: "PERSONAL", role: "Personal", popupKind: "hr", grokId: "f175d0c3-18b8-4b48-886a-40009a84960a" },
  { id: "pmv", name: "PMV THE EQUATION", role: "PMV", popupKind: "eq", grokId: "76723efb-81c6-4c47-8727-83ebe406fb9c" },
];

export const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

export const POPUPS = {
  wa: ["WA → Majo: montos OK", "PDF inbound +593…", "Alerta retención enviada", "Reply Majo recibido"],
  gmail: ["Gmail: OC pendiente", "Excel costeo semanal", "Aprobación Stratega", "Cruce packing list"],
  pdf: ["Oficio 74310716", "PDF no digitalizado", "Impacto Rumi +/−", "Expediente abierto"],
  sri: ["SRI portal…", "Retenciones OK", "Banco: espera OK_aplicar", "Kluane pagos"],
  inflow: ["inFlow: listo aplicar", "Comprobante pendiente", "Saldo mapeo", "Stamp PAID"],
  liq: ["liq.minecore.ec", "Campaña liquidación", "Links deploy EFCH", "Flyer publicado"],
  gh: ["GitHub PR #42", "Admin App build", "CI passed", "Deploy verde"],
  stock: ["Stock sync OK", "Existencias Admin App", "Conteo de patio", "Alerta mínimo"],
  brief: ["Jornada del piso", "Reunión convocada", "Reparto RRHH", "Anuncio al equipo"],
  nota: ["Comunicado interno", "Aviso al piso", "Borrador listo", "Publicado"],
  hr: ["Turnos de la semana", "Personal en piso", "Ausencia cubierta", "Lista de gente"],
  eq: ["Ecuación PMV", "Variable en revisión", "Modelo actualizado", "Seguimiento"],
};

export const POPUP_META = {
  wa: { app: "WhatsApp", accent: "#25d366", host: "wa.me" },
  gmail: { app: "Gmail", accent: "#ea4335", host: "mail.google.com" },
  pdf: { app: "PDF · Legal", accent: "#ffb020", host: "drive" },
  sri: { app: "SRI", accent: "#5b8cff", host: "srienlinea.sri.gob.ec" },
  inflow: { app: "inFlow", accent: "#3ec6ff", host: "inflowinventory.com" },
  liq: { app: "Liquidación", accent: "#b8ff3c", host: "liq.minecore.ec" },
  gh: { app: "GitHub", accent: "#e6edf3", host: "github.com" },
  stock: { app: "Stock", accent: "#ff8a3d", host: "admin app" },
  brief: { app: "CHIEF", accent: "#f2d48a", host: "núcleo" },
  nota: { app: "Comunicados", accent: "#d07bff", host: "piso" },
  hr: { app: "Personal", accent: "#7eb6ff", host: "rrhh" },
  eq: { app: "PMV", accent: "#b8ff3c", host: "ecuación" },
};

const ZONE_META = {
  chief: { title: "CHIEF", detail: "RRHH", accent: "#f2d48a", lines: ["Orquesta el piso"] },
  manuelito: { title: "WHATSAPP", detail: "Hub WA", accent: "#2ad4b0", lines: ["Canal con Majo"] },
  cote: { title: "COSTEO", detail: "Semanal", accent: "#e2b15a", lines: ["OC y packing"] },
  law: { title: "JUICIO RUMI", detail: "Legal", accent: "#d07bff", lines: ["Oficios PDF"] },
  secre: { title: "RETENCIONES", detail: "SRI", accent: "#6b93ff", lines: ["Portal SRI"] },
  finance: { title: "INFLOW", detail: "CFO", accent: "#3ec6ff", lines: ["Stamp PAID"] },
  marketing: { title: "LIQUIDACIÓN", detail: "Campañas", accent: "#b8ff3c", lines: ["liq.minecore.ec"] },
  "stock-pilot": { title: "STOCK PILOT", detail: "Existencias", accent: "#ff8a3d", lines: ["Sync de stock"] },
  devops: { title: "DEVOPS", detail: "CI", accent: "#9fb4ff", lines: ["PRs y deploys"] },
  comunicados: { title: "COMUNICADOS", detail: "Avisos", accent: "#e38bff", lines: ["Anuncios"] },
  personal: { title: "PERSONAL", detail: "Gente", accent: "#7eb6ff", lines: ["Turnos"] },
  pmv: { title: "PMV", detail: "Ecuación", accent: "#d6ff6a", lines: ["Modelo"] },
};

const INNER = ["chief", "law", "secre", "finance", "manuelito", "cote"];
const OUTER = ["marketing", "stock-pilot", "devops", "comunicados", "personal", "pmv"];

export function localToWorld(px, pz, lx, lz) {
  const c = Math.cos(YAW);
  const s = Math.sin(YAW);
  return {
    x: px + lx * c + lz * s,
    z: pz - lx * s + lz * c,
  };
}

function placeRing(ids, radius, offsetDeg, ring) {
  return ids.map((id, i) => {
    const deg = -90 + offsetDeg + i * (360 / ids.length);
    const a = (deg * Math.PI) / 180;
    const position = { x: Math.cos(a) * radius, z: Math.sin(a) * radius };
    return {
      id,
      ...ZONE_META[id],
      ring,
      scale: ISLAND_SCALE,
      position,
      seat: localToWorld(position.x, position.z, 0, SEAT_LOCAL_Z * ISLAND_SCALE),
    };
  });
}

export const ZONES = [
  ...placeRing(INNER, 3.9, -18, "inner"),
  ...placeRing(OUTER, 7.05, 12, "outer"),
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));
export const HOMES = Object.fromEntries(ZONES.map((z) => [z.id, z.seat]));

/** Camera sits on +X/+Z. CHIEF stands on the far side of the sala and faces the room. */
const CAM_ANG = Math.PI / 4;
const FAR_ANG = CAM_ANG + Math.PI;
export const CHIEF_PODIUM = {
  x: Math.cos(FAR_ANG) * 1.12,
  z: Math.sin(FAR_ANG) * 1.12,
};

const LISTENERS = AGENTS.filter((a) => a.id !== "chief");
export const MEETING_SPOTS = Object.fromEntries(
  LISTENERS.map((a, i) => {
    const span = Math.PI * 1.22;
    const start = CAM_ANG - span / 2;
    const t = i / (LISTENERS.length - 1);
    const ang = start + span * t;
    const r = 1.68;
    return [a.id, { x: Math.cos(ang) * r, z: Math.sin(ang) * r }];
  })
);

export const DOSSIERS = {
  chief: {
    title: "Orquestador",
    mission: "Convoca al piso, reparte la jornada y anuncia cambios al equipo. RRHH del núcleo.",
    next: "Abrir la sala cuando haya un anuncio.",
  },
  manuelito: {
    title: "Hub WhatsApp",
    mission: "Atiende el canal WA de Minecore: recibe PDFs, avisa retenciones y escribe a Majo cuando hay montos.",
    next: "Esperar reply de Majo y confirmar alerta de retención.",
  },
  cote: {
    title: "Costeo",
    mission: "Arma el costeo semanal: cruza Gmail, packing list y deja aprobaciones Stratega listas.",
    next: "Cerrar OC pendiente y cruzar packing list.",
  },
  law: {
    title: "Legal",
    mission: "Sigue oficios y expedientes (Rumi y demás). Marca PDFs no digitalizados y el impacto.",
    next: "Digitalizar Oficio 74310716.",
  },
  secre: {
    title: "Retenciones",
    mission: "Carga retenciones en SRI, sigue al banco y pasa a Finance cuando hay OK_aplicar.",
    next: "Reintentar SRI y avisar Kluane a Finance.",
  },
  finance: {
    title: "inFlow",
    mission: "Aplica comprobantes en inFlow, mapea saldos y deja el stamp PAID cuando hay respaldo.",
    next: "Aplicar el siguiente comprobante en inFlow.",
  },
  marketing: {
    title: "Liquidación",
    mission: "Publica campañas en liq.minecore.ec, flyers y espera deploys de EFCH.",
    next: "Publicar flyer cuando el deploy EFCH esté verde.",
  },
  "stock-pilot": {
    title: "Stock",
    mission: "Cuida existencias, el sync del Admin App y las alertas de mínimo. No hace CI.",
    next: "Confirmar stock sync.",
  },
  devops: {
    title: "DevOps",
    mission: "CI, PRs y deploys. Deja el Admin App en verde. No lleva el conteo de stock.",
    next: "Cerrar el PR abierto y confirmar el build.",
  },
  comunicados: {
    title: "Comunicados",
    mission: "Redacta avisos internos y deja listo el anuncio que CHIEF da en la sala.",
    next: "Pasar el borrador del anuncio a CHIEF.",
  },
  personal: {
    title: "Personal",
    mission: "Turnos, gente en piso y cobertura. Apoya a CHIEF en RRHH.",
    next: "Cerrar la lista de turnos de la semana.",
  },
  pmv: {
    title: "PMV",
    mission: "Sigue la ecuación PMV y marca qué variable cambió.",
    next: "Revisar la variable abierta del modelo.",
  },
};

export const WORKFLOW_EDGES = [
  ["cote", "manuelito"],
  ["secre", "finance"],
  ["law", "secre"],
  ["stock-pilot", "marketing"],
  ["devops", "marketing"],
  ["finance", "marketing"],
  ["comunicados", "chief"],
];

export const LOOKS = {
  chief: { shirt: "#1a1408", vest: true, coverall: false, hair: "#2a2118", skin: "#e8b894", glasses: false, beard: true, mustache: false },
  manuelito: { shirt: "#1a2744", vest: true, coverall: false, hair: "#1b1b1b", skin: "#f0c09a", glasses: false, beard: false, mustache: false },
  cote: { shirt: "#c4a574", vest: true, coverall: false, hair: "#9a9a9a", skin: "#efc29e", glasses: true, beard: false, mustache: false },
  law: { shirt: "#161616", vest: true, coverall: false, hair: "#1a1a1a", skin: "#e8b894", glasses: false, beard: true, mustache: false },
  secre: { shirt: "#f2f2f4", vest: true, coverall: false, hair: "#5a3a28", skin: "#f3c4a2", glasses: false, beard: false, mustache: false },
  finance: { shirt: "#1f6f82", vest: true, coverall: false, hair: "#1b1b1b", skin: "#f0c09a", glasses: false, beard: false, mustache: false },
  marketing: { shirt: "#3f8f34", vest: true, coverall: false, hair: "#3a2418", skin: "#e8b894", glasses: false, beard: false, mustache: true },
  "stock-pilot": { shirt: "#ff7a18", vest: false, coverall: true, hair: "#1b1b1b", skin: "#e8b894", glasses: false, beard: false, mustache: false },
  devops: { shirt: "#243044", vest: false, coverall: true, hair: "#1b1b1b", skin: "#d7a574", glasses: true, beard: false, mustache: false },
  comunicados: { shirt: "#6a3d86", vest: true, coverall: false, hair: "#3a2418", skin: "#f0c09a", glasses: false, beard: false, mustache: false },
  personal: { shirt: "#3d6eab", vest: true, coverall: false, hair: "#1b1b1b", skin: "#efc29e", glasses: false, beard: false, mustache: false },
  pmv: { shirt: "#101810", vest: true, coverall: false, hair: "#1a1a1a", skin: "#e8b894", glasses: true, beard: false, mustache: false },
};

export const SEEDS = {
  chief: { activity: "En el núcleo · esperando instrucción", status: "ok", popup: "Jornada del piso" },
  law: { activity: "Oficio 74310716 — PDF no digitalizado", status: "pending", popup: "Oficio 74310716" },
  secre: { activity: "Retenciones OK · SRI caído · Kluane espera", status: "pending", popup: "SRI portal…" },
  finance: { activity: "Listo para inFlow · sin comprobante nuevo", status: "pending", popup: "inFlow: listo aplicar" },
  manuelito: { activity: "Hub WA · alerta retención enviada", status: "ok", popup: "Alerta retención enviada" },
  marketing: { activity: "Liq esperando deploy EFCH", status: "pending", popup: "liq.minecore.ec" },
  cote: { activity: "Semanal regenerado · Gmail aprobaciones", status: "pending", popup: "Gmail: OC pendiente" },
  "stock-pilot": { activity: "Stock sync en espera", status: "pending", popup: "Stock sync OK" },
  devops: { activity: "CI del Admin App en cola", status: "pending", popup: "GitHub PR #42" },
  comunicados: { activity: "Sin comunicado nuevo", status: "pending", popup: "Comunicado interno" },
  personal: { activity: "Turnos de la semana abiertos", status: "pending", popup: "Turnos de la semana" },
  pmv: { activity: "Ecuación PMV en seguimiento", status: "pending", popup: "Ecuación PMV" },
};

export const STATUS_COLOR = { ok: "#5dffa8", pending: "#ffd35c", blocked: "#ff6b6b" };
export const STATUS_LABEL = { ok: "ok", pending: "pendiente", blocked: "bloqueado" };

export function actionVerb(agent) {
  if (agent?.id === "chief" && agent?.meeting) return "Anunciando en la sala";
  if (agent?.meeting) return "En la sala de reuniones";
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
  return `#${[channel(16), channel(8), channel(0)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function beside(id, side = 1) {
  const home = HOMES[id];
  const c = Math.cos(YAW);
  const s = Math.sin(YAW);
  return { x: home.x + c * 0.72 * side, z: home.z - s * 0.72 * side };
}

export function hubGate(id) {
  const home = HOMES[id];
  const dx = HUB.x - home.x;
  const dz = HUB.z - home.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: HUB.x - (dx / len) * 1.35, z: HUB.z - (dz / len) * 1.35 };
}

export function wantsMeeting(agentId, text) {
  if (agentId === "chief") return true;
  return /reuni[oó]n|anunci|convo[ck]/i.test(text || "");
}
