// Epley formula: 1RM = weight × (1 + reps/30)
// Standard, same one Hevy and most trackers use. Only meaningful up to
// ~10-12 reps — beyond that it's treated as an estimate, not gospel.
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}
