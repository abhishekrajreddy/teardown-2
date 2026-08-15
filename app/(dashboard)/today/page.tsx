import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { motivationalLine } from "@/lib/motivation";
import { sessionLabel } from "@/lib/session-label";
import DailyCheckinCard from "@/components/ui/DailyCheckinCard";
import ResumeWorkoutBanner from "@/components/ui/ResumeWorkoutBanner";
import ReadinessRing from "@/components/ui/ReadinessRing";
import { computeReadiness } from "@/lib/readiness";
import { todayUTC } from "@/lib/date";

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  const [recentSessions, sessionsThisWeek, sessionsLastWeek, activeSupplements, latestCheckin] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 4,
      include: { sets: { include: { exercise: true } }, routine: true },
    }),
    prisma.workoutSession.count({
      where: { userId, date: { gte: new Date(now - oneWeek) } },
    }),
    prisma.workoutSession.count({
      where: { userId, date: { gte: new Date(now - 2 * oneWeek), lt: new Date(now - oneWeek) } },
    }),
    prisma.supplement.findMany({
      where: { userId, endDate: null },
      orderBy: { startDate: "desc" },
    }),
    prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId, date: todayUTC() } },
    }),
  ]);

  const readinessScore = computeReadiness(latestCheckin);

  const lastSession = recentSessions[0];
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const line = motivationalLine(sessionsThisWeek, sessionsLastWeek, !!lastSession);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-semibold text-2xl">Today</h1>
        <span className="font-mono text-xs text-bone-dim">{dateLabel}</span>
      </div>

      <FadeIn>
        <div className="bg-charcoal border border-iron rounded-card mb-6 flex items-center justify-between px-6">
          <div className="flex-1 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">
              Today's readiness
            </p>
            <p className="text-sm text-bone-dim leading-relaxed max-w-[180px]">
              {readinessScore != null
                ? "From your latest check-in — sleep quality, mood, and energy averaged."
                : "Check in below to see this fill in."}
            </p>
          </div>
          <ReadinessRing score={readinessScore} />
        </div>
      </FadeIn>

      <ResumeWorkoutBanner />

      <FadeIn>
        <div className="bg-charcoal border border-iron rounded-card p-6 mb-3">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">
            Sessions this week
          </p>
          <p className="font-display font-bold text-4xl text-moss">
            <AnimatedNumber value={sessionsThisWeek} />
          </p>
          <p className="text-sm text-bone-dim mt-2">
            {lastSession
              ? `Last session: ${sessionLabel(lastSession)} · ${new Date(lastSession.date).toLocaleDateString("en-GB")}`
              : "No sessions logged yet — log your first one below."}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <p className="font-mono text-xs text-ember mb-6">{line}</p>
      </FadeIn>

      <DailyCheckinCard />

      {recentSessions.length > 0 && (
        <FadeIn delay={0.12}>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
            Recent sessions
          </p>
          <div className="flex flex-col gap-2.5 mb-6">
            {recentSessions.map((s) => {
              const totalVolume = s.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="bg-charcoal border border-iron rounded-card px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="text-sm font-medium">{sessionLabel(s)}</p>
                    <p className="font-mono text-xs text-bone-dim mt-1">
                      {new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}
                      {new Date(s.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}
                      {s.sets.length} sets
                      {s.overallFeel ? ` · felt ${s.overallFeel}/5` : ""}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-moss">
                    {Math.round(totalVolume).toLocaleString()}kg vol
                  </span>
                </Link>
              );
            })}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.18}>
        <div className="bg-charcoal border border-iron rounded-card p-6 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
            Active supplements
          </p>
          {activeSupplements.length === 0 ? (
            <p className="text-sm text-bone-dim">
              Nothing tracked yet.{" "}
              <Link href="/supplements" className="text-ember">
                Add one
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeSupplements.map((s) => (
                <span
                  key={s.id}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border border-iron text-bone-dim"
                >
                  {s.name} · {s.dose}
                  {s.unit}
                </span>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.24}>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/log"
            className="bg-charcoal border border-iron rounded-card px-5 py-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-ember font-display font-bold">+</span>
            <span className="font-medium">Log workout</span>
          </Link>
          <Link
            href="/supplements"
            className="bg-charcoal border border-iron rounded-card px-5 py-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <span className="text-ember font-display font-bold">+</span>
            <span className="font-medium">Log supplement</span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
