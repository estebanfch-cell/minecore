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
    bubble: null,
    x: home.x,
    z: home.z,
    typing: true,
    walking: false,
    meeting: false,
  };
}

function createInitial() {
  const agents = {};
  AGENTS.forEach((a) => {
    agents[a.id] = { ...blankAgent(a), ...(SEEDS[a.id] || {}) };
  });
  return {
    agents,
    mode: "live",
    ticker: "Esperando heartbeats…",
    meeting: false,
    handoff: null,
  };
}

let state = createInitial();
const listeners = new Set();

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

export function replaceState(next) {
  state = next;
  emit();
}

export function patchState(partial) {
  state = { ...state, ...partial };
  emit();
}

export function snapshotAgents() {
  const agents = {};
  for (const id of Object.keys(state.agents)) {
    agents[id] = { ...state.agents[id] };
  }
  return agents;
}

export function setAgent(id, patch) {
  const cur = state.agents[id];
  if (!cur) return;
  const next = { ...cur, ...patch };
  state = {
    ...state,
    agents: { ...state.agents, [id]: next },
    ticker: patch.activity ? `${id}: ${patch.activity}` : state.ticker,
  };
  emit();
}

export function setTicker(msg) {
  patchState({ ticker: msg });
}

export function getPublicState() {
  return JSON.parse(JSON.stringify(state.agents));
}

export function goHome(id) {
  const home = HOMES[id];
  if (!home) return;
  setAgent(id, {
    x: home.x,
    z: home.z,
    walking: false,
    meeting: false,
    typing: true,
    bubble: null,
  });
}

export function walkTo(id, x, z, bubble) {
  setAgent(id, {
    x,
    z,
    walking: true,
    typing: false,
    bubble: bubble ?? state.agents[id]?.bubble ?? null,
  });
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
      bubble: null,
    };
  }
  state = { ...state, agents, meeting: false, handoff: null };
  emit();
}

export function setHandoff(from, to) {
  patchState({ handoff: from && to ? { from, to } : null });
}
