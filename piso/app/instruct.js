const fileMods = import.meta.glob("../instruct-config.js", { eager: true });

function fileConfig() {
  const mod = Object.values(fileMods)[0];
  if (!mod) return { url: "", key: "" };
  return {
    url: mod.INSTRUCT_WEBHOOK_URL || "",
    key: mod.INSTRUCT_WEBHOOK_KEY || "",
  };
}

/** Window values win so the workshop can paste URL and key without a rebuild. */
export function instructSettings() {
  const file = fileConfig();
  const url = (typeof window !== "undefined" && window.MINECORE_INSTRUCT_URL) || file.url || "";
  const key = (typeof window !== "undefined" && window.MINECORE_INSTRUCT_KEY) || file.key || "";
  return { url: String(url).trim(), key: String(key).trim() };
}

export function grokLink(grokId) {
  return `grokbot://app/v1/sidebar?agent=${encodeURIComponent(grokId)}&tab=overview`;
}

/**
 * POST to the CHIEF webhook routine.
 * Header is the one Cursor documents: Authorization: Bearer <sender key>.
 * Does not throw.
 */
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
