import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HUB, LIME } from "../constants.js";

function paintCard(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 220;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c1218";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#c6ff3d";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = "#c6ff3d";
  ctx.font = "700 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = String(text || "").split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 680 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  const top = canvas.height / 2 - ((lines.length - 1) * 48) / 2;
  lines.forEach((row, i) => ctx.fillText(row, canvas.width / 2, top + i * 48));
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function InstructCue({ brief, agents }) {
  const { camera } = useThree();
  const beam = useRef();
  const pulse = useRef();
  const card = useRef();
  const from = useRef(new THREE.Vector3());
  const to = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const text = brief?.text || "";
  const map = useMemo(() => (text ? paintCard(text) : null), [text]);
  useEffect(() => () => map?.dispose(), [map]);

  useFrame(() => {
    const chief = agents?.chief;
    const bot = brief ? agents?.[brief.id] : null;
    if (!beam.current || !pulse.current || !card.current || !chief || !bot) return;
    const age = performance.now() - (brief.at || 0);
    const fade = age > 1550 ? Math.max(0, 1 - (age - 1550) / 400) : 1;
    from.current.set(chief.x, 1.25, chief.z);
    to.current.set(bot.x, 1.05, bot.z);
    dir.current.copy(to.current).sub(from.current);
    const len = Math.max(0.2, dir.current.length());
    dir.current.multiplyScalar(1 / len);
    beam.current.position.copy(from.current).addScaledVector(dir.current, len / 2);
    beam.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.current);
    beam.current.scale.set(1, len, 1);
    beam.current.material.opacity = 0.35 + 0.4 * fade;
    const travel = (age % 650) / 650;
    pulse.current.position.copy(from.current).lerp(to.current, travel);
    pulse.current.material.opacity = fade;
    const away = dir.current.set(bot.x - HUB.x, 0, bot.z - HUB.z);
    if (away.lengthSq() < 0.04) away.set(1, 0, 0);
    away.normalize().multiplyScalar(0.78);
    card.current.position.set(bot.x + away.x, 1.48, bot.z + away.z);
    card.current.lookAt(camera.position);
    card.current.material.opacity = fade;
  });

  if (!brief || !map || !agents?.[brief.id] || !agents?.chief) return null;
  return (
    <group>
      <mesh ref={beam}>
        <cylinderGeometry args={[0.012, 0.012, 1, 8]} />
        <meshBasicMaterial color={LIME} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={LIME} transparent opacity={1} toneMapped={false} />
      </mesh>
      <mesh ref={card}>
        <planeGeometry args={[1.55, 0.44]} />
        <meshBasicMaterial map={map} transparent opacity={1} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
