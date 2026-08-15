import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type IncomingMetric = { date: string; metricType: string; value: number };

export async function POST(req: Request) {
  // Two ways in: a logged-in session (manual entry from the app itself)
  // or a Bearer token (Shortcuts/Health Auto Export, which can't hold a
  // browser session). Whichever succeeds determines the user.
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;
  let source = "manual";

  if (!userId) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { apiToken: token } });
    if (!user) return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
    userId = user.id;
    source = "apple_health";
  }

  const { metrics } = (await req.json()) as { metrics: IncomingMetric[] };
  if (!metrics?.length) {
    return NextResponse.json({ error: "metrics array is required" }, { status: 400 });
  }

  await prisma.healthMetric.createMany({
    data: metrics.map((m) => ({
      userId: userId!,
      date: new Date(m.date),
      metricType: m.metricType,
      value: m.value,
      source,
    })),
  });

  return NextResponse.json({ ok: true, inserted: metrics.length });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);

  const metrics = await prisma.healthMetric.findMany({
    where: { userId: session.user.id, date: { gte: new Date(Date.now() - days * 86400000) } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(metrics);
}
