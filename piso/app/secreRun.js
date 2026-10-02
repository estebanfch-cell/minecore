import { AGENTS, ZONE_BY_ID } from "./constants.js";
import { interruptFloor } from "./director.js";
import { postSecreRetencion } from "./instruct.js";
import { getState, goHome, patchState, selectAgent, setAgent, setTicker, settleFloor } from "./store.js";

export const SRI_SUMMARY =
  "Encontré en el SRI la retención 001-999-000034524 de Kluane por $28.01 (renta 312 2% $8.62 + IVA 30% $19.39) y la apliqué a la factura 1223 (MCOR-SO-001205). Saldo $495.42 → $467.41, estado Parcial. Te mandé el informe por correo.";

export const BANK_SUMMARY =
  "Apliqué 3 créditos por $14,173.21: Goldtech FAC 1122+1188 pagadas, Agrícola Cañapalm FAC 1212 pagada, Kluane FAC 1207 parcial (saldo $656.24 = retención pendiente). 4 débitos ignorados.";

/** Natural length of sri-recorrido.mp4 (20.17 s cut). The first beat plays it once, at 1x. */
export const SRI_VIDEO_MS = 20170;
const SRI_RIDE_MS = 5200;
const SRI_SO_MS = 3400;
const SRI_CHECKS_MS = 3400;
const SRI_SAVE_MS = 2800;
const SRI_SUMMARY_MS = 5500;
/** Lead the summary by ~47s. Shorter runs post when the owner sends the message. */
const SRI_MAIL_LEAD_MS = 47000;
/** Nora types, then the reply sits before the floor run. Sum of the two chat waits. */
export const SRI_TYPE_MS = 800;
export const SRI_REPLY_MS = 1200;
export const SRI_CHAT_BEFORE_RUN_MS = SRI_TYPE_MS + SRI_REPLY_MS;

/** Portal beats on the 20.17 s cut. Login 0–5.3, profile/menu 5–9.3, filter 9–12.6, row and XML 12.3–16.1, RIDE PDF ~16.8 to the end. */
export const SRI_CUES = {
  menu: 5000,
  filter: 9000,
  found: 12300,
  download: 16100,
};

const SRI_RIDE_AT = SRI_VIDEO_MS;
const SRI_SO_AT = SRI_RIDE_AT + SRI_RIDE_MS;
const SRI_CHECKS_AT = SRI_SO_AT + SRI_SO_MS;
const SRI_SAVE_AT = SRI_CHECKS_AT + SRI_CHECKS_MS;
/** When the closing summary screen appears, measured from the anchored video start. */
export const SRI_SUMMARY_AT = SRI_SAVE_AT + SRI_SAVE_MS;
/** From the owner's Enviar to the summary, before the video's play delay. */
export const SRI_SUMMARY_FROM_MESSAGE_MS = SRI_CHAT_BEFORE_RUN_MS + SRI_SUMMARY_AT;
/** True when that span is shorter than the mail lead, so the POST goes out with Enviar. */
export const SRI_MAIL_ON_SEND = SRI_SUMMARY_FROM_MESSAGE_MS < SRI_MAIL_LEAD_MS;
/** Single pre_send. Negative when the POST belongs at Enviar instead of mid-run. */
export const SRI_MAIL_AT = SRI_SUMMARY_AT - SRI_MAIL_LEAD_MS;

const SRI_STEPS = [
  { text: "Entrar al SRI", at: 0 },
  { text: "Comprobantes recibidos", at: SRI_CUES.menu },
  { text: "Filtrar retenciones", at: SRI_CUES.filter },
  { text: "Encontrar retención", at: SRI_CUES.found },
  { text: "Descargar XML y RIDE", at: SRI_CUES.download },
  { text: "Leer retención", at: SRI_RIDE_AT },
  { text: "Buscar factura en el Sistema", at: SRI_SO_AT },
  { text: "Validar datos", at: SRI_CHECKS_AT },
  { text: "Aplicar retención", at: SRI_SAVE_AT },
  { text: "Informar a Esteban", at: SRI_SUMMARY_AT },
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
  { screen: "sri", ms: SRI_VIDEO_MS, title: "SRI en Línea", caption: "Entra al SRI" },
  { screen: "ride", ms: SRI_RIDE_MS, title: "RIDE · Comprobante de retención", caption: "Lee el comprobante de retención" },
  { screen: "so", ms: SRI_SO_MS, title: "Sistema", system: true, caption: "Busca la factura en el Sistema" },
  { screen: "checks", ms: SRI_CHECKS_MS, title: "Sistema", system: true, caption: "Valida los datos" },
  { screen: "save", ms: SRI_SAVE_MS, title: "Sistema", system: true, caption: "Aplica la retención" },
  { screen: "summary", ms: SRI_SUMMARY_MS, title: "SECRE", caption: "Informa a Esteban", note: SRI_SUMMARY },
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
let mailTimer = null;
let mailedEpoch = -1;
let ownerPosted = false;

function clearBeatTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers = [];
  if (mailTimer) clearTimeout(mailTimer);
  mailTimer = null;
}

export function haltSecreRun() {
  epoch += 1;
  clearBeatTimers();
}

/** Line the checklist and the later beats up with the recording. The RIDE starts as the video ends. */
export function anchorSecreVideo(mediaMs = 0) {
  const run = getState().demoRun;
  if (!run || run.id !== "secre") return;
  const ep = epoch;
  clearBeatTimers();
  const played = Math.max(0, Math.min(SRI_VIDEO_MS, mediaMs || 0));
  const now = Date.now();
  const briefAt = now - played;
  const fileName = getState().workWindow?.fileName || "";
  patchState({ demoRun: { ...run, briefAt } });
  let cursor = SRI_VIDEO_MS - played;
  SRI_BEATS.forEach((beat, index) => {
    if (index === 0) return;
    const at = cursor;
    later(ep, () => present(ep, beat, index, SRI_BEATS.length, run.briefing, briefAt, fileName), at);
    cursor += beat.ms;
  });
  later(ep, () => settleFloor(), cursor + RESET_PAUSE_MS);
  armSecreMail(ep);
}

function armSecreMail(ep) {
  if (mailTimer) clearTimeout(mailTimer);
  mailTimer = null;
  if (ownerPosted || SRI_MAIL_ON_SEND || SRI_MAIL_AT <= 0) return;
  mailTimer = setTimeout(() => {
    mailTimer = null;
    if (ep !== epoch || mailedEpoch === ep || ownerPosted) return;
    mailedEpoch = ep;
    postSecreRetencion();
  }, SRI_MAIL_AT);
}

/** Scene A only. A short run posts with the owner's message; a longer one waits for the anchor. */
export function onSecreOwnerMessage(scene) {
  ownerPosted = false;
  if (scene === "banco" || !SRI_MAIL_ON_SEND) return;
  ownerPosted = true;
  postSecreRetencion();
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

/** Floor run for SECRE. Scene A posts one retention report. Scene B does not. */
export function startSecreRun(scene, fileName) {
  const current = getState().demoRun;
  if (current && current.id !== "secre") return;
  haltSecreRun();
  const ep = epoch;
  interruptFloor();
  AGENTS.forEach((agent) => goHome(agent.id));
  const banco = scene === "banco";
  if (!banco) armSecreMail(ep);
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
