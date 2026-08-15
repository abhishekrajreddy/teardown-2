import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { newDose } = (await req.json()) as { newDose: number };
  if (!newDose) return NextResponse.json({ error: "newDose is required" }, { status: 400 });

  const current = await prisma.supplement.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();

  const [, updated] = await prisma.$transaction([
    prisma.supplement.update({ where: { id: current.id }, data: { endDate: now } }),
    prisma.supplement.create({
      data: {
        userId: session.user.id,
        name: current.name,
        category: current.category,
        purpose: current.purpose,
        dose: newDose,
        unit: current.unit,
        timeOfDay: current.timeOfDay,
        startDate: now,
        supersedesId: current.id,
      },
    }),
  ]);

  return NextResponse.json(updated, { status: 201 });
}
