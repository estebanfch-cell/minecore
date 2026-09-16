import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html, Trail } from "@react-three/drei";
import * as THREE from "three";
import { LIME, LOOKS, TAG_OFFSET, actionVerb } from "../constants.js";
import { useAvatarTexture } from "./useAvatarTexture.js";

export function Miner({ agent }) {
  const root = useRef();
  const display = useRef(new THREE.Vector3(agent.x, 0, agent.z));
  const sprite = useRef();
  const look = LOOKS[agent.id];
  const texture = useAvatarTexture(agent.id);
  const tag = TAG_OFFSET[agent.id] || [0.65, 0.1];
  const verb = actionVerb(agent);

  useFrame((_, dt) => {
    if (!root.current) return;
    const target = new THREE.Vector3(agent.x, 0, agent.z);
    const dist = display.current.distanceTo(target);
    const speed = agent.meeting ? 2.5 : 2.15;
    display.current.lerp(target, 1 - Math.exp(-speed * dt * 3.2));
    root.current.position.x = display.current.x;
    root.current.position.z = display.current.z;

    const moving = dist > 0.06 || agent.walking;
    const seated = !moving && !agent.meeting;
    const t = performance.now() / 1000;
    const walk = moving ? Math.sin(t * 10) : 0;
    const type = seated && agent.typing ? Math.sin(t * 16) : 0;

    root.current.position.y = seated ? 0 : moving ? Math.abs(walk) * 0.07 : 0.04;

    if (sprite.current) {
      const base = seated ? 0.82 : 1.02;
      sprite.current.position.y = base + (seated ? Math.abs(type) * 0.025 : Math.abs(walk) * 0.05);
      sprite.current.rotation.z = moving ? walk * 0.08 : type * 0.03;
      const s = seated ? 0.92 : 1;
      sprite.current.scale.setScalar(s);
    }

    const dx = target.x - display.current.x;
    const dz = target.z - display.current.z;
    if (moving && Math.abs(dx) + Math.abs(dz) > 0.02) {
      root.current.rotation.y = THREE.MathUtils.lerp(
        root.current.rotation.y,
        Math.atan2(dx, dz),
        0.16
      );
    } else {
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, 0, 0.1);
    }
  });

  const moving = agent.walking;
  const aspect = texture
    ? texture.image.width / texture.image.height
    : 0.72;
  const h = 1.42;
  const w = h * aspect;

  return (
    <group ref={root} position={[agent.x, 0, agent.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color="#0c1010" transparent opacity={0.45} />
      </mesh>

      <mesh position={[0, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.22, 6, 10]} />
        <meshStandardMaterial color={look.coverall ? "#ff7a18" : look.shirt} roughness={0.55} />
      </mesh>

      <group ref={sprite}>
        <Billboard follow lockX={false} lockZ={false}>
          {texture ? (
            <mesh>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial
                map={texture}
                transparent
                alphaTest={0.12}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ) : (
            <mesh>
              <circleGeometry args={[0.28, 16]} />
              <meshBasicMaterial color={look.shirt} />
            </mesh>
          )}
        </Billboard>
      </group>

      {moving && (
        <Trail width={0.55} length={4} color={LIME} attenuation={(v) => v * v}>
          <mesh position={[0, 0.12, -0.05]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={LIME} transparent opacity={0.85} />
          </mesh>
        </Trail>
      )}

      <Html position={[tag[0], 1.55 + tag[1], 0.12]} center distanceFactor={10} zIndexRange={[22, 0]}>
        <div className={`agent-tag ${agent.walking ? "is-walk" : ""} ${agent.meeting ? "is-meet" : ""}`}>
          <div className="nm">{agent.name}</div>
          <div className="verb">{verb}</div>
          <span className={`chip ${agent.status}`}>{agent.status}</span>
        </div>
      </Html>
      {agent.bubble && (
        <Html position={[0, 1.95, 0.15]} center distanceFactor={8} zIndexRange={[30, 0]}>
          <div className="speech">{agent.bubble}</div>
        </Html>
      )}
    </group>
  );
}
