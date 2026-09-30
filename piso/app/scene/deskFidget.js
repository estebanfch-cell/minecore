/** Calm desk fidgets. Each bot has its own period and phase so they never match. */

export const held = {
  mug: new Set(),
  phone: new Set(),
};

const NAMES = ["phone", "coffee", "stretch", "scroll", "nod"];

function hashId(id) {
  let h = 0;
  const text = String(id || "");
  for (let i = 0; i < text.length; i++) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  return h;
}

function envelope(u) {
  const edge = 0.2;
  if (u < edge) return u / edge;
  if (u > 1 - edge) return (1 - u) / edge;
  return 1;
}

if (import.meta.env?.DEV && typeof window !== "undefined") {
  window.__deskAct = (id, time, working) => deskAct(id, time, working);
}

export function deskAct(id, time, working) {
  const h = hashId(id);
  const period = (working ? 12 : 28) + (h % (working ? 6 : 10));
  const offset = (h % 97) * 0.37;
  const span = working ? 3.4 : 2.8;
  const local = (time + offset) % period;
  const which = NAMES[(Math.floor((time + offset) / period) + (h % 5)) % NAMES.length];
  if (local < period - span) return { name: working ? "type" : "rest", amount: 1 };
  const u = (local - (period - span)) / span;
  return { name: which, amount: envelope(u) };
}
