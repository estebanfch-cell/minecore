# Minecore · Piso operativo 3D

Animated isometric office for the seven Minecore agents. Replaces the old flat 2D HTML demo. GitHub Pages serves this folder at:

**https://estebanfch-cell.github.io/minecore/piso/**

## What’s on the floor

- Calm isometric diorama: raised hex platform, lime rim (`#b8ff3c`), wide desk grid
- Seven agents (manuelito, cote, law, secre, finance, marketing, stock-devops)
- Identity labels only (name + role + status color). No activity bubbles over avatars
- Click / tap an agent to open a side **ficha**: quién es, misión, historial, siguiente
- Idle typing, walk tweens / handoffs, Demo stand-up in the center
- Spanish HUD: **En vivo** / **Demo**. Live activity stays in the dossier, not on the 3D floor
- Slow isometric pan (drag to look around)

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

Same contract as the previous 2D floor. From the browser console (or a heartbeat script):

```js
window.MinecoreFeed.setAgent("manuelito", {
  activity: "Hub WA · alerta retención enviada",
  status: "ok",          // ok | pending | blocked
  popup: "Alerta retención enviada",
});

window.MinecoreFeed.getState();
```

Agent ids are fixed: `manuelito`, `cote`, `law`, `secre`, `finance`, `marketing`, `stock-devops`.

## Do not touch

The root Admin App (`index.html`, `app.js`, `SCRIPT_URL`) is independent. This folder only owns `/piso/`.
