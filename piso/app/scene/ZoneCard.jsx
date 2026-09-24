import { Html } from "@react-three/drei";
import { STATUS_LABEL } from "../constants.js";

function clip(text, n = 42) {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

export function ZoneCard({ zone, agent }) {
  const position = [
    zone.position.x - 1.05,
    2.12,
    zone.position.z - 1.05,
  ];
  const status = agent?.status || "pending";

  return (
    <Html position={position} center distanceFactor={14} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
      <div className="zone-card notranslate" style={{ "--accent": zone.accent }} translate="no">
        <div className="zone-kicker">
          <span>{zone.title}</span>
          <em>{zone.detail}</em>
        </div>
        <div className="zone-count">
          <strong>1</strong>
          <span>agente</span>
        </div>
        <ul>
          {zone.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li className={status}>
            <i />
            {clip(agent?.activity)} · {STATUS_LABEL[status] || status}
          </li>
        </ul>
      </div>
    </Html>
  );
}
