import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const [sessions, supplements, exercises] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: 30,
      include: { sets: { include: { exercise: true } } },
    }),
    prisma.supplement.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: "asc" },
      include: { logs: { orderBy: { date: "asc" } } },
    }),
    prisma.exercise.findMany({ select: { id: true, name: true, variationOfId: true } }),
  ]);

  const volumeSeries = sessions.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    volume: Math.round(s.sets.reduce((sum, set) => sum + set.weight * set.reps, 0)),
  }));

  // Walk each exercise up to its root (the un-variationed parent) so
  // "incline dumbbell press" rolls into the same trend as "bench press".
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  function rootOf(exerciseId: string): { id: string; name: string } {
    let current = exerciseMap.get(exerciseId);
    if (!current) return { id: exerciseId, name: "Unknown" };
    const seen = new Set<string>();
    while (current?.variationOfId && !seen.has(current.id)) {
      seen.add(current.id);
      const parent = exerciseMap.get(current.variationOfId);
      if (!parent) break;
      current = parent;
    }
    return { id: current.id, name: current.name };
  }

  const familyVolumeByDate = new Map<string, { id: string; dates: Map<string, number> }>();
  for (const s of sessions) {
    const date = s.date.toISOString().slice(0, 10);
    for (const set of s.sets) {
      const root = rootOf(set.exerciseId);
      if (!familyVolumeByDate.has(root.name)) familyVolumeByDate.set(root.name, { id: root.id, dates: new Map() });
      const entry = familyVolumeByDate.get(root.name)!;
      entry.dates.set(date, (entry.dates.get(date) ?? 0) + set.weight * set.reps);
    }
  }

  const families = Array.from(familyVolumeByDate.entries())
    .map(([name, { id, dates }]) => ({
      id,
      name,
      points: Array.from(dates.entries())
        .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    }))
    .filter((f) => f.points.length >= 2)
    .sort((a, b) => b.points.length - a.points.length)
    .slice(0, 5);

  const events: { date: string; name: string; type: "start" | "stop" | "dose change" }[] = [];
  for (const s of supplements) {
    events.push({
      date: s.startDate.toISOString().slice(0, 10),
      name: s.name,
      type: s.supersedesId ? "dose change" : "start",
    });
    if (s.endDate) {
      events.push({ date: s.endDate.toISOString().slice(0, 10), name: s.name, type: "stop" });
    }
  }
  events.sort((a, b) => (a.date < b.date ? 1 : -1));

  const adherence = supplements
    .filter((s) => s.logs.length > 0)
    .map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate.toISOString().slice(0, 10),
      endDate: s.endDate ? s.endDate.toISOString().slice(0, 10) : null,
      logs: s.logs.map((l) => ({ date: l.date.toISOString().slice(0, 10), taken: l.taken })),
    }));

  return NextResponse.json({ volumeSeries, events, adherence, families });
}
