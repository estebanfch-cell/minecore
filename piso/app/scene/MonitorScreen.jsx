import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { POPUP_META } from "../constants.js";

function paint(canvas, kind, text) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const meta = POPUP_META[kind] || { app: "App", accent: "#b8ff3c", host: "minecore" };

  ctx.fillStyle = "#071018";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = meta.accent;
  ctx.fillRect(0, 0, w, 8);
  ctx.fillStyle = "#d8e6e0";
  ctx.font = "700 28px Segoe UI, sans-serif";
  ctx.fillText(meta.app, 22, 52);
  ctx.fillStyle = "#8aa090";
  ctx.font = "18px Segoe UI, sans-serif";
  wrapText(ctx, text || "—", 22, 92, w - 44, 26);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let yy = y;
  let rows = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
      rows += 1;
      if (rows >= 2) break;
    } else {
      line = test;
    }
  }
  if (rows < 2) ctx.fillText(line, x, yy);
}

export function MonitorScreen({ kind, text, position = [0, 0.98, -0.235] }) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    paint(canvas, kind, text);
    texture.needsUpdate = true;
  }, [canvas, texture, kind, text]);

  const meta = POPUP_META[kind] || { app: "App", accent: "#b8ff3c" };

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
      <Html position={[0.82, 0.38, 0.06]} center distanceFactor={13} zIndexRange={[12, 0]}>
        <div className="float-app">
          <header style={{ color: meta.accent }}>
            <span className="dot" style={{ background: meta.accent }} />
            {meta.app}
          </header>
          <div className="body">{text}</div>
        </div>
      </Html>
    </group>
  );
}
