import { Html } from "@react-three/drei";

function clip(text, n = 32) {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

export function ZoneCard({ zone, agent }) {
  const dx = zone.position.x;
  const dz = zone.position.z;
  const len = Math.hypot(dx, dz) || 1;
  const out = zone.ring === "outer" ? 1.05 : 0.95;
  const position = [dx + (dx / len) * out, zone.ring === "outer" ? 1.28 : 1.48, dz + (dz / len) * out];
  const status = agent?.status || "pending";

  return (
    <Html position={position} center distanceFactor={22} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
      <div className="zone-card compact notranslate" style={{ "--accent": zone.accent }} translate="no" data-agent-id={agent?.grokId || ""}>
        <div className="zone-kicker">
          <span>{zone.title}</span>
          <em>{zone.detail}</em>
        </div>
        <p className={status}>
          <i />
          {clip(agent?.activity)}
        </p>
      </div>
    </Html>
  );
}
