import { useEffect, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Hud } from "./Hud.jsx";
import { Office } from "./scene/Office.jsx";
import { getState, selectAgent, subscribe } from "./store.js";
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
          camera={{ position: [15.4, 17.2, 15.8], fov: 32, near: 0.1, far: 90 }}
          gl={{ antialias: true, alpha: false }}
          onPointerMissed={() => selectAgent(null)}
        >
          <Office
            agents={state.agents}
            meeting={state.meeting}
            selectedId={state.selectedId}
          />
        </Canvas>
      </div>
      <Hud />
    </>
  );
}
