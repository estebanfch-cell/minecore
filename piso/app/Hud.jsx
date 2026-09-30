import { useEffect, useState, useSyncExternalStore } from "react";
import { Dossier } from "./Dossier.jsx";
import { TaskFeed } from "./TaskFeed.jsx";
import { AGENT_BY_ID, AGENTS, agentCallName } from "./constants.js";
import { ChiefChat } from "./ChiefChat.jsx";
import { SplitBrief, SplitPortrait } from "./SplitBrief.jsx";
import { WorkWindow } from "./WorkWindow.jsx";
import { PreviewPanel } from "./DemoChrome.jsx";
import { beginScriptedExchange, stopDemoRun } from "./demoRun.js";
import { getState, openChiefInstruction, subscribe } from "./store.js";
import { runDemo, startLive } from "./director.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function clockLabel() {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function Hud() {
  const state = useStore();
  const [clock, setClock] = useState(clockLabel);
  const selected = state.selectedId ? state.agents[state.selectedId] : null;

  useEffect(() => {
    const t = setInterval(() => setClock(clockLabel()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "d" && e.key !== "D") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      beginScriptedExchange();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="topbar notranslate" translate="no">
        <div className="brand">
          <span className="logo-mark">M</span>
          <div>
            <strong>MINECORE</strong>
            <span className="sub">Piso de agentes</span>
          </div>
        </div>
        <p className="census">{AGENTS.length} agentes en piso</p>
        <div className="clock">
          <span>{clock}</span>
          <em>Guayaquil</em>
        </div>
        <button className="instruct-launch" type="button" onClick={openChiefInstruction}>
          Dar instrucción
        </button>
        <div className="modes" role="group" aria-label="Modo del piso">
          <button
            className={`mode ${state.mode === "demo" ? "active" : ""}`}
            type="button"
            onClick={() => {
              stopDemoRun();
              runDemo();
            }}
          >
            Ejecutar
          </button>
          <button
            className={`mode ${state.mode === "live" ? "active" : ""}`}
            type="button"
            onClick={() => {
              stopDemoRun();
              startLive();
            }}
          >
            En vivo
          </button>
        </div>
      </header>

      <TaskFeed />
      <SplitPortrait run={state.demoRun} />
      <SplitBrief run={state.demoRun} />
      {state.demoRun?.handoffLine && (
        <div className="handoff-caption notranslate" translate="no" role="status">
          <strong>{agentCallName(AGENT_BY_ID[state.demoRun.agentId])}</strong>
          <p>{state.demoRun.handoffLine}</p>
        </div>
      )}

      {!selected && !state.announcement && !state.chatOpen && !state.demoRun && (
        <div className="hint notranslate">Toca CHIEF para anunciar a la sala</div>
      )}

      {state.announcement && (
        <div className="announce notranslate" role="status" translate="no">
          <span>CHIEF · anuncio</span>
          <p>{state.announcement}</p>
        </div>
      )}

      {state.chatOpen && !state.demoRun && state.selectedId !== "chief" && (
        <ChiefChat focus={!!state.focusInstruction} />
      )}

      <WorkWindow spec={state.workWindow} sourcePdf={state.sourcePdf} />

      <PreviewPanel doc={state.previewDoc} />

      {state.toast && (
        <div className={`floor-toast notranslate ${state.toast.tone || "ok"}`} role="status" translate="no">
          {state.toast.message}
        </div>
      )}

      <Dossier agent={selected} focusInstruction={!!state.focusInstruction} />
    </>
  );
}
