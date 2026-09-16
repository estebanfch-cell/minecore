import { AGENTS, HOMES, MEETING_SPOTS, POPUPS } from "./constants.js";
import {
  getState,
  goHome,
  patchState,
  resetAllHome,
  setAgent,
  setTicker,
  setHandoff,
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
    const t = setTimeout(resolve, ms);
    const check = setInterval(() => {
      if (token?.aborted) {
        clearTimeout(t);
        clearInterval(check);
        resolve();
      }
    }, 80);
    setTimeout(() => clearInterval(check), ms + 20);
  });
}

function cyclePopupsLive() {
  AGENTS.forEach((a) => {
    const list = POPUPS[a.popupKind];
    const cur = getState().agents[a.id].popup;
    const i = Math.max(0, list.indexOf(cur));
    setAgent(a.id, { popup: list[(i + 1) % list.length] });
  });
}

export function startLive() {
  clearTimers();
  patchState({ mode: "live", meeting: false });
  resetAllHome();
  setTicker("Modo EN VIVO — heartbeats en la ficha");
  liveTimer = setInterval(() => {
    cyclePopupsLive();
  }, 8000);
}

export async function runDemo() {
  clearTimers();
  patchState({ mode: "demo", meeting: false });
  const token = { aborted: false };
  demoAbort = token;
  resetAllHome();
  setTicker("DEMO — intensificando actividad…");

  for (let round = 0; round < 4 && !token.aborted; round++) {
    AGENTS.forEach((a) => {
      const list = POPUPS[a.popupKind];
      setAgent(a.id, {
        popup: list[round % list.length],
        typing: true,
        status: round === 3 ? "ok" : "pending",
      });
    });
    await sleep(900, token);
  }
  if (token.aborted) return;

  setTicker("DEMO — handoffs SECRE→FINANCE, COTE→MANUELITO");
  setHandoff("secre", "finance");
  walkTo("secre", HOMES.finance.x + 1.15, HOMES.finance.z, "OK_aplicar?");
  await sleep(1400, token);
  if (token.aborted) return;
  setAgent("secre", { bubble: null });
  setAgent("finance", { bubble: "Aplico en inFlow" });
  goHome("secre");
  setHandoff("cote", "manuelito");
  await sleep(800, token);

  walkTo("cote", HOMES.manuelito.x + 1.15, HOMES.manuelito.z, "Avisá a Majo");
  await sleep(1400, token);
  if (token.aborted) return;
  setAgent("cote", { bubble: null });
  setAgent("manuelito", { bubble: "Mensaje WA listo" });
  goHome("cote");
  await sleep(900, token);
  setAgent("manuelito", { bubble: null });
  setAgent("finance", { bubble: null });
  setHandoff(null, null);
  if (token.aborted) return;

  setTicker("DEMO — reunión stand-up centro");
  patchState({ meeting: true });
  AGENTS.forEach((a, i) => {
    const spot = MEETING_SPOTS[i];
    setAgent(a.id, { meeting: true, typing: false });
    walkTo(a.id, spot.x, spot.z, i === 0 ? "Stand-up 60s" : null);
  });
  await sleep(1800, token);
  if (token.aborted) return;
  AGENTS.forEach((a) => setAgent(a.id, { walking: false, bubble: null }));
  setAgent("manuelito", { bubble: "WA OK" });
  setAgent("law", { bubble: "Juicio Rumi" });
  setAgent("stock-devops", { bubble: "App verde" });
  await sleep(2800, token);
  if (token.aborted) return;

  AGENTS.forEach((a) => {
    setAgent(a.id, { bubble: null, meeting: false });
    goHome(a.id);
  });
  patchState({ meeting: false });
  setTicker("DEMO — ciclo listo. Pulsa Demo otra vez para repetir.");
}

export function bindFeedApi() {
  window.MinecoreFeed = {
    setAgent(id, patch) {
      setAgent(id, patch || {});
    },
    getState() {
      return JSON.parse(JSON.stringify(getState().agents));
    },
  };
}
