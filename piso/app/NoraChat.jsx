import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { onSecreOwnerMessage, SRI_REPLY_MS, SRI_TYPE_MS, sheetAttached, startSecreRun } from "./secreRun.js";
import { getState, patchState, subscribe } from "./store.js";

function FileChip({ name }) {
  if (!name) return null;
  return <span className="pdf-chip">{name}</span>;
}

export function NoraChat({ focus = false }) {
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState(null);
  const input = useRef(null);
  const fileBox = useRef(null);
  const list = useRef(null);
  const sending = useRef(false);
  const messages = useSyncExternalStore(subscribe, getState, getState).noraChat || [];

  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => input.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [focus]);

  useEffect(() => {
    const node = list.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, messages[messages.length - 1]?.typing]);

  function onSubmit(e) {
    e.preventDefault();
    if (sending.current) return;
    const text = draft.trim();
    const fileName = file?.name || "";
    if (!text && !sheetAttached(fileName)) return;
    const scene = sheetAttached(fileName) ? "banco" : "sri";
    sending.current = true;
    const base = (getState().noraChat || []).filter((msg) => !msg.typing);
    patchState({
      noraChat: [
        ...base,
        { id: `u-${Date.now()}`, role: "user", text, fileName, at: Date.now() },
        { id: "typing", role: "nora", typing: true, at: Date.now() },
      ],
    });
    setDraft("");
    setFile(null);
    if (fileBox.current) fileBox.current.value = "";
    onSecreOwnerMessage(scene);
    window.setTimeout(() => {
      const reply = scene === "banco" ? "Voy a cruzar el estado de cuenta..." : "Voy al SRI a revisar las retenciones recibidas.";
      const chat = (getState().noraChat || []).filter((msg) => !msg.typing);
      patchState({
        noraChat: [...chat, { id: `r-${Date.now()}`, role: "nora", text: reply, at: Date.now() }],
      });
      window.setTimeout(() => {
        sending.current = false;
        patchState({ noraOpen: false });
        startSecreRun(scene, fileName);
      }, SRI_REPLY_MS);
    }, SRI_TYPE_MS);
  }

  return (
    <section className="chief-chat notranslate" translate="no" aria-label="Chat con SECRE" data-nora="open">
      <header>
        <strong>SECRE</strong>
        <button type="button" onClick={() => patchState({ noraOpen: false })}>
          Cerrar
        </button>
      </header>
      <ol ref={list}>
        {messages.map((msg) => (
          <li key={msg.id} className={msg.role} data-typing={msg.typing ? "1" : undefined}>
            {msg.typing ? (
              <span className="dots" aria-label="SECRE está escribiendo">
                <i />
                <i />
                <i />
              </span>
            ) : (
              <>
                {msg.text ? <p>{msg.text}</p> : null}
                <FileChip name={msg.fileName} />
              </>
            )}
          </li>
        ))}
      </ol>
      <form onSubmit={onSubmit}>
        {file && (
          <div className="pending-file">
            <FileChip name={file.name} />
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
              accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              aria-label="Adjuntar archivo"
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
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe un mensaje"
            aria-label="Mensaje para SECRE"
          />
          <button className="send" type="submit">
            Enviar
          </button>
        </div>
      </form>
    </section>
  );
}
