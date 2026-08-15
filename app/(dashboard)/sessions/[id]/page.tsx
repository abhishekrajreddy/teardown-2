"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

type Set = {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
  exercise: { name: string; bodyPart: string };
};
type SessionDetail = {
  id: string;
  date: string;
  overallFeel: number | null;
  routine: { name: string } | null;
  sets: Set[];
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<SessionDetail | null>(null);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editRir, setEditRir] = useState("");

  function load() {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(() => {
    load();
  }, [id]);

  function startEdit(set: Set) {
    setEditingSetId(set.id);
    setEditWeight(String(set.weight));
    setEditReps(String(set.reps));
    setEditRir(set.rir != null ? String(set.rir) : "");
  }

  async function saveEdit(setId: string) {
    await fetch(`/api/sessions/${id}/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: Number(editWeight),
        reps: Number(editReps),
        rir: editRir === "" ? null : Number(editRir),
      }),
    });
    setEditingSetId(null);
    load();
  }

  async function deleteSet(setId: string) {
    await fetch(`/api/sessions/${id}/sets/${setId}`, { method: "DELETE" });
    load();
  }

  async function deleteSession() {
    if (!confirm("Delete this whole session? This can't be undone.")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.push("/today");
  }

  async function setOverallFeel(feel: number) {
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overallFeel: feel }),
    });
    load();
  }

  if (!data) return <p className="text-bone-dim text-sm">Loading...</p>;

  return (
    <div>
      <button onClick={() => router.push("/today")} className="font-mono text-xs text-bone-dim mb-4">
        ← back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">{data.routine?.name ?? "Session"}</h1>
          <p className="font-mono text-xs text-bone-dim mt-1">
            {new Date(data.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" · "}
            {new Date(data.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button onClick={deleteSession} className="font-mono text-xs text-ember">
          delete session
        </button>
      </div>

      <FadeIn>
        <div className="bg-charcoal border border-iron rounded-card p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
            How did it feel overall?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setOverallFeel(n)}
                className={`flex-1 py-2.5 rounded-card font-mono text-sm border ${
                  data.overallFeel === n
                    ? "border-moss bg-moss/10 text-moss"
                    : "border-iron text-bone-dim"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="bg-charcoal border border-iron rounded-card overflow-hidden">
          <AnimatePresence initial={false}>
            {data.sets.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 py-4 border-b border-iron last:border-b-0"
              >
                {editingSetId === s.id ? (
                  <div>
                    <p className="text-sm font-medium mb-2">{s.exercise.name}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="bg-graphite border border-iron rounded-card px-2 py-2 text-sm font-mono text-center focus:outline-none focus:border-ember"
                        placeholder="kg"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editReps}
                        onChange={(e) => setEditReps(e.target.value)}
                        className="bg-graphite border border-iron rounded-card px-2 py-2 text-sm font-mono text-center focus:outline-none focus:border-ember"
                        placeholder="reps"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editRir}
                        onChange={(e) => setEditRir(e.target.value)}
                        className="bg-graphite border border-iron rounded-card px-2 py-2 text-sm font-mono text-center focus:outline-none focus:border-ember"
                        placeholder="RIR"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="font-mono text-xs text-moss"
                      >
                        save
                      </button>
                      <button
                        onClick={() => setEditingSetId(null)}
                        className="font-mono text-xs text-bone-dim"
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.exercise.name}</p>
                      <p className="font-mono text-xs text-bone-dim mt-0.5">
                        set {s.setNumber} · {s.weight}kg × {s.reps}
                        {s.rir != null ? ` · RIR ${s.rir}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(s)} className="font-mono text-xs text-bone-dim">
                        edit
                      </button>
                      <button onClick={() => deleteSet(s.id)} className="font-mono text-xs text-bone-dim">
                        remove
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </FadeIn>
    </div>
  );
}
