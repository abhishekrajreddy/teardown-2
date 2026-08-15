import { prisma } from "@/lib/prisma";

export type ExperimentMetric = "sleep_quality" | "mood" | "energy" | "sleep_hours" | "workout_volume";

export const METRIC_LABELS: Record<ExperimentMetric, string> = {
  sleep_quality: "Sleep quality (1-5)",
  mood: "Mood (1-5)",
  energy: "Energy (1-5)",
  sleep_hours: "Sleep hours",
  workout_volume: "Workout volume (kg)",
};

export async function computeMetricAverage(
  userId: string,
  metric: ExperimentMetric,
  from: Date,
  to: Date
): Promise<{ average: number | null; sampleSize: number }> {
  if (metric === "workout_volume") {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: { sets: true },
    });
    if (sessions.length === 0) return { average: null, sampleSize: 0 };
    const totalVolume = sessions.reduce(
      (sum, s) => sum + s.sets.reduce((sSum, set) => sSum + set.weight * set.reps, 0),
      0
    );
    return { average: Math.round(totalVolume / sessions.length), sampleSize: sessions.length };
  }

  const field = { sleep_quality: "sleepQuality", mood: "mood", energy: "energy", sleep_hours: "sleepHours" }[
    metric
  ] as "sleepQuality" | "mood" | "energy" | "sleepHours";

  const checkins = await prisma.dailyCheckin.findMany({
    where: { userId, date: { gte: from, lte: to }, [field]: { not: null } },
  });
  if (checkins.length === 0) return { average: null, sampleSize: 0 };

  const values = checkins.map((c) => c[field] as number);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return { average: Math.round(average * 10) / 10, sampleSize: checkins.length };
}
