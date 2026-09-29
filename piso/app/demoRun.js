import { ZONE_BY_ID, wantsDemoRun } from "./constants.js";
import {
  getState,
  patchState,
  selectAgent,
  setAgent,
  setHandoff,
  setTicker,
} from "./store.js";

const STEP_MS = 7000;
const FRAME_MS = 2200;

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
  return `${demoBase()}demo/${folder}/${encodeURIComponent(name)}`;
}

export async function loadDemoScript() {
  if (script) return script;
  const res = await fetch(`${demoBase()}demo/demo_steps.json`);
  if (!res.ok) throw new Error("demo script");
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
  if (!getState().demoRun && !getState().carry) return;
  setHandoff(null, null);
  patchState({ demoRun: null, carry: null, deskScreens: {}, previewDoc: null });
}

function screenFor(step, fileName) {
  return {
    agentId: step.agent,
    caption: step.caption,
    banner: step.banner || "",
    image: demoAsset("previews", fileName),
    pdf: demoAsset("pdf", step.file),
    title: fileName.replace(/\.png$/i, ""),
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
  if (frames.length > 1) {
    frameTimer = setInterval(() => {
      frame = (frame + 1) % frames.length;
      applyFrame();
    }, FRAME_MS);
  }

  setAgent(step.agent, { activity: step.caption, status: "ok", typing: true });
  setTicker(step.caption);
  if (step.handoffTo) {
    setHandoff(step.agent, step.handoffTo);
    patchState({
      carry: {
        from: step.agent,
        to: step.handoffTo,
        image: demoAsset("previews", step.preview),
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
  patchState({ demoRun: run });

  if (stepTimer) clearTimeout(stepTimer);
  const wait = script.stepMs || STEP_MS;
  if (!run.paused && index < steps.length - 1) {
    stepTimer = setTimeout(() => showStep(index + 1), wait);
  }
}

export async function startDemoRun() {
  interruptFloor();
  selectAgent(null);
  clearRunTimers();
  try {
    await loadDemoScript();
  } catch {
    setTicker("No se pudo cargar la demo");
    return;
  }
  patchState({ demoRun: { paused: false, index: 0, count: script.steps.length } });
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
  patchState({ demoRun: { ...(getState().demoRun || {}), paused: false } });
  showStep(0);
}

export function shouldStartDemo(agentId, text) {
  return wantsDemoRun(agentId, text);
}
