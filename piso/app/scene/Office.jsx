import { Suspense, useMemo } from "react";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { AGENTS, HUB, YAW, ZONE_BY_ID } from "../constants.js";
import { Hub, Walkways, ZoneIsland } from "./Furniture.jsx";
import { Miner } from "./Miner.jsx";
import { ZoneCard } from "./ZoneCard.jsx";

export function Office({ agents, meeting, selectedId, handoff, popupFlash }) {
  const hotIds = useMemo(() => {
    const ids = new Set();
    if (handoff?.from) ids.add(handoff.from);
    if (handoff?.to) ids.add(handoff.to);
    return ids;
  }, [handoff]);

  return (
    <>
      <color attach="background" args={["#070a10"]} />
      <fog attach="fog" args={["#070a10", 48, 96]} />

      <hemisphereLight args={["#d7e4f8", "#3a332c", 0.82]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[7, 16, 9]}
        intensity={2.15}
        color="#f7f9ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-near={2}
        shadow-camera-far={42}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <directionalLight position={[-8, 7, -6]} intensity={0.7} color="#9eb6ff" />
      <directionalLight position={[8, 5, 12]} intensity={0.55} color="#fff4ea" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[26, 64]} />
        <meshStandardMaterial color="#080c14" roughness={1} />
      </mesh>

      <Walkways hotIds={hotIds} />
      <Hub meeting={meeting} />
      <Html position={[HUB.x, 2.45, HUB.z]} center distanceFactor={16} zIndexRange={[6, 0]} style={{ pointerEvents: "none" }}>
        <div className="hub-card notranslate" translate="no">
          <span>SALA</span>
          <strong>{meeting ? "Reunión" : "Reuniones"}</strong>
        </div>
      </Html>

      {AGENTS.map((def, index) => (
        <ZoneIsland
          key={def.id}
          zone={ZONE_BY_ID[def.id]}
          kind={def.popupKind}
          hot={hotIds.has(def.id)}
          index={index}
        />
      ))}

      <Suspense fallback={null}>
        {AGENTS.map((def) => (
          <Miner
            key={def.id}
            agent={agents[def.id]}
            selected={selectedId === def.id}
            popupFlash={popupFlash}
            floorMeeting={meeting}
          />
        ))}
      </Suspense>

      {!meeting &&
        AGENTS.map((def) => (
          <ZoneCard key={`card-${def.id}`} zone={ZONE_BY_ID[def.id]} agent={agents[def.id]} />
        ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.38} scale={30} blur={2.4} far={5} color="#000" />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={false}
        enableDamping
        minPolarAngle={0.72}
        maxPolarAngle={1.08}
        minAzimuthAngle={YAW - 0.28}
        maxAzimuthAngle={YAW + 0.28}
        minDistance={14}
        maxDistance={42}
        target={[0.15, 0.12, 0.05]}
      />
    </>
  );
}
