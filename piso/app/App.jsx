import { useEffect, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Hud } from "./Hud.jsx";
import { Office } from "./scene/Office.jsx";
import { getState, selectAgent, subscribe } from "./store.js";
import { bindFeedApi, interruptFloor, startLive, stopDirector } from "./director.js";
import { beginScriptedExchange, bindDemoRun } from "./demoRun.js";
import { captureInstructSettings, loadInstructConfig } from "./instruct.js";

function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export default function App() {
  const state = useStore();

  useEffect(() => {
    bindFeedApi();
    bindDemoRun({ interrupt: interruptFloor });
    captureInstructSettings();
    loadInstructConfig();
    startLive();
    const params = new URLSearchParams(window.location.search);
    if (params.get("run") === "taluvira" || params.get("demo") === "taluvira") beginScriptedExchange();
    return () => stopDirector();
  }, []);

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          shadows
          dpr={[1, 1.6]}
          camera={{ position: [10.55, 7.12, 11.2], fov: 44, near: 0.1, far: 160 }}
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
            demoRun={state.demoRun}
            deskScreens={state.deskScreens}
            carry={state.carry}
            brief={state.brief}
          />
        </Canvas>
      </div>
      <Hud />
    </>
  );
}
