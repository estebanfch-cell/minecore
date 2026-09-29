# Minecore · Piso operativo 3D

**Taller:** escribe la instrucción en CHIEF → mira la sala.

**Orquesta OC:** en el chat de CHIEF escribe algo con `OC` o `Taluvira`, o adjunta un PDF con ese nombre, y pulsa Enviar (también `?run=taluvira` o la tecla `D`). CHIEF contesta y el piso recorre los 6 pasos. Pausa / Siguiente / Reiniciar. Los archivos viven en `piso/run/`.

Animated isometric office for the Minecore agents. Replaces the old flat 2D HTML floor. GitHub Pages serves this folder at:

**https://estebanfch-cell.github.io/minecore/piso/**

## What’s on the floor

- Dark isometric diorama: every agent on their own desk (CHIEF, LAW, SECRE, FINANCE, MANUELITO, COTE, MARKETING, STOCK PILOT, DEVOPS, Comunicados, PERSONAL, PMV) around a central **sala / núcleo**
- Low-poly miners with white helmets and the Minecore M mark (approved v5 portraits stay on the ficha)
- Each platform’s front face (toward the camera) carries the short name and a status dot (green online, grey away, red offline). No plates above the miners. Activity stays in the ficha and the task panel
- Panel derecho **Estado de tareas** (icono, texto, hora Guayaquil)
- Barra superior: marca Minecore, reloj America/Guayaquil, Ejecutar / En vivo
- Click / tap an agent to open a large **ficha**: quién es, para qué está entrenado, historial, siguiente, and an **Instrucción** box
- **Dar instrucción** (or click CHIEF) → type the announcement → **Enviar**. Everyone walks in through the sala door, CHIEF delivers the line (ticker + one speech panel), then they leave and return to their desks. The scene plays even if the webhook is not set yet
- **Ejecutar** loops desk work, handoffs (SECRE→Finance, COTE→Manuelito) and a stand-up in the sala. Status dots follow each agent’s `status`
- **En vivo** waits for `window.MinecoreFeed.setAgent` or `window.MINECORE_FEED_URL`. Until a heartbeat arrives, the floor keeps the last known state and the panel says so

## Develop

From this folder (`piso/`):

```bash
npm install
npm run dev
```

Opens Vite at `http://localhost:5173/minecore/piso/`. Source lives in `app/`. Approved v5 portraits are in `public/avatars/`.

## Build for GitHub Pages

Pages deploys the repo **from `main`**. The built files must sit in `piso/` (not only `piso/dist`), with asset URLs prefixed by `/minecore/piso/`.

```bash
npm run build
```

`npm run build` emits `piso/dist/`, then copies the Pages payload into this folder:

- `piso/index.html` — production shell
- `piso/assets/` — hashed JS/CSS
- `piso/avatars/` — copied portraits

Do **not** point Pages at `piso/dist` (gitignored). After merge, the live URL is `/minecore/piso/`.

`vite.config.js` always uses `base: '/minecore/piso/'` so `dev`, `preview`, and Pages share the same asset URLs.

Preview the production build locally:

```bash
npm run preview
```

Then open the `/minecore/piso/` path the preview server prints.

## Live feed API

Same contract as the previous floor. **En vivo** does not invent motion. Until a heartbeat arrives, the panel says it is waiting and the desks keep the last known state.

From the browser console (or a heartbeat script):

```js
window.MinecoreFeed.setAgent("manuelito", {
  activity: "Hub WA · alerta retención enviada",
  status: "ok",          // ok | pending | blocked
  popup: "Alerta retención enviada", // optional app toast
});

window.MinecoreFeed.getState();
```

Or point the page at a JSON document and it will poll every 10s:

```js
window.MINECORE_FEED_URL = "https://example.com/minecore-feed.json";
// { "agents": { "manuelito": { "activity": "...", "status": "ok", "popup": "..." } } }
```

Agent ids on the floor: `chief`, `manuelito`, `cote`, `law`, `secre`, `finance`, `marketing`, `stock-pilot`, `devops`, `comunicados`, `personal`, `pmv`.

## Workshop instruction

The winning moment is visual: type on CHIEF, press **Enviar**, watch the room gather.

The relay URL lives in `instruct.json` and is fetched on each page load with `cache: "no-store"`. No key is stored or sent. Precedence when Manuelito finishes:

1. `window.MINECORE_INSTRUCT_URL` or `?instructUrl=` (saved to localStorage, then removed from the address bar)
2. `instruct.json`
3. localStorage

```js
window.MINECORE_INSTRUCT_URL = "https://…"; // optional override
```

The POST body is JSON with `Content-Type: text/plain` and no Authorization header. The relay adds the key. The floor never shows the URL.

```js
window.MinecoreFeed.enqueueInstruction({
  agentId: "<grok uuid>",
  agentName: "MINECORE CHIEF",
  text: "…",
  ts: new Date().toISOString(),
});
```

CHIEF’s id on the floor is `chief`.

## Do not touch

The root Admin App (`index.html`, `app.js`, `SCRIPT_URL`) is independent. This folder only owns `/piso/`.
