import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayUTC } from "@/lib/date";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { taken } = (await req.json()) as { taken: boolean };
  const supplement = await prisma.supplement.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!supplement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const date = todayUTC();

  const log = await prisma.supplementLog.upsert({
    where: { supplementId_date: { supplementId: params.id, date } },
    update: { taken },
    create: { supplementId: params.id, date, taken },
  });

  return NextResponse.json(log);
}
