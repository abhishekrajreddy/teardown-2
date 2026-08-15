import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateOneRepMax } from "@/lib/one-rep-max";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const sets = await prisma.workoutSet.findMany({
    where: { exerciseId: params.id, setType: { not: "warmup" }, session: { userId: session.user.id } },
  });

  if (sets.length === 0) {
    return NextResponse.json({ maxWeight: 0, best1RM: 0 });
  }

  const maxWeight = Math.max(...sets.map((s) => s.weight));
  const best1RM = Math.max(...sets.map((s) => estimateOneRepMax(s.weight, s.reps)));

  return NextResponse.json({ maxWeight, best1RM });
}
