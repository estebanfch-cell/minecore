import { AGENTS, CHIEF_PODIUM, DOOR_QUEUE, MEETING_SPOTS, ZONE_BY_ID, wantsDemoRun } from "./constants.js";
import { CHIEF_ACK, CHIEF_ACK_MS, SCRIPTED_FILE, SCRIPTED_USER, announceRunStep, cancelChiefTalk, chiefSays, pushUserLine } from "./chatLog.js";
import { postOrquesta } from "./instruct.js";
import {
  getState,
  goHome,
  patchState,
  selectAgent,
  setAgent,
  setHandoff,
  setTicker,
  settleFloor,
  walkTo,
} from "./store.js";

const STEP_MS = 7500;
/** Mail transit after the relay POST. The notice leaves this long before Manuelito says "Enviado". */
const EMAIL_LEAD_MS = 75000;
const DESK_OPEN_MS = 1100;
export const ENVIADO_FLIP_MS = 2400;
/** Settle line still appears at the same moment: window opens with the step, the flip waits the old open delay too. */
export const SETTLE_REVEAL_MS = DESK_OPEN_MS + ENVIADO_FLIP_MS;

let script = null;
let stepTimer = null;
let frameTimer = null;
let finishTimer = null;
let stepRemain = 0;
let stepDeadline = 0;
let runEpoch = 0;
const RESET_PAUSE_MS = 3500;
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
  if (finishTimer) clearTimeout(finishTimer);
  finishTimer = null;
  if (emailTimer) clearTimeout(emailTimer);
  emailTimer = null;
  stepRemain = 0;
  stepDeadline = 0;
  clearSubs();
}

function settleAndHome(epoch) {
  finishTimer = null;
  if (epoch !== runEpoch) return;
  cancelChiefTalk();
  setHandoff(null, null);
  settleFloor();
}

function scheduleAdvance(index, ms) {
  if (stepTimer) clearTimeout(stepTimer);
  stepTimer = null;
  stepRemain = ms;
  if (index >= (script?.steps.length || 1) - 1) return;
  if (getState().demoRun?.paused) return;
  stepDeadline = Date.now() + ms;
  stepTimer = setTimeout(() => showStep(index + 1), ms);
}

function standDown() {
  AGENTS.forEach((a) => {
    setAgent(a.id, { meeting: false, seated: false, cue: null }, { silent: true });
    goHome(a.id);
  });
  patchState({ meeting: false, assignments: [], brief: null });
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
  patchState({ meeting: false, assignments: [], brief: null });
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
  (step.assignments || []).forEach((item, index) => {
    const at = 7600 + index * 2000;
    later(() => {
      const spot = MEETING_SPOTS[item.agent];
      setAgent(
        "chief",
        {
          cue: "point",
          cueAt: Date.now(),
          cueX: spot?.x,
          cueZ: spot?.z,
          meeting: true,
          seated: false,
        },
        { silent: true }
      );
      setAgent(
        item.agent,
        { cue: "nod", cueAt: Date.now(), seated: false, meeting: true },
        { silent: true }
      );
      patchState({ brief: { id: item.agent, text: item.card, at: Date.now() } });
    }, at);
    later(() => {
      setAgent(item.agent, { seated: true, cue: "listen", meeting: true }, { silent: true });
    }, at + 1200);
    later(() => {
      if (getState().brief?.id === item.agent) patchState({ brief: null });
      setAgent("chief", { cue: null, meeting: true, seated: false }, { silent: true });
    }, at + 1900);
  });
}

function openDeskWindow(step) {
  const win = step.window;
  if (!win) return;
  patchState({
    workWindow: {
      title: win.title,
      pdf: null,
      erp: win.erp || null,
      mode: win.mode || null,
      status: win.status || null,
      still: win.still || null,
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
  const prev = index > 0 ? steps[index - 1] : null;
  if (prev?.agent === "finance" && step.agent === "stock-pilot") {
    setHandoff("finance", "stock-pilot");
    patchState({
      carry: {
        from: "finance",
        to: "stock-pilot",
        image: demoAsset("previews", "FINANZAS - MCOR-PO-000379.png"),
        t0: performance.now(),
      },
    });
    later(() => {
      setHandoff(null, null);
      patchState({ carry: null });
    }, 2900);
  }

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
        logMs: 1400,
        mode: "scan",
        minimizing: false,
      },
    });
  } else if (phase === "meeting") {
    minimizeWindow();
    seatMeeting(step);
  } else {
    const fromDesk = prev && (prev.phase || "desk") === "desk";
    if (!fromDesk) minimizeWindow();
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
    openDeskWindow(step);
  }

  setAgent(step.agent, { activity: step.caption, status: "ok", typing: phase === "desk" });
  setTicker(step.banner || step.caption);

  const split = phase === "desk";
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
    split,
    briefing: step.brief || null,
    briefAt: Date.now(),
    focus: split
      ? null
      : wide
        ? { x: 0.1, y: 1.15, z: 0.15 }
        : zone
          ? { x: zone.position.x - 0.22, y: 1.35, z: zone.position.z + 0.24 }
          : { x: 0, y: 0.45, z: 0 },
  };
  patchState({ demoRun: run, chatOpen: true });
  const last = index === steps.length - 1;
  announceRunStep(step, { last, closing: script.closing || "" });

  if (last) {
    const epoch = runEpoch;
    const worked = step.stepMs || script.stepMs || STEP_MS;
    finishTimer = setTimeout(() => settleAndHome(epoch), worked + RESET_PAUSE_MS);
    return;
  }
  scheduleAdvance(index, step.stepMs || script.stepMs || STEP_MS);
}

export async function startDemoRun() {
  runEpoch += 1;
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
  armOrquesta(runSerial);
  showStep(0);
}

export function pauseDemoRun() {
  const run = getState().demoRun;
  if (!run) return;
  if (run.paused) {
    patchState({ demoRun: { ...run, paused: false } });
    if (run.index < run.count - 1) scheduleAdvance(run.index, stepRemain || script?.steps?.[run.index]?.stepMs || script?.stepMs || STEP_MS);
    return;
  }
  if (stepTimer) {
    clearTimeout(stepTimer);
    stepTimer = null;
    stepRemain = Math.max(400, stepDeadline - Date.now());
  }
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
  armOrquesta(runSerial);
  showStep(0);
}

export function shouldStartDemo(agentId, text) {
  return wantsDemoRun(agentId, text);
}

let runSerial = 0;
let orquestaText = "";
let orquestaSentSerial = -1;
let emailTimer = null;

function stepDur(loaded, step) {
  return step.stepMs || loaded.stepMs || STEP_MS;
}

/** Designed clock from Enviar. "Enviado" is the settle line; done is the end of that step. */
export function orquestaSchedule(loaded) {
  const steps = loaded?.steps || [];
  let cursor = 0;
  let enviadoFromShow = null;
  let doneFromShow = null;
  for (const step of steps) {
    const dur = stepDur(loaded, step);
    const saysEnviado = (step.window?.status || []).some((line) => String(line).trim().toLowerCase() === "enviado");
    if (saysEnviado && enviadoFromShow == null) {
      const phase = step.phase || "desk";
      const revealAt = phase === "analysis" || phase === "meeting" ? ENVIADO_FLIP_MS : SETTLE_REVEAL_MS;
      enviadoFromShow = cursor + revealAt;
    }
    cursor += dur;
    if (saysEnviado && doneFromShow == null) doneFromShow = cursor;
  }
  if (doneFromShow == null) doneFromShow = cursor;
  if (enviadoFromShow == null) enviadoFromShow = doneFromShow;
  const fromAttachToEnviado = CHIEF_ACK_MS + enviadoFromShow;
  const fromAttachToDone = CHIEF_ACK_MS + doneFromShow;
  const postDelayFromShow = enviadoFromShow - EMAIL_LEAD_MS;
  return {
    enviadoFromShow,
    doneFromShow,
    fromAttachToEnviado,
    fromAttachToDone,
    postDelayFromShow,
    fireOnEnviar: fromAttachToDone < EMAIL_LEAD_MS || postDelayFromShow <= 0,
  };
}

function fireOrquesta(serial) {
  if (orquestaSentSerial === serial) return;
  orquestaSentSerial = serial;
  if (emailTimer) clearTimeout(emailTimer);
  emailTimer = null;
  postOrquesta({ text: orquestaText, phase: "pre_send" });
}

function armOrquesta(serial) {
  if (orquestaSentSerial === serial || !script) return;
  if (emailTimer) clearTimeout(emailTimer);
  emailTimer = null;
  const plan = orquestaSchedule(script);
  if (plan.fireOnEnviar || plan.postDelayFromShow <= 0) {
    fireOrquesta(serial);
    return;
  }
  emailTimer = setTimeout(() => {
    emailTimer = null;
    if (serial !== runSerial) return;
    fireOrquesta(serial);
  }, plan.postDelayFromShow);
}

/** User line is already on screen. CHIEF types, then the floor run starts. The notice leads "Enviado" by EMAIL_LEAD_MS. */
export function ackAndStartOrquesta(entry) {
  const serial = ++runSerial;
  orquestaText = entry?.text || "";
  const considerEarly = (loaded) => {
    if (serial !== runSerial || !loaded) return;
    if (orquestaSchedule(loaded).fireOnEnviar) fireOrquesta(serial);
  };
  if (script) considerEarly(script);
  else loadDemoScript().then(considerEarly);
  chiefSays(CHIEF_ACK, () => {
    if (serial !== runSerial) return;
    startDemoRun();
  });
}

loadDemoScript().catch(() => {});

/** Hidden URL and the D key. The greeting stays, then the floor runs. */
export function beginScriptedExchange() {
  cancelChiefTalk();
  const hello = (getState().chat || []).find((msg) => msg.id === "hello");
  patchState({ chat: hello ? [hello] : [], chatOpen: true });
  pushUserLine(SCRIPTED_USER, SCRIPTED_FILE);
  ackAndStartOrquesta({ text: `${SCRIPTED_USER} · ${SCRIPTED_FILE}` });
}
