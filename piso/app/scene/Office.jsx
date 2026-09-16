import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, DESKS, LIME } from "../constants.js";
import { Desk, OfficeRoom } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";

export function Office({ agents, meeting }) {
  return (
    <>
      <color attach="background" args={["#070c0a"]} />
      <fog attach="fog" args={["#070c0a", 18, 38]} />

      <hemisphereLight args={["#b8ff3c", "#0a100c", 0.28]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[0, 3.6, 0]} color={LIME} intensity={1.1} distance={16} />
      <pointLight position={[-5, 3.2, -3]} color="#7ad0ff" intensity={0.35} distance={10} />
      <pointLight position={[5, 3.2, 3]} color="#7ad0ff" intensity={0.28} distance={10} />

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

      <ContactShadows position={[0, 0.01, 0.3]} opacity={0.42} scale={20} blur={2.2} far={6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        minDistance={10}
        maxDistance={22}
        target={[0, 0.6, 0.2]}
      />
    </>
  );
}
