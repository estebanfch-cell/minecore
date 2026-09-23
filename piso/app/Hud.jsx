import { useEffect, useState, useSyncExternalStore } from "react";
import { Dossier } from "./Dossier.jsx";
import { TaskFeed } from "./TaskFeed.jsx";
import { AGENTS } from "./constants.js";
import { getState, subscribe } from "./store.js";
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
        <div className="modes" role="group" aria-label="Modo del piso">
          <button
            className={`mode ${state.mode === "demo" ? "active" : ""}`}
            type="button"
            onClick={runDemo}
          >
            Demo
          </button>
          <button
            className={`mode ${state.mode === "live" ? "active" : ""}`}
            type="button"
            onClick={startLive}
          >
            En vivo
          </button>
        </div>
      </header>

      <TaskFeed />

      {!selected && (
        <div className="hint notranslate">Toca un agente para abrir su ficha</div>
      )}

      <Dossier agent={selected} />
    </>
  );
}
