import { LIME } from "../constants.js";
import { MonitorScreen } from "./MonitorScreen.jsx";

const DESK_TOP = "#efe8dc";
const DESK_EDGE = "#d9d0c2";
const LEG = "#1b1d20";

export function Platform({ meeting }) {
  return (
    <group>
      <mesh position={[0, -0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[9.55, 9.85, 0.52, 6]} />
        <meshStandardMaterial color="#101612" roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[9.4, 9.4, 0.05, 6]} />
        <meshStandardMaterial color="#1c2620" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[9.72, 9.72, 0.08, 6]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1.05} />
      </mesh>
      <pointLight position={[0, -0.1, 0]} color={LIME} intensity={0.8} distance={14} />
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[9.1, 6]} />
        <meshStandardMaterial color="#2a362f" roughness={0.82} />
      </mesh>
      <gridHelper args={[15.2, 16, "#3d5a30", "#2a3a28"]} position={[0, 0.03, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0.15]}>
        <circleGeometry args={[1.45, 40]} />
        <meshStandardMaterial
          color="#18241c"
          emissive={LIME}
          emissiveIntensity={meeting ? 0.28 : 0.04}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0.15]}>
        <ringGeometry args={[1.38, 1.5, 40]} />
        <meshStandardMaterial
          color={LIME}
          emissive={LIME}
          emissiveIntensity={meeting ? 1.8 : 0.25}
          transparent
          opacity={meeting ? 1 : 0.4}
        />
      </mesh>
    </group>
  );
}

export function Desk({ x, z, kind }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.05, 0.78]} />
        <meshStandardMaterial color={DESK_TOP} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.59, 0]}>
        <boxGeometry args={[1.55, 0.02, 0.78]} />
        <meshStandardMaterial color={DESK_EDGE} />
      </mesh>
      {[
        [-0.68, -0.3],
        [0.68, -0.3],
        [-0.68, 0.3],
        [0.68, 0.3],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.3, lz]}>
          <boxGeometry args={[0.045, 0.6, 0.045]} />
          <meshStandardMaterial color={LEG} metalness={0.25} roughness={0.45} />
        </mesh>
      ))}

      <mesh position={[0, 0.98, -0.26]}>
        <boxGeometry args={[0.92, 0.58, 0.04]} />
        <meshStandardMaterial color="#15191c" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.66, -0.22]}>
        <boxGeometry args={[0.1, 0.12, 0.06]} />
        <meshStandardMaterial color="#15191c" />
      </mesh>
      <MonitorScreen kind={kind} position={[0, 0.98, -0.235]} />
      <pointLight position={[0, 0.95, 0.05]} color="#9ad8ff" intensity={0.55} distance={1.6} />

      <mesh position={[0, 0.655, 0.08]}>
        <boxGeometry args={[0.42, 0.015, 0.16]} />
        <meshStandardMaterial color="#2a2e32" />
      </mesh>

      <group position={[0, 0, 0.62]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.36, 0.05, 0.36]} />
          <meshStandardMaterial color="#ece6da" />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial color={LEG} />
        </mesh>
        <mesh position={[0, 0.55, -0.12]} rotation={[0.28, 0, 0]}>
          <boxGeometry args={[0.36, 0.28, 0.035]} />
          <meshStandardMaterial color="#e4ddd0" />
        </mesh>
      </group>
    </group>
  );
}
