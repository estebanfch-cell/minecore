import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await mkdir(resolve(root, "assets"), { recursive: true });
await mkdir(resolve(root, "avatars"), { recursive: true });
await rm(resolve(root, "assets"), { recursive: true, force: true });
await rm(resolve(root, "avatars"), { recursive: true, force: true });
await cp(resolve(dist, "index.html"), resolve(root, "index.html"));
await cp(resolve(dist, "assets"), resolve(root, "assets"), { recursive: true });
await cp(resolve(dist, "avatars"), resolve(root, "avatars"), { recursive: true });
console.log("Published dist → piso/ for GitHub Pages (/minecore/piso/)");
