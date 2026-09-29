import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, existsSync, cpSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const runDir = resolve(__dirname, "run");
const instructFile = resolve(__dirname, "instruct.json");

function runFiles() {
  const types = {
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".json": "application/json",
  };
  return {
    name: "piso-run-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = (req.url || "").split("?")[0];
        if (raw === "/minecore/piso/instruct.json" || raw === "/instruct.json") {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          createReadStream(instructFile).pipe(res);
          return;
        }
        const prefix = "/minecore/piso/run/";
        if (!raw.startsWith(prefix)) return next();
        const rel = decodeURIComponent(raw.slice(prefix.length));
        const file = resolve(runDir, rel);
        if (!file.startsWith(runDir + sep) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader("Content-Type", types[extname(file).toLowerCase()] || "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      cpSync(runDir, resolve(__dirname, "dist/run"), { recursive: true });
      cpSync(instructFile, resolve(__dirname, "dist/instruct.json"));
    },
  };
}

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, "app"),
  // Relative asset URLs so the same build works at
  // https://estebanfch-cell.github.io/minecore/piso/ and https://agentes.minecore.ec/piso/
  // Dev keeps the project-site prefix so `npm run dev` stays on /minecore/piso/.
  base: command === "build" ? "./" : "/minecore/piso/",
  publicDir: resolve(__dirname, "public"),
  plugins: [react(), runFiles()],
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
