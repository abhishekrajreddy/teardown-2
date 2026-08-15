import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; setId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const set = await prisma.workoutSet.findFirst({
    where: { id: params.setId, sessionId: params.id, session: { userId: session.user.id } },
  });
  if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { weight, reps, rir } = (await req.json()) as {
    weight?: number;
    reps?: number;
    rir?: number | null;
  };

  const updated = await prisma.workoutSet.update({
    where: { id: params.setId },
    data: { weight, reps, rir },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; setId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const set = await prisma.workoutSet.findFirst({
    where: { id: params.setId, sessionId: params.id, session: { userId: session.user.id } },
  });
  if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workoutSet.delete({ where: { id: params.setId } });
  return NextResponse.json({ ok: true });
}
