import { useEffect } from "react";
import { DOSSIERS, POPUPS, STATUS_LABEL, actionVerb } from "./constants.js";
import { selectAgent } from "./store.js";

function planned(agent) {
  const dossier = DOSSIERS[agent.id];
  const list = POPUPS[agent.popupKind] || [];
  const i = Math.max(0, list.indexOf(agent.popup));
  const nxt = list[(i + 1) % Math.max(list.length, 1)];
  return dossier?.next || nxt || "Sin plan cargado.";
}

function when(at) {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
}

export function Dossier({ agent }) {
  useEffect(() => {
    if (!agent) return;
    const onKey = (e) => {
      if (e.key === "Escape") selectAgent(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agent]);

  if (!agent) return null;
  const bio = DOSSIERS[agent.id] || { title: agent.role, mission: agent.activity };
  const history = agent.history?.length
    ? agent.history
    : [{ text: agent.activity, at: Date.now() }];

  return (
    <>
      <button
        className="dossier-scrim notranslate"
        type="button"
        aria-label="Cerrar ficha"
        onClick={() => selectAgent(null)}
      />
      <aside className="dossier notranslate" role="dialog" aria-modal="true" aria-label={`Ficha ${agent.name}`}>
        <button className="dossier-close" type="button" onClick={() => selectAgent(null)}>
          Cerrar
        </button>
        <div className="dossier-head">
          <img src={`${import.meta.env.BASE_URL}avatars/${agent.id}.jpg`} alt={agent.name} />
          <div>
            <div className="kicker">{bio.title}</div>
            <h2>{agent.name}</h2>
            <p className="who">{agent.role}</p>
            <span className={`chip ${agent.status}`}>{STATUS_LABEL[agent.status] || agent.status}</span>
          </div>
        </div>

        <section>
          <h3>Quién es</h3>
          <p>
            <strong>{agent.name}</strong> · {bio.title}. Canal: {agent.role}.
          </p>
        </section>

        <section>
          <h3>Entrenado para</h3>
          <p>{bio.mission}</p>
        </section>

        <section>
          <h3>Ahora</h3>
          <p>
            <strong>{actionVerb(agent)}</strong>
            {agent.activity ? ` · ${agent.activity}` : ""}
          </p>
        </section>

        <section>
          <h3>Historial reciente</h3>
          <ol>
            {history.slice(0, 6).map((ev, i) => (
              <li key={`${ev.at}-${i}`}>
                <time>{when(ev.at)}</time>
                {ev.text}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3>Siguiente</h3>
          <p>{planned(agent)}</p>
        </section>
      </aside>
    </>
  );
}
