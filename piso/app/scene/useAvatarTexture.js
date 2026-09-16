import { useEffect, useState } from "react";
import * as THREE from "three";

const cache = new Map();

function keyOutWhite(img) {
  const src = document.createElement("canvas");
  src.width = img.width;
  src.height = img.height;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(img, 0, 0);
  const data = sctx.getImageData(0, 0, src.width, src.height);
  const px = data.data;

  let minX = src.width;
  let minY = src.height;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const white = r > 248 && g > 248 && b > 248;
    if (white) {
      px[i + 3] = 0;
    } else {
      const p = i / 4;
      const x = p % src.width;
      const y = (p / src.width) | 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  sctx.putImageData(data, 0, 0);

  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(src.width - 1, maxX + pad);
  maxY = Math.min(src.height - 1, maxY + pad);
  const w = Math.max(8, maxX - minX);
  const h = Math.max(8, maxY - minY);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(src, minX, minY, w, h, 0, 0, w, h);

  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function loadAvatarTexture(id) {
  if (cache.has(id)) return cache.get(id);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(keyOutWhite(img));
    img.onerror = () => resolve(null);
    img.src = `${import.meta.env.BASE_URL}avatars/${id}.jpg`;
  });
  cache.set(id, p);
  return p;
}

export function useAvatarTexture(id) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let live = true;
    loadAvatarTexture(id).then((tex) => {
      if (live) setTexture(tex);
    });
    return () => {
      live = false;
    };
  }, [id]);
  return texture;
}
