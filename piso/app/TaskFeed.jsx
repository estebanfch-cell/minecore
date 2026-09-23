import { useSyncExternalStore } from "react";
import { STATUS_LABEL } from "./constants.js";
import { getState, subscribe } from "./store.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function when(at) {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
}

export function TaskFeed() {
  const state = useStore();
  const live = state.mode === "live";
  const waiting = live && !state.liveConnected;

  return (
    <aside className="task-panel notranslate" translate="no" aria-label="Estado de tareas">
      <header>
        <div>
          <p className="eyebrow">Piso Minecore</p>
          <h2>Estado de tareas</h2>
        </div>
        <span className={`live-pill ${waiting ? "wait" : live ? "live" : "demo"}`}>
          <i />
          {waiting ? "Esperando" : live ? "En vivo" : "Demo"}
        </span>
      </header>
      <p className="ticker">{state.ticker}</p>
      {waiting && (
        <p className="stub">
          Sin heartbeats todavía. El piso muestra el último estado conocido. Conecta{" "}
          <code>MinecoreFeed.setAgent</code> o define <code>MINECORE_FEED_URL</code>.
        </p>
      )}
      <ol>
        {state.feed.map((ev, i) => (
          <li key={`${ev.at}-${ev.agentId || "piso"}-${i}`}>
            <span className={`mark ${ev.status || "pending"}`} aria-hidden="true" />
            <div>
              <div className="row">
                <strong>{ev.name}</strong>
                <time>{when(ev.at)}</time>
              </div>
              <p>{ev.text}</p>
              <em>{STATUS_LABEL[ev.status] || ev.status}</em>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
