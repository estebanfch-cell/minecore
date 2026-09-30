import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { AGENT_BY_ID, LOOKS, PLATFORM_TOP, SEAT_LOCAL_Z, ZONE_BY_ID, mixHex } from "../constants.js";
import { Chair, Desk, SLAB_D, SLAB_H, SLAB_W } from "./Furniture.jsx";
import { MinerAvatar } from "./Miner.jsx";
import { getMarkTexture } from "./markTexture.js";

const ISLAND = 0.48;

function SeatedMiner({ agentId }) {
  const look = LOOKS[agentId] || LOOKS.devops;
  const mark = getMarkTexture();
  const chest = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();

  useFrame(() => {
    const time = performance.now() / 1000;
    const type = Math.sin(time * 9.2);
    if (legL.current) legL.current.rotation.x = -1.12;
    if (legR.current) legR.current.rotation.x = -1.12;
    if (armL.current) armL.current.rotation.x = -1.02 + type * 0.2;
    if (armR.current) armR.current.rotation.x = -1.02 - type * 0.2;
    if (chest.current) {
      chest.current.position.y = -0.26;
      chest.current.rotation.x = 0.1;
      chest.current.rotation.y = Math.sin(time * 0.7) * 0.04;
    }
  });

  return (
    <group position={[0, PLATFORM_TOP, SEAT_LOCAL_Z * ISLAND]} rotation={[0, 0.18, 0]}>
      <MinerAvatar look={look} mark={mark} legL={legL} legR={legR} armL={armL} armR={armR} chest={chest} />
    </group>
  );
}

function DeskDiorama({ agentId }) {
  const zone = ZONE_BY_ID[agentId];
  const accent = zone?.accent || "#9fb4ff";
  const kind = AGENT_BY_ID[agentId]?.popupKind || "gh";
  const top = mixHex("#2a3548", accent, 0.58);
  const side = mixHex("#1c2636", accent, 0.42);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[2.65, 48]} />
        <meshStandardMaterial color="#10161f" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[1.55, 2.15, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <group scale={[ISLAND, 1, ISLAND]}>
        <RoundedBox args={[SLAB_W + 0.08, 0.07, SLAB_D + 0.08]} radius={0.08} smoothness={3} position={[0, 0.05, 0]}>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
        </RoundedBox>
        <RoundedBox args={[SLAB_W, SLAB_H, SLAB_D]} radius={0.1} smoothness={3} position={[0, PLATFORM_TOP - SLAB_H / 2, 0]}>
          <meshStandardMaterial color={side} roughness={0.62} metalness={0.18} />
        </RoundedBox>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM_TOP + 0.01, 0]} receiveShadow>
          <planeGeometry args={[SLAB_W - 0.18, SLAB_D - 0.18]} />
          <meshStandardMaterial color={top} roughness={0.78} metalness={0.08} />
        </mesh>
        <pointLight position={[0, 1.7, 0.2]} color={accent} intensity={0.45} distance={4.2} />
        <group position={[0, PLATFORM_TOP, 0]}>
          <Chair />
          <Desk kind={kind} accent={accent} />
        </group>
      </group>
      <SeatedMiner agentId={agentId} />
    </group>
  );
}

export function PortraitBot({ agentId }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [1.22, 1.42, 1.78], fov: 36, near: 0.08, far: 24 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0.02, 0.82, 0.08);
        gl.setClearColor("#10161f");
        gl.toneMappingExposure = 1.18;
      }}
    >
      <hemisphereLight args={["#e4eefc", "#2a241e", 0.72]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[2.4, 4.2, 2.8]} intensity={1.7} color="#f7f9ff" castShadow />
      <pointLight position={[0.4, 1.5, 1.2]} intensity={0.55} color="#ffffff" />
      <DeskDiorama agentId={agentId} />
    </Canvas>
  );
}
