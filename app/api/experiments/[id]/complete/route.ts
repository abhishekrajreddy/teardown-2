import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMetricAverage, type ExperimentMetric } from "@/lib/metrics";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Your session is out of date — please log out and log back in.", code: "STALE_SESSION" }, { status: 401 });

  const experiment = await prisma.experiment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!experiment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseline = experiment.baselineSummary as { metric: ExperimentMetric };
  const now = new Date();

  const result = await computeMetricAverage(session.user.id, baseline.metric, experiment.startDate, now);

  const updated = await prisma.experiment.update({
    where: { id: params.id },
    data: {
      endDate: now,
      resultSummary: { metric: baseline.metric, ...result },
    },
  });

  return NextResponse.json(updated);
}
