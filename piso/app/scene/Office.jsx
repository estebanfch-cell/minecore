import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, DESKS, LIME } from "../constants.js";
import { Desk, Platform } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";
import { Workflow } from "./Workflow.jsx";

export function Office({ agents, meeting, handoff }) {
  return (
    <>
      <color attach="background" args={["#10151c"]} />

      <hemisphereLight args={["#e8f2ff", "#1a221c", 0.85]} />
      <ambientLight intensity={0.78} />
      <directionalLight
        position={[5, 14, 7]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <directionalLight position={[-7, 5, -3]} intensity={0.4} color="#9ad4ff" />
      <pointLight position={[0, 3.8, 0]} color={LIME} intensity={1.05} distance={13} />

      <Platform meeting={meeting} />

      {AGENTS.map((def) => (
        <Desk
          key={def.id}
          x={DESKS[def.id].x}
          z={DESKS[def.id].z}
          kind={def.popupKind}
          popup={agents[def.id].popup}
        />
      ))}

      <Workflow agents={agents} handoff={handoff} />

      <Suspense fallback={null}>
        {AGENTS.map((def) => (
          <Miner key={def.id} agent={agents[def.id]} />
        ))}
      </Suspense>

      <ContactShadows position={[0, -0.58, 0]} opacity={0.5} scale={20} blur={2.8} far={6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.22}
        minPolarAngle={0.42}
        maxPolarAngle={0.88}
        minDistance={10}
        maxDistance={18}
        target={[0, 0.35, 0.1]}
      />
    </>
  );
}
