import { useEffect, useRef, useState } from "react";
import { ErpStage } from "./ErpStage.jsx";
import { demoAsset } from "./demoRun.js";
import { renderPdfPages } from "./pdfPages.js";

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
    if (!node) return undefined;
    let y = 0;
    const timer = setInterval(() => {
      const max = node.scrollHeight - node.clientHeight;
      if (max <= 0) return;
      y += 36;
      if (y > max + 40) y = 0;
      node.scrollTop = y;
    }, 60);
    return () => clearInterval(timer);
  }, [pages, frame?.preview, spec?.title]);

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
          <div className="scan-line" />
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
