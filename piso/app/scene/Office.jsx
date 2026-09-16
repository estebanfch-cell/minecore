import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, DESKS, LIME } from "../constants.js";
import { Desk, Platform } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";
import { Workflow } from "./Workflow.jsx";

export function Office({ agents, meeting, handoff }) {
  return (
    <>
      <color attach="background" args={["#0b1014"]} />

      <hemisphereLight args={["#d8e8ff", "#121814", 0.7]} />
      <ambientLight intensity={0.62} />
      <directionalLight
        position={[6, 16, 8]}
        intensity={1.55}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.28} color="#8ecbff" />
      <pointLight position={[0, 4.2, 0]} color={LIME} intensity={1.15} distance={14} />

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

      <ContactShadows position={[0, -0.4, 0]} opacity={0.45} scale={18} blur={2.6} far={5} />

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
