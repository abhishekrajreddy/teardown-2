import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const routines = await prisma.routine.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
  });

  return NextResponse.json(routines);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { name, exerciseIds } = (await req.json()) as { name: string; exerciseIds: string[] };

  if (!name?.trim() || !exerciseIds?.length) {
    return NextResponse.json({ error: "Name and at least one exercise are required" }, { status: 400 });
  }

  const routine = await prisma.routine.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      exercises: {
        create: exerciseIds.map((exerciseId, i) => ({ exerciseId, order: i })),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });

  return NextResponse.json(routine, { status: 201 });
}
