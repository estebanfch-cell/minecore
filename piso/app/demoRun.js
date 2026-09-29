import { ZONE_BY_ID, wantsDemoRun } from "./constants.js";
import { CHIEF_ACK, SCRIPTED_FILE, SCRIPTED_USER, announceRunStep, cancelChiefTalk, chiefSays, pushUserLine } from "./chatLog.js";
import { postOrquesta } from "./instruct.js";
import {
  getState,
  patchState,
  setAgent,
  setHandoff,
  setTicker,
} from "./store.js";

const STEP_MS = 7500;

let script = null;
let stepTimer = null;
let frameTimer = null;
let interruptFloor = () => {};

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
}

export function stopDemoRun() {
  clearRunTimers();
  cancelChiefTalk();
  if (!getState().demoRun && !getState().carry) return;
  setHandoff(null, null);
  patchState({ demoRun: null, carry: null, deskScreens: {}, previewDoc: null });
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

function showStep(index) {
  const steps = script.steps;
  const step = steps[index];
  if (!step) return;
  const zone = ZONE_BY_ID[step.agent];
  const frames = step.frames?.length ? step.frames : [step.preview];
  let frame = 0;
  const applyFrame = () => {
    const view = screenFor(step, frames[frame] || step.preview);
    const prev = getState().deskScreens || {};
    patchState({
      deskScreens: { ...prev, [step.agent]: view },
    });
  };
  applyFrame();
  if (frameTimer) clearInterval(frameTimer);
  frameTimer = null;
  if (frames.length > 1) {
    const wait = step.stepMs || script.stepMs || STEP_MS;
    const slice = Math.max(1100, Math.floor(wait / frames.length));
    frameTimer = setInterval(() => {
      if (frame >= frames.length - 1) {
        clearInterval(frameTimer);
        frameTimer = null;
        return;
      }
      frame += 1;
      applyFrame();
    }, slice);
  }

  setAgent(step.agent, { activity: step.caption, status: "ok", typing: true });
  setTicker(step.banner || step.caption);
  const from = step.handoffFrom;
  if (from && from !== step.agent) {
    setHandoff(from, step.agent);
    const first = resolveFrame(step, frames[0]);
    patchState({
      carry: {
        from,
        to: step.agent,
        image: demoAsset("previews", first.preview),
        t0: performance.now(),
      },
    });
  } else {
    setHandoff(null, null);
    patchState({ carry: null });
  }

  const run = {
    id: script.id,
    title: script.title,
    index,
    count: steps.length,
    paused: !!getState().demoRun?.paused,
    caption: step.caption,
    banner: step.banner || "",
    agentId: step.agent,
    focus: zone
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
  patchState({
    demoRun: { paused: false, index: 0, count: script.steps.length },
    deskScreens: {},
    previewDoc: null,
    carry: null,
    chatOpen: true,
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
