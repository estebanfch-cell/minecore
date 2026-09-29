import { AGENTS, CHIEF_PODIUM, DOOR_QUEUE, MEETING_SPOTS, ZONE_BY_ID, wantsDemoRun } from "./constants.js";
import { CHIEF_ACK, SCRIPTED_FILE, SCRIPTED_USER, announceRunStep, cancelChiefTalk, chiefSays, pushUserLine } from "./chatLog.js";
import { postOrquesta } from "./instruct.js";
import {
  getState,
  goHome,
  patchState,
  selectAgent,
  setAgent,
  setHandoff,
  setTicker,
  walkTo,
} from "./store.js";

const STEP_MS = 7500;

let script = null;
let stepTimer = null;
let frameTimer = null;
let subs = [];
let interruptFloor = () => {};

function later(fn, ms) {
  const timer = setTimeout(fn, ms);
  subs.push(timer);
  return timer;
}

function clearSubs() {
  subs.forEach((timer) => clearTimeout(timer));
  subs = [];
}

export function bindDemoRun(api) {
  interruptFloor = api?.interrupt || (() => {});
}

function demoBase() {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : `${base}/`;
}

export function demoAsset(folder, name) {
  return `${demoBase()}run/${folder}/${encodeURIComponent(name)}`;
}

export async function loadDemoScript() {
  if (script) return script;
  const res = await fetch(`${demoBase()}run/steps.json`);
  if (!res.ok) throw new Error("run script");
  script = await res.json();
  return script;
}

function clearRunTimers() {
  if (stepTimer) clearTimeout(stepTimer);
  if (frameTimer) clearInterval(frameTimer);
  stepTimer = null;
  frameTimer = null;
  clearSubs();
}

function standDown() {
  AGENTS.forEach((a) => {
    setAgent(a.id, { meeting: false, seated: false, cue: null }, { silent: true });
    goHome(a.id);
  });
  patchState({ meeting: false, assignments: [] });
}

export function stopDemoRun() {
  clearRunTimers();
  cancelChiefTalk();
  if (!getState().demoRun && !getState().carry && !getState().workWindow && !getState().meeting) return;
  setHandoff(null, null);
  standDown();
  patchState({ demoRun: null, carry: null, deskScreens: {}, previewDoc: null, workWindow: null, assignments: [] });
}

function resolveFrame(step, frame) {
  if (frame && typeof frame === "object") {
    return {
      preview: frame.preview || step.preview,
      file: frame.file || step.file,
    };
  }
  return { preview: frame || step.preview, file: step.file };
}

function screenFor(step, frame) {
  const spec = resolveFrame(step, frame);
  return {
    agentId: step.agent,
    caption: step.caption,
    banner: step.banner || "",
    image: demoAsset("previews", spec.preview),
    pdf: demoAsset("pdf", spec.file),
    title: String(spec.preview).replace(/\.png$/i, ""),
  };
}

function releaseRoom() {
  if (!getState().meeting) return;
  AGENTS.forEach((a) => {
    setAgent(a.id, { meeting: false, seated: false, cue: null }, { silent: true });
    goHome(a.id);
  });
  patchState({ meeting: false, assignments: [] });
}

function minimizeWindow() {
  const current = getState().workWindow;
  if (!current) return;
  patchState({ workWindow: { ...current, minimizing: true } });
  later(() => {
    if (getState().workWindow?.minimizing) patchState({ workWindow: null });
  }, 720);
}

function seatMeeting(step) {
  patchState({ meeting: true, assignments: [] });
  AGENTS.forEach((a) => {
    setAgent(a.id, { meeting: true, seated: false, typing: false, cue: null }, { silent: true });
    const door = DOOR_QUEUE[a.id];
    if (door) walkTo(a.id, door.x, door.z);
  });
  later(() => {
    AGENTS.forEach((a) => {
      const spot = a.id === "chief" ? CHIEF_PODIUM : MEETING_SPOTS[a.id];
      if (spot) walkTo(a.id, spot.x, spot.z);
      setAgent(a.id, { meeting: true }, { silent: true });
    });
  }, 3000);
  later(() => {
    AGENTS.forEach((a) => {
      setAgent(
        a.id,
        {
          walking: false,
          meeting: true,
          seated: a.id !== "chief",
          cue: "listen",
          cueAt: Date.now(),
        },
        { silent: true }
      );
    });
  }, 6800);
  (step.assignments || []).forEach((item) => {
    later(() => {
      const cur = getState().assignments || [];
      patchState({ assignments: [...cur, { id: item.agent, text: item.card }] });
      setAgent("chief", { cue: "speak", cueAt: Date.now(), meeting: true }, { silent: true });
      setAgent(item.agent, { cue: "nod", cueAt: Date.now(), seated: true, meeting: true }, { silent: true });
    }, item.at || 9000);
  });
}

function openDeskWindow(step) {
  const win = step.window;
  if (!win) return;
  patchState({
    workWindow: {
      title: win.title,
      pdf: null,
      frames: win.frames || [],
      log: win.log || [],
      logMs: win.logMs || 1500,
      minimizing: false,
    },
  });
}

function showStep(index) {
  const steps = script.steps;
  const step = steps[index];
  if (!step) return;
  clearSubs();
  if (frameTimer) clearInterval(frameTimer);
  frameTimer = null;
  const zone = ZONE_BY_ID[step.agent];
  const phase = step.phase || "desk";
  const wide = phase === "analysis" || phase === "meeting";
  const frames = step.window?.frames?.length
    ? step.window.frames
    : step.frames?.length
      ? step.frames
      : step.preview
        ? [step.preview]
        : [];

  if (phase !== "meeting") releaseRoom();
  setHandoff(null, null);
  patchState({ carry: null });

  if (phase === "analysis") {
    selectAgent(null);
    const win = step.window || {};
    patchState({
      assignments: [],
      workWindow: {
        title: win.title,
        pdf: win.pdf,
        fallback: win.preview,
        frames: [],
        log: win.log || [],
        logMs: 900,
        minimizing: false,
      },
    });
  } else if (phase === "meeting") {
    minimizeWindow();
    seatMeeting(step);
  } else {
    minimizeWindow();
    if (frames.length) {
      const applyFrame = (n) => {
        const view = screenFor(step, frames[n] || step.preview);
        const prev = getState().deskScreens || {};
        patchState({ deskScreens: { ...prev, [step.agent]: view } });
      };
      applyFrame(0);
      if (frames.length > 1) {
        let frame = 0;
        const slice = Math.max(1400, Math.floor((step.stepMs || STEP_MS) / frames.length));
        frameTimer = setInterval(() => {
          if (frame >= frames.length - 1) {
            clearInterval(frameTimer);
            frameTimer = null;
            return;
          }
          frame += 1;
          applyFrame(frame);
        }, slice);
      }
    }
    later(() => openDeskWindow(step), 1100);
  }

  setAgent(step.agent, { activity: step.caption, status: "ok", typing: phase === "desk" });
  setTicker(step.banner || step.caption);

  const run = {
    id: script.id,
    title: script.title,
    index,
    count: steps.length,
    paused: !!getState().demoRun?.paused,
    caption: step.caption,
    banner: step.banner || "",
    agentId: step.agent,
    wide,
    room: phase === "meeting",
    focus: wide
      ? { x: 0.1, y: 1.15, z: 0.15 }
      : zone
        ? { x: zone.position.x - 0.22, y: 1.35, z: zone.position.z + 0.24 }
        : { x: 0, y: 0.45, z: 0 },
  };
  patchState({ demoRun: run, chatOpen: true });
  announceRunStep(step, { last: index === steps.length - 1, closing: script.closing || "" });

  if (stepTimer) clearTimeout(stepTimer);
  const wait = step.stepMs || script.stepMs || STEP_MS;
  if (!run.paused && index < steps.length - 1) {
    stepTimer = setTimeout(() => showStep(index + 1), wait);
  }
}

export async function startDemoRun() {
  interruptFloor();
  clearRunTimers();
  try {
    await loadDemoScript();
  } catch {
    setTicker("No se pudo cargar la orquesta");
    return;
  }
  AGENTS.forEach((a) => goHome(a.id));
  patchState({
    demoRun: { paused: false, index: 0, count: script.steps.length },
    deskScreens: {},
    previewDoc: null,
    carry: null,
    chatOpen: true,
    meeting: false,
    workWindow: null,
    assignments: [],
  });
  showStep(0);
}

export function pauseDemoRun() {
  const run = getState().demoRun;
  if (!run) return;
  if (run.paused) {
    patchState({ demoRun: { ...run, paused: false } });
    if (run.index < run.count - 1) {
      if (stepTimer) clearTimeout(stepTimer);
      stepTimer = setTimeout(() => showStep(run.index + 1), script?.stepMs || STEP_MS);
    }
    return;
  }
  if (stepTimer) clearTimeout(stepTimer);
  stepTimer = null;
  patchState({ demoRun: { ...run, paused: true } });
}

export function nextDemoStep() {
  const run = getState().demoRun;
  if (!run || run.index >= run.count - 1) return;
  if (stepTimer) clearTimeout(stepTimer);
  showStep(run.index + 1);
}

export function restartDemoRun() {
  if (!script) {
    startDemoRun();
    return;
  }
  clearRunTimers();
  patchState({
    demoRun: { ...(getState().demoRun || {}), paused: false },
    deskScreens: {},
    previewDoc: null,
    carry: null,
  });
  showStep(0);
}

export function shouldStartDemo(agentId, text) {
  return wantsDemoRun(agentId, text);
}

/** User line is already on screen. CHIEF types, then the floor run starts. */
export function ackAndStartOrquesta() {
  chiefSays(CHIEF_ACK, () => {
    postOrquesta();
    startDemoRun();
  });
}

/** URL and the D key: the exchange is already written, then the floor runs. */
export function beginScriptedExchange() {
  cancelChiefTalk();
  patchState({ chat: [], chatOpen: true });
  pushUserLine(SCRIPTED_USER, SCRIPTED_FILE);
  ackAndStartOrquesta();
}
