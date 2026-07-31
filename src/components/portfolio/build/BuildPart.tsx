"use client";

import type { BuildModelPart, BuildMaterialVariant } from "@/data/build-model-parts";

type BuildMaterialProps = {
  color: string;
  roughness: number;
  metalness: number;
};

const materialProps: Record<BuildMaterialVariant, BuildMaterialProps> = {
  plaster: {
    color: "#f4f0e6",
    roughness: 0.86,
    metalness: 0,
  },
  stone: {
    color: "#e7e0d2",
    roughness: 0.94,
    metalness: 0,
  },
  grooved: {
    color: "#f1eadc",
    roughness: 0.98,
    metalness: 0,
  },
};

type BuildPartProps = {
  part: BuildModelPart;
};

export function BuildPart({ part }: BuildPartProps) {
  return (
    <mesh
      name={part.id}
      position={part.position}
      rotation={part.rotation}
      castShadow
      receiveShadow
      userData={{ id: part.id, label: part.name, materialVariant: part.materialVariant }}
    >
      <boxGeometry args={part.size} />
      <meshStandardMaterial {...materialProps[part.materialVariant]} />
    </mesh>
  );
}
