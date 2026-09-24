import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { HOMES, HUB, LOOKS, PLATFORM_TOP, POPUP_META, YAW } from "../constants.js";
import { selectAgent } from "../store.js";
import { getMarkTexture } from "./markTexture.js";

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function Arm({ side, color, skin, armRef }) {
  return (
    <group ref={armRef} position={[side * 0.2, 0.62, 0]}>
      <mesh position={[0, -0.13, 0]} castShadow>
        <capsuleGeometry args={[0.042, 0.12, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.26, 0]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
    </group>
  );
}

export function Miner({ agent, selected, popupFlash, floorMeeting }) {
  const root = useRef();
  const chest = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const display = useRef({ x: agent.x, z: agent.z });
  const sit = useRef(1);
  const look = LOOKS[agent.id];
  const mark = getMarkTexture();
  const pants = look.coverall ? look.shirt : "#1b2130";
  const home = HOMES[agent.id];

  useFrame((_, dt) => {
    const node = root.current;
    if (!node) return;
    const d = display.current;
    const k = 1 - Math.exp(-1.45 * dt);
    d.x += (agent.x - d.x) * k;
    d.z += (agent.z - d.z) * k;
    const dx = agent.x - d.x;
    const dz = agent.z - d.z;
    const dist = Math.hypot(dx, dz);
    const moving = dist > 0.07;
    const homeDist = Math.hypot(d.x - home.x, d.z - home.z);
    const wantSit = !moving && !agent.meeting && homeDist < 0.55;
    sit.current += ((wantSit ? 1 : 0) - sit.current) * (1 - Math.exp(-7 * dt));
    const s = sit.current;
    const time = performance.now() / 1000;
    const walk = moving ? Math.sin(time * 9) : 0;
    const type = wantSit && agent.typing ? Math.sin(time * 12) : 0;

    node.position.x = d.x;
    node.position.z = d.z;
    node.position.y = PLATFORM_TOP + (moving ? Math.abs(walk) * 0.05 : 0);
    let face = YAW;
    if (moving && dist > 0.02) face = Math.atan2(dx, dz);
    else if (agent.meeting) face = Math.atan2(HUB.x - d.x, HUB.z - d.z);
    node.rotation.y = lerpAngle(node.rotation.y, face, 1 - Math.exp(-8 * dt));

    const listening = agent.meeting && !moving;
    if (legL.current) legL.current.rotation.x = -1.15 * s + walk * (1 - s) * 0.75;
    if (legR.current) legR.current.rotation.x = -1.15 * s - walk * (1 - s) * 0.75;
    if (armL.current) armL.current.rotation.x = -1.02 * s + walk * (1 - s) * 0.7 + type * 0.32 * s;
    if (armR.current) armR.current.rotation.x = -1.02 * s - walk * (1 - s) * 0.7 - type * 0.32 * s;
    if (chest.current) {
      chest.current.position.y = -0.26 * s;
      const nod = listening && agent.id !== "chief" ? Math.sin(time * 1.7 + d.x * 2) * 0.14 : 0;
      chest.current.rotation.x = 0.1 * s + nod;
      chest.current.rotation.z = Math.sin(time * 1.35 + d.x) * 0.028;
    }
    if (listening && agent.id === "chief") {
      if (armL.current) armL.current.rotation.x = -0.35 + Math.sin(time * 2.1) * 0.28;
      if (armR.current) armR.current.rotation.x = -0.2 + Math.sin(time * 2.1 + 0.8) * 0.22;
    }
  });

  const open = (e) => {
    e.stopPropagation();
    selectAgent(agent.id);
  };
  const hover = (on) => {
    document.body.style.cursor = on ? "pointer" : "auto";
  };

  const showToast =
    popupFlash &&
    popupFlash.agentId === agent.id &&
    Date.now() - popupFlash.at < 3900;
  const toastMeta = POPUP_META[agent.popupKind] || { app: "App", accent: "#b8ff3c" };

  return (
    <group ref={root} position={[agent.x, PLATFORM_TOP, agent.z]} rotation={[0, YAW, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.26, 0.34, 24]} />
        <meshBasicMaterial
          color={selected ? "#b8ff3c" : "#9fb0c4"}
          transparent
          opacity={selected ? 0.95 : 0.28}
          toneMapped={false}
        />
      </mesh>

      <group scale={1.12}>
        <group ref={legL} position={[-0.09, 0.4, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
            <meshStandardMaterial color={pants} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.32, 0.03]}>
            <boxGeometry args={[0.09, 0.06, 0.14]} />
            <meshStandardMaterial color="#0e1116" />
          </mesh>
        </group>
        <group ref={legR} position={[0.09, 0.4, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
            <meshStandardMaterial color={pants} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.32, 0.03]}>
            <boxGeometry args={[0.09, 0.06, 0.14]} />
            <meshStandardMaterial color="#0e1116" />
          </mesh>
        </group>

        <group ref={chest}>
          <mesh position={[0, 0.56, 0]} castShadow>
            <boxGeometry args={[0.34, 0.32, 0.18]} />
            <meshStandardMaterial color={look.shirt} roughness={0.52} />
          </mesh>
          {look.vest && !look.coverall && (
            <mesh position={[0, 0.56, 0.07]}>
              <boxGeometry args={[0.26, 0.24, 0.05]} />
              <meshStandardMaterial color="#1a2333" roughness={0.55} />
            </mesh>
          )}
          {look.vest && (
            <mesh position={[0, 0.7, 0.08]}>
              <boxGeometry args={[0.1, 0.05, 0.04]} />
              <meshStandardMaterial color="#ece8df" />
            </mesh>
          )}

          <Arm side={-1} color={look.shirt} skin={look.skin} armRef={armL} />
          <Arm side={1} color={look.shirt} skin={look.skin} armRef={armR} />

          <group position={[0, 0.8, 0.02]}>
            <mesh position={[0, 0, 0.04]} castShadow>
              <sphereGeometry args={[0.105, 16, 14]} />
              <meshStandardMaterial color={look.skin} roughness={0.62} />
            </mesh>
            <mesh position={[0, 0.08, -0.02]} scale={[1.16, 0.78, 1.1]} castShadow>
              <sphereGeometry args={[0.145, 18, 14]} />
              <meshStandardMaterial color="#f7fbff" roughness={0.28} metalness={0.04} emissive="#d5deea" emissiveIntensity={0.28} />
            </mesh>
            <mesh position={[0, 0.01, 0.01]} rotation={[0.28, 0, 0]}>
              <cylinderGeometry args={[0.172, 0.172, 0.022, 18]} />
              <meshStandardMaterial color="#f7fafc" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.02, 0.12]}>
              <boxGeometry args={[0.15, 0.04, 0.02]} />
              <meshStandardMaterial color="#1a2330" metalness={0.55} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.18, 0.06]}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshStandardMaterial color="#ffe7a3" emissive="#ffbf4a" emissiveIntensity={1.8} />
            </mesh>
            <mesh position={[0, 0.09, 0.15]}>
              <circleGeometry args={[0.058, 18]} />
              <meshBasicMaterial map={mark} toneMapped={false} />
            </mesh>
            {look.beard && (
              <mesh position={[0, -0.06, 0.08]} scale={[1, 0.75, 0.7]}>
                <sphereGeometry args={[0.055, 10, 8]} />
                <meshStandardMaterial color={look.hair} roughness={0.8} />
              </mesh>
            )}
            {look.mustache && (
              <mesh position={[0, -0.035, 0.12]}>
                <boxGeometry args={[0.07, 0.018, 0.02]} />
                <meshStandardMaterial color={look.hair} />
              </mesh>
            )}
            {look.glasses && (
              <group position={[0, 0.01, 0.11]}>
                <mesh position={[-0.04, 0, 0]}>
                  <torusGeometry args={[0.028, 0.006, 6, 12]} />
                  <meshStandardMaterial color="#22262c" metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[0.04, 0, 0]}>
                  <torusGeometry args={[0.028, 0.006, 6, 12]} />
                  <meshStandardMaterial color="#22262c" metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.028, 0.008, 0.008]} />
                  <meshStandardMaterial color="#22262c" />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      <mesh
        position={[0, 0.55, 0]}
        onClick={open}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry args={[0.62, 1.15, 0.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {!floorMeeting && !agent.meeting && (
      <Html position={[0, 1.02, 0]} center distanceFactor={16} zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
        <button
          className={`id-tag notranslate ${agent.status} ${selected ? "is-on" : ""}`}
          type="button"
          translate="no"
          data-agent-id={agent.grokId}
          onClick={open}
        >
          <span className="dot" aria-hidden="true" />
          <span className="nm">{agent.name}</span>
          <span className="role">{agent.role}</span>
        </button>
      </Html>
      )}

      {showToast && (
        <Html position={[0.85, 1.15, 0.2]} center distanceFactor={12} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="app-toast notranslate" style={{ "--accent": toastMeta.accent }} translate="no">
            <span className="app-mark" />
            <div>
              <strong>{toastMeta.app}</strong>
              <em>{popupFlash.text}</em>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
