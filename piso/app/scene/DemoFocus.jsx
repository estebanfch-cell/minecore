import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { LIME } from "../constants.js";

const HOME_TARGET = new THREE.Vector3(0.15, 0.12, 0.05);
const HOME_OFFSET = new THREE.Vector3(18.05, 22.28, 18.15);
const FOCUS_OFFSET = new THREE.Vector3(3.55, 4.15, 3.55);
const HANDOFF_OFFSET = new THREE.Vector3(6.5, 7.7, 6.5);

export function DemoCamera({ run, carry, agents }) {
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

    const from = carry && agents ? agents[carry.from] : null;
    const to = carry && agents ? agents[carry.to] : null;
    const flying = !!(from && to && performance.now() - carry.t0 < 2700);

    controls.minDistance = active || homing.current ? 5.2 : 14;
    const alpha = 1 - Math.exp(-1.6 * dt);
    const target = !active
      ? HOME_TARGET
      : flying
        ? desired.current.set((from.x + to.x) / 2, 1.45, (from.z + to.z) / 2)
        : desired.current.set(focus.x, focus.y ?? 1.2, focus.z);
    const goal = !active ? HOME_OFFSET : flying ? HANDOFF_OFFSET : FOCUS_OFFSET;
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
  const doc = useRef();
  const head = useRef();
  const urlRef = useRef("");
  const from = carry ? agents[carry.from] : null;
  const to = carry ? agents[carry.to] : null;
  const curve = useMemo(() => {
    if (!from || !to) return null;
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(from.x, 1.2, from.z),
      new THREE.Vector3((from.x + to.x) / 2, 2.5, (from.z + to.z) / 2),
      new THREE.Vector3(to.x, 1.28, to.z)
    );
  }, [from, to]);

  useFrame(() => {
    const node = doc.current;
    if (!node || !carry || !curve) return;
    const t = Math.min(1, (performance.now() - carry.t0) / 2800);
    const p = curve.getPoint(t);
    node.position.copy(p);
    node.lookAt(p.x + 1, p.y + 0.35, p.z + 1);
    if (head.current) {
      const tipT = Math.min(1, t + 0.07);
      const tip = curve.getPoint(tipT);
      const aim = tip.clone().add(curve.getTangent(tipT));
      head.current.position.copy(tip);
      head.current.lookAt(aim);
    }
    if (urlRef.current !== carry.image) {
      urlRef.current = carry.image;
      new THREE.TextureLoader().load(carry.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        if (node.material) {
          node.material.map = tex;
          node.material.needsUpdate = true;
        }
      });
    }
  });

  if (!carry || !from || !to || !curve) return null;
  return (
    <group>
      <QuadraticBezierLine
        start={[from.x, 1.2, from.z]}
        end={[to.x, 1.28, to.z]}
        mid={[(from.x + to.x) / 2, 2.5, (from.z + to.z) / 2]}
        color={LIME}
        lineWidth={3}
        transparent
        opacity={0.95}
      />
      <group ref={head}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.26, 10]} />
          <meshBasicMaterial color={LIME} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={doc}>
        <planeGeometry args={[0.62, 0.82]} />
        <meshBasicMaterial color="#f4f7fb" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
