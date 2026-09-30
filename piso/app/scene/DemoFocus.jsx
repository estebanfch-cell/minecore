import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { LIME, YAW } from "../constants.js";

const HOME_TARGET = new THREE.Vector3(-0.85, 0.42, -0.2);
const HOME_OFFSET = new THREE.Vector3(11.4, 6.7, 11.4);
const FOCUS_OFFSET = new THREE.Vector3(3.55, 4.15, 3.55);
const WIDE_OFFSET = new THREE.Vector3(6.6, 8.1, 6.6);
const ROOM_OFFSET = new THREE.Vector3(7.4, 3.7, 7.4);
const HANDOFF_OFFSET = new THREE.Vector3(6.5, 7.7, 6.5);
const WALK_OFFSET = new THREE.Vector3(4.6, 3.15, 4.6);
const PORTRAIT_FOV = 40;
const PORTRAIT_PHI = 0.74;
const PORTRAIT_DIST = 13.9;
const PORTRAIT_SIDE = 0.7;
const portraitTheta = YAW + PORTRAIT_SIDE;
const portraitSinPhi = Math.sin(PORTRAIT_PHI);
const PORTRAIT_OFFSET = new THREE.Vector3(
  PORTRAIT_DIST * portraitSinPhi * Math.sin(portraitTheta),
  PORTRAIT_DIST * Math.cos(PORTRAIT_PHI),
  PORTRAIT_DIST * portraitSinPhi * Math.cos(portraitTheta),
);

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
    const split = !!run?.split;
    if (active) homing.current = true;
    else if (wasActive.current) homing.current = true;
    wasActive.current = active;
    if (!active && !homing.current) return;

    const from = carry && agents ? agents[carry.from] : null;
    const to = carry && agents ? agents[carry.to] : null;
    const flying = !!(from && to && performance.now() - carry.t0 < 2700);

    controls.minDistance = active || homing.current ? 5.2 : 14;
    controls.maxDistance = 42;
    const az = split ? 0.95 : 0.28;
    controls.minPolarAngle = split ? 0.42 : 0.62;
    controls.maxPolarAngle = 1.22;
    controls.minAzimuthAngle = YAW - az;
    controls.maxAzimuthAngle = YAW + az;
    const fov = split ? PORTRAIT_FOV : 44;
    if (Math.abs(camera.fov - fov) > 0.4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const alpha = 1 - Math.exp((run?.walk ? -3.4 : -1.6) * dt);
    const target = !active
      ? HOME_TARGET
      : flying
        ? desired.current.set((from.x + to.x) / 2, 1.45, (from.z + to.z) / 2)
        : desired.current.set(focus.x, focus.y ?? 1.2, focus.z);
    const goal = !active ? HOME_OFFSET : flying ? HANDOFF_OFFSET : split ? PORTRAIT_OFFSET : run?.walk ? WALK_OFFSET : run?.room ? ROOM_OFFSET : run?.wide ? WIDE_OFFSET : FOCUS_OFFSET;
    if (split) {
      offset.current.copy(goal);
      controls.target.copy(target);
    } else {
      offset.current.copy(camera.position).sub(controls.target);
      offset.current.lerp(goal, alpha);
      controls.target.lerp(target, alpha);
    }
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
