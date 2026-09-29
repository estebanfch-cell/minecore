import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const HOME_TARGET = new THREE.Vector3(0.15, 0.12, 0.05);
const HOME_OFFSET = new THREE.Vector3(18.05, 22.28, 18.15);
const FOCUS_OFFSET = new THREE.Vector3(3.55, 4.15, 3.55);

export function DemoCamera({ run }) {
  const { camera, controls } = useThree();
  const offset = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const homing = useRef(false);
  const wasActive = useRef(false);

  useFrame((_, dt) => {
    if (!controls?.target) return;
    const focus = run?.focus;
    const active = !!focus;
    if (active) homing.current = true;
    else if (wasActive.current) homing.current = true;
    wasActive.current = active;
    if (!active && !homing.current) return;

    controls.minDistance = active || homing.current ? 5.2 : 14;
    const alpha = 1 - Math.exp(-1.6 * dt);
    const target = active ? desired.current.set(focus.x, focus.y ?? 1.2, focus.z) : HOME_TARGET;
    const goal = active ? FOCUS_OFFSET : HOME_OFFSET;
    offset.current.copy(camera.position).sub(controls.target);
    offset.current.lerp(goal, alpha);
    controls.target.lerp(target, alpha);
    camera.position.copy(controls.target).add(offset.current);
    controls.update();

    if (!active && camera.position.distanceTo(HOME_TARGET.clone().add(HOME_OFFSET)) < 0.6) {
      homing.current = false;
    }
  });

  return null;
}

export function DocCarry({ carry, agents }) {
  const mesh = useRef();
  const mapRef = useRef(null);
  const urlRef = useRef("");

  useFrame(() => {
    const node = mesh.current;
    if (!node || !carry) return;
    const from = agents[carry.from];
    const to = agents[carry.to];
    if (!from || !to) return;
    const t = Math.min(1, (performance.now() - carry.t0) / 2800);
    const lift = Math.sin(t * Math.PI);
    node.position.set(
      from.x + (to.x - from.x) * t,
      1.05 + lift * 1.35,
      from.z + (to.z - from.z) * t
    );
    node.lookAt(node.position.x + 1, node.position.y + 0.4, node.position.z + 1);
    if (urlRef.current !== carry.image) {
      urlRef.current = carry.image;
      new THREE.TextureLoader().load(carry.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mapRef.current = tex;
        if (node.material) {
          node.material.map = tex;
          node.material.needsUpdate = true;
        }
      });
    }
  });

  if (!carry) return null;
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[0.78, 1.02]} />
      <meshBasicMaterial color="#f4f7fb" toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
