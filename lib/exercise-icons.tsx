import { Dumbbell, CircleDot, Cable, Cog, PersonStanding, type LucideIcon } from "lucide-react";

// No exercise-video/photo content is feasible here, so this gives each
// exercise a consistent visual identity by equipment type instead —
// a lightweight stand-in that at least breaks up plain text lists.
export function iconForExercise(equipment: string | null | undefined): LucideIcon {
  switch (equipment) {
    case "barbell":
      return Dumbbell;
    case "dumbbell":
      return Dumbbell;
    case "cable":
      return Cable;
    case "machine":
      return Cog;
    case "bodyweight":
      return PersonStanding;
    default:
      return CircleDot;
  }
}

export const BODY_PART_COLOR: Record<string, string> = {
  chest: "text-ember",
  back: "text-moss",
  legs: "text-volt",
  shoulders: "text-ember",
  arms: "text-moss",
  core: "text-volt",
  other: "text-bone-dim",
};
