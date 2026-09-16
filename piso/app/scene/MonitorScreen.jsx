import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { POPUP_META } from "../constants.js";

function paint(canvas, kind) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const meta = POPUP_META[kind] || { app: "App", accent: "#b8ff3c", host: "" };
  ctx.fillStyle = "#071018";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = meta.accent;
  ctx.fillRect(0, 0, w, 8);
  ctx.fillStyle = "#d8e6e0";
  ctx.font = "700 28px Segoe UI, sans-serif";
  ctx.fillText(meta.app, 22, 56);
  ctx.fillStyle = "#8aa090";
  ctx.font = "18px Segoe UI, sans-serif";
  ctx.fillText(meta.host || "", 22, 96);
}

export function MonitorScreen({ kind, position = [0, 0.98, -0.235] }) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    paint(canvas, kind);
    texture.needsUpdate = true;
  }, [canvas, texture, kind]);

  const meta = POPUP_META[kind] || { accent: "#b8ff3c" };

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.84, 0.52]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.84, 0.52]} />
        <meshBasicMaterial color={meta.accent} transparent opacity={0.08} toneMapped={false} />
      </mesh>
    </group>
  );
}
