export type CategoryId = "build" | "teach" | "think";

export type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  image: string;
  colors: {
    top: string;
    middle: string;
    bottom: string;
    ink: string;
  };
};

export type ExperienceState = "loading" | "entering" | "ready" | "rotating";
