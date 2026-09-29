import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pushChief } from "./chatLog.js";
import { demoAsset } from "./demoRun.js";
import { PART_A, PART_B, PO_LINES, PO_TOTAL, QUOTE_LINES, QUOTES, STOCK_ROWS, money } from "./erpData.js";
import { getState } from "./store.js";

const SO1 = QUOTE_LINES.filter((line) => !line.missing);
const SO2 = QUOTE_LINES.filter((line) => line.missing);
const SALE_SUB = 2083077;
const SALE_IVA = 312462;
const SALE_TOTAL = 2395539;

const PREVIEWS = {
  pick: { file: "PICK LIST - MCOR-SO-001209-1.pdf", image: "PICK LIST - MCOR-SO-001209-1.png" },
  so1: { file: "ORDEN DE VENTA - MCOR-SO-001209-1.pdf", image: "ORDEN DE VENTA - MCOR-SO-001209-1.png" },
  so2: { file: "ORDEN DE VENTA - MCOR-SO-001209-2.pdf", image: "ORDEN DE VENTA - MCOR-SO-001209-2.png" },
  po: { file: "ORDEN DE COMPRA - MCOR-PO-000379.pdf", image: "ORDEN DE COMPRA - MCOR-PO-000379.png" },
};

const DEVOPS_BEATS = [
  { t: 0, screen: "quotes", aim: "nav-cot", search: "" },
  { t: 450, screen: "quotes", aim: "search", search: "" },
  { t: 750, screen: "quotes", aim: "search", search: "SQ-001011", type: true, typeEnd: 1900 },
  { t: 2100, screen: "quotes", aim: "row-sq", search: "SQ-001011" },
  { t: 2750, screen: "quotes", aim: "row-sq", search: "SQ-001011", click: true },
  { t: 3150, screen: "doc", doc: "sq", aim: "lines", scroll: 0 },
  { t: 4300, screen: "doc", doc: "sq", aim: "lines", scroll: 0.42 },
  { t: 5600, screen: "doc", doc: "sq", aim: "total", scroll: 1 },
  { t: 6900, screen: "doc", doc: "sq", aim: "convert", scroll: 1 },
  { t: 7700, screen: "doc", doc: "sq", aim: "convert", scroll: 1, click: true },
  { t: 8100, screen: "modal", modal: "convert", aim: "confirm" },
  { t: 9100, screen: "modal", modal: "convert", aim: "confirm", click: true },
  { t: 9500, screen: "spinner", spinner: "Creando orden de venta…" },
  { t: 11100, screen: "doc", doc: "so", aim: "oc", chips: false, scroll: 0 },
  { t: 12400, screen: "doc", doc: "so", aim: "red", chips: true, scroll: 0 },
  { t: 13800, screen: "doc", doc: "so", aim: "red2", chips: true, scroll: 0.4 },
  { t: 15200, screen: "doc", doc: "so", aim: "split", chips: true, scroll: 0.4 },
  { t: 16000, screen: "doc", doc: "so", aim: "split", chips: true, click: true },
  { t: 16400, screen: "modal", modal: "split", aim: "confirm" },
  { t: 17400, screen: "modal", modal: "split", aim: "confirm", click: true },
  { t: 17800, screen: "spinner", spinner: "Dividiendo la orden…" },
  { t: 19200, screen: "split", tab: "1", aim: "tab-1" },
  { t: 20600, screen: "split", tab: "2", aim: "tab-2" },
  { t: 22400, screen: "split", tab: "1", aim: "print" },
  { t: 23200, screen: "split", tab: "1", aim: "menu-pick", menu: true },
  { t: 24000, screen: "split", tab: "1", aim: "menu-pick", menu: true, click: true },
  { t: 24400, screen: "preview", preview: "pick", toast: "PICK LIST - MCOR-SO-001209-1.pdf descargado", tab: "1" },
  { t: 26200, screen: "split", tab: "1", aim: "menu-so", menu: true },
  { t: 27000, screen: "preview", preview: "so1", toast: "ORDEN DE VENTA - MCOR-SO-001209-1.pdf descargado", tab: "1" },
  { t: 28800, screen: "preview", preview: "so2", toast: "ORDEN DE VENTA - MCOR-SO-001209-2.pdf descargado", tab: "2" },
];

const DEVOPS_NOTES = [
  { at: 750, text: "DEVOPS busca SQ-001011 en Cotizaciones." },
  { at: 3150, text: "MCOR-SQ-001011 · TALUVIRA PERFORACIONES S.A. · 59 líneas · total $23,955.39." },
  { at: 11100, text: "Convertida a MCOR-SO-001209. OC cliente OC-2026-0417." },
  { at: 13800, text: "Sin stock: MCOR000520, 000519, 000506, 000504 y 000510." },
  { at: 19200, text: "SO-001209-1 · 54 líneas · $23,338.59. SO-001209-2 · 5 líneas · $616.79." },
  { at: 24400, text: "Pick list y las dos órdenes de venta descargados." },
];

function buildStockBeats() {
  const beats = [
    { t: 0, screen: "stock", aim: "nav-inv", search: "" },
    { t: 400, screen: "stock", aim: "search", search: "" },
    { t: 750, screen: "stock", aim: "search", search: "BOYLES", type: true, typeEnd: 1600 },
    { t: 1800, screen: "stock", aim: "row-126", search: "BOYLES" },
    { t: 3100, screen: "stock", aim: "row-442", search: "BOYLES" },
    { t: 4400, screen: "stock", aim: "row-803", search: "BOYLES" },
    { t: 5500, screen: "stock", aim: "nav-new", search: "BOYLES" },
    { t: 6100, screen: "stock", aim: "nav-new", search: "BOYLES", click: true },
    { t: 6500, screen: "po", aim: "supplier", lines: 0 },
    { t: 7200, screen: "po", aim: "supplier", supplierOpen: true, lines: 0 },
    { t: 8000, screen: "po", aim: "supplier-boyles", supplierOpen: true, lines: 0 },
    { t: 8700, screen: "po", aim: "supplier-boyles", supplierOpen: true, lines: 0, click: true },
    { t: 9100, screen: "po", aim: "sku", supplier: true, lines: 0, sku: "" },
  ];
  let t = 9500;
  PO_LINES.forEach((line, i) => {
    beats.push({
      t,
      screen: "po",
      aim: "sku",
      supplier: true,
      lines: i,
      sku: line.sku,
      type: true,
      typeEnd: t + 520,
    });
    t += 560;
    beats.push({ t, screen: "po", aim: "sku", supplier: true, lines: i + 1, sku: "", click: true });
    t += 250;
  });
  beats.push(
    { t: t + 250, screen: "po", aim: "save", supplier: true, lines: PO_LINES.length },
    { t: t + 1000, screen: "po", aim: "save", supplier: true, lines: PO_LINES.length, click: true },
    { t: t + 1350, screen: "spinner", spinner: "Guardando orden de compra…", supplier: true, lines: PO_LINES.length },
    { t: t + 2400, screen: "po", aim: "po-no", supplier: true, lines: PO_LINES.length, saved: true },
    { t: t + 3200, screen: "po", aim: "print", supplier: true, lines: PO_LINES.length, saved: true },
    { t: t + 3900, screen: "po", aim: "print", supplier: true, lines: PO_LINES.length, saved: true, menu: true, click: true },
    {
      t: t + 4400,
      screen: "preview",
      preview: "po",
      toast: "ORDEN DE COMPRA - MCOR-PO-000379.pdf descargado",
      supplier: true,
      lines: PO_LINES.length,
      saved: true,
    },
  );
  return beats;
}

const STOCK_BEATS = buildStockBeats();
const STOCK_SAVED_AT = STOCK_BEATS.find((beat) => beat.saved)?.t || 20000;
const STOCK_NOTES = [
  { at: 1800, text: "Inventario Boyles: 6 SKUs con cobertura bajo 3 meses." },
  { at: 9100, text: "Compra a BOYLES BROS DIAMANTINA S.A. Parte A urgente y parte B de reposición." },
  { at: STOCK_SAVED_AT, text: "MCOR-PO-000379 guardada · FOB $8,790.74." },
];

function beatAt(beats, elapsed) {
  let current = beats[0];
  for (const beat of beats) {
    if (elapsed >= beat.t) current = beat;
    else break;
  }
  return current;
}

function pageBeat(beats, elapsed) {
  let current = beats[0];
  for (const beat of beats) {
    if (elapsed < beat.t) break;
    if (beat.screen !== "modal" && beat.screen !== "spinner" && beat.screen !== "preview") current = beat;
  }
  return current;
}

function reveal(beat, elapsed, key) {
  const full = beat[key] || "";
  if (!beat.type || !full) return full;
  const end = beat.typeEnd || beat.t + 700;
  if (elapsed >= end) return full;
  const p = Math.max(0, elapsed - beat.t) / Math.max(1, end - beat.t);
  return full.slice(0, Math.ceil(p * full.length));
}

function useElapsed() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let acc = 0;
    let shown = -1;
    let last = performance.now();
    let frame = 0;
    const loop = (now) => {
      if (!getState().demoRun?.paused) acc += now - last;
      last = now;
      if (acc - shown > 40) {
        shown = acc;
        setElapsed(acc);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return elapsed;
}

function pressed(beat, elapsed, id) {
  return beat.aim === id && beat.click && elapsed - beat.t < 260;
}

function shortName(name) {
  return name.replace(/ - BOYLES BROS$/i, "").replace(/ - FORDIA$/i, "");
}

function navKey(screen, doc) {
  if (screen === "stock") return "nav-inv";
  if (screen === "po" || screen === "preview") return "nav-new";
  if (screen === "split" || doc === "so") return "nav-orders";
  if (screen === "quotes" || doc === "sq") return "nav-cot";
  return "nav-cot";
}

export function ErpStage({ phase }) {
  const elapsed = useElapsed();
  const beats = phase === "stock" ? STOCK_BEATS : DEVOPS_BEATS;
  const notes = phase === "stock" ? STOCK_NOTES : DEVOPS_NOTES;
  const beat = beatAt(beats, elapsed);
  const search = reveal(beat, elapsed, "search");
  const skuTyped = reveal(beat, elapsed, "sku");
  const clicking = !!(beat.click && elapsed - beat.t < 260);
  const rootRef = useRef(null);
  const linesRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 48, y: 64 });
  const sent = useRef(new Set());

  useEffect(() => {
    notes.forEach((note) => {
      if (elapsed < note.at || sent.current.has(note.text)) return;
      sent.current.add(note.text);
      pushChief(note.text);
    });
  }, [elapsed, notes]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const node = root?.querySelector(`[data-aim="${beat.aim}"]`);
    if (!root || !node) return;
    const host = root.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    setCursor({
      x: box.left - host.left + Math.min(box.width * 0.55, 36),
      y: box.top - host.top + Math.min(box.height * 0.55, 22),
    });
  }, [beat.aim, beat.screen, beat.tab, beat.lines, beat.menu, beat.scroll, beat.supplierOpen, search, skuTyped]);

  useEffect(() => {
    const node = linesRef.current;
    if (!node || beat.scroll == null) return;
    const max = node.scrollHeight - node.clientHeight;
    node.scrollTop = Math.max(0, max * beat.scroll);
  }, [beat.scroll, beat.screen, beat.chips, beat.doc]);

  const page = pageBeat(beats, elapsed);
  const active = navKey(page.screen === "preview" ? beat.screen : page.screen, page.doc);

  return (
    <div
      className="erp notranslate"
      translate="no"
      ref={rootRef}
      data-screen={beat.screen}
      data-phase={phase}
      data-lines={beat.lines || 0}
      data-saved={beat.saved ? "1" : "0"}
    >
      <aside className="erp-side">
        <div className="erp-brand">
          <span>M</span>
          <strong>MINECORE</strong>
        </div>
        <p>Ventas</p>
        <button type="button" data-aim="nav-cot" className={active === "nav-cot" ? "is-on" : ""}>
          Cotizaciones
        </button>
        <button type="button" data-aim="nav-orders" className={active === "nav-orders" ? "is-on" : ""}>
          Órdenes de venta
        </button>
        <p>Compras</p>
        <button type="button" data-aim="nav-po">
          Órdenes de compra
        </button>
        <button type="button" data-aim="nav-new" className={`${active === "nav-new" ? "is-on" : ""} ${pressed(beat, elapsed, "nav-new") ? "is-pressed" : ""}`}>
          Nueva orden
        </button>
        <p>Inventario</p>
        <button type="button" data-aim="nav-inv" className={active === "nav-inv" ? "is-on" : ""}>
          Existencias
        </button>
        <p>Reportes</p>
        <button type="button" data-aim="nav-rep">
          Rotación
        </button>
      </aside>
      <div className="erp-main">
        <header className="erp-top">
          <label className={`erp-search ${beat.aim === "search" ? "is-focus" : ""}`}>
            <input data-aim="search" readOnly value={search} placeholder="Buscar cotización, SKU o cliente" aria-label="Buscar" />
          </label>
          <em>Guayaquil</em>
        </header>
        {page.screen === "quotes" && <QuoteList search={search} pressed={pressed(beat, elapsed, "row-sq")} />}
        {page.screen === "doc" && <SaleDoc beat={page.chips != null || page.doc ? page : beat} elapsed={elapsed} linesRef={linesRef} />}
        {page.screen === "split" && <SplitView beat={page} elapsed={elapsed} menu={beat.menu} />}
        {page.screen === "stock" && <StockTable search={search} />}
        {page.screen === "po" && <Purchase beat={page.saved || page.lines != null ? { ...page, saved: beat.saved || page.saved, menu: beat.menu } : beat} elapsed={elapsed} skuTyped={skuTyped} />}
        {beat.screen === "modal" && <Confirm modal={beat.modal} pressed={pressed(beat, elapsed, "confirm")} />}
        {beat.screen === "spinner" && (
          <div className="erp-spin">
            <i />
            <strong>{beat.spinner}</strong>
          </div>
        )}
        {beat.screen === "preview" && beat.preview && <PdfSheet kind={beat.preview} />}
        {beat.toast && beat.screen === "preview" && <div className="erp-toast">{beat.toast}</div>}
      </div>
      <i className={`erp-cursor ${clicking ? "is-click" : ""}`} style={{ left: cursor.x, top: cursor.y }} />
    </div>
  );
}

function QuoteList({ search, pressed }) {
  const q = search.trim().toUpperCase();
  const rows = QUOTES.filter((row) => !q || row.id.includes(q) || row.customer.toUpperCase().includes(q));
  return (
    <section className="erp-page">
      <div className="erp-head">
        <h2>Ventas · Cotizaciones</h2>
        <span>{rows.length} resultado{rows.length === 1 ? "" : "s"}</span>
      </div>
      <table className="erp-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Líneas</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-aim={row.id === "MCOR-SQ-001011" ? "row-sq" : undefined} className={row.id === "MCOR-SQ-001011" && pressed ? "is-pressed" : ""}>
              <td>{row.id}</td>
              <td>{row.customer}</td>
              <td>{row.date}</td>
              <td>{row.lines}</td>
              <td className="num">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SaleDoc({ beat, elapsed, linesRef }) {
  const isSo = beat.doc === "so";
  return (
    <section className="erp-page">
      <div className="erp-head">
        <h2>{isSo ? "Orden de venta MCOR-SO-001209" : "Cotización MCOR-SQ-001011"}</h2>
        <div className="erp-actions">
          {!isSo && (
            <button type="button" className={`erp-primary ${pressed(beat, elapsed, "convert") ? "is-pressed" : ""}`} data-aim="convert">
              Convertir a orden de venta
            </button>
          )}
          {isSo && beat.chips && (
            <button type="button" className={`erp-primary ${pressed(beat, elapsed, "split") ? "is-pressed" : ""}`} data-aim="split">
              Dividir orden
            </button>
          )}
        </div>
      </div>
      <div className="erp-meta">
        <div>
          <span>Cliente</span>
          <strong>TALUVIRA PERFORACIONES S.A.</strong>
        </div>
        <div>
          <span>Contacto</span>
          <strong>Daniela Maldonado Ríos</strong>
        </div>
        <div>
          <span>Pago</span>
          <strong>CONTADO</strong>
        </div>
        <div>
          <span>Entrega</span>
          <strong>Campamento Bella Rica · 09-oct</strong>
        </div>
        <div data-aim="oc" className={isSo ? "is-fill" : ""}>
          <span>OC cliente</span>
          <strong>{isSo ? "OC-2026-0417" : "—"}</strong>
        </div>
      </div>
      {beat.chips && (
          <p className="erp-banner erp-banner-bad">
            Falta · MCOR000520 · MCOR000519 · MCOR000506 · MCOR000504 · MCOR000510
          </p>
        )}
      <div className="erp-scroll" ref={linesRef} data-aim="lines">
        <table className="erp-table erp-lines">
          <thead>
            <tr>
              <th>#</th>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. unit.</th>
              <th>Total</th>
              {beat.chips && <th>Stock</th>}
            </tr>
          </thead>
          <tbody>
            {QUOTE_LINES.map((line, index) => (
              <tr
                key={line.sku}
                className={beat.chips && line.missing ? "is-falt" : ""}
                data-aim={line.sku === "MCOR000520" ? "red" : line.sku === "MCOR000506" ? "red2" : undefined}
              >
                <td>{index + 1}</td>
                <td>{line.sku}</td>
                <td title={line.name}>{shortName(line.name)}</td>
                <td>{line.qty}</td>
                <td className="num">{money(line.price)}</td>
                <td className="num">{money(line.ext)}</td>
                {beat.chips && (
                  <td>{line.missing ? <b className="chip no">Falta</b> : <b className="chip ok">Disponible</b>}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="erp-totals" data-aim="total">
        <span>59 líneas</span>
        <span>Subtotal {money(SALE_SUB)}</span>
        <span>IVA 15% {money(SALE_IVA)}</span>
        <strong>Total {money(SALE_TOTAL)}</strong>
      </footer>
    </section>
  );
}

function SplitView({ beat, elapsed, menu }) {
  const tab = beat.tab || "1";
  const lines = tab === "2" ? SO2 : SO1;
  const headline = tab === "2" ? "MCOR-SO-001209-2" : "MCOR-SO-001209-1";
  const count = tab === "2" ? "5 líneas" : "54 líneas";
  const total = tab === "2" ? "$616.79" : "$23,338.59";
  const sub = tab === "2" ? "$536.34" : "$20,294.43";
  const iva = tab === "2" ? "$80.45" : "$3,044.16";
  return (
    <section className="erp-page">
      <div className="erp-tabs">
        <button type="button" data-aim="tab-1" className={tab === "1" ? "is-on" : ""}>
          SO-001209-1 · 54 · $23,338.59
        </button>
        <button type="button" data-aim="tab-2" className={tab === "2" ? "is-on" : ""}>
          SO-001209-2 · 5 · $616.79
        </button>
        <div className="erp-print">
          <button type="button" data-aim="print" className={pressed(beat, elapsed, "print") ? "is-pressed" : ""}>
            Imprimir
          </button>
          {menu && (
            <ul className="erp-menu">
              <li data-aim="menu-pick" className={pressed(beat, elapsed, "menu-pick") ? "is-pressed" : ""}>
                Pick list
              </li>
              <li data-aim="menu-so">Orden de venta</li>
            </ul>
          )}
        </div>
      </div>
      <div className="erp-head">
        <h2>{headline}</h2>
        <strong className="erp-big">{total}</strong>
      </div>
      <p className="erp-banner">
        TALUVIRA PERFORACIONES S.A. · OC-2026-0417 · {count} · subtotal {sub} · IVA {iva}
      </p>
      <div className="erp-scroll">
        <table className="erp-table erp-lines">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.slice(0, tab === "2" ? 5 : 8).map((line) => (
              <tr key={line.sku} className={line.missing ? "is-falt" : ""}>
                <td>{line.sku}</td>
                <td>{shortName(line.name)}</td>
                <td>{line.qty}</td>
                <td className="num">{money(line.ext)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tab === "1" && <p className="erp-more">+ 46 líneas con stock · pick list 1,220 unidades</p>}
      </div>
    </section>
  );
}

function StockTable({ search }) {
  const q = search.trim().toUpperCase();
  const boyles = !q || "BOYLES".startsWith(q);
  const rows = STOCK_ROWS.filter((row) => boyles || row.sku.includes(q) || row.name.toUpperCase().includes(q));
  return (
    <section className="erp-page">
      <div className="erp-head">
        <h2>Inventario · Existencias</h2>
        <span className="erp-pill">6 SKUs bajo 3 meses</span>
      </div>
      <table className="erp-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Disponible</th>
            <th>En tránsito</th>
            <th>Venta/mes</th>
            <th>Cobertura</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.sku}
              data-aim={row.sku === "MCOR000126" ? "row-126" : row.sku === "MCOR000442" ? "row-442" : row.sku === "MCOR000803" ? "row-803" : undefined}
              className={row.hot ? "is-hot" : row.falta ? "is-falt" : ""}
            >
              <td>{row.sku}</td>
              <td>{row.name}</td>
              <td>{row.falta ? <b className="chip no">Falta</b> : row.disponible}</td>
              <td>{row.transito}</td>
              <td>{row.venta}</td>
              <td className={row.hot || row.falta ? "warn" : ""}>{row.cobertura.toFixed(1)} m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Purchase({ beat, elapsed, skuTyped }) {
  const shown = PO_LINES.slice(0, beat.lines || 0);
  const total = shown.reduce((sum, line) => sum + line.ext, 0);
  const partA = shown.filter((line) => line.part === "A").reduce((sum, line) => sum + line.ext, 0);
  const partB = shown.filter((line) => line.part === "B").reduce((sum, line) => sum + line.ext, 0);
  return (
    <section className="erp-page">
      <div className="erp-head">
        <h2 data-aim="po-no">{beat.saved ? "Orden de compra MCOR-PO-000379" : "Nueva orden de compra"}</h2>
        {beat.saved && <strong className="erp-big">$8,790.74</strong>}
        <div className="erp-print">
          <button type="button" className={`erp-primary ${pressed(beat, elapsed, "save") ? "is-pressed" : ""}`} data-aim="save" disabled={!!beat.saved}>
            Guardar
          </button>
          <button type="button" data-aim="print" className={pressed(beat, elapsed, "print") ? "is-pressed" : ""}>
            Imprimir
          </button>
        </div>
      </div>
      <div className="erp-meta">
        <div className="erp-supplier" data-aim="supplier">
          <span>Proveedor</span>
          <strong>{beat.supplier ? "BOYLES BROS DIAMANTINA S.A." : "Seleccionar proveedor"}</strong>
          {beat.supplierOpen && (
            <ul className="erp-menu">
              <li data-aim="supplier-boyles" className={pressed(beat, elapsed, "supplier-boyles") ? "is-pressed" : ""}>
                BOYLES BROS DIAMANTINA S.A.
              </li>
              <li>SANDVIK MINING</li>
              <li>EPIROC</li>
            </ul>
          )}
        </div>
        <div>
          <span>Pago</span>
          <strong>{beat.supplier ? "90 DÍAS" : "—"}</strong>
        </div>
        <div>
          <span>Contacto</span>
          <strong>{beat.supplier ? "Rudy Aguilar" : "—"}</strong>
        </div>
      </div>
      <label className={`erp-sku ${beat.aim === "sku" ? "is-focus" : ""}`}>
        Agregar producto
        <input data-aim="sku" readOnly value={skuTyped} placeholder="MCOR000000" aria-label="Agregar producto" />
      </label>
      <div className="erp-scroll">
        <table className="erp-table erp-lines">
          <thead>
            <tr>
              <th></th>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Costo</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((line, index) => (
              <tr key={line.sku} className={index === shown.length - 1 ? "is-new" : ""}>
                <td>{line.part}</td>
                <td>{line.sku}</td>
                <td>{line.name}</td>
                <td>{line.qty}</td>
                <td className="num">{money(line.price)}</td>
                <td className="num">{money(line.ext)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="erp-totals" data-aim="total" data-total={money(total)}>
        {partA > 0 && <span>A urgente {money(partA === PART_A ? PART_A : partA)}</span>}
        {partB > 0 && <span>B reposición {money(partB === PART_B ? PART_B : partB)}</span>}
        <strong>Total {money(total === PO_TOTAL ? PO_TOTAL : total)}</strong>
      </footer>
    </section>
  );
}

function Confirm({ modal, pressed }) {
  const convert = modal === "convert";
  return (
    <div className="erp-modal">
      <div className="erp-dialog">
        <h2>{convert ? "Convertir a orden de venta" : "Dividir orden"}</h2>
        <p>
          {convert
            ? "MCOR-SQ-001011 · TALUVIRA PERFORACIONES S.A. · 59 líneas · $23,955.39"
            : "54 líneas con stock pasan a SO-001209-1. 5 líneas sin stock quedan en SO-001209-2."}
        </p>
        <div className="erp-actions">
          <button type="button">Cancelar</button>
          <button type="button" className={`erp-primary ${pressed ? "is-pressed" : ""}`} data-aim="confirm">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfSheet({ kind }) {
  const spec = PREVIEWS[kind];
  if (!spec) return null;
  return (
    <aside className="erp-pdf">
      <header>{spec.file}</header>
      <img src={demoAsset("previews", spec.image)} alt="" />
    </aside>
  );
}
