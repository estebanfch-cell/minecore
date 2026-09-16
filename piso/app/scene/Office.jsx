import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, DESKS, LIME } from "../constants.js";
import { Desk, OfficeRoom } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";

export function Office({ agents, meeting }) {
  return (
    <>
      <color attach="background" args={["#15211c"]} />

      <hemisphereLight args={["#e8ffc8", "#1a2a22", 0.85]} />
      <ambientLight intensity={0.72} />
      <directionalLight
        position={[7, 13, 8]}
        intensity={1.85}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-6, 6, -4]} intensity={0.45} color="#9ad4ff" />
      <pointLight position={[0, 3.4, 0]} color={LIME} intensity={2.4} distance={18} />
      <pointLight position={[-5, 3.0, -3]} color="#7ad0ff" intensity={0.7} distance={12} />
      <pointLight position={[5, 3.0, 3]} color="#7ad0ff" intensity={0.55} distance={12} />

      <OfficeRoom meeting={meeting} />

      {AGENTS.map((def) => (
        <Desk
          key={def.id}
          x={DESKS[def.id].x}
          z={DESKS[def.id].z}
          kind={def.popupKind}
          popup={agents[def.id].popup}
        />
      ))}

      <Suspense fallback={null}>
        {AGENTS.map((def) => (
          <Miner key={def.id} agent={agents[def.id]} />
        ))}
      </Suspense>

      <ContactShadows position={[0, 0.015, 0.3]} opacity={0.16} scale={18} blur={1.8} far={4} />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.35}
        minPolarAngle={0.62}
        maxPolarAngle={1.05}
        minDistance={9}
        maxDistance={16}
        target={[0, 0.55, 0.15]}
      />
    </>
  );
}
