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

/** Read ?instructUrl=&instructKey= once, keep them in localStorage, and drop them from the address bar. */
export function captureInstructSettings() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const url = (params.get("instructUrl") || "").trim();
  const key = (params.get("instructKey") || "").trim();
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
  return { url: String(url).trim(), key: String(key).trim() };
}

/**
 * POST to the CHIEF webhook routine.
 * Header is the one Cursor documents: Authorization: Bearer <sender key>.
 * Does not throw.
 */
/**
 * Fire-and-forget notice that the OC run started. One POST per call.
 * Cross-origin from agentes.minecore.ec: JSON plus Authorization is not a
 * simple request, so the browser sends OPTIONS first. The endpoint must
 * allow POST and the headers content-type and authorization.
 * Never throws and never surfaces an error.
 */
export function postOrquesta(entry) {
  const { url, key } = instructSettings();
  if (!url) return;
  const chief = AGENT_BY_ID.chief;
  const headers = { "Content-Type": "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;
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
  fetch(url, {
    method: "POST",
    mode: "cors",
    headers,
    body: JSON.stringify(body),
  }).catch(() => {});
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
