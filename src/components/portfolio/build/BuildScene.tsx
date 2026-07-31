"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { BuildModel } from "./BuildModel";

type BuildSceneProps = {
  enableOrbitControls?: boolean;
};

export function BuildScene({ enableOrbitControls = false }: BuildSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true }}
      className="h-full w-full"
    >
      <PerspectiveCamera makeDefault position={[6.2, 4.25, 6.6]} fov={34} />
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={1.55} />
      <directionalLight
        position={[4.5, 7, 5]}
        intensity={1.85}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 4, -3]} intensity={0.45} />
      <BuildModel />
      <ContactShadows
        position={[0, -0.06, 0]}
        opacity={0.24}
        scale={8.4}
        blur={2.7}
        far={5}
        color="#b9b1a3"
      />
      {enableOrbitControls ? (
        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={7}
          maxDistance={12}
          target={[0, 1.55, 0.25]}
        />
      ) : null}
    </Canvas>
  );
}
