"use client";

import { buildModelParts } from "@/data/build-model-parts";
import { BuildPart } from "./BuildPart";

export function BuildModel() {
  return (
    <group name="build-architectural-model" position={[0, -0.2, 0]}>
      {buildModelParts.map((part) => (
        <BuildPart key={part.id} part={part} />
      ))}
    </group>
  );
}
