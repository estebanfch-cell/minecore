import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LIME, LOOKS, STATUS_COLOR } from "../constants.js";

const VEST = "#ff7a18";
const HAT = "#f5f7f4";
const NAVY = "#1b2438";

function HexLogo({ position }) {
  return (
    <mesh position={position} rotation={[0.15, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.02, 6]} />
      <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.45} roughness={0.3} />
    </mesh>
  );
}

function Accessory({ kind, walking }) {
  if (kind === "phone") {
    return (
      <mesh position={[0.34, 0.92, 0.14]} rotation={[0.2, 0.4, 0.15]}>
        <boxGeometry args={[0.08, 0.14, 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.35} metalness={0.4} />
      </mesh>
    );
  }
  if (kind === "clipboard") {
    return (
      <mesh position={[-0.36, 0.95, 0.16]} rotation={[0.15, 0.2, 0.1]}>
        <boxGeometry args={[0.16, 0.22, 0.02]} />
        <meshStandardMaterial color="#1b1b1b" />
      </mesh>
    );
  }
  if (kind === "gavel") {
    return (
      <group position={[0.38, 0.98, 0.12]} rotation={[0.2, 0, 0.4]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
      </group>
    );
  }
  if (kind === "paper") {
    return (
      <mesh position={[0.32, 0.96, 0.14]} rotation={[0.1, 0.15, 0.05]}>
        <boxGeometry args={[0.1, 0.16, 0.01]} />
        <meshStandardMaterial color="#f4f4f0" />
      </mesh>
    );
  }
  if (kind === "coins") {
    return (
      <group position={[0.32, 1.0, 0.12]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 12]} />
            <meshStandardMaterial color="#e6c15a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  }
  if (kind === "megaphone") {
    return (
      <group position={[0.4, 1.05, 0.16]} rotation={[0, 0.6, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.07, 0.16, 10]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        <mesh position={[0, -0.04, 0.05]}>
          <boxGeometry args={[0.04, 0.06, 0.03]} />
          <meshStandardMaterial color="#e23b3b" />
        </mesh>
      </group>
    );
  }
  if (kind === "scanner") {
    return (
      <group position={[0.36, 0.98, 0.14]} rotation={[0.4, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 0.12, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.02, 0.1]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={walking ? "#ff3b3b" : "#5dffa8"} emissive={walking ? "#ff3b3b" : "#5dffa8"} emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }
  return null;
}

export function Miner({ agent }) {
  const root = useRef();
  const display = useRef(new THREE.Vector3(agent.x, 0, agent.z));
  const leftLeg = useRef();
  const rightLeg = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const body = useRef();
  const look = LOOKS[agent.id];
  const shirt = look.coverall ? VEST : look.shirt;

  useFrame((_, dt) => {
    if (!root.current) return;
    const target = new THREE.Vector3(agent.x, 0, agent.z);
    const dist = display.current.distanceTo(target);
    const speed = agent.meeting ? 2.4 : 2.1;
    display.current.lerp(target, 1 - Math.exp(-speed * dt * 3.2));
    root.current.position.copy(display.current);

    const moving = dist > 0.06 || agent.walking;
    const t = performance.now() / 1000;
    const walk = moving ? Math.sin(t * 9) : 0;
    const type = !moving && agent.typing ? Math.sin(t * 14) : 0;

    if (leftLeg.current && rightLeg.current) {
      leftLeg.current.rotation.x = moving ? walk * 0.7 : 0.08;
      rightLeg.current.rotation.x = moving ? -walk * 0.7 : 0.08;
    }
    if (leftArm.current && rightArm.current) {
      leftArm.current.rotation.x = moving ? -walk * 0.55 : 1.15 + type * 0.18;
      rightArm.current.rotation.x = moving ? walk * 0.55 : 1.05 - type * 0.22;
    }
    if (body.current) {
      body.current.position.y = moving ? 0.72 + Math.abs(walk) * 0.04 : 0.7 + (agent.typing ? Math.abs(type) * 0.012 : 0);
    }

    const dx = target.x - display.current.x;
    const dz = target.z - display.current.z;
    if (moving && (Math.abs(dx) + Math.abs(dz) > 0.02)) {
      const yaw = Math.atan2(dx, dz);
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, yaw, 0.15);
    } else {
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, 0, 0.08);
    }
  });

  return (
    <group ref={root} position={[agent.x, 0, agent.z]}>
      <group ref={body} position={[0, 0.7, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.2, 0.38, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.55} />
        </mesh>
        {look.vest && (
          <mesh castShadow position={[0, 0.02, 0.02]}>
            <boxGeometry args={[0.42, 0.42, 0.28]} />
            <meshStandardMaterial color={VEST} roughness={0.45} />
          </mesh>
        )}
        {look.vest && (
          <>
            <mesh position={[-0.12, 0.08, 0.165]}>
              <boxGeometry args={[0.07, 0.05, 0.01]} />
              <meshStandardMaterial color="#f2f2f2" />
            </mesh>
            <mesh position={[0.12, 0.08, 0.165]}>
              <boxGeometry args={[0.07, 0.05, 0.01]} />
              <meshStandardMaterial color="#f2f2f2" />
            </mesh>
          </>
        )}
        {look.coverall && (
          <mesh position={[0, -0.02, 0.12]}>
            <boxGeometry args={[0.16, 0.08, 0.02]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
        )}
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.28, 0.08, 0.16]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
      </group>

      <group ref={leftArm} position={[-0.28, 0.95, 0]}>
        <mesh castShadow position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.28, 0.95, 0]}>
        <mesh castShadow position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      </group>

      <group ref={leftLeg} position={[-0.1, 0.42, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.065, 0.28, 4, 8]} />
          <meshStandardMaterial color={look.coverall ? VEST : NAVY} />
        </mesh>
        <mesh position={[0, -0.38, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.07, 0.18]} />
          <meshStandardMaterial color="#2b1d12" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.1, 0.42, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.065, 0.28, 4, 8]} />
          <meshStandardMaterial color={look.coverall ? VEST : NAVY} />
        </mesh>
        <mesh position={[0, -0.38, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.07, 0.18]} />
          <meshStandardMaterial color="#2b1d12" />
        </mesh>
      </group>

      <group position={[0, 1.22, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.175, 16, 16]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        <mesh position={[-0.055, 0.03, 0.15]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.055, 0.03, 0.15]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.04, 0.16]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#c97b7b" />
        </mesh>
        {look.hairStyle === "bob" && (
          <mesh position={[0, 0.02, -0.02]}>
            <sphereGeometry args={[0.195, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
        )}
        {look.hairStyle !== "bob" && (
          <mesh position={[0, 0.06, -0.01]} scale={[1, 0.45, 1]}>
            <sphereGeometry args={[0.17, 12, 10]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
        )}
        {look.glasses && (
          <group position={[0, 0.03, 0.16]}>
            <mesh position={[-0.055, 0, 0]}>
              <torusGeometry args={[0.04, 0.008, 6, 12]} />
              <meshStandardMaterial color="#222" metalness={0.4} />
            </mesh>
            <mesh position={[0.055, 0, 0]}>
              <torusGeometry args={[0.04, 0.008, 6, 12]} />
              <meshStandardMaterial color="#222" metalness={0.4} />
            </mesh>
          </group>
        )}
        {look.beard && (
          <mesh position={[0, -0.1, 0.1]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        )}
        {look.mustache && (
          <mesh position={[0, -0.03, 0.165]} scale={[1.3, 0.35, 0.4]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#3a2418" />
          </mesh>
        )}

        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={HAT} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.03, 8, 20]} />
          <meshStandardMaterial color={HAT} roughness={0.35} />
        </mesh>
        <HexLogo position={[0, 0.28, 0.1]} />
      </group>

      <Accessory kind={look.accessory} walking={agent.walking} />

      <Html position={[0, 2.02, 0]} center distanceFactor={10} zIndexRange={[20, 0]}>
        <div className="agent-tag">
          <div className="nm">{agent.name}</div>
          <span className={`chip ${agent.status}`}>{agent.status}</span>
        </div>
      </Html>
      {agent.bubble && (
        <Html position={[0, 2.28, 0.1]} center distanceFactor={8} zIndexRange={[30, 0]}>
          <div className="speech">{agent.bubble}</div>
        </Html>
      )}
      <pointLight
        position={[0, 1.55, 0.1]}
        color={STATUS_COLOR[agent.status] || LIME}
        intensity={0.18}
        distance={1.8}
      />
    </group>
  );
}
