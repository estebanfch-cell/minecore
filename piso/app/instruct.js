import { AGENT_BY_ID } from "./constants.js";

const fileMods = import.meta.glob("../instruct-config.js", { eager: true });
const STORE_URL = "minecore.instructUrl";
const STORE_KEY = "minecore.instructKey";

function fileConfig() {
  const mod = Object.values(fileMods)[0];
  if (!mod) return { url: "", key: "" };
  return {
    url: mod.INSTRUCT_WEBHOOK_URL || "",
    key: mod.INSTRUCT_WEBHOOK_KEY || "",
  };
}

function readStore() {
  if (typeof localStorage === "undefined") return { url: "", key: "" };
  try {
    return {
      url: localStorage.getItem(STORE_URL) || "",
      key: localStorage.getItem(STORE_KEY) || "",
    };
  } catch {
    return { url: "", key: "" };
  }
}

function writeStore(url, key) {
  try {
    if (url) localStorage.setItem(STORE_URL, url);
    if (key) localStorage.setItem(STORE_KEY, key);
  } catch {
    /* private mode: the in-memory window values still work */
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

/** Read ?instructUrl=&instructKey= once, keep them in localStorage, and drop them from the address bar. */
export function captureInstructSettings() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const url = unwrap(params.get("instructUrl"));
  const key = unwrap(params.get("instructKey"));
  if (!url && !key) return;
  writeStore(url, key);
  params.delete("instructUrl");
  params.delete("instructKey");
  const next = params.toString();
  const path = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", path);
}

/** Window values win. Nothing here is rendered. */
export function instructSettings() {
  const file = fileConfig();
  const saved = readStore();
  const url = (typeof window !== "undefined" && window.MINECORE_INSTRUCT_URL) || saved.url || file.url || "";
  const key = (typeof window !== "undefined" && window.MINECORE_INSTRUCT_KEY) || saved.key || file.key || "";
  return { url: unwrap(url), key: unwrap(key) };
}

function urlWithKey(url, key) {
  if (!key) return url;
  const hashAt = url.indexOf("#");
  const base = hashAt >= 0 ? url.slice(0, hashAt) : url;
  const hash = hashAt >= 0 ? url.slice(hashAt) : "";
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}key=${encodeURIComponent(key)}${hash}`;
}

/**
 * Fire-and-forget notice that the OC run started. Called once per run.
 * Tries a CORS POST with Authorization. If that throws (preflight or network),
 * one simple no-cors POST follows: text/plain body, key on the query and in
 * the JSON. Never throws and never surfaces an error.
 */
export function postOrquesta(entry) {
  const { url, key } = instructSettings();
  if (!url) return;
  const chief = AGENT_BY_ID.chief;
  const body = {
    event: "orquesta_oc",
    oc: "OC-2026-0417",
    cliente: "Taluvira",
    to: "estebanferlito@minecore.ec",
    agentId: chief.grokId,
    agentName: chief.name,
    text: entry?.text || "",
    ts: new Date().toISOString(),
  };
  const headers = { "Content-Type": "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;
  const simpleBody = key ? { ...body, key } : body;
  fetch(url, {
    method: "POST",
    mode: "cors",
    headers,
    body: JSON.stringify(body),
  }).catch(() => {
    fetch(urlWithKey(url, key), {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(simpleBody),
    }).catch(() => {});
  });
}

export async function postInstruction(entry) {
  const { url, key } = instructSettings();
  if (!url) return { ok: false, reason: "missing" };
  try {
    const headers = { "Content-Type": "application/json" };
    if (key) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
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
