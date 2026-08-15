"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";

type VolumePoint = { date: string; volume: number };
type Family = { id: string; name: string; points: VolumePoint[] };
type Event = { date: string; name: string; type: "start" | "stop" | "dose change" };
type Adherence = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  logs: { date: string; taken: boolean }[];
};

const eventColor: Record<string, string> = {
  start: "text-moss",
  stop: "text-bone-dim",
  "dose change": "text-ember",
};

function last30Days(startDate: string, endDate: string | null) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(Math.max(new Date(startDate).getTime(), today.getTime() - 29 * 86400000));
  const end = endDate ? new Date(endDate) : today;

  const days: string[] = [];
  for (let d = new Date(start); d <= end && d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(new Date(d).toISOString().slice(0, 10));
  }
  return days;
}

export default function TimelinePage() {
  const [volumeSeries, setVolumeSeries] = useState<VolumePoint[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [adherence, setAdherence] = useState<Adherence[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((data) => {
        setVolumeSeries(data.volumeSeries);
        setFamilies(data.families ?? []);
        setEvents(data.events);
        setAdherence(data.adherence ?? []);
        setLoaded(true);
      });
  }, []);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-6">Timeline</h1>

      <FadeIn>
        <div className="bg-charcoal border border-iron rounded-card p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-1">
            Total volume per session
          </p>
          <p className="font-mono text-[10px] text-bone-dim mb-4">
            weight × reps summed across every set logged that day
          </p>

          {loaded && volumeSeries.length === 0 && (
            <p className="text-sm text-bone-dim py-8 text-center">
              No sessions yet — log a workout to start the trend line.
            </p>
          )}

          {volumeSeries.length > 0 && (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={volumeSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2A2D36" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9A978E", fontSize: 10, fontFamily: "monospace" }}
                    tickFormatter={(d) => d.slice(5)}
                    axisLine={{ stroke: "#2A2D36" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9A978E", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1D1F26",
                      border: "1px solid #2A2D36",
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#9A978E" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#E2853D"
                    strokeWidth={2.5}
                    dot={{ fill: "#E2853D", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </FadeIn>

      {families.length > 0 && (
        <FadeIn delay={0.06}>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-1">
            By exercise family
          </p>
          <p className="font-mono text-[10px] text-bone-dim mb-4">
            variations roll up into one trend — e.g. incline/decline press count toward bench press
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {families.map((f) => (
              <div key={f.id} className="bg-charcoal border border-iron rounded-card p-4">
                <Link href={`/exercises/${f.id}`} className="text-sm font-medium mb-2 block hover:text-ember">
                  {f.name} →
                </Link>
                <div style={{ width: "100%", height: 100 }}>
                  <ResponsiveContainer>
                    <LineChart data={f.points} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                      <YAxis tick={{ fill: "#9A978E", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#1D1F26", border: "1px solid #2A2D36", borderRadius: 8, fontFamily: "monospace", fontSize: 11 }}
                        labelStyle={{ color: "#9A978E" }}
                      />
                      <Line type="monotone" dataKey="volume" stroke="#E2853D" strokeWidth={2} dot={{ fill: "#E2853D", r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {adherence.length > 0 && (
        <FadeIn delay={0.1}>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-1">
            Supplement adherence
          </p>
          <p className="font-mono text-[10px] text-bone-dim mb-4">
            last 30 days — filled means taken, hollow means skipped or not logged
          </p>
          <div className="bg-charcoal border border-iron rounded-card p-5 mb-8">
            {adherence.map((a) => {
              const days = last30Days(a.startDate, a.endDate);
              const takenDates = new Set(a.logs.filter((l) => l.taken).map((l) => l.date));
              const takenCount = days.filter((d) => takenDates.has(d)).length;
              return (
                <div key={a.id} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{a.name}</span>
                    <span className="font-mono text-xs text-volt">
                      {takenCount}/{days.length} days
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {days.map((d) => {
                      const taken = takenDates.has(d);
                      return (
                        <span
                          key={d}
                          title={`${d} — ${taken ? "taken" : "skipped"}`}
                          className={`w-3.5 h-3.5 rounded-sm ${
                            taken ? "bg-volt" : "bg-iron"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
          Supplement events
        </p>
        {events.length === 0 ? (
          <p className="text-sm text-bone-dim">
            Nothing logged yet — supplement starts, stops, and dose changes will line up here
            against your volume trend above.
          </p>
        ) : (
          <div className="bg-charcoal border border-iron rounded-card overflow-hidden">
            {events.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 border-b border-iron last:border-b-0"
              >
                <span className="text-sm">{e.name}</span>
                <span className={`font-mono text-xs ${eventColor[e.type]}`}>
                  {e.type} · {e.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
