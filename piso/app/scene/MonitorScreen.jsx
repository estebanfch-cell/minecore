import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  ctx.fillRect(0, 0, w, 18);
  ctx.fillStyle = "#071018";
  ctx.font = "700 22px Inter, Segoe UI, sans-serif";
  ctx.fillText(meta.app, 18, 58);
  ctx.fillStyle = "#8aa0b4";
  ctx.font = "16px Inter, Segoe UI, sans-serif";
  ctx.fillText(meta.host || "", 18, 88);
  const bars = [0.72, 0.46, 0.61, 0.33];
  bars.forEach((amt, i) => {
    const y = 120 + i * 36;
    ctx.fillStyle = "#122033";
    ctx.fillRect(18, y, w - 36, 16);
    ctx.fillStyle = meta.accent;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(18, y, (w - 36) * amt, 16);
    ctx.globalAlpha = 1;
  });
}

export function MonitorScreen({ kind, position = [0, 0, 0] }) {
  const glow = useRef();
  const { canvas, texture } = useMemo(() => {
    const el = document.createElement("canvas");
    el.width = 512;
    el.height = 320;
    const map = new THREE.CanvasTexture(el);
    map.colorSpace = THREE.SRGBColorSpace;
    return { canvas: el, texture: map };
  }, []);

  useEffect(() => {
    paint(canvas, kind);
    texture.needsUpdate = true;
  }, [canvas, texture, kind]);

  useFrame(() => {
    if (!glow.current) return;
    glow.current.material.opacity = 0.08 + Math.sin(performance.now() / 480) * 0.05;
  });

  const meta = POPUP_META[kind] || { accent: "#b8ff3c" };

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.72, 0.46]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh ref={glow} position={[0, 0, 0.012]}>
        <planeGeometry args={[0.72, 0.46]} />
        <meshBasicMaterial color={meta.accent} transparent opacity={0.1} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
