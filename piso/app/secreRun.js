import { AGENTS, ZONE_BY_ID } from "./constants.js";
import { interruptFloor } from "./director.js";
import { getState, goHome, patchState, selectAgent, setAgent, setTicker, settleFloor } from "./store.js";

export const SRI_SUMMARY =
  "Retención 001-999-000012345 · factura 001-001-000001166 · SO MCOR-SO-001156 · $22.07 · JC PORTAL · aplicada y RIDE adjunto. No hay más retenciones pendientes.";

export const BANK_SUMMARY =
  "Apliqué 3 créditos por $14,173.21: Goldtech FAC 1122+1188 pagadas, Agrícola Cañapalm FAC 1212 pagada, Kluane FAC 1207 parcial (saldo $656.24 = retención pendiente). 4 débitos ignorados.";

const SRI_STEPS = [
  { text: "Entrar al SRI", at: 0 },
  { text: "Consultar retenciones recibidas", at: 5000 },
  { text: "Detectar retención sin aplicar", at: 11000 },
  { text: "Descargar XML y RIDE", at: 16000 },
  { text: "Leer retención", at: 21000 },
  { text: "Buscar factura en el Sistema", at: 31000 },
  { text: "Validar datos", at: 44000 },
  { text: "Aplicar retención", at: 53000 },
  { text: "Registrar y adjuntar RIDE", at: 64000 },
  { text: "Informar a Esteban", at: 76000 },
];

const BANK_STEPS = [
  { text: "Leer estado de cuenta", at: 0 },
  { text: "Separar créditos y débitos", at: 7000 },
  { text: "Identificar clientes", at: 14000 },
  { text: "Buscar facturas abiertas", at: 20000 },
  { text: "Cruzar montos", at: 32000 },
  { text: "Detectar retención pendiente", at: 42000 },
  { text: "Proponer aplicación", at: 46000 },
  { text: "Registrar pagos", at: 62000 },
  { text: "Informar a Esteban", at: 82000 },
];

const SRI_BEATS = [
  { screen: "sri", ms: 16000, title: "SRI · Comprobantes electrónicos recibidos", caption: "Entra al SRI" },
  { screen: "ride", ms: 15000, title: "RIDE · Comprobante de retención", caption: "Lee el comprobante de retención" },
  { screen: "so", ms: 13000, title: "Sistema", system: true, caption: "Busca la factura en el Sistema" },
  { screen: "checks", ms: 9000, title: "Sistema", system: true, caption: "Valida los datos" },
  { screen: "pay", ms: 11000, title: "Sistema", system: true, caption: "Aplica la retención" },
  { screen: "save", ms: 12000, title: "Sistema", system: true, caption: "Registra y adjunta el RIDE" },
  { screen: "summary", ms: 8000, title: "SECRE", caption: "Informa a Esteban", note: SRI_SUMMARY },
];

const BANK_BEATS = [
  { screen: "bank", ms: 20000, title: "BANCO PICHINCHA · Estado de cuenta", caption: "Lee el estado de cuenta" },
  { screen: "match", ms: 26000, title: "Sistema", system: true, caption: "Cruza créditos con facturas abiertas" },
  { screen: "proposal", ms: 16000, title: "Sistema", system: true, caption: "Propone la aplicación" },
  { screen: "collect", ms: 20000, title: "Sistema", system: true, caption: "Registra los pagos" },
  { screen: "summary", ms: 10000, title: "SECRE", caption: "Informa a Esteban", note: BANK_SUMMARY },
];

const RESET_PAUSE_MS = 3500;

let epoch = 0;
let timers = [];

export function haltSecreRun() {
  epoch += 1;
  timers.forEach((timer) => clearTimeout(timer));
  timers = [];
}

function later(ep, fn, ms) {
  const timer = setTimeout(() => {
    if (ep !== epoch) return;
    fn();
  }, ms);
  timers.push(timer);
}

export function sheetAttached(name) {
  return /\.(xlsx|xls|csv)$/i.test(String(name || ""));
}

function present(ep, beat, index, count, briefing, briefAt, fileName) {
  if (ep !== epoch) return;
  const zone = ZONE_BY_ID.secre;
  patchState({
    demoRun: {
      id: "secre",
      title: briefing.purpose,
      index,
      count,
      paused: false,
      caption: beat.caption,
      banner: "",
      agentId: "secre",
      wide: false,
      room: false,
      split: true,
      walk: false,
      handoffLine: "",
      briefing,
      briefAt,
      focus: zone ? { x: zone.position.x, y: 0.62, z: zone.position.z } : { x: 0, y: 0.62, z: 0 },
    },
    workWindow: {
      title: beat.title,
      secre: beat.screen,
      system: !!beat.system,
      fileName: fileName || "",
      note: beat.note || "",
      since: Date.now(),
      minimizing: false,
      log: [],
      frames: [],
    },
    previewDoc: null,
    carry: null,
    meeting: false,
    chatOpen: false,
    noraOpen: false,
    selectedId: null,
    deskScreens: {},
  });
  setAgent(
    "secre",
    { typing: true, activity: beat.caption, status: "ok", meeting: false, walking: false, seated: false },
    { silent: true }
  );
  setTicker(beat.caption);
}

/** Floor run for SECRE. Does not call the mail relay. */
export function startSecreRun(scene, fileName) {
  const current = getState().demoRun;
  if (current && current.id !== "secre") return;
  haltSecreRun();
  const ep = epoch;
  interruptFloor();
  AGENTS.forEach((agent) => goHome(agent.id));
  const banco = scene === "banco";
  const beats = banco ? BANK_BEATS : SRI_BEATS;
  const briefing = {
    role: "Retenciones",
    purpose: banco
      ? "Aplicar los créditos del estado de cuenta a facturas abiertas."
      : "Revisar retenciones recibidas y aplicar la que falta.",
    steps: banco ? BANK_STEPS : SRI_STEPS,
  };
  const briefAt = Date.now();
  let cursor = 0;
  beats.forEach((beat, index) => {
    const at = cursor;
    if (at === 0) present(ep, beat, index, beats.length, briefing, briefAt, fileName);
    else later(ep, () => present(ep, beat, index, beats.length, briefing, briefAt, fileName), at);
    cursor += beat.ms;
  });
  later(ep, () => settleFloor(), cursor + RESET_PAUSE_MS);
}

if (import.meta.env?.DEV && typeof window !== "undefined") {
  window.__nora = {
    open() {
      selectAgent("secre");
    },
  };
}
