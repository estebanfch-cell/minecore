import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { agentCallName, FLOOR_DOT, ISLAND_SCALE, PLATFORM_TOP, YAW } from "../constants.js";
import { selectAgent } from "../store.js";
import { SLAB_D } from "./Furniture.jsx";

/** Left gutter stays empty so the status dot never sits on the letters. */
const PLATE_W = 1024;
const PLATE_H = 220;
const TEXT_LEFT = 248;
const TEXT_RIGHT = 988;

function paintName(name) {
  const canvas = document.createElement("canvas");
  canvas.width = PLATE_W;
  canvas.height = PLATE_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c1218";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const maxWidth = TEXT_RIGHT - TEXT_LEFT;
  const centerX = (TEXT_LEFT + TEXT_RIGHT) / 2;
  let size = 118;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fit = () => {
    ctx.font = `800 ${size}px sans-serif`;
    return ctx.measureText(name).width;
  };
  while (fit() > maxWidth && size > 52) size -= 4;
  ctx.font = `800 ${size}px sans-serif`;
  ctx.fillStyle = "#c6ff3d";
  ctx.fillText(name, centerX, PLATE_H / 2);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

export function DeskTag({ zone, agent }) {
  const label = agentCallName(agent);
  const map = useMemo(() => paintName(label), [label]);
  useEffect(() => () => map.dispose(), [map]);
  const color = FLOOR_DOT[agent?.status] || FLOOR_DOT.pending;
  const faceZ = (SLAB_D / 2) * ISLAND_SCALE + 0.05;
  const faceY = PLATFORM_TOP + 0.02;

  const open = (e) => {
    e.stopPropagation();
    selectAgent(agent.id);
  };

  const plateW = 1.36;
  const plateH = 0.29;
  const dotX = (108 / PLATE_W - 0.5) * plateW;

  return (
    <group position={[zone.position.x, 0, zone.position.z]} rotation={[0, YAW, 0]}>
      <mesh position={[0, faceY, faceZ]} onClick={open}>
        <planeGeometry args={[plateW, plateH]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <mesh position={[dotX, faceY, faceZ + 0.012]} onClick={open}>
        <circleGeometry args={[0.062, 28]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}
