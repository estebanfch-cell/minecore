import { AGENTS, HOMES, POPUPS, SEEDS } from "./constants.js";

function blankAgent(def) {
  const home = HOMES[def.id];
  return {
    id: def.id,
    name: def.name,
    role: def.role,
    popupKind: def.popupKind,
    activity: "En espera de heartbeat…",
    status: "pending",
    popup: POPUPS[def.popupKind][0],
    history: [],
    x: home.x,
    z: home.z,
    typing: true,
    walking: false,
    meeting: false,
  };
}

function createInitial() {
  const boot = Date.now();
  const agents = {};
  const feed = [];
  AGENTS.forEach((a, i) => {
    const seed = SEEDS[a.id] || {};
    const base = { ...blankAgent(a), ...seed };
    if (seed.activity) {
      base.history = [{ text: seed.activity, at: boot - (AGENTS.length - 1 - i) * 90000 }];
      feed.unshift({
        agentId: a.id,
        name: a.name,
        text: seed.activity,
        status: seed.status || "pending",
        at: boot - (AGENTS.length - 1 - i) * 90000,
      });
    }
    agents[a.id] = base;
  });
  return {
    agents,
    mode: "live",
    ticker: "En vivo · esperando heartbeats",
    meeting: false,
    handoff: null,
    selectedId: null,
    popupFlash: null,
    liveConnected: false,
    feed,
  };
}

let state = createInitial();
const listeners = new Set();
let flashTimer = null;

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function patchState(partial) {
  state = { ...state, ...partial };
  emit();
}

function pushHistory(cur, patch) {
  const note = patch.activity;
  if (!note) return cur.history || [];
  const last = (cur.history || [])[0];
  if (last && last.text === note) return cur.history;
  return [{ text: note, at: Date.now() }, ...(cur.history || [])].slice(0, 8);
}

function pushFeed(agent, text, status) {
  if (!text) return state.feed;
  const last = state.feed[0];
  if (last && last.agentId === agent.id && last.text === text) return state.feed;
  return [
    {
      agentId: agent.id,
      name: agent.name,
      text,
      status: status || agent.status,
      at: Date.now(),
    },
    ...state.feed,
  ].slice(0, 24);
}

function armFlash(agent, text) {
  if (!text) return;
  const at = Date.now();
  state = {
    ...state,
    popupFlash: { agentId: agent.id, kind: agent.popupKind, text, at },
  };
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    if (state.popupFlash?.at === at) {
      state = { ...state, popupFlash: null };
      emit();
    }
  }, 3800);
}

export function setAgent(id, patch, meta) {
  const cur = state.agents[id];
  if (!cur) return;
  const next = {
    ...cur,
    ...patch,
    history: meta?.silent ? cur.history || [] : pushHistory(cur, patch || {}),
  };
  const feed =
    meta?.silent || !patch?.activity ? state.feed : pushFeed(next, patch.activity, next.status);
  state = {
    ...state,
    agents: { ...state.agents, [id]: next },
    feed,
    ticker: patch?.activity && !meta?.silent ? `${next.name}: ${patch.activity}` : state.ticker,
    liveConnected: meta?.external ? true : state.liveConnected,
  };
  if ((meta?.external || patch?.flash) && patch?.popup) {
    armFlash(next, patch.popup);
  }
  emit();
}

export function flashPopup(id, text) {
  const cur = state.agents[id];
  if (!cur) return;
  const next = { ...cur, popup: text || cur.popup };
  state = {
    ...state,
    agents: { ...state.agents, [id]: next },
  };
  armFlash(next, text || cur.popup);
  emit();
}

export function pushNote(text, status = "pending") {
  const last = state.feed[0];
  if (last && last.agentId == null && last.text === text) {
    state = { ...state, ticker: text };
    emit();
    return;
  }
  state = {
    ...state,
    ticker: text,
    feed: [
      { agentId: null, name: "PISO", text, status, at: Date.now() },
      ...state.feed,
    ].slice(0, 24),
  };
  emit();
}

export function selectAgent(id) {
  patchState({ selectedId: id || null });
}

export function setTicker(msg) {
  patchState({ ticker: msg });
}

export function goHome(id) {
  const home = HOMES[id];
  if (!home) return;
  setAgent(
    id,
    {
      x: home.x,
      z: home.z,
      walking: false,
      meeting: false,
      typing: true,
    },
    { silent: true }
  );
}

export function walkTo(id, x, z) {
  setAgent(
    id,
    {
      x,
      z,
      walking: true,
      typing: false,
      meeting: false,
    },
    { silent: true }
  );
}

export function resetAllHome() {
  const agents = {};
  for (const a of AGENTS) {
    const home = HOMES[a.id];
    agents[a.id] = {
      ...state.agents[a.id],
      x: home.x,
      z: home.z,
      walking: false,
      meeting: false,
      typing: true,
    };
  }
  state = { ...state, agents, meeting: false, handoff: null };
  emit();
}

export function setHandoff(from, to) {
  patchState({ handoff: from && to ? { from, to } : null });
}

export function restoreSeeds() {
  for (const a of AGENTS) {
    const seed = SEEDS[a.id];
    if (!seed) continue;
    setAgent(a.id, { ...seed, typing: true, walking: false, meeting: false }, { silent: true });
  }
  resetAllHome();
}
