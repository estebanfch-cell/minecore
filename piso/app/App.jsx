import { useEffect, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Hud } from "./Hud.jsx";
import { Office } from "./scene/Office.jsx";
import { getState, selectAgent, subscribe } from "./store.js";
import { bindFeedApi, startLive, stopDirector } from "./director.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export default function App() {
  const state = useStore();

  useEffect(() => {
    bindFeedApi();
    startLive();
    return () => stopDirector();
  }, []);

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          shadows
          dpr={[1, 1.6]}
          camera={{ position: [18.2, 22.4, 18.2], fov: 39, near: 0.1, far: 140 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.22;
          }}
          onPointerMissed={() => selectAgent(null)}
        >
          <Office
            agents={state.agents}
            meeting={state.meeting}
            selectedId={state.selectedId}
            handoff={state.handoff}
            popupFlash={state.popupFlash}
          />
        </Canvas>
      </div>
      <Hud />
    </>
  );
}
