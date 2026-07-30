"use client";

import type { Category } from "@/types/portfolio";
import { PortfolioPanel } from "./PortfolioPanel";

type ReflectionGroupProps = {
  categories: Category[];
  activeIndex: number;
};

export function ReflectionGroup({ categories, activeIndex }: ReflectionGroupProps) {
  return (
    <group position={[0, -3.58, 0]} scale={[1, -1, 1]}>
      {categories.map((category, index) => (
        <PortfolioPanel
          key={`${category.id}-reflection`}
          category={category}
          index={index}
          active={index === activeIndex}
          reflection
        />
      ))}
    </group>
  );
}
