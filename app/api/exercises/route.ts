import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  // Shared defaults (userId null) + this user's own custom exercises only —
  // nobody sees or can touch another user's custom exercises.
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId: session.user.id }] },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      bodyPart: true,
      equipment: true,
      variationOfId: true,
      userId: true,
      _count: { select: { sets: true } },
    },
  });

  return NextResponse.json(
    exercises.map((e) => ({ ...e, setCount: e._count.sets, _count: undefined }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const body = await req.json();
  const { name, bodyPart, muscleGroup, movementPattern, equipment, variationOfId } = body as {
    name: string;
    bodyPart: string;
    muscleGroup?: string;
    movementPattern?: string;
    equipment?: string;
    variationOfId?: string;
  };

  if (!name?.trim() || !bodyPart?.trim()) {
    return NextResponse.json({ error: "Name and body part are required" }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      bodyPart: bodyPart.trim(),
      muscleGroup: muscleGroup?.trim() || null,
      movementPattern: movementPattern?.trim() || null,
      equipment: equipment?.trim() || null,
      variationOfId: variationOfId || null,
      isCustom: true,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
