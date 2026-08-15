import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } }, routine: true },
  });

  if (!workoutSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workoutSession);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { overallFeel, notes } = (await req.json()) as { overallFeel?: number; notes?: string };

  const result = await prisma.workoutSession.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: { overallFeel, notes },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const result = await prisma.workoutSession.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
