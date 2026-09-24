import { useEffect, useRef, useState } from "react";
import { DOSSIERS, POPUPS, STATUS_LABEL, actionVerb, wantsMeeting } from "./constants.js";
import { playAnnouncement } from "./director.js";
import { grokLink, instructSettings, postInstruction } from "./instruct.js";
import { recordInstruction, selectAgent, setToast } from "./store.js";

function planned(agent) {
  if (agent.order) return agent.order;
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

export function Dossier({ agent, focusInstruction }) {
  const [draft, setDraft] = useState("");
  const [imgOk, setImgOk] = useState(true);
  const [copied, setCopied] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!agent) return;
    const onKey = (e) => {
      if (e.key === "Escape") selectAgent(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agent]);

  useEffect(() => {
    setDraft("");
    setImgOk(true);
    setCopied(false);
  }, [agent?.id]);

  useEffect(() => {
    if (!agent || !focusInstruction) return;
    const t = setTimeout(() => {
      box.current?.focus();
      box.current?.scrollIntoView({ block: "center" });
    }, 40);
    return () => clearTimeout(t);
  }, [agent, focusInstruction]);

  if (!agent) return null;
  const bio = DOSSIERS[agent.id] || { title: agent.role, mission: agent.activity };
  const history = agent.history?.length ? agent.history : [{ text: agent.activity, at: Date.now() }];
  const { url } = instructSettings();
  const link = agent.grokId ? grokLink(agent.grokId) : "";

  async function onSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const entry = recordInstruction(agent.id, text);
    const scene = wantsMeeting(agent.id, text);
    if (scene) playAnnouncement(text);
    const result = entry ? await postInstruction(entry) : { ok: false, reason: "missing" };
    if (scene && result.ok) setToast("Escena + enviado", "ok");
    else if (scene && result.reason === "missing") setToast("Escena ok · webhook pendiente", "wait");
    else if (scene) setToast("Escena ok · no se pudo enviar", "wait");
    else if (result.ok) setToast("Enviado a CHIEF", "ok");
    else setToast("Falta configurar webhook del demo", "wait");
    setDraft("");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        className="dossier-scrim notranslate"
        type="button"
        aria-label="Cerrar ficha"
        onClick={() => selectAgent(null)}
      />
      <aside
        className="dossier notranslate"
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha ${agent.name}`}
        translate="no"
        data-agent-id={agent.grokId || ""}
      >
        <button className="dossier-close" type="button" onClick={() => selectAgent(null)}>
          Cerrar
        </button>
        <div className="dossier-head">
          {imgOk ? (
            <img
              src={`${import.meta.env.BASE_URL}avatars/${agent.id}.jpg`}
              alt={agent.name}
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="portrait-fallback" aria-hidden="true">
              M
            </span>
          )}
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
            <strong>{agent.name}</strong> es el agente de {agent.role} en el piso Minecore ({bio.title}).
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

        <section className="instruct">
          <h3>Instrucción</h3>
          <form onSubmit={onSubmit}>
            <textarea
              ref={box}
              value={draft}
              rows={5}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                agent.id === "chief"
                  ? "Ej. por favor haz una reunión con todos para anunciarles que vamos a hacer un cambio de 8%"
                  : "Escribe la instrucción para este agente"
              }
              aria-label="Instrucción"
            />
            {!url && (
              <p className="instruct-hint">
                Pega la URL y la clave en window.MINECORE_INSTRUCT_URL y window.MINECORE_INSTRUCT_KEY. La escena se ve igual.
              </p>
            )}
            <div className="instruct-row">
              <button className="send" type="submit">
                Enviar
              </button>
            </div>
          </form>
          {link && (
            <p className="grok-link">
              <button type="button" onClick={copyLink}>
                {copied ? "Copiado" : "Copiar enlace del agente"}
              </button>
              <code>{link}</code>
            </p>
          )}
        </section>
      </aside>
    </>
  );
}
