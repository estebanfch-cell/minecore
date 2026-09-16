import { useEffect, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Hud } from "./Hud.jsx";
import { Office } from "./scene/Office.jsx";
import { getState, subscribe } from "./store.js";
import { bindFeedApi, startLive } from "./director.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export default function App() {
  const state = useStore();

  useEffect(() => {
    bindFeedApi();
    startLive();
  }, []);

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [9.2, 7.6, 9.8], fov: 38, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Office agents={state.agents} meeting={state.meeting} />
        </Canvas>
      </div>
      <Hud />
    </>
  );
}
