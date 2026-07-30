import type { Category } from "@/types/portfolio";

export const categories: Category[] = [
  {
    id: "build",
    title: "BUILD",
    subtitle: "Software & Engineering",
    image: "/images/build.jpg",
    colors: {
      top: "#fbfaf5",
      middle: "#ece7de",
      bottom: "#b9b1a8",
      ink: "#ffffff",
    },
  },
  {
    id: "teach",
    title: "TEACH",
    subtitle: "Mathematics & Learning",
    image: "/images/teach.jpg",
    colors: {
      top: "#f2eafe",
      middle: "#d8caef",
      bottom: "#a69ab5",
      ink: "#fffaff",
    },
  },
  {
    id: "think",
    title: "THINK",
    subtitle: "Product & Business",
    image: "/images/think.jpg",
    colors: {
      top: "#ecfbf7",
      middle: "#c8ece6",
      bottom: "#91b9b2",
      ink: "#fbfffe",
    },
  },
];
