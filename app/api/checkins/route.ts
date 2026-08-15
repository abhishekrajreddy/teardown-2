import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayUTC } from "@/lib/date";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);

  const checkins = await prisma.dailyCheckin.findMany({
    where: {
      userId: session.user.id,
      date: { gte: new Date(Date.now() - days * 86400000) },
    },
    orderBy: { date: "desc" },
  });

  const today = todayUTC();
  const todayEntry = checkins.find((c) => c.date.getTime() === today.getTime()) ?? null;

  return NextResponse.json({ checkins, today: todayEntry });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { sleepHours, sleepQuality, mood, energy, stress, notes } = (await req.json()) as {
    sleepHours?: number;
    sleepQuality?: number;
    mood?: number;
    energy?: number;
    stress?: number;
    notes?: string;
  };

  const date = todayUTC();

  const checkin = await prisma.dailyCheckin.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { sleepHours, sleepQuality, mood, energy, stress, notes },
    create: { userId: session.user.id, date, sleepHours, sleepQuality, mood, energy, stress, notes },
  });

  return NextResponse.json(checkin);
}
