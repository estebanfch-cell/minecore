import { RoundedBox } from "@react-three/drei";
import {
  DESK_LOCAL_Z,
  HUB,
  LIME,
  PLATFORM_TOP,
  POPUP_META,
  SEAT_LOCAL_Z,
  YAW,
  ZONES,
  mixHex,
} from "../constants.js";
import { MonitorScreen } from "./MonitorScreen.jsx";

const SLAB_W = 3.45;
const SLAB_D = 2.55;
const SLAB_H = 0.28;

function Desk({ kind, accent }) {
  const meta = POPUP_META[kind] || { accent };
  return (
    <group position={[0, 0, DESK_LOCAL_Z]}>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 0.045, 0.64]} />
        <meshStandardMaterial color="#121822" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[1.22, 0.03, 0.58]} />
        <meshStandardMaterial color="#0c1118" />
      </mesh>
      {[
        [-0.54, -0.24],
        [0.54, -0.24],
        [-0.54, 0.24],
        [0.54, 0.24],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
          <boxGeometry args={[0.04, 0.42, 0.04]} />
          <meshStandardMaterial color="#0a0e14" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[0.02, 0.74, 0.18]} castShadow>
        <boxGeometry args={[0.78, 0.48, 0.04]} />
        <meshStandardMaterial color="#07090d" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.5, 0.16]}>
        <boxGeometry args={[0.07, 0.08, 0.05]} />
        <meshStandardMaterial color="#07090d" />
      </mesh>
      <group position={[0.02, 0.74, 0.205]} rotation={[-0.22, 0, 0]}>
        <MonitorScreen kind={kind} />
      </group>
      <pointLight position={[0.02, 0.7, 0.42]} color={meta.accent} intensity={0.7} distance={2.2} />

      <mesh position={[0.08, 0.495, -0.06]}>
        <boxGeometry args={[0.36, 0.016, 0.12]} />
        <meshStandardMaterial color="#0e141c" />
      </mesh>
      <mesh position={[-0.4, 0.492, 0]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[0.18, 0.01, 0.24]} />
        <meshStandardMaterial color="#d5dee8" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0, SEAT_LOCAL_Z]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.38, 0.055, 0.36]} />
        <meshStandardMaterial color="#1a2230" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.22, 8]} />
        <meshStandardMaterial color="#0c1016" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, -0.16]} castShadow>
        <boxGeometry args={[0.38, 0.4, 0.045]} />
        <meshStandardMaterial color="#243044" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Props({ accent, flip }) {
  const side = flip ? -1 : 1;
  return (
    <group>
      <group position={[1.15 * side, 0, -0.72]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.16, 8]} />
          <meshStandardMaterial color="#1a120e" />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.15, 10, 8]} />
          <meshStandardMaterial color={mixHex("#14301c", accent, 0.35)} />
        </mesh>
      </group>
      <mesh position={[-1.05 * side, 0.18, 0.35]} castShadow>
        <boxGeometry args={[0.4, 0.36, 0.34]} />
        <meshStandardMaterial color="#121820" metalness={0.25} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function ZoneIsland({ zone, kind, hot, index }) {
  const top = mixHex("#2a3548", zone.accent, 0.58);
  const side = mixHex("#1c2636", zone.accent, 0.42);
  return (
    <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[2.15, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      <RoundedBox args={[SLAB_W + 0.08, 0.07, SLAB_D + 0.08]} radius={0.08} smoothness={3} position={[0, 0.05, 0]}>
        <meshStandardMaterial color={zone.accent} emissive={zone.accent} emissiveIntensity={hot ? 0.85 : 0.45} />
      </RoundedBox>
      <RoundedBox
        args={[SLAB_W, SLAB_H, SLAB_D]}
        radius={0.1}
        smoothness={3}
        position={[0, PLATFORM_TOP - SLAB_H / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={side} roughness={0.62} metalness={0.18} />
      </RoundedBox>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM_TOP + 0.01, 0]} receiveShadow>
        <planeGeometry args={[SLAB_W - 0.18, SLAB_D - 0.18]} />
        <meshStandardMaterial color={top} roughness={0.78} metalness={0.08} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color={zone.accent} intensity={hot ? 0.7 : 0.28} distance={4.2} />
      <group position={[0, PLATFORM_TOP, 0]}>
        <Chair />
        <Desk kind={kind} accent={zone.accent} />
        <Props accent={zone.accent} flip={index % 2 === 0} />
      </group>
    </group>
  );
}

export function Hub({ meeting }) {
  return (
    <group position={[HUB.x, 0, HUB.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[2.3, 28]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <RoundedBox args={[3.15, 0.08, 3.15]} radius={0.12} smoothness={3} position={[0, 0.06, 0]}>
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={meeting ? 0.9 : 0.28} />
      </RoundedBox>
      <RoundedBox args={[2.95, SLAB_H, 2.95]} radius={0.14} smoothness={3} position={[0, PLATFORM_TOP - SLAB_H / 2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#141a24" metalness={0.22} roughness={0.55} />
      </RoundedBox>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM_TOP + 0.012, 0]}>
        <ringGeometry args={[0.72, 0.86, 40]} />
        <meshBasicMaterial color={LIME} transparent opacity={meeting ? 0.95 : 0.45} toneMapped={false} />
      </mesh>
      <mesh position={[0, PLATFORM_TOP + 0.08, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
        <meshStandardMaterial color="#0e1410" emissive={LIME} emissiveIntensity={meeting ? 1.4 : 0.45} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color={LIME} intensity={meeting ? 1.3 : 0.45} distance={6} />
    </group>
  );
}

export function Walkways({ hotIds }) {
  return (
    <group>
      {ZONES.map((zone) => {
        const dx = zone.position.x - HUB.x;
        const dz = zone.position.z - HUB.z;
        const len = Math.hypot(dx, dz);
        const rot = Math.atan2(dx, dz);
        const hot = hotIds?.has(zone.id);
        return (
          <group key={zone.id} position={[HUB.x + dx / 2, 0.1, HUB.z + dz / 2]} rotation={[0, rot, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.62, 0.08, len - 1.7]} />
              <meshStandardMaterial color="#121820" metalness={0.25} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <boxGeometry args={[0.06, 0.02, len - 2.1]} />
              <meshStandardMaterial
                color={hot ? zone.accent : "#9fb4c8"}
                emissive={hot ? zone.accent : "#7f93a8"}
                emissiveIntensity={hot ? 1.1 : 0.25}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
