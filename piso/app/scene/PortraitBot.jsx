import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { LOOKS } from "../constants.js";
import { MinerAvatar } from "./Miner.jsx";
import { getMarkTexture } from "./markTexture.js";

function PortraitRig({ agentId }) {
  const look = LOOKS[agentId] || LOOKS.devops;
  const mark = getMarkTexture();
  const root = useRef();
  const chest = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();

  useFrame(() => {
    const time = performance.now() / 1000;
    const type = Math.sin(time * 8.2);
    if (root.current) root.current.position.y = Math.sin(time * 1.4) * 0.012;
    if (legL.current) legL.current.rotation.x = 0.04;
    if (legR.current) legR.current.rotation.x = -0.04;
    if (armL.current) armL.current.rotation.x = -0.72 + type * 0.16;
    if (armR.current) armR.current.rotation.x = -0.72 - type * 0.16;
    if (chest.current) {
      chest.current.position.y = 0;
      chest.current.rotation.x = 0.06;
      chest.current.rotation.y = Math.sin(time * 0.55) * 0.05;
    }
  });

  return (
    <group ref={root} rotation={[0, 0.42, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.42, 28]} />
        <meshBasicMaterial color="#05080d" transparent opacity={0.55} />
      </mesh>
      <MinerAvatar look={look} mark={mark} legL={legL} legR={legR} armL={armL} armR={armR} chest={chest} />
    </group>
  );
}

export function PortraitBot({ agentId }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0.42, 0.78, 3.15], fov: 26, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0.62, 0);
        gl.setClearColor("#0c1118");
      }}
    >
      <ambientLight intensity={0.62} />
      <directionalLight position={[1.4, 2.6, 2.4]} intensity={1.45} />
      <pointLight position={[-1.1, 1.5, 1.4]} color="#d5e4ff" intensity={0.45} />
      <PortraitRig agentId={agentId} />
    </Canvas>
  );
}
