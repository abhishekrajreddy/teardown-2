import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const lastSet = await prisma.workoutSet.findFirst({
    where: { exerciseId: params.id, session: { userId: session.user.id } },
    orderBy: { session: { date: "desc" } },
    include: { session: { select: { date: true } } },
  });

  if (!lastSet) return NextResponse.json(null);

  return NextResponse.json({
    weight: lastSet.weight,
    reps: lastSet.reps,
    rir: lastSet.rir,
    date: lastSet.session.date,
  });
}
