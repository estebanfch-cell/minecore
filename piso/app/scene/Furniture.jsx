import { LIME } from "../constants.js";
import { MonitorScreen } from "./MonitorScreen.jsx";

const DESK_TOP = "#f3ece1";
const DESK_EDGE = "#ddd4c6";
const LEG = "#1b1d20";

export function Platform({ meeting }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]} receiveShadow>
        <circleGeometry args={[20, 48]} />
        <meshStandardMaterial color="#0a0e12" roughness={1} />
      </mesh>

      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6.55, 6.85, 0.58, 6]} />
        <meshStandardMaterial color="#161c18" roughness={0.72} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 6.4, 0.06, 6]} />
        <meshStandardMaterial color="#2a332c" roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[6.72, 6.72, 0.1, 6]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1.15} />
      </mesh>
      <pointLight position={[0, -0.05, 0]} color={LIME} intensity={0.9} distance={11} />
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.025, 0]} receiveShadow>
        <circleGeometry args={[6.12, 6]} />
        <meshStandardMaterial color="#334038" roughness={0.78} />
      </mesh>
      <gridHelper args={[10.2, 14, "#4a6a38", "#314034"]} position={[0, 0.04, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0.12]}>
        <circleGeometry args={[1.5, 40]} />
        <meshStandardMaterial
          color="#1a261e"
          emissive={LIME}
          emissiveIntensity={meeting ? 0.32 : 0.05}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0.12]}>
        <ringGeometry args={[1.4, 1.56, 40]} />
        <meshStandardMaterial
          color={LIME}
          emissive={LIME}
          emissiveIntensity={meeting ? 2 : 0.3}
          transparent
          opacity={meeting ? 1 : 0.45}
        />
      </mesh>
      <mesh position={[0, 0.055, 0.12]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 6]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.55} />
      </mesh>

      <Plant position={[-4.6, 0, -3.4]} />
      <Plant position={[4.7, 0, -3.2]} />
      <Plant position={[-4.8, 0, 3.3]} scale={0.85} />
      <Plant position={[4.55, 0, 3.45]} />
      <Crate position={[-5.15, 0, 0.2]} />
      <Crate position={[5.2, 0, -0.4]} rot={0.4} />
      <MiniLamp position={[-3.9, 0, 4.4]} />
    </group>
  );
}

function Plant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.17, 0.28, 10]} />
        <meshStandardMaterial color="#6a4a32" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <sphereGeometry args={[0.24, 10, 10]} />
        <meshStandardMaterial color="#2f7a3c" />
      </mesh>
      <mesh position={[0.1, 0.62, 0.04]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#3a8f48" />
      </mesh>
    </group>
  );
}

function Crate({ position, rot = 0 }) {
  return (
    <mesh position={[position[0], 0.16, position[2]]} rotation={[0, rot, 0]} castShadow>
      <boxGeometry args={[0.42, 0.32, 0.32]} />
      <meshStandardMaterial color="#3a2a1c" roughness={0.8} />
    </mesh>
  );
}

function MiniLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#2a2e32" />
      </mesh>
      <mesh position={[0, 0.58, 0.08]} rotation={[0.6, 0, 0]}>
        <coneGeometry args={[0.12, 0.16, 10]} />
        <meshStandardMaterial color="#c8c4b8" />
      </mesh>
      <pointLight position={[0, 0.5, 0.15]} color="#ffd9a0" intensity={0.45} distance={2.4} />
    </group>
  );
}

export function Desk({ x, z, kind, popup }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.58, 0.05, 0.8]} />
        <meshStandardMaterial color={DESK_TOP} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.59, 0]}>
        <boxGeometry args={[1.58, 0.02, 0.8]} />
        <meshStandardMaterial color={DESK_EDGE} />
      </mesh>
      {[
        [-0.7, -0.32],
        [0.7, -0.32],
        [-0.7, 0.32],
        [0.7, 0.32],
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
      <MonitorScreen kind={kind} text={popup} position={[0, 0.98, -0.235]} />
      <pointLight position={[0, 0.95, 0.08]} color="#9ad8ff" intensity={0.62} distance={1.7} />

      <mesh position={[0, 0.655, 0.1]}>
        <boxGeometry args={[0.44, 0.016, 0.16]} />
        <meshStandardMaterial color="#2a2e32" />
      </mesh>
      <mesh position={[0.42, 0.655, 0.18]}>
        <cylinderGeometry args={[0.028, 0.028, 0.02, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.55, 0.66, 0.16]}>
        <cylinderGeometry args={[0.05, 0.045, 0.07, 12]} />
        <meshStandardMaterial color="#c45c3a" />
      </mesh>
      <mesh position={[0.58, 0.68, -0.02]}>
        <boxGeometry args={[0.16, 0.03, 0.2]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh position={[0.62, 0.71, -0.01]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.18]} />
        <meshStandardMaterial color="#e8e2d6" />
      </mesh>
      <mesh position={[-0.62, 0.7, -0.08]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#2f7a3c" />
      </mesh>

      <group position={[0, 0, 0.64]}>
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
