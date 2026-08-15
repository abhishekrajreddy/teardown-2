import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type IncomingSet = {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
  setType?: string;
  notes?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const body = await req.json();
  const { overallFeel, notes, routineId, date, sets } = body as {
    overallFeel?: number;
    notes?: string;
    routineId?: string;
    date?: string;
    sets: IncomingSet[];
  };

  if (!sets?.length) {
    return NextResponse.json({ error: "A session needs at least one set" }, { status: 400 });
  }

  const created = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      overallFeel,
      notes,
      routineId,
      date: date ? new Date(date) : new Date(),
      sets: { create: sets },
    },
    include: { sets: true },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 10,
    include: { sets: { include: { exercise: true } } },
  });

  return NextResponse.json(sessions);
}
