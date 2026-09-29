import { useEffect, useRef, useState } from "react";
import { ErpStage } from "./ErpStage.jsx";
import { PART_B, PO_LINES, STOCK_ROWS } from "./erpData.js";
import { ENVIADO_FLIP_MS, demoAsset } from "./demoRun.js";
import { renderPdfPages } from "./pdfPages.js";

const RECOVERY_MONTHS = {
  MCOR000126: "8.4",
  MCOR000509: "7.5",
  MCOR000442: "5.0",
  MCOR000355: "4.6",
  MCOR000512: "3.8",
  MCOR000803: "2.4",
};

function money(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useReveal(lines, ms) {
  const [count, setCount] = useState(0);
  const key = (lines || []).join("\n");
  useEffect(() => {
    setCount(0);
    if (!lines?.length) return undefined;
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= lines.length) clearInterval(timer);
    }, ms || 800);
    return () => clearInterval(timer);
  }, [key, ms]);
  return count;
}

export function WorkWindow({ spec, sourcePdf }) {
  const log = spec?.log || [];
  const shown = useReveal(log, spec?.logMs || 800);
  const frames = spec?.frames || [];
  const frameIndex =
    frames.length === 0 ? 0 : Math.min(frames.length - 1, shown === 0 ? 0 : Math.floor(((shown - 1) * frames.length) / Math.max(log.length, 1)));
  const frame = frames[frameIndex];
  const scroller = useRef(null);
  const [pages, setPages] = useState([]);
  const [scanOn, setScanOn] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const pdfName = spec?.pdf || "";
  const bundled = pdfName ? demoAsset("pdf", pdfName) : "";
  const live = sourcePdf?.url && /oc|taluvira/i.test(sourcePdf.name || "") ? sourcePdf.url : "";
  const pdfUrl = live || bundled;

  useEffect(() => {
    let cancel = false;
    setPages([]);
    if (!spec?.pdf || !pdfUrl) return undefined;
    renderPdfPages(pdfUrl)
      .then((list) => {
        if (!cancel) setPages(list);
      })
      .catch((err) => {
        console.error("pdf-pages", err && (err.message || err));
        if (!cancel) setPages([]);
      });
    return () => {
      cancel = true;
    };
  }, [spec?.pdf, pdfUrl]);

  useEffect(() => {
    const node = scroller.current;
    if (!node || spec?.mode !== "scan") {
      setScanOn(false);
      return undefined;
    }
    let frameId = 0;
    let live = true;
    const start = performance.now();
    const duration = 14000;
    const settle = 900;
    node.scrollTop = 0;
    setScanOn(true);
    setScanKey((key) => key + 1);
    const tick = (now) => {
      if (!live) return;
      const max = Math.max(0, node.scrollHeight - node.clientHeight);
      const elapsed = now - start;
      if (elapsed <= duration) {
        node.scrollTop = max * (elapsed / duration);
        frameId = requestAnimationFrame(tick);
        return;
      }
      const u = Math.min(1, (elapsed - duration) / settle);
      const ease = u * u * (3 - 2 * u);
      node.scrollTop = max * (1 - ease);
      if (u < 1) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      node.scrollTop = 0;
      setScanOn(false);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      live = false;
      cancelAnimationFrame(frameId);
    };
  }, [pages.length, spec?.mode, spec?.title]);

  if (!spec) return null;
  const fallback = spec.fallback ? demoAsset("previews", spec.fallback) : "";
  const image = frame?.preview ? demoAsset("previews", frame.preview) : fallback;

  return (
    <section className={`work-window notranslate ${spec.minimizing ? "is-min" : ""} ${spec.erp ? "is-sistema" : ""}`} translate="no" aria-label={spec.erp ? "MINECORE · Sistema" : spec.title}>
      <header className="work-title">
        <span className="work-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{spec.erp ? "MINECORE · Sistema" : spec.title}</strong>
      </header>
      <div className={`work-body ${spec.erp ? "work-body-erp" : ""}`}>
        {spec.erp ? (
          <ErpStage phase={spec.erp} />
        ) : spec.mode === "finance" ? (
          <FinanceReport log={log} shown={shown} />
        ) : spec.mode === "settle" ? (
          <SettleScreen spec={spec} image={image} log={log} shown={shown} />
        ) : (
          <>
        <div className="work-stage">
          <div className="work-doc" ref={scroller}>
            {pages.length > 0 ? (
              pages.map((src, i) => <img key={`${spec.title}-${i}`} src={src} alt="" />)
            ) : (
              image && <img src={image} alt="" />
            )}
          </div>
          {spec.mode === "scan" && scanOn && <div key={scanKey} className="scan-line" />}
        </div>
        <ol className="work-log">
          {log.slice(0, shown).map((line) => (
            <li key={line}>{line}</li>
          ))}
          {shown < log.length && (
            <li className="caret" aria-hidden="true">
              ▍
            </li>
          )}
        </ol>
          </>
        )}
      </div>
    </section>
  );
}

/** Counter targets for Finance. Tune these without touching the sequence. */
const FINANCE_SKU_TARGET = 4280;
const FINANCE_CLIENT_PURCHASES = 2140;
const FINANCE_QUOTES = 980;
const FINANCE_SALES = 3560;
const FINANCE_SUPPLIER_ORDERS = 640;
const FINANCE_CROSSCHECK = 4280;
/** Each phase, in order. Six of these plus a short pause and the still report fit in the finance step. */
const FINANCE_PHASE_MS = 1500;
const FINANCE_CHECK_MS = 450;
const FINANCE_PHASES = [
  { id: "skus", label: "Analizando SKUs del inventario", target: FINANCE_SKU_TARGET },
  { id: "compras", label: "Analizando historial de compras de clientes", target: FINANCE_CLIENT_PURCHASES },
  { id: "cotizaciones", label: "Analizando historial de cotizaciones", target: FINANCE_QUOTES },
  { id: "ventas", label: "Analizando historial de ventas", target: FINANCE_SALES },
  { id: "pedidos", label: "Analizando historial de pedidos a proveedores", target: FINANCE_SUPPLIER_ORDERS },
  { id: "cruce", label: "Cruzando rotación y stock mínimo", target: FINANCE_CROSSCHECK },
];

function financeStream(seed, elapsed) {
  const tick = Math.floor(elapsed / 80);
  const parts = [];
  for (let i = 0; i < 6; i += 1) {
    const n = Math.abs(((seed * 97 + i * 131 + tick * 17) % 9000) + 120);
    parts.push(String(n).padStart(4, "0"));
  }
  return parts.join("   ");
}

function FinanceReport({ log, shown }) {
  const [elapsed, setElapsed] = useState(0);
  const hot = STOCK_ROWS.filter((row) => row.hot);
  useEffect(() => {
    const start = performance.now();
    const limit = FINANCE_PHASES.length * FINANCE_PHASE_MS + FINANCE_CHECK_MS;
    let frame = 0;
    const tick = (now) => {
      const next = now - start;
      setElapsed(next);
      if (next < limit) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const done = elapsed >= FINANCE_PHASES.length * FINANCE_PHASE_MS + FINANCE_CHECK_MS;
  const partB = PO_LINES.filter((line) => line.part === "B");
  return (
    <>
      {done ? (
      <div className="finance-report">
        <p className="finance-count">Análisis listo</p>
        <h3>Alta rotación · cobertura bajo 3 meses</h3>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Pieza</th>
              <th>Cobertura</th>
              <th>Recupera</th>
              <th>Reponer</th>
            </tr>
          </thead>
          <tbody>
            {hot.map((row) => {
              const po = partB.find((line) => line.sku === row.sku);
              return (
                <tr key={row.sku}>
                  <td>{row.sku}</td>
                  <td>{row.name}</td>
                  <td>{row.cobertura.toFixed(1)} m</td>
                  <td>{RECOVERY_MONTHS[row.sku]} m</td>
                  <td>{po ? `${po.qty} · ${money(po.ext)}` : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="finance-note">
          Reponer a 4 meses. Parte B FOB {money(PART_B)}. Puesto en bodega $9,994. Se recupera en 4.5 meses.
        </p>
        <p className="finance-note">Recomendación: aprovechar el pedido a Boyles para reponer alta rotación.</p>
      </div>
      ) : (
      <div className="finance-scan">
        <p className="finance-kicker">FINANCE · análisis</p>
        <ol>
          {FINANCE_PHASES.map((phase, index) => {
            const phaseStart = index * FINANCE_PHASE_MS;
            const state = elapsed >= phaseStart + FINANCE_PHASE_MS ? "done" : elapsed >= phaseStart ? "run" : "wait";
            const local = elapsed - phaseStart;
            const progress = state === "done" ? 1 : state === "run" ? Math.min(1, Math.max(0, local / FINANCE_PHASE_MS)) : 0;
            const value = Math.round(phase.target * progress);
            return (
              <li key={phase.id} className={state}>
                <div className="fin-row">
                  <span className="fin-mark" aria-hidden="true">{state === "done" ? "✓" : ""}</span>
                  <span className="fin-label">{phase.label}</span>
                  <strong>
                    {value.toLocaleString("en-US")}
                    <em> / {phase.target.toLocaleString("en-US")}</em>
                  </strong>
                </div>
                <div className="fin-bar" aria-hidden="true">
                  <i style={{ width: `${progress * 100}%` }} />
                </div>
                {state === "run" && <p className="fin-stream">{financeStream(index + 3, elapsed)}</p>}
              </li>
            );
          })}
        </ol>
      </div>
      )}
      <ol className="work-log">
        {log.slice(0, shown).map((line) => (
          <li key={line}>{line}</li>
        ))}
        {shown < log.length && (
          <li className="caret" aria-hidden="true">
            ▍
          </li>
        )}
      </ol>
    </>
  );
}

function SettleScreen({ spec, image, log, shown }) {
  const lines = spec.status || [];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    if (lines.length < 2) return undefined;
    const timer = setTimeout(() => setIndex(1), ENVIADO_FLIP_MS);
    return () => clearTimeout(timer);
  }, [spec.title, lines.length]);
  const still = spec.still ? demoAsset("previews", spec.still) : image;
  return (
    <>
      <div className="settle-stage">
        <strong>{lines[index] || lines[0]}</strong>
        {index > 0 && still && <img src={still} alt="" />}
      </div>
      <ol className="work-log">
        {log.slice(0, shown).map((line) => (
          <li key={line}>{line}</li>
        ))}
        {shown < log.length && (
          <li className="caret" aria-hidden="true">
            ▍
          </li>
        )}
      </ol>
    </>
  );
}

export function AssignmentFeed({ items }) {
  if (!items?.length) return null;
  return (
    <ol className="assign-feed notranslate" translate="no">
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ol>
  );
}
