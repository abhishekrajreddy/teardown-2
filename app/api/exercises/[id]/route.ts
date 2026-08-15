import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const existing = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only rename exercises you created yourself." },
      { status: 403 }
    );
  }

  const { name, bodyPart } = (await req.json()) as { name?: string; bodyPart?: string };

  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(bodyPart?.trim() ? { bodyPart: bodyPart.trim() } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const existing = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only delete exercises you created yourself." },
      { status: 403 }
    );
  }

  const setCount = await prisma.workoutSet.count({ where: { exerciseId: params.id } });
  if (setCount > 0) {
    return NextResponse.json(
      { error: `This exercise has ${setCount} logged set(s) — rename it instead of deleting, so your history stays intact.` },
      { status: 409 }
    );
  }

  await prisma.routineExercise.deleteMany({ where: { exerciseId: params.id } });
  await prisma.exercise.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
