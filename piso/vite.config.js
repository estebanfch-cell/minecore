import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, "app"),
  // Relative asset URLs so the same build works at
  // https://estebanfch-cell.github.io/minecore/piso/ and https://agentes.minecore.ec/piso/
  // Dev keeps the project-site prefix so `npm run dev` stays on /minecore/piso/.
  base: command === "build" ? "./" : "/minecore/piso/",
  publicDir: resolve(__dirname, "public"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: "assets",
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
}));
