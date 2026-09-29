import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FLOOR_DOT, ISLAND_SCALE, PLATFORM_TOP, YAW } from "../constants.js";
import { selectAgent } from "../store.js";
import { SLAB_D, SLAB_H } from "./Furniture.jsx";

function paintName(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let size = 86;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const fit = () => {
    ctx.font = `700 ${size}px sans-serif`;
    return ctx.measureText(name).width;
  };
  while (fit() > 480 && size > 40) size -= 4;
  ctx.font = `700 ${size}px sans-serif`;
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(6, 10, 16, 0.72)";
  ctx.strokeText(name, 256, 66);
  ctx.fillStyle = "#ffffff";
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
  const faceZ = (SLAB_D / 2) * ISLAND_SCALE + 0.03;
  const faceY = PLATFORM_TOP - SLAB_H / 2;

  const open = (e) => {
    e.stopPropagation();
    selectAgent(agent.id);
  };

  return (
    <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]}>
      <mesh position={[-0.58, faceY, faceZ]} onClick={open}>
        <circleGeometry args={[0.078, 28]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0.1, faceY, faceZ + 0.002]} onClick={open}>
        <planeGeometry args={[1.12, 0.2]} />
        <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
