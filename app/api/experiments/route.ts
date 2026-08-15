import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetricAverage, type ExperimentMetric } from "@/lib/metrics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const experiments = await prisma.experiment.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(experiments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const { variableDescription, metric, durationDays } = (await req.json()) as {
    variableDescription: string;
    metric: ExperimentMetric;
    durationDays: number;
  };

  if (!variableDescription?.trim() || !metric || !durationDays) {
    return NextResponse.json({ error: "Description, metric, and duration are required" }, { status: 400 });
  }

  const now = new Date();
  const baselineStart = new Date(now.getTime() - durationDays * 86400000);
  const plannedEnd = new Date(now.getTime() + durationDays * 86400000);

  const baseline = await computeMetricAverage(session.user.id, metric, baselineStart, now);

  const experiment = await prisma.experiment.create({
    data: {
      userId: session.user.id,
      variableDescription: variableDescription.trim(),
      startDate: now,
      endDate: plannedEnd, // planned end — "complete" can be called early or late
      baselineSummary: { metric, ...baseline },
    },
  });

  return NextResponse.json(experiment, { status: 201 });
}
