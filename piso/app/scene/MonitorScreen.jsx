import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { POPUP_META } from "../constants.js";

function paint(canvas, kind, text) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const meta = POPUP_META[kind] || { app: "App", accent: "#b8ff3c", host: "minecore" };

  ctx.fillStyle = "#07141c";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0e1c24";
  ctx.fillRect(0, 0, w, 36);
  ctx.fillStyle = meta.accent;
  ctx.beginPath();
  ctx.arc(18, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8f0e6";
  ctx.font = "700 16px Segoe UI, sans-serif";
  ctx.fillText(meta.app, 32, 23);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 12, 48, w - 24, 70, 8);
  ctx.fill();
  ctx.fillStyle = meta.accent;
  ctx.fillRect(12, 48, 4, 70);

  ctx.fillStyle = "#e8f0e6";
  ctx.font = "600 18px Segoe UI, sans-serif";
  wrapText(ctx, text || "—", 24, 78, w - 48, 22);

  ctx.fillStyle = "#8aa090";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillText(meta.host, 16, h - 14);

  ctx.fillStyle = "#b8ff3c";
  ctx.fillRect(w - 18, h - 22, 8, 12);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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

export function MonitorScreen({ kind, text, position = [0, 1.18, -0.18] }) {
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

  const meta = POPUP_META[kind] || { app: "App", accent: "#b8ff3c", host: "" };

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.05, 0.66]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <Html position={[0.15, 0.58, 0.08]} center distanceFactor={11} zIndexRange={[15, 0]}>
        <div className="float-app">
          <header style={{ background: `${meta.accent}22`, color: meta.accent }}>
            <span className="dot" style={{ background: meta.accent }} />
            {meta.app}
          </header>
          <div className="body">{text}</div>
        </div>
      </Html>
    </group>
  );
}
