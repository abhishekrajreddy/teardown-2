"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import FadeIn from "@/components/ui/FadeIn";

type ChartPoint = { date: string; volume: number; best1RM: number };
type HistoryRow = {
  id: string;
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  rir: number | null;
  setType: string;
  oneRepMax: number;
};
type Detail = { name: string; maxWeight: number; best1RM: number; chart: ChartPoint[]; history: HistoryRow[] };

const setTypeLetter: Record<string, string> = { warmup: "W", failure: "F", dropset: "D" };
const setTypeBadge: Record<string, string> = {
  warmup: "text-ember bg-ember/15",
  failure: "text-volt bg-volt/15",
  dropset: "text-moss bg-moss/15",
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [metric, setMetric] = useState<"volume" | "best1RM">("best1RM");

  useEffect(() => {
    fetch(`/api/exercises/${id}/detail`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <p className="text-bone-dim text-sm">Loading...</p>;

  return (
    <div>
      <button onClick={() => router.back()} className="font-mono text-xs text-bone-dim mb-4">
        ← back
      </button>

      <h1 className="font-display font-semibold text-2xl mb-6">{data.name}</h1>

      <FadeIn>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-charcoal border border-iron rounded-card p-5">
            <p className="font-mono text-[10px] uppercase text-bone-dim mb-2">Heaviest weight</p>
            <p className="font-display font-bold text-3xl text-moss">{data.maxWeight}<span className="text-base text-bone-dim ml-1">kg</span></p>
          </div>
          <div className="bg-charcoal border border-iron rounded-card p-5">
            <p className="font-mono text-[10px] uppercase text-bone-dim mb-2">Best est. 1RM</p>
            <p className="font-display font-bold text-3xl text-ember">{data.best1RM}<span className="text-base text-bone-dim ml-1">kg</span></p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="bg-charcoal border border-iron rounded-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-bone-dim">Trend</p>
            <div className="flex gap-1">
              <button
                onClick={() => setMetric("best1RM")}
                className={`font-mono text-[10px] px-2.5 py-1 rounded-full border ${metric === "best1RM" ? "border-ember text-ember bg-ember/10" : "border-iron text-bone-dim"}`}
              >
                Est. 1RM
              </button>
              <button
                onClick={() => setMetric("volume")}
                className={`font-mono text-[10px] px-2.5 py-1 rounded-full border ${metric === "volume" ? "border-ember text-ember bg-ember/10" : "border-iron text-bone-dim"}`}
              >
                Volume
              </button>
            </div>
          </div>

          {data.chart.length === 0 ? (
            <p className="text-sm text-bone-dim py-6 text-center">No sets logged yet.</p>
          ) : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={data.chart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2A2D36" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#9A978E", fontSize: 10, fontFamily: "monospace" }} tickFormatter={(d) => d.slice(5)} axisLine={{ stroke: "#2A2D36" }} tickLine={false} />
                  <YAxis tick={{ fill: "#9A978E", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1D1F26", border: "1px solid #2A2D36", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} labelStyle={{ color: "#9A978E" }} />
                  <Line type="monotone" dataKey={metric} stroke="#E2853D" strokeWidth={2.5} dot={{ fill: "#E2853D", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
          Complete history
        </p>
        {data.history.length === 0 ? (
          <p className="text-sm text-bone-dim">Nothing logged yet.</p>
        ) : (
          <div className="bg-charcoal border border-iron rounded-card overflow-hidden">
            {data.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3 border-b border-iron last:border-b-0">
                <div>
                  <p className="text-sm">
                    {h.setType !== "normal" && (
                      <span className={`font-mono text-[9px] mr-2 px-1.5 py-0.5 rounded ${setTypeBadge[h.setType]}`}>
                        {setTypeLetter[h.setType]}
                      </span>
                    )}
                    {h.weight}kg × {h.reps}
                    {h.rir != null ? ` · RIR ${h.rir}` : ""}
                  </p>
                  <p className="font-mono text-[10px] text-bone-dim mt-0.5">
                    {new Date(h.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · est. 1RM {h.oneRepMax}kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
