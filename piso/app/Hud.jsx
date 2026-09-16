import { useEffect, useState, useSyncExternalStore } from "react";
import { Dossier } from "./Dossier.jsx";
import { getState, subscribe } from "./store.js";
import { runDemo, startLive } from "./director.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function clockLabel() {
  return (
    new Intl.DateTimeFormat("es-EC", {
      timeZone: "America/Guayaquil",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()) + " GT"
  );
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
      <div className="hud notranslate">
        <div className="brand">
          <span className="logo-mark">M</span>
          <div>
            <strong>MINECORE</strong>
            <span className="sub">Piso operativo</span>
          </div>
        </div>
        <div className="clock">{clock}</div>
        <div className="modes">
          <button
            className={`mode ${state.mode === "live" ? "active" : ""}`}
            type="button"
            onClick={startLive}
          >
            En vivo
          </button>
          <button
            className={`mode ${state.mode === "demo" ? "active" : ""}`}
            type="button"
            onClick={runDemo}
          >
            Demo
          </button>
        </div>
      </div>

      {!selected && (
        <div className="hint notranslate">Toca un agente para ver su ficha</div>
      )}

      <Dossier agent={selected} />
    </>
  );
}
