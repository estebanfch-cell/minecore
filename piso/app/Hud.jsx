import { useEffect, useState, useSyncExternalStore } from "react";
import { AGENTS, APPS, actionVerb } from "./constants.js";
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
        <div className="app-rail">
          {APPS.map((app) => (
            <span className="app-pill" key={app.id}>{app.label}</span>
          ))}
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

      <aside className="side-panel left-panel notranslate">
        <div className="panel-kicker">WORKFORCE</div>
        <div className="panel-title">{state.mode === "demo" ? "Demo" : "En vivo"}</div>
        {AGENTS.map((a) => {
          const s = state.agents[a.id];
          return (
            <div className="dot-row" key={a.id}>
              <span className={`led ${s.status}`} />
              <span>{a.name}</span>
              <em>{actionVerb(s)}</em>
            </div>
          );
        })}
      </aside>

      <aside className="side-panel roster notranslate">
        {AGENTS.map((a) => {
          const s = state.agents[a.id];
          return (
            <div className="roster-card" key={a.id}>
              <img src={`${import.meta.env.BASE_URL}avatars/${a.id}.jpg`} alt={a.name} />
              <div>
                <div className="name">{a.name}</div>
                <div className="verb">{actionVerb(s)}</div>
                <div className="activity">{s.activity}</div>
                <span className={`chip ${s.status}`}>{s.status}</span>
              </div>
            </div>
          );
        })}
      </aside>

      <div className="caption notranslate">
        {state.meeting ? "Stand-up · piso operativo" : state.ticker}
      </div>
    </>
  );
}
