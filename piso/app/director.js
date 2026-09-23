import { AGENTS, MEETING_SPOTS, beside, hubGate } from "./constants.js";
import {
  flashPopup,
  getState,
  goHome,
  patchState,
  pushNote,
  resetAllHome,
  restoreSeeds,
  setAgent,
  setHandoff,
  setTicker,
  walkTo,
} from "./store.js";

let liveTimer = null;
let demoAbort = null;

function clearTimers() {
  if (liveTimer) clearInterval(liveTimer);
  liveTimer = null;
  if (demoAbort) demoAbort.aborted = true;
  demoAbort = null;
}

function sleep(ms, token) {
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      clearInterval(check);
      resolve();
    }, ms);
    const check = setInterval(() => {
      if (token?.aborted) {
        clearTimeout(t);
        clearInterval(check);
        resolve();
      }
    }, 80);
  });
}

function applyPayload(data) {
  const agents = data?.agents || data;
  if (!agents || typeof agents !== "object") return;
  let applied = false;
  for (const [id, patch] of Object.entries(agents)) {
    if (!patch || typeof patch !== "object") continue;
    setAgent(id, patch, { external: true });
    applied = true;
  }
  if (applied) {
    setTicker("En vivo · heartbeat recibido");
  }
}

async function pullExternalFeed() {
  const url = typeof window !== "undefined" ? window.MINECORE_FEED_URL : "";
  if (!url) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    applyPayload(data);
  } catch {
    /* keep the last known floor; the panel already says there is no heartbeat */
  }
}

export function startLive() {
  clearTimers();
  patchState({ mode: "live", meeting: false, popupFlash: null });
  if (!getState().liveConnected) {
    restoreSeeds();
    setTicker("En vivo · esperando heartbeats");
    pushNote("En vivo · sin heartbeat todavía", "pending");
  } else {
    resetAllHome();
    setTicker("En vivo · heartbeat activo");
  }
  liveTimer = setInterval(pullExternalFeed, 10000);
  pullExternalFeed();
}

async function arrive(id, x, z, token, ms = 1700) {
  walkTo(id, x, z);
  await sleep(ms, token);
  if (token.aborted) return;
  setAgent(id, { walking: false }, { silent: true });
}

async function playRound(token) {
  resetAllHome();
  setHandoff(null, null);
  patchState({ meeting: false });
  pushNote("Demo · jornada en los escritorios", "ok");
  await sleep(500, token);
  if (token.aborted) return;

  const desk = [
    ["manuelito", "Hub WA · PDF de Majo en cola", "ok"],
    ["cote", "Costeo semanal · cruce de packing list", "pending"],
    ["law", "Oficio 74310716 · PDF sin digitalizar", "pending"],
    ["secre", "SRI en línea · retenciones del día", "pending"],
    ["finance", "inFlow abierto · esperando OK_aplicar", "pending"],
    ["marketing", "liq.minecore.ec · espera deploy EFCH", "pending"],
    ["stock-devops", "Admin App · sync de stock en curso", "pending"],
  ];
  for (const [id, activity, status] of desk) {
    if (token.aborted) return;
    setAgent(id, { activity, status, typing: true });
    await sleep(620, token);
  }
  if (token.aborted) return;

  setTicker("Demo · SECRE lleva OK_aplicar a Finance");
  setHandoff("secre", "finance");
  setAgent("secre", { activity: "Sale con OK_aplicar hacia Finance", status: "ok" });
  flashPopup("secre", "Retenciones OK");
  await arrive("secre", hubGate("secre").x, hubGate("secre").z, token, 1500);
  if (token.aborted) return;
  const fin = beside("finance", -1);
  await arrive("secre", fin.x, fin.z, token, 1600);
  if (token.aborted) return;
  setAgent("finance", { activity: "Recibe OK_aplicar · abre inFlow", status: "ok" });
  flashPopup("finance", "inFlow: listo aplicar");
  await sleep(1100, token);
  if (token.aborted) return;
  goHome("secre");
  setHandoff(null, null);
  await sleep(900, token);
  if (token.aborted) return;

  setTicker("Demo · COTE pasa la OC a Manuelito");
  setHandoff("cote", "manuelito");
  setAgent("cote", { activity: "Pide aviso a Majo por la OC", status: "pending" });
  flashPopup("cote", "Gmail: OC pendiente");
  await arrive("cote", hubGate("cote").x, hubGate("cote").z, token, 1500);
  if (token.aborted) return;
  const wa = beside("manuelito", 1);
  await arrive("cote", wa.x, wa.z, token, 1600);
  if (token.aborted) return;
  setAgent("manuelito", { activity: "Mensaje WA a Majo enviado", status: "ok" });
  flashPopup("manuelito", "WA → Majo: montos OK");
  await sleep(1100, token);
  if (token.aborted) return;
  goHome("cote");
  setHandoff(null, null);
  await sleep(800, token);
  if (token.aborted) return;

  setAgent("law", { activity: "Impacto Rumi marcado en el expediente", status: "pending" });
  flashPopup("law", "Oficio 74310716");
  await sleep(900, token);
  if (token.aborted) return;
  setAgent("stock-devops", { activity: "CI del Admin App en verde", status: "ok" });
  flashPopup("stock-devops", "GitHub · CI passed");
  await sleep(900, token);
  if (token.aborted) return;
  setAgent("marketing", { activity: "Flyer de liquidación publicado", status: "ok" });
  flashPopup("marketing", "Flyer publicado");
  await sleep(1000, token);
  if (token.aborted) return;

  setTicker("Demo · stand-up en el núcleo");
  pushNote("Stand-up en el núcleo", "ok");
  patchState({ meeting: true });
  AGENTS.forEach((a, i) => {
    const spot = MEETING_SPOTS[i];
    setAgent(a.id, { meeting: true, typing: false }, { silent: true });
    walkTo(a.id, spot.x, spot.z);
  });
  await sleep(2200, token);
  if (token.aborted) return;
  AGENTS.forEach((a) => setAgent(a.id, { walking: false, meeting: true }, { silent: true }));
  await sleep(2200, token);
  if (token.aborted) return;

  AGENTS.forEach((a) => {
    setAgent(a.id, { meeting: false }, { silent: true });
    goHome(a.id);
  });
  patchState({ meeting: false });
  await sleep(1800, token);
  if (token.aborted) return;
  setTicker("Demo · ciclo listo, se repite");
}

export async function runDemo() {
  clearTimers();
  patchState({ mode: "demo", meeting: false });
  const token = { aborted: false };
  demoAbort = token;
  resetAllHome();
  setTicker("Demo · intensificando actividad");
  while (!token.aborted) {
    await playRound(token);
    await sleep(1400, token);
  }
}

export function stopDirector() {
  clearTimers();
}

export function bindFeedApi() {
  window.MinecoreFeed = {
    setAgent(id, patch) {
      setAgent(id, patch || {}, { external: true });
      if (getState().mode === "live") {
        setTicker("En vivo · heartbeat recibido");
      }
    },
    getState() {
      return JSON.parse(JSON.stringify(getState().agents));
    },
  };
}
