import { getState, patchState } from "./store.js";
import { nextDemoStep, pauseDemoRun, restartDemoRun } from "./demoRun.js";

export function DemoBar({ run }) {
  if (!run?.caption) return null;
  return (
    <div className="demo-bar notranslate" translate="no" data-step={run.index + 1}>
      <div className="demo-bar-kicker">Orquesta OC · {run.index + 1}/{run.count}</div>
      <p>{run.banner || run.caption}</p>
      <div className="demo-bar-actions">
        <button type="button" onClick={pauseDemoRun}>
          {run.paused ? "Seguir" : "Pausa"}
        </button>
        <button type="button" onClick={nextDemoStep} disabled={run.index >= run.count - 1}>
          Siguiente
        </button>
        <button type="button" onClick={restartDemoRun}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}

export function PreviewPanel({ doc }) {
  if (!doc) return null;
  return (
    <aside className="preview-panel notranslate" role="dialog" aria-label="Vista del documento" translate="no">
      <header>
        <div>
          <span>Documento</span>
          <strong>{doc.caption}</strong>
        </div>
        <button type="button" onClick={() => patchState({ previewDoc: null })}>
          Cerrar
        </button>
      </header>
      <img src={doc.image} alt={doc.title || doc.caption} />
      <a href={doc.pdf} target="_blank" rel="noreferrer">
        Abrir PDF
      </a>
    </aside>
  );
}

export function openDeskPreview(agentId) {
  const screen = getState().deskScreens?.[agentId];
  if (!screen) return;
  patchState({ previewDoc: screen });
}
