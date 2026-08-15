import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateOneRepMax } from "@/lib/one-rep-max";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const root = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!root) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Roll up every exercise that's this one, or a variation of it (one level,
  // matching how the taxonomy is seeded — e.g. bench press + incline/decline).
  const family = await prisma.exercise.findMany({
    where: { OR: [{ id: root.id }, { variationOfId: root.id }] },
  });
  const familyIds = family.map((f) => f.id);

  const sets = await prisma.workoutSet.findMany({
    where: { exerciseId: { in: familyIds }, session: { userId: session.user.id } },
    include: { session: { select: { date: true } }, exercise: { select: { name: true } } },
    orderBy: { session: { date: "desc" } },
  });

  const workingSets = sets.filter((s) => s.setType !== "warmup");

  const maxWeight = workingSets.length ? Math.max(...workingSets.map((s) => s.weight)) : 0;
  const best1RM = workingSets.length
    ? Math.max(...workingSets.map((s) => estimateOneRepMax(s.weight, s.reps)))
    : 0;

  // Per-session rollup for the charts: best 1RM that day + total volume that day
  const bySessionDate = new Map<string, { volume: number; best1RM: number }>();
  for (const s of workingSets) {
    const date = s.session.date.toISOString().slice(0, 10);
    const entry = bySessionDate.get(date) ?? { volume: 0, best1RM: 0 };
    entry.volume += s.weight * s.reps;
    entry.best1RM = Math.max(entry.best1RM, estimateOneRepMax(s.weight, s.reps));
    bySessionDate.set(date, entry);
  }
  const chart = Array.from(bySessionDate.entries())
    .map(([date, v]) => ({ date, volume: Math.round(v.volume), best1RM: Math.round(v.best1RM * 10) / 10 }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const history = sets.map((s) => ({
    id: s.id,
    date: s.session.date.toISOString(),
    exerciseName: s.exercise.name,
    weight: s.weight,
    reps: s.reps,
    rir: s.rir,
    setType: s.setType,
    oneRepMax: estimateOneRepMax(s.weight, s.reps),
  }));

  return NextResponse.json({
    name: root.name,
    maxWeight,
    best1RM,
    chart,
    history,
  });
}
