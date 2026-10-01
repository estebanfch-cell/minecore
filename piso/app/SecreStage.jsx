import { useEffect, useRef, useState } from "react";
import { demoAsset } from "./demoRun.js";
import { anchorSecreVideo, SRI_CUES } from "./secreRun.js";

const ACCESS = "2509202607179133506600120019990000345240004354918";
const QUERY = "001-001-000001223";
const RET_REF = "001-999-000034524";
const RET_AMT = 28.01;
const SALE_TOTAL = 495.42;
const SALE_LEFT = 467.41;

const BANK_ROWS = [
  ["TRANSFERENCIA INTERBANCARIA DE GOLDTECH DRILLING CIA LTDA", "30/09/2026", "14820367", "C", "CENTRO SERVIC. OPERAT. SS. QTO", 2511.08, 36164.23],
  ["2609300F7QK1-MINECORE-PAG-PROV 30 SEP", "30/09/2026", "2014472", "D", "AG. NORTE", 612.4, 33653.15],
  ["2609290F6YTR-AGRICOLA CANAPALM-PAG-1793194965001", "29/09/2026", "109702215", "C", "AG. NORTE", 243.6, 34265.55],
  ["TRANSFERENCIA INTERBANCARIA DE KLUANE DRILLING ECUADOR", "29/09/2026", "13421876", "C", "CENTRO SERVIC. OPERAT. SS. QTO", 11418.53, 34021.95],
  ["COMISION TRANSFERENCIA SPI", "29/09/2026", "2013390", "D", "AG. NORTE", 0.41, 22603.42],
  ["2609290F6ZUL-MINECORE-PAG-NOM SEP", "29/09/2026", "2012815", "D", "AG. NORTE", 1420, 22603.83],
  ["2609280F5KP2-MINECORE-PAG-PROV 28 SEP", "28/09/2026", "2011904", "D", "AG. NORTE", 286.75, 24023.83],
];

const CHECKS = [
  "El sustento es la factura 001-001-000001223",
  "La base de renta coincide con el subtotal",
  "La base de IVA coincide con el IVA",
  "Sin retención previa",
];

const COLLECT = [
  { fac: "001-001-000001122", so: "MCOR-SO-001114", client: "Goldtech Drilling", ref: "14820367", pay: 1368.5, from: 1368.5, to: 0, end: "Pagada" },
  { fac: "001-001-000001188", so: "MCOR-SO-001172", client: "Goldtech Drilling", ref: "14820367", pay: 1142.58, from: 1142.58, to: 0, end: "Pagada" },
  { fac: "001-001-000001212", so: "MCOR-SO-001194", client: "Agrícola Cañapalm", ref: "109702215", pay: 243.6, from: 243.6, to: 0, end: "Pagada" },
  { fac: "001-001-000001207", so: "MCOR-SO-001190", client: "Kluane Drilling Ecuador", ref: "13421876", pay: 11418.53, from: 12074.77, to: 656.24, end: "Parcial", wait: true },
];

function money(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function usd(n) {
  return `$${money(n)}`;
}

function ease(u) {
  const x = Math.min(1, Math.max(0, u));
  return x * x * (3 - 2 * x);
}

function typed(full, elapsed, start, dur) {
  if (elapsed <= start) return "";
  const p = Math.min(1, (elapsed - start) / dur);
  return full.slice(0, Math.ceil(p * full.length));
}

function useTicker() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 50);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function readyFor(screen, elapsed) {
  if (screen === "sri") return elapsed > 19000;
  if (screen === "ride") return elapsed > 6500;
  if (screen === "so") return elapsed > 3200;
  if (screen === "checks") return elapsed > 5600;
  if (screen === "pay") return elapsed > 2000;
  if (screen === "save") return elapsed > 2500;
  if (screen === "bank") return elapsed > 7800;
  if (screen === "match") return elapsed > 9000;
  if (screen === "proposal") return elapsed > 400;
  if (screen === "collect") return elapsed > 5800;
  if (screen === "summary") return elapsed > 200;
  return false;
}

function Sistema({ active, search, typing, log, children }) {
  return (
    <div className="erp notranslate" translate="no">
      <aside className="erp-side">
        <div className="erp-brand">
          <span>M</span>
          <div>
            <strong>MINECORE</strong>
            <em>Sistema</em>
          </div>
        </div>
        <p>Ventas</p>
        <button type="button" className={active === "orders" ? "is-on" : ""}>
          Órdenes de venta
        </button>
        <button type="button" className={active === "invoices" ? "is-on" : ""}>
          Facturas abiertas
        </button>
        <p>Caja</p>
        <button type="button" className={active === "pay" ? "is-on" : ""}>
          Pagos
        </button>
      </aside>
      <div className="erp-main">
        <header className="erp-top">
          <label className={`erp-search ${typing ? "is-focus" : ""}`}>
            <input readOnly value={search} placeholder="Buscar factura, orden o cliente" aria-label="Buscar" />
          </label>
          <span className="erp-op">Operado por SECRE · agente</span>
        </header>
        {children}
      </div>
      <aside className="erp-agent">
        <header>
          <i />
          SECRE · agente
        </header>
        <ol>
          {log.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function SriFilm() {
  const video = useRef(null);
  const [failed, setFailed] = useState(false);
  const [mediaMs, setMediaMs] = useState(0);
  const notes = [
    "Ingreso con el RUC de Minecore",
    mediaMs >= SRI_CUES.filter ? "Filtro septiembre · Retenciones" : "",
    mediaMs >= SRI_CUES.found ? `Encontré la retención de Kluane ${RET_REF}` : "",
    mediaMs >= SRI_CUES.download ? "Descargo XML y RIDE" : "",
  ].filter(Boolean);
  const frame = mediaMs < SRI_CUES.menu
    ? "sri-01.png"
    : mediaMs < SRI_CUES.filter
      ? "sri-03.png"
      : mediaMs < SRI_CUES.found
        ? "sri-04.png"
        : mediaMs < SRI_CUES.download
          ? "sri-05.png"
          : "sri-06.png";
  useEffect(() => {
    const node = video.current;
    if (!node) return undefined;
    node.muted = true;
    const play = node.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => setFailed(true));
    }
    const onError = () => setFailed(true);
    const onPlaying = () => {
      if (node.currentTime < 1) anchorSecreVideo();
    };
    const onTime = () => setMediaMs(node.currentTime * 1000);
    node.addEventListener("error", onError);
    node.addEventListener("playing", onPlaying);
    node.addEventListener("timeupdate", onTime);
    return () => {
      node.removeEventListener("error", onError);
      node.removeEventListener("playing", onPlaying);
      node.removeEventListener("timeupdate", onTime);
    };
  }, []);
  return (
    <div className="sri-film">
      <div className="sri-film-stage">
        {failed ? (
          <img src={demoAsset("secre", frame)} alt="" />
        ) : (
          <video
            ref={video}
            src={demoAsset("secre", "sri-recorrido.mp4")}
            poster={demoAsset("secre", "sri-01.png")}
            muted
            autoPlay
            playsInline
            preload="auto"
          />
        )}
      </div>
      <aside className="erp-agent">
        <header>
          <i />
          SECRE · agente
        </header>
        <ol>
          {notes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function Ride({ elapsed }) {
  const scan = Math.min(1, Math.max(0, (elapsed - 200) / 8000));
  const hot = {
    num: elapsed > 800,
    fac: elapsed > 2000,
    renta: elapsed > 3500,
    iva: elapsed > 5000,
    total: elapsed > 6500,
  };
  return (
    <div className="ride-wrap">
      {elapsed > 400 && <p className="ride-dl">XML descargado · RIDE descargado</p>}
      <article className="ride">
        <header>
          <div>
            <strong>KLUANE DRILLING ECUADOR S.A.</strong>
            <p>RUC 1791335066001</p>
            <p>Juan Barrezueta N72 Lote 2 y Rodrigo de Villalobos</p>
          </div>
          <div className={hot.num ? "ride-hot" : ""}>
            <span>COMPROBANTE DE RETENCIÓN</span>
            <strong>No. {RET_REF}</strong>
          </div>
        </header>
        <p className="ride-key">
          <span>Clave de acceso</span>
          {ACCESS}
        </p>
        <p className="ride-meta">Autorizado 29/09/2026 16:04:04</p>
        <div className="ride-who">
          <p>
            <span>Sujeto retenido</span>
            MINECORE S.A.S.
          </p>
          <p>
            <span>RUC</span>
            1793194965001
          </p>
          <p>
            <span>Fecha de emisión</span>
            25/09/2026
          </p>
          <p>
            <span>Periodo fiscal</span>
            09/2026
          </p>
        </div>
        <p className={`ride-sustento ${hot.fac ? "ride-hot" : ""}`}>
          Factura sustento <strong>001-001-000001223</strong> del 25/09/2026
        </p>
        <table>
          <thead>
            <tr>
              <th>Impuesto</th>
              <th>Código</th>
              <th>%</th>
              <th>Base</th>
              <th>Valor retenido</th>
            </tr>
          </thead>
          <tbody>
            <tr className={hot.renta ? "ride-hot" : ""}>
              <td>Renta</td>
              <td>312</td>
              <td>2.00%</td>
              <td className="num">430.80</td>
              <td className="num">8.62</td>
            </tr>
            <tr className={hot.iva ? "ride-hot" : ""}>
              <td>IVA</td>
              <td />
              <td>30%</td>
              <td className="num">64.62</td>
              <td className="num">19.39</td>
            </tr>
          </tbody>
        </table>
        <p className={`ride-total ${hot.total ? "ride-hot" : ""}`}>
          TOTAL RETENIDO <strong>$28.01</strong>
        </p>
        <div className="ride-bars" aria-hidden="true">
          {ACCESS.split("").map((digit, index) => (
            <i key={`${digit}-${index}`} style={{ width: `${1 + (Number(digit) % 3)}px` }} />
          ))}
        </div>
      </article>
      <div className="scan-line" style={{ animation: "none", top: `${8 + scan * 80}%` }} />
    </div>
  );
}

function Sale({ elapsed, phase }) {
  const search = phase === "so" ? typed(QUERY, elapsed, 200, 2000) : QUERY;
  const found = phase !== "so" || elapsed > 2800;
  const showPay = phase === "pay" || phase === "save";
  const u = phase === "save" ? ease((elapsed - 400) / 1600) : 0;
  const pagado = RET_AMT * u;
  const saldo = SALE_TOTAL - pagado;
  const done = phase === "save" && u > 0.98;
  const checksOn = phase === "checks";
  const log = [
    elapsed >= 0 ? "Abro la orden de la factura sustento." : "",
    found ? "MCOR-SO-001205 · KLUANE DRILLING ECUADOR S.A." : "Escribo 001-001-000001223.",
    checksOn && elapsed > 4000 ? "Sustento y bases coinciden. Sin retención previa." : "",
    showPay ? `Cargo la retención ${RET_REF}.` : "",
    done ? "Registrado. Saldo $467.41 · Parcial." : "",
  ].filter(Boolean);
  return (
    <Sistema active={showPay ? "pay" : "orders"} search={search} typing={phase === "so" && !found} log={log}>
      <section className="erp-page">
        {!found ? (
          <>
            <div className="erp-head">
              <h2>Órdenes de venta</h2>
              <span>{search.length > 6 ? "1 resultado" : "Buscando"}</span>
            </div>
            {search.length > 6 && (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th>Factura</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="is-new">
                    <td>MCOR-SO-001205</td>
                    <td>KLUANE DRILLING ECUADOR S.A.</td>
                    <td>001-001-000001223</td>
                    <td className="num">{usd(SALE_TOTAL)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            <div className="erp-head">
              <h2>Orden de venta MCOR-SO-001205</h2>
              <b className={done ? "chip mid" : "erp-pill"} data-estado={done ? "Parcial" : "Facturada"}>
                {done ? "Parcial" : "Facturada"}
              </b>
            </div>
            {done && <p className="secre-ok">Registrado</p>}
            <div className="erp-meta">
              <div>
                <span>Cliente</span>
                <strong>KLUANE DRILLING ECUADOR S.A.</strong>
              </div>
              <div>
                <span>RUC</span>
                <strong>1791335066001</strong>
              </div>
              <div>
                <span>Fecha</span>
                <strong>25/09/2026</strong>
              </div>
              <div>
                <span>Factura</span>
                <strong>001-001-000001223</strong>
              </div>
              <div>
                <span>Vence</span>
                <strong>25/10/2026</strong>
              </div>
            </div>
            {checksOn && (
              <ul className="secre-checks">
                {CHECKS.map((line, index) => {
                  const on = elapsed > 700 + index * 1500;
                  return (
                    <li key={line} className={on ? "done" : "wait"}>
                      <span className="mark" aria-hidden="true">
                        {on ? "✓" : ""}
                      </span>
                      {line}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="erp-scroll">
              <table className="erp-table secre-fit">
                <colgroup>
                  <col className="c-sku" />
                  <col className="c-name" />
                  <col className="c-qty" />
                  <col className="c-money" />
                  <col className="c-qty" />
                  <col className="c-money" />
                </colgroup>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>P. unit.</th>
                    <th>Desc.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MCOR000965</td>
                    <td>ZAPATA IMP., HO, 60715, SERIE 2, DL, 8WW - BOYLES BROS</td>
                    <td>1</td>
                    <td className="num">$478.67</td>
                    <td>10%</td>
                    <td className="num">$430.80</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="erp-totals secre-totals">
              <span>Subtotal {usd(430.8)}</span>
              <span>IVA 15% {usd(64.62)}</span>
              <span>Total {usd(SALE_TOTAL)}</span>
              <span>Pagado {usd(phase === "save" ? pagado : 0)}</span>
              <strong data-saldo={done ? money(SALE_LEFT) : money(SALE_TOTAL)}>Saldo {usd(phase === "save" ? saldo : SALE_TOTAL)}</strong>
            </div>
            {showPay && (
              <div className="secre-pay">
                <h3>Pagos</h3>
                <p>
                  Método RETENCIÓN · Ref {RET_REF} · {usd(RET_AMT)} · 25/09/2026
                  <span className="pdf-chip">RIDE-retencion-001-999-000034524.pdf</span>
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </Sistema>
  );
}

function Bank({ elapsed, fileName }) {
  const scan = Math.min(1, elapsed / 14000);
  return (
    <div className="bank-sheet">
      <header className="bank-head">
        <strong>BANCO PICHINCHA · Estado de cuenta · Cta. Cte. MINECORE S.A.S · RUC 1793194965001</strong>
        <p>Periodo: 28/09/2026 – 30/09/2026</p>
        {fileName ? <p className="bank-file">{fileName}</p> : null}
      </header>
      <table className="bank-table">
        <colgroup>
          <col className="c-concept" />
          <col className="c-date" />
          <col className="c-doc" />
          <col className="c-tipo" />
          <col className="c-office" />
          <col className="c-money" />
          <col className="c-money" />
        </colgroup>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Fecha</th>
            <th>Documento</th>
            <th>Tipo</th>
            <th>Oficina</th>
            <th>Monto</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {BANK_ROWS.map((row, index) => {
            const seen = elapsed > 1000 + index * 850;
            const credit = row[3] === "C";
            const cls = seen ? (credit ? "is-credit" : "is-debit") : "";
            return (
              <tr key={row[2]} className={cls}>
                <td>
                  {row[0]}
                  {seen && !credit ? <span className="bank-na">no aplica</span> : null}
                </td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td className="num">{money(row[5])}</td>
                <td className="num">{money(row[6])}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="scan-line" style={{ animation: "none", top: `${12 + scan * 74}%` }} />
    </div>
  );
}

function Match({ elapsed }) {
  const gold = elapsed > 400;
  const agri = elapsed > 3500;
  const kluane = elapsed > 7000;
  const log = [
    gold ? "Goldtech · $2,511.08 = 1,368.50 + 1,142.58." : "Busco facturas abiertas de los créditos.",
    agri ? "Agrícola Cañapalm · saldo $243.60 exacto." : "",
    kluane ? "Kluane · falta $656.24 de retención." : "",
  ].filter(Boolean);
  return (
    <Sistema active="invoices" search="facturas abiertas" log={log}>
      <section className="erp-page">
        <div className="erp-head">
          <h2>Facturas abiertas</h2>
          <span>3 créditos</span>
        </div>
        <div className="erp-scroll secre-cards">
          {gold && (
            <article>
              <header>
                <strong>Goldtech Drilling</strong>
                <span>RUC 1990927479001</span>
                <b className="chip ok">Exacto</b>
              </header>
              <p>MCOR-SO-001114 · FAC 001-001-000001122 · saldo $1,368.50</p>
              <p>MCOR-SO-001172 · FAC 001-001-000001188 · saldo $1,142.58</p>
              <p className="match">$2,511.08 = 1,368.50 + 1,142.58</p>
            </article>
          )}
          {agri && (
            <article>
              <header>
                <strong>Agrícola Cañapalm</strong>
                <span>RUC 2390007887001</span>
                <b className="chip ok">Exacto</b>
              </header>
              <p>MCOR-SO-001194 · FAC 001-001-000001212</p>
              <p>Total $276.00 · retención 7466 $32.40 ya aplicada · saldo $243.60</p>
              <p className="match">Pago $243.60 · coincide con el saldo</p>
            </article>
          )}
          {kluane && (
            <article className="is-gap">
              <header>
                <strong>Kluane Drilling Ecuador</strong>
                <b className="chip mid">Retención pendiente</b>
              </header>
              <p>MCOR-SO-001190 · FAC 001-001-000001207 · total y saldo $12,074.77</p>
              <p>Pago $11,418.53 · ref 13421876 · sin retención previa</p>
              <p>Renta 312 · 1.75% × 10,499.80 = 183.75</p>
              <p>IVA 30% × 1,574.97 = 472.49</p>
              <p className="match">Falta $656.24 = retención pendiente</p>
            </article>
          )}
        </div>
      </section>
    </Sistema>
  );
}

function Proposal() {
  return (
    <Sistema
      active="pay"
      search=""
      log={["Propuesta lista. 4 transferencias, 4 débitos fuera."]}
    >
      <section className="erp-page">
        <div className="erp-head">
          <h2>Propuesta de aplicación</h2>
          <span>Antes de registrar</span>
        </div>
        <div className="erp-scroll">
          <table className="erp-table secre-fit">
            <colgroup>
              <col className="c-who" />
              <col className="c-ref" />
              <col className="c-name" />
              <col className="c-money" />
              <col className="c-state" />
            </colgroup>
            <thead>
              <tr>
                <th>Crédito</th>
                <th>Documento</th>
                <th>Facturas</th>
                <th>Aplicar</th>
                <th>Estado final</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Goldtech Drilling · $2,511.08</td>
                <td>14820367</td>
                <td>FAC 1122 $1,368.50 + FAC 1188 $1,142.58</td>
                <td className="num">$2,511.08</td>
                <td>Pagada · Pagada</td>
              </tr>
              <tr>
                <td>Agrícola Cañapalm · $243.60</td>
                <td>109702215</td>
                <td>FAC 1212 · saldo $243.60</td>
                <td className="num">$243.60</td>
                <td>Pagada</td>
              </tr>
              <tr className="is-hot">
                <td>Kluane Drilling Ecuador · $11,418.53</td>
                <td>13421876</td>
                <td>FAC 1207 · saldo $12,074.77</td>
                <td className="num">$11,418.53</td>
                <td>Parcial · saldo $656.24</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="secre-note">4 débitos del estado de cuenta no se aplican.</p>
      </section>
    </Sistema>
  );
}

function Collect({ elapsed }) {
  const u = ease((elapsed - 3600) / 2000);
  const done = u > 0.98;
  const log = [
    "Registro 4 transferencias.",
    done ? "1122, 1188 y 1212 pagadas. Kluane queda en $656.24." : "Aplicando saldos…",
  ];
  return (
    <Sistema active="pay" search="" log={log}>
      <section className="erp-page">
        <div className="erp-head">
          <h2>Pagos registrados</h2>
          {done && <b className="chip ok">Registrado</b>}
        </div>
        <div className="erp-scroll">
          <table className="erp-table secre-fit secre-pays">
            <colgroup>
              <col className="c-fac" />
              <col className="c-who" />
              <col className="c-met" />
              <col className="c-ref" />
              <col className="c-money" />
              <col className="c-money" />
              <col className="c-state" />
            </colgroup>
            <thead>
              <tr>
                <th>Factura</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Ref</th>
                <th>Pago</th>
                <th>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {COLLECT.map((row, index) => {
                const line = elapsed > 400 + index * 700;
                const saldo = row.from + (row.to - row.from) * (line ? u : 0);
                const estado = done && line ? row.end : "Facturada";
                return (
                  <tr key={row.fac} className={done && row.wait ? "is-hot" : ""}>
                    <td>
                      {row.fac}
                      <small>{row.so}</small>
                    </td>
                    <td>{row.client}</td>
                    <td>{line ? "TRANSFERENCIA" : "—"}</td>
                    <td>{line ? row.ref : "—"}</td>
                    <td className="num">{line ? usd(row.pay) : "—"}</td>
                    <td className="num" data-saldo={done ? money(row.to) : undefined}>
                      {usd(line ? saldo : row.from)}
                    </td>
                    <td>
                      <b className={estado === "Pagada" ? "chip ok" : estado === "Parcial" ? "chip mid" : "erp-pill"}>{estado}</b>
                      {done && row.wait ? <span className="secre-wait">esperando retención</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Sistema>
  );
}

function Summary({ note }) {
  return (
    <div className="secre-result">
      <p className="secre-kicker">SECRE</p>
      <p>{note}</p>
    </div>
  );
}

const ERP_SCREENS = new Set(["so", "checks", "pay", "save", "match", "proposal", "collect"]);

export function SecreStage({ screen, fileName, note, since }) {
  const now = useTicker();
  const elapsed = Math.max(0, now - (since || now));
  const ready = readyFor(screen, elapsed);
  return (
    <div
      className={`secre-stage ${ERP_SCREENS.has(screen) ? "is-erp" : "is-sheet"}`}
      data-secre-screen={screen}
      data-secre-ready={ready ? "1" : "0"}
    >
      {screen === "sri" && <SriFilm />}
      {screen === "ride" && <Ride elapsed={elapsed} />}
      {(screen === "so" || screen === "checks" || screen === "pay" || screen === "save") && (
        <Sale elapsed={elapsed} phase={screen} />
      )}
      {screen === "bank" && <Bank elapsed={elapsed} fileName={fileName} />}
      {screen === "match" && <Match elapsed={elapsed} />}
      {screen === "proposal" && <Proposal />}
      {screen === "collect" && <Collect elapsed={elapsed} />}
      {screen === "summary" && <Summary note={note} />}
    </div>
  );
}
