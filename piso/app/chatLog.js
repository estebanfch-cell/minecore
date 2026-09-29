import { getState, pushChat, setChatTyping } from "./store.js";

export const CHIEF_ACK = "Recibida OC-2026-0417 de Taluvira. Arranco la orquesta.";
export const CHIEF_ACK_MS = 700;
export const SCRIPTED_USER = "Te paso la OC de Taluvira";
export const SCRIPTED_FILE = "OC-2026-0417 TALUVIRA.pdf";

let talkGen = 0;
let talkTimer = null;

export function fileStartsOrquesta(name) {
  return String(name || "").trim().length > 0;
}

export function textStartsOrquesta(text) {
  return /taluvira|\boc\b|\borquesta\b|\bdemo\b/i.test(text || "");
}

function clearTalkTimer() {
  if (talkTimer) clearTimeout(talkTimer);
  talkTimer = null;
}

export function cancelChiefTalk() {
  talkGen += 1;
  clearTalkTimer();
  setChatTyping(false);
}

export function chiefSays(text, then) {
  const gen = ++talkGen;
  clearTalkTimer();
  setChatTyping(true);
  talkTimer = setTimeout(() => {
    if (gen !== talkGen) return;
    setChatTyping(false);
    pushChat({ role: "chief", text });
    if (then) then();
  }, CHIEF_ACK_MS);
}

export function pushUserLine(text, fileName) {
  pushChat({
    role: "user",
    text: text || "",
    fileName: fileName || "",
  });
}

export function pushChief(text) {
  if (!text) return;
  cancelChiefTalk();
  pushChat({ role: "chief", text });
}

export function announceRunStep(step, { last = false, closing = "" } = {}) {
  if (!step?.chat) return;
  pushChief(step.chat);
  if (last && closing) pushChief(closing);
}

export function chatIsOpen() {
  return !!getState().chatOpen;
}
