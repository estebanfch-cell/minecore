import { QuadraticBezierLine } from "@react-three/drei";
import { HOMES, LIME, WORKFLOW_EDGES } from "../constants.js";

export function Workflow({ agents, handoff }) {
  return (
    <group>
      {WORKFLOW_EDGES.map(([a, b]) => {
        const A = agents[a];
        const B = agents[b];
        if (!A || !B) return null;
        const active =
          handoff &&
          ((handoff.from === a && handoff.to === b) ||
            (handoff.from === b && handoff.to === a));
        const start = [A.x, 1.15, A.z];
        const end = [B.x, 1.15, B.z];
        const mid = [(A.x + B.x) / 2, active ? 2.15 : 1.7, (A.z + B.z) / 2];
        return (
          <QuadraticBezierLine
            key={`${a}-${b}`}
            start={start}
            end={end}
            mid={mid}
            color={active ? LIME : "#8ab84a"}
            lineWidth={active ? 3 : 1.6}
            dashed
            dashScale={6}
            transparent
            opacity={active ? 1 : 0.7}
          />
        );
      })}
      {handoff && HOMES[handoff.from] && HOMES[handoff.to] && (
        <QuadraticBezierLine
          start={[agents[handoff.from].x, 1.35, agents[handoff.from].z]}
          end={[agents[handoff.to].x, 1.35, agents[handoff.to].z]}
          mid={[
            (agents[handoff.from].x + agents[handoff.to].x) / 2,
            2.4,
            (agents[handoff.from].z + agents[handoff.to].z) / 2,
          ]}
          color={LIME}
          lineWidth={3}
        />
      )}
    </group>
  );
}
