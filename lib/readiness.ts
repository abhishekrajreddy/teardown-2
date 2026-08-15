export type ReadinessInput = {
  sleepQuality: number | null;
  mood: number | null;
  energy: number | null;
};

export function computeReadiness(input: ReadinessInput | null): number | null {
  if (!input) return null;
  const values = [input.sleepQuality, input.mood, input.energy].filter(
    (v): v is number => v != null
  );
  if (values.length === 0) return null;
  const avgOutOfFive = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avgOutOfFive / 5) * 100);
}

export function readinessColor(score: number): "moss" | "ember" | "rust" {
  if (score >= 70) return "moss";
  if (score >= 40) return "ember";
  return "rust";
}
