"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

type MetricSummary = { metric: string; average: number | null; sampleSize: number } | null;
type Experiment = {
  id: string;
  variableDescription: string;
  startDate: string;
  endDate: string | null;
  baselineSummary: MetricSummary;
  resultSummary: MetricSummary;
};

const METRICS = [
  { value: "sleep_quality", label: "Sleep quality" },
  { value: "mood", label: "Mood" },
  { value: "energy", label: "Energy" },
  { value: "sleep_hours", label: "Sleep hours" },
  { value: "workout_volume", label: "Workout volume" },
];

function metricLabel(m: string) {
  return METRICS.find((x) => x.value === m)?.label ?? m;
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [metric, setMetric] = useState("sleep_quality");
  const [duration, setDuration] = useState("14");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/experiments")
      .then((r) => r.json())
      .then((data) => setExperiments(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    load();
  }, []);

  async function createExperiment() {
    if (!description.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variableDescription: description.trim(),
          metric,
          durationDays: Number(duration),
        }),
      });
      setDescription("");
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function complete(id: string) {
    await fetch(`/api/experiments/${id}/complete`, { method: "POST" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/experiments/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-semibold text-2xl">Experiments</h1>
        <button onClick={() => setShowForm((v) => !v)} className="font-mono text-xs text-ember">
          {showForm ? "cancel" : "+ new experiment"}
        </button>
      </div>

      {showForm && (
        <div className="bg-charcoal border border-iron rounded-card p-4 mb-6">
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">
            What are you testing?
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Does magnesium improve my sleep quality?"
            className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          />

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">
            What should we measure?
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">
            Window
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mb-4 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </select>

          <p className="font-mono text-[10px] text-bone-dim mb-4 leading-relaxed">
            Baseline is calculated automatically from your last {duration} days of logs. Come back
            after the window (or end it early) to see the result compared to that baseline.
          </p>

          <button
            onClick={createExperiment}
            disabled={!description.trim() || saving}
            className="w-full bg-ember text-graphite font-semibold rounded-card py-2.5 text-sm disabled:opacity-40"
          >
            {saving ? "Starting..." : "Start experiment"}
          </button>
        </div>
      )}

      {experiments.length === 0 && !showForm && (
        <p className="text-sm text-bone-dim">
          No experiments yet. Pick one variable — a supplement, a sleep target, a training change —
          and get a real before/after instead of a guess.
        </p>
      )}

      <AnimatePresence initial={false}>
        {experiments.map((exp, i) => {
          const isComplete = !!exp.resultSummary;
          const windowPassed = new Date(exp.endDate ?? 0) <= new Date();
          const baseline = exp.baselineSummary;
          const result = exp.resultSummary;

          return (
            <FadeIn key={exp.id} delay={i * 0.05}>
              <motion.div
                layout
                exit={{ opacity: 0, height: 0 }}
                className="bg-charcoal border border-iron rounded-card p-5 mb-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">{exp.variableDescription}</p>
                    <p className="font-mono text-xs text-bone-dim mt-1">
                      {metricLabel(baseline?.metric ?? "")} ·{" "}
                      {isComplete
                        ? "complete"
                        : windowPassed
                        ? "window ended — ready to complete"
                        : `until ${new Date(exp.endDate ?? "").toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <button onClick={() => remove(exp.id)} className="font-mono text-[10px] text-bone-dim">
                    remove
                  </button>
                </div>

                <div className="flex gap-8 mb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-bone-dim mb-1.5">Baseline</p>
                    <p className="font-display font-bold text-xl">
                      {baseline?.average ?? "—"}
                      {baseline?.sampleSize ? (
                        <span className="font-mono text-[10px] text-bone-dim ml-1">
                          ({baseline.sampleSize} logs)
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {isComplete && (
                    <div>
                      <p className="font-mono text-[10px] uppercase text-bone-dim mb-1.5">Result</p>
                      <p className="font-display font-bold text-xl text-moss">
                        {result?.average ?? "—"}
                        {result?.sampleSize ? (
                          <span className="font-mono text-[10px] text-bone-dim ml-1">
                            ({result.sampleSize} logs)
                          </span>
                        ) : null}
                      </p>
                    </div>
                  )}
                </div>

                {!isComplete && (
                  <button
                    onClick={() => complete(exp.id)}
                    className="font-mono text-xs text-ember"
                  >
                    {windowPassed ? "complete now" : "complete early"}
                  </button>
                )}
              </motion.div>
            </FadeIn>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
