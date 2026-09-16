import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, DESKS, LIME } from "../constants.js";
import { Desk, Platform } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";

export function Office({ agents, meeting, selectedId }) {
  return (
    <>
      <color attach="background" args={["#0b1014"]} />

      <hemisphereLight args={["#d8e8ff", "#121814", 0.7]} />
      <ambientLight intensity={0.62} />
      <directionalLight
        position={[7, 16, 9]}
        intensity={1.55}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.28} color="#8ecbff" />
      <pointLight position={[0, 4.2, 0]} color={LIME} intensity={1.05} distance={16} />

      <Platform meeting={meeting} />

      {AGENTS.map((def) => (
        <Desk
          key={def.id}
          x={DESKS[def.id].x}
          z={DESKS[def.id].z}
          kind={def.popupKind}
        />
      ))}

      <Suspense fallback={null}>
        {AGENTS.map((def) => (
          <Miner key={def.id} agent={agents[def.id]} selected={selectedId === def.id} />
        ))}
      </Suspense>

      <ContactShadows position={[0, -0.4, 0]} opacity={0.45} scale={26} blur={2.6} far={6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={!selectedId}
        autoRotateSpeed={0.18}
        minPolarAngle={0.42}
        maxPolarAngle={0.88}
        minDistance={14}
        maxDistance={26}
        target={[0, 0.35, 0.2]}
      />
    </>
  );
}
