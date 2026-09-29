import { AGENT_BY_ID } from "./constants.js";

const fileMods = import.meta.glob("../instruct-config.js", { eager: true });
const STORE_URL = "minecore.instructUrl";
const STORE_KEY = "minecore.instructKey";

function fileConfig() {
  const mod = Object.values(fileMods)[0];
  if (!mod) return { url: "" };
  return { url: mod.INSTRUCT_WEBHOOK_URL || "" };
}

function forgetKey() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* private mode */
  }
}

function readStore() {
  if (typeof localStorage === "undefined") return "";
  forgetKey();
  try {
    return localStorage.getItem(STORE_URL) || "";
  } catch {
    return "";
  }
}

function writeStore(url) {
  forgetKey();
  try {
    if (url) localStorage.setItem(STORE_URL, url);
  } catch {
    /* private mode: the in-memory window value still works */
  }
}

/** Accept a plain URL or one that is still percent-encoded (once or twice). */
function unwrap(value) {
  let out = String(value || "").trim();
  for (let i = 0; i < 3; i += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(out)) break;
    try {
      const next = decodeURIComponent(out).trim();
      if (!next || next === out) break;
      out = next;
    } catch {
      break;
    }
  }
  return out;
}

let queryUrl = "";
let runtimeUrl = "";
let runtimeLoad = null;

function instructJsonUrl() {
  const base = import.meta.env.BASE_URL || "./";
  return new URL("instruct.json", new URL(base, window.location.href)).href;
}

/** Fetch piso/instruct.json on each load. Nothing here is rendered. */
export function loadInstructConfig() {
  if (typeof window === "undefined") return Promise.resolve();
  if (runtimeLoad) return runtimeLoad;
  runtimeLoad = fetch(instructJsonUrl(), { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      runtimeUrl = unwrap(data && data.url);
    })
    .catch(() => {
      runtimeUrl = "";
    });
  return runtimeLoad;
}

/** Read ?instructUrl= once, keep it in localStorage, and drop it from the address bar. */
export function captureInstructSettings() {
  if (typeof window === "undefined") return;
  forgetKey();
  const params = new URLSearchParams(window.location.search);
  const url = unwrap(params.get("instructUrl"));
  const hadKey = params.has("instructKey");
  if (url) {
    queryUrl = url;
    writeStore(url);
  }
  if (!url && !hadKey) return;
  params.delete("instructUrl");
  params.delete("instructKey");
  const next = params.toString();
  const path = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", path);
}

/**
 * Precedence: window.MINECORE_INSTRUCT_URL, then ?instructUrl=, then instruct.json,
 * then localStorage, then an optional gitignored instruct-config.js.
 * The page never sends a key.
 */
export function instructSettings() {
  forgetKey();
  const windowUrl = typeof window !== "undefined" ? unwrap(window.MINECORE_INSTRUCT_URL || "") : "";
  const saved = unwrap(readStore());
  const baked = unwrap(fileConfig().url);
  const url = windowUrl || queryUrl || runtimeUrl || saved || baked;
  return { url };
}

function orquestaBody(entry) {
  const chief = AGENT_BY_ID.chief;
  return {
    event: "orquesta_oc",
    oc: "OC-2026-0417",
    cliente: "Taluvira",
    to: "estebanferlito@minecore.ec",
    agentId: chief.grokId,
    agentName: chief.name,
    text: entry?.text || "",
    ts: new Date().toISOString(),
    phase: "manuelito_done",
  };
}

function deliver(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  }).then((res) => {
    console.debug("orquesta-post", res.status);
    return res.ok;
  });
}

/**
 * One simple CORS POST when Manuelito finishes. No Authorization, no preflight.
 * Retries once after 1.5s if the network fails or the status is not 2xx.
 */
export function postOrquesta(entry) {
  loadInstructConfig().then(() => {
    const { url } = instructSettings();
    if (!url) {
      console.debug("orquesta-post", "skipped");
      return;
    }
    const body = orquestaBody(entry);
    const retry = () => {
      deliver(url, body).catch(() => {
        console.debug("orquesta-post", "error");
      });
    };
    deliver(url, body)
      .then((ok) => {
        if (!ok) setTimeout(retry, 1500);
      })
      .catch(() => {
        console.debug("orquesta-post", "error");
        setTimeout(retry, 1500);
      });
  });
}

export async function postInstruction(entry) {
  await loadInstructConfig();
  const { url } = instructSettings();
  if (!url) return { ok: false, reason: "missing" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        agentId: entry.agentId,
        agentName: entry.agentName,
        text: entry.text,
        ts: entry.ts,
      }),
    });
    if (!res.ok) return { ok: false, reason: "http", status: res.status };
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}
