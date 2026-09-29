import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { wantsMeeting } from "./constants.js";
import { fileStartsOrquesta, pushUserLine, textStartsOrquesta } from "./chatLog.js";
import { ackAndStartOrquesta } from "./demoRun.js";
import { playAnnouncement } from "./director.js";
import { getState, patchState, subscribe } from "./store.js";

function PdfChip({ name }) {
  if (!name) return null;
  return <span className="pdf-chip">{name}</span>;
}

export function ChiefChat({ embedded = false, focus = false, runDock = false }) {
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState(null);
  const input = useRef(null);
  const fileBox = useRef(null);
  const list = useRef(null);
  const messages = useSyncExternalStore(subscribe, getState, getState).chat || [];

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => input.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [focus]);

  useEffect(() => {
    const node = list.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, messages[messages.length - 1]?.typing]);

  function onSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    const fileName = file?.name || "";
    if (!text && !fileName) return;
    pushUserLine(text, fileName);
    if (file) {
      const prev = getState().sourcePdf;
      if (prev?.url) URL.revokeObjectURL(prev.url);
      patchState({ sourcePdf: { url: URL.createObjectURL(file), name: file.name } });
    }
    setDraft("");
    setFile(null);
    if (fileBox.current) fileBox.current.value = "";
    if (fileStartsOrquesta(fileName) || textStartsOrquesta(text)) {
      ackAndStartOrquesta();
      return;
    }
    if (text && wantsMeeting("chief", text)) playAnnouncement(text);
  }

  return (
    <section className={`chief-chat notranslate ${embedded ? "is-embedded" : ""} ${runDock ? "is-run" : ""}`} translate="no" aria-label="Chat con CHIEF">
      <header>
        <strong>CHIEF</strong>
        {!embedded && (
          <button type="button" onClick={() => patchState({ chatOpen: false, focusInstruction: false })}>
            Cerrar
          </button>
        )}
      </header>
      <ol ref={list}>
        {messages.map((msg) => (
          <li key={msg.id} className={msg.role} data-typing={msg.typing ? "1" : undefined}>
            {msg.typing ? (
              <span className="dots" aria-label="CHIEF está escribiendo">
                <i />
                <i />
                <i />
              </span>
            ) : (
              <>
                {msg.text ? <p>{msg.text}</p> : null}
                <PdfChip name={msg.fileName} />
              </>
            )}
          </li>
        ))}
      </ol>
      <form onSubmit={onSubmit}>
        {file && (
          <div className="pending-file">
            <PdfChip name={file.name} />
            <button type="button" onClick={() => setFile(null)} aria-label="Quitar archivo">
              ×
            </button>
          </div>
        )}
        <div className="composer">
          <label className="clip">
            <input
              ref={fileBox}
              type="file"
              accept="application/pdf,.pdf"
              aria-label="Adjuntar PDF"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 7.5v8.2a4 4 0 0 0 8 0V6.8a2.6 2.6 0 0 0-5.2 0v8.1a1.2 1.2 0 0 0 2.4 0V8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </label>
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Te paso la OC de Taluvira"
            aria-label="Mensaje para CHIEF"
          />
          <button className="send" type="submit">
            Enviar
          </button>
        </div>
      </form>
    </section>
  );
}
