import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, existsSync, cpSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const demoDir = resolve(__dirname, "demo");

function demoFiles() {
  const types = {
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".json": "application/json",
  };
  return {
    name: "piso-demo-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = (req.url || "").split("?")[0];
        const prefix = "/minecore/piso/demo/";
        if (!raw.startsWith(prefix)) return next();
        const rel = decodeURIComponent(raw.slice(prefix.length));
        const file = resolve(demoDir, rel);
        if (!file.startsWith(demoDir + sep) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader("Content-Type", types[extname(file).toLowerCase()] || "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      cpSync(demoDir, resolve(__dirname, "dist/demo"), { recursive: true });
    },
  };
}

export default defineConfig({
  root: resolve(__dirname, "app"),
  // GitHub Pages project site: https://estebanfch-cell.github.io/minecore/piso/
  base: "/minecore/piso/",
  publicDir: resolve(__dirname, "public"),
  plugins: [react(), demoFiles()],
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
});
