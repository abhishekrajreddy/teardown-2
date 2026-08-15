import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayUTC } from "@/lib/date";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const todayStart = todayUTC();

  const supplements = await prisma.supplement.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: { logs: { where: { date: todayStart } } },
  });

  const withTodayStatus = supplements.map((s) => ({
    ...s,
    takenToday: s.logs[0]?.taken ?? null,
  }));

  return NextResponse.json(withTodayStatus);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const body = await req.json();
  const { name, category, purpose, dose, unit, timeOfDay, startDate } = body as {
    name: string;
    category?: string;
    purpose?: string;
    dose: number;
    unit: string;
    timeOfDay?: string;
    startDate?: string;
  };

  if (!name?.trim() || !dose || !unit?.trim()) {
    return NextResponse.json({ error: "Name, dose, and unit are required" }, { status: 400 });
  }

  const supplement = await prisma.supplement.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      category: category || null,
      purpose: purpose?.trim() || null,
      dose,
      unit: unit.trim(),
      timeOfDay: timeOfDay || null,
      startDate: startDate ? new Date(startDate) : new Date(),
    },
  });

  return NextResponse.json(supplement, { status: 201 });
}
