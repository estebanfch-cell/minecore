import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FLOOR_DOT, ISLAND_SCALE, PLATFORM_TOP, YAW } from "../constants.js";
import { selectAgent } from "../store.js";
import { SLAB_D, SLAB_H } from "./Furniture.jsx";

function paintName(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 280;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c1218";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let size = 168;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fit = () => {
    ctx.font = `800 ${size}px sans-serif`;
    return ctx.measureText(name).width;
  };
  while (fit() > 960 && size > 72) size -= 6;
  ctx.font = `800 ${size}px sans-serif`;
  ctx.fillStyle = "#c6ff3d";
  ctx.fillText(name, 512, 146);
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
  const faceZ = (SLAB_D / 2) * ISLAND_SCALE + 0.05;
  const faceY = PLATFORM_TOP + 0.02;

  const open = (e) => {
    e.stopPropagation();
    selectAgent(agent.id);
  };

  return (
    <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]}>
      <mesh position={[0.02, faceY, faceZ]} onClick={open}>
        <planeGeometry args={[1.62, 0.4]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, faceY, faceZ + 0.02]} onClick={open}>
        <circleGeometry args={[0.11, 28]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}
