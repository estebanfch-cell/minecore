# Minecore · Piso operativo 3D

Animated isometric office for the seven Minecore agents. Replaces the old flat 2D HTML demo. GitHub Pages serves this folder at:

**https://estebanfch-cell.github.io/minecore/piso/**

## What’s on the floor

- Dark isometric diorama: seven colored department platforms around a central **núcleo**, linked by walkways
- Low-poly miners with white helmets and the Minecore M mark (approved v5 portraits stay on the ficha)
- Calm identity labels only (name + role). No speech bubbles over avatars
- Glass cards per zone: nombre, 1 agente, dos métricas y el estado corto
- Panel derecho **Estado de tareas** (icono, texto, hora Guayaquil)
- Barra superior: marca Minecore, reloj America/Guayaquil, Demo / En vivo
- Click / tap an agent to open a large **ficha**: quién es, para qué está entrenado, historial, siguiente
- **Demo** loops desk work, handoffs (SECRE→Finance, COTE→Manuelito) and a stand-up on the núcleo. App toasts (SRI, inFlow, Gmail, WA, GitHub) are one at a time
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

Agent ids are fixed: `manuelito`, `cote`, `law`, `secre`, `finance`, `marketing`, `stock-devops`.

## Do not touch

The root Admin App (`index.html`, `app.js`, `SCRIPT_URL`) is independent. This folder only owns `/piso/`.
