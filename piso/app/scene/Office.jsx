import { Suspense, useMemo } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AGENTS, YAW, ZONE_BY_ID } from "../constants.js";
import { DeskTag } from "./DeskTag.jsx";
import { DemoCamera, DocCarry } from "./DemoFocus.jsx";
import { Hub, Walkways, ZoneIsland } from "./Furniture.jsx";
import { InstructCue } from "./InstructCue.jsx";
import { Miner } from "./Miner.jsx";
import { openDeskPreview } from "../DemoChrome.jsx";

export function Office({ agents, meeting, selectedId, handoff, demoRun, deskScreens, carry, brief }) {
  const hotIds = useMemo(() => {
    const ids = new Set();
    if (handoff?.from) ids.add(handoff.from);
    if (handoff?.to) ids.add(handoff.to);
    if (demoRun?.agentId) ids.add(demoRun.agentId);
    return ids;
  }, [handoff, demoRun]);

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
      <Hub meeting={meeting} focusId={brief?.id || null} />

      {AGENTS.map((def, index) => (
        <ZoneIsland
          key={def.id}
          zone={ZONE_BY_ID[def.id]}
          kind={def.popupKind}
          hot={hotIds.has(def.id)}
          index={index}
          screen={deskScreens?.[def.id]}
          quiet={!!demoRun?.split && !hotIds.has(def.id)}
          mark={!!demoRun?.split && hotIds.has(def.id)}
          onMonitor={() => openDeskPreview(def.id)}
        />
      ))}

      <Suspense fallback={null}>
        {AGENTS.map((def) => (
          <Miner
            key={def.id}
            agent={agents[def.id]}
            selected={selectedId === def.id}
          />
        ))}
      </Suspense>

      {AGENTS.map((def) => (
        <DeskTag key={`tag-${def.id}`} zone={ZONE_BY_ID[def.id]} agent={agents[def.id]} />
      ))}

      <DocCarry carry={carry} agents={agents} />
      <InstructCue brief={brief} agents={agents} />
      {demoRun?.split && demoRun.focus && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[demoRun.focus.x, -0.02, demoRun.focus.z]}>
            <circleGeometry args={[12, 48]} />
            <meshStandardMaterial color="#1a2836" roughness={0.92} metalness={0.04} />
          </mesh>
          <pointLight
            position={[demoRun.focus.x, 3.1, demoRun.focus.z]}
            intensity={5}
            distance={11}
            decay={2}
            color="#d7e4f4"
          />
        </group>
      )}
      <DemoCamera run={demoRun} carry={carry} agents={agents} />

      <ContactShadows position={[0, 0, 0]} opacity={0.38} scale={30} blur={2.4} far={5} color="#000" />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={false}
        enableDamping
        minPolarAngle={0.62}
        maxPolarAngle={1.22}
        minAzimuthAngle={YAW - 0.28}
        maxAzimuthAngle={YAW + 0.28}
        minDistance={11}
        maxDistance={42}
        target={[-0.85, 0.42, -0.2]}
      />
    </>
  );
}
