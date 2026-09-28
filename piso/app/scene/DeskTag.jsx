import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FLOOR_DOT, PLATFORM_TOP, YAW } from "../constants.js";
import { selectAgent } from "../store.js";

function paintName(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let size = 84;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const fit = () => {
    ctx.font = `700 ${size}px sans-serif`;
    return ctx.measureText(name).width;
  };
  while (fit() > 470 && size > 42) size -= 4;
  ctx.font = `700 ${size}px sans-serif`;
  ctx.strokeStyle = "rgba(5, 8, 14, 0.9)";
  ctx.lineWidth = 12;
  ctx.strokeText(name, 256, 66);
  ctx.fillStyle = "#f5f8fb";
  ctx.fillText(name, 256, 66);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

export function DeskTag({ zone, agent }) {
  const label = agent?.tag || "AGENTE";
  const map = useMemo(() => paintName(label), [label]);
  useEffect(() => () => map.dispose(), [map]);
  const color = FLOOR_DOT[agent?.status] || FLOOR_DOT.pending;

  const open = (e) => {
    e.stopPropagation();
    selectAgent(agent.id);
  };

  return (
    <group position={[zone.position.x, PLATFORM_TOP + 0.04, zone.position.z]} rotation={[0, YAW, 0]}>
      <mesh position={[-0.56, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]} onClick={open}>
        <ringGeometry args={[0.062, 0.086, 22]} />
        <meshBasicMaterial color="#070b12" toneMapped={false} />
      </mesh>
      <mesh position={[-0.56, 0.016, 0.5]} rotation={[-Math.PI / 2, 0, 0]} onClick={open}>
        <circleGeometry args={[0.058, 22]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 0.014, 0.5]} rotation={[-Math.PI / 2, 0, Math.PI]} onClick={open}>
        <planeGeometry args={[1.12, 0.2]} />
        <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
