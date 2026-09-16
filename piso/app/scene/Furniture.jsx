import { useMemo } from "react";
import * as THREE from "three";
import { LIME } from "../constants.js";
import { MonitorScreen } from "./MonitorScreen.jsx";

const DESK = "#1a2822";
const DESK_EDGE = "#2d4638";
const METAL = "#2a3230";

export function OfficeRoom({ meeting }) {
  const gridTex = useMemo(() => makeGridTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#121a17" map={gridTex} roughness={0.92} metalness={0.05} />
      </mesh>

      <mesh position={[0, 2.2, -6.4]} receiveShadow>
        <boxGeometry args={[18, 4.4, 0.18]} />
        <meshStandardMaterial color="#101816" roughness={0.85} />
      </mesh>
      <mesh position={[-8.9, 2.2, 0.3]} receiveShadow>
        <boxGeometry args={[0.18, 4.4, 13.6]} />
        <meshStandardMaterial color="#101816" roughness={0.85} />
      </mesh>
      <mesh position={[8.9, 2.2, 0.3]} receiveShadow>
        <boxGeometry args={[0.18, 4.4, 13.6]} />
        <meshStandardMaterial color="#101816" roughness={0.85} />
      </mesh>

      <mesh position={[0, 4.15, -0.2]}>
        <boxGeometry args={[16.4, 0.08, 12.2]} />
        <meshStandardMaterial color="#0c1210" roughness={0.8} transparent opacity={0.35} />
      </mesh>

      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, 4.05, -0.2]}>
          <boxGeometry args={[0.12, 0.16, 12]} />
          <meshStandardMaterial color="#1c2a22" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[0, 3.55, -6.28]}>
        <boxGeometry args={[10.4, 0.06, 0.06]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.04, -6.28]}>
        <boxGeometry args={[12, 0.05, 0.05]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.8} />
      </mesh>

      <BrandWall />
      <MeetingPad active={meeting} />
      <Plant position={[-8.1, 0, -5.6]} />
      <Plant position={[8.1, 0, -5.6]} />
      <ServerRack position={[-8.05, 0, 5.4]} />
      <ServerRack position={[8.05, 0, 5.4]} />
    </group>
  );
}

function BrandWall() {
  const sign = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0b1612";
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = LIME;
    ctx.font = "800 92px Segoe UI, sans-serif";
    ctx.fillText("MINECORE", 220, 130);
    ctx.fillStyle = "#8aa090";
    ctx.font = "600 28px Segoe UI, sans-serif";
    ctx.fillText("PISO OPERATIVO  ·  AGENTES EN VIVO", 220, 188);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={[0, 2.55, -6.28]}>
      <mesh>
        <planeGeometry args={[3.8, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <mesh position={[-1.45, 0.02, 0.04]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 6]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-1.45, 0.04, 0.07]}>
        <boxGeometry args={[0.08, 0.18, 0.02]} />
        <meshStandardMaterial color="#0a1208" />
      </mesh>
    </group>
  );
}

function MeetingPad({ active }) {
  return (
    <group position={[0, 0.02, 0.05]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.15, 48]} />
        <meshStandardMaterial
          color="#15241c"
          emissive={LIME}
          emissiveIntensity={active ? 0.22 : 0.05}
          roughness={0.7}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.05, 2.18, 48]} />
        <meshStandardMaterial
          color={LIME}
          emissive={LIME}
          emissiveIntensity={active ? 2.2 : 0.35}
          transparent
          opacity={active ? 1 : 0.45}
        />
      </mesh>
      {active && (
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
          <meshStandardMaterial color="#1a2822" />
        </mesh>
      )}
    </group>
  );
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.36, 10]} />
        <meshStandardMaterial color="#3a2a1c" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshStandardMaterial color="#2f6b38" />
      </mesh>
    </group>
  );
}

function ServerRack({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.55, 1.7, 0.45]} />
        <meshStandardMaterial color="#161c1a" metalness={0.3} roughness={0.45} />
      </mesh>
      {[0.35, 0.55, 0.75, 0.95, 1.15].map((y, i) => (
        <mesh key={y} position={[0.22, y, 0.0]}>
          <boxGeometry args={[0.04, 0.06, 0.3]} />
          <meshStandardMaterial
            color={i % 2 ? LIME : "#5dffa8"}
            emissive={i % 2 ? LIME : "#5dffa8"}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Desk({ x, z, kind, popup }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.08, 0.92]} />
        <meshStandardMaterial color={DESK} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[1.85, 0.015, 0.92]} />
        <meshStandardMaterial color={DESK_EDGE} />
      </mesh>
      <mesh position={[0, 0.735, 0.46]}>
        <boxGeometry args={[1.85, 0.03, 0.02]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.7} />
      </mesh>
      {[
        [-0.8, -0.38],
        [0.8, -0.38],
        [-0.8, 0.38],
        [0.8, 0.38],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.36, lz]}>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshStandardMaterial color={METAL} metalness={0.35} roughness={0.45} />
        </mesh>
      ))}

      <mesh position={[0, 1.12, -0.28]}>
        <boxGeometry args={[1.12, 0.72, 0.06]} />
        <meshStandardMaterial color="#243640" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, -0.22]}>
        <boxGeometry args={[0.14, 0.16, 0.08]} />
        <meshStandardMaterial color="#243640" />
      </mesh>
      <MonitorScreen kind={kind} text={popup} />

      <mesh position={[0, 0.78, 0.12]} castShadow>
        <boxGeometry args={[0.52, 0.025, 0.18]} />
        <meshStandardMaterial color="#1a1f22" />
      </mesh>
      <mesh position={[0.38, 0.78, 0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      <group position={[0, 0, 0.72]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 0.08, 0.42]} />
          <meshStandardMaterial color="#22302a" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color={METAL} />
        </mesh>
        <mesh position={[0, 0.68, -0.16]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.42, 0.36, 0.05]} />
          <meshStandardMaterial color="#1b2621" />
        </mesh>
      </group>
    </group>
  );
}

function makeGridTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#121a17";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(184,255,60,0.10)";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
