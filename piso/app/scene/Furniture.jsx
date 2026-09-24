import { RoundedBox } from "@react-three/drei";
import {
  DESK_LOCAL_Z,
  HUB,
  LIME,
  PLATFORM_TOP,
  POPUP_META,
  ROOM,
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
  const s = zone.scale || 1;
  const furniture = (
    <group position={[0, PLATFORM_TOP, 0]}>
      <Chair />
      <Desk kind={kind} accent={zone.accent} />
      <Props accent={zone.accent} flip={index % 2 === 0} />
    </group>
  );
  if (zone.ring === "hub") {
    return (
      <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]} scale={[s, 1, s]}>
        {furniture}
      </group>
    );
  }
  return (
    <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]} scale={[s, 1, s]}>
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
      <pointLight position={[0, 1.6, 0]} color={zone.accent} intensity={hot ? 0.55 : 0.22} distance={3.4} />
      {furniture}
    </group>
  );
}

function Wall({ args, position, glass }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#1c2636" roughness={0.62} metalness={0.16} />
      </mesh>
      <mesh position={[0, args[1] / 2 + 0.025, 0]}>
        <boxGeometry args={[args[0], 0.045, args[2]]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.35} />
      </mesh>
      {glass && (
        <mesh position={[0, args[1] / 2 + 0.28, 0]}>
          <boxGeometry args={args[0] >= args[2] ? [args[0], 0.46, 0.035] : [0.035, 0.46, args[2]]} />
          <meshStandardMaterial
            color="#b7c6d6"
            transparent
            opacity={0.22}
            roughness={0.08}
            metalness={0.15}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function Hub({ meeting }) {
  const { halfX, halfZ, door } = ROOM;
  const wallH = 0.86;
  const wallT = 0.08;
  const y = PLATFORM_TOP + wallH / 2;
  const jamb = halfX - door;
  const floorW = halfX * 2;
  const floorD = halfZ * 2;

  return (
    <group position={[HUB.x, 0, HUB.z]} rotation={[0, YAW, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[1.7, 28]} />
        <meshBasicMaterial color="#000" transparent opacity={0.32} />
      </mesh>
      <RoundedBox args={[floorW + 0.14, 0.055, floorD + 0.14]} radius={0.06} smoothness={2} position={[0, 0.05, 0]}>
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={meeting ? 0.45 : 0.16} />
      </RoundedBox>
      <RoundedBox
        args={[floorW, SLAB_H, floorD]}
        radius={0.05}
        smoothness={2}
        position={[0, PLATFORM_TOP - SLAB_H / 2, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#121820" metalness={0.18} roughness={0.62} />
      </RoundedBox>

      <group position={[0, PLATFORM_TOP, -0.4]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.9, 0.045, 0.36]} />
          <meshStandardMaterial color="#0e141c" roughness={0.4} metalness={0.25} />
        </mesh>
        {[
          [-0.42, -0.22],
          [0.42, -0.22],
          [-0.42, 0.22],
          [0.42, 0.22],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.16, z]}>
            <boxGeometry args={[0.04, 0.3, 0.04]} />
            <meshStandardMaterial color="#0a0e14" />
          </mesh>
        ))}
      </group>

      <Wall args={[floorW, wallH, wallT]} position={[0, y, -halfZ]} glass />
      <Wall args={[wallT, wallH, floorD]} position={[-halfX, y, 0]} glass />
      <Wall args={[wallT, wallH, floorD]} position={[halfX, y, 0]} glass />
      <Wall args={[jamb, wallH, wallT]} position={[-(door + jamb / 2), y, halfZ]} />
      <Wall args={[jamb, wallH, wallT]} position={[door + jamb / 2, y, halfZ]} />
      <mesh position={[0, PLATFORM_TOP + wallH - 0.05, halfZ]} castShadow>
        <boxGeometry args={[door * 2 + 0.16, 0.1, wallT + 0.02]} />
        <meshStandardMaterial color="#243044" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, PLATFORM_TOP + 0.02, halfZ + 0.28]} receiveShadow>
        <boxGeometry args={[door * 2 + 0.2, 0.04, 0.55]} />
        <meshStandardMaterial color="#1a2433" roughness={0.7} />
      </mesh>

      <pointLight position={[0, 1.7, 0]} color={LIME} intensity={meeting ? 0.85 : 0.22} distance={3.4} />
    </group>
  );
}

export function Walkways({ hotIds }) {
  return (
    <group>
      {ZONES.filter((zone) => zone.ring !== "hub").map((zone) => {
        const dx = zone.position.x - HUB.x;
        const dz = zone.position.z - HUB.z;
        const len = Math.hypot(dx, dz) || 1;
        const rot = Math.atan2(dx, dz);
        const hot = hotIds?.has(zone.id);
        const startR = zone.ring === "outer" ? 5.05 : 2.05;
        const endR = Math.max(startR + 0.35, len - 1.05);
        const mid = (startR + endR) / 2;
        const span = endR - startR;
        return (
          <group key={zone.id} position={[(dx / len) * mid, 0.08, (dz / len) * mid]} rotation={[0, rot, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.42, 0.06, span]} />
              <meshStandardMaterial color="#121820" metalness={0.25} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.045, 0.015, Math.max(0.2, span - 0.18)]} />
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
