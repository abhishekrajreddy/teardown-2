"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Supplement = {
  id: string;
  name: string;
  category: string | null;
  purpose: string | null;
  dose: number;
  unit: string;
  timeOfDay: string | null;
  startDate: string;
  endDate: string | null;
  supersedesId: string | null;
  takenToday: boolean | null;
};

const CATEGORIES = ["vitamin", "mineral", "performance", "other"];

function statusOf(s: Supplement): "active" | "watching" | "stopped" {
  if (s.endDate) return "stopped";
  const daysSinceStart = (Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceStart <= 14 ? "watching" : "active";
}

const badgeStyles: Record<string, string> = {
  active: "text-moss bg-moss/10",
  watching: "text-ember bg-ember/10",
  stopped: "text-bone-dim bg-iron/40",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("vitamin");
  const [purpose, setPurpose] = useState("");
  const [dose, setDose] = useState("");
  const [unit, setUnit] = useState("mg");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [doseChangeId, setDoseChangeId] = useState<string | null>(null);
  const [newDose, setNewDose] = useState("");

  function load() {
    fetch("/api/supplements")
      .then((r) => r.json())
      .then((data) => setSupplements(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    load();
  }, []);

  async function addSupplement() {
    if (!name.trim() || !dose) return;
    setSaving(true);
    try {
      await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          purpose: purpose.trim() || undefined,
          dose: Number(dose),
          unit,
          timeOfDay,
        }),
      });
      setName("");
      setPurpose("");
      setDose("");
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function stopSupplement(id: string) {
    await fetch(`/api/supplements/${id}/stop`, { method: "POST" });
    load();
  }

  async function logAdherence(id: string, taken: boolean) {
    await fetch(`/api/supplements/${id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taken }),
    });
    load();
  }

  async function submitDoseChange(id: string) {
    if (!newDose) return;
    await fetch(`/api/supplements/${id}/change-dose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDose: Number(newDose) }),
    });
    setDoseChangeId(null);
    setNewDose("");
    load();
  }

  const currentOnly = supplements.filter((s) => {
    const isSuperseded = supplements.some((other) => other.supersedesId === s.id);
    return !isSuperseded;
  });

  const vitamins = currentOnly.filter((s) => s.category === "vitamin");
  const others = currentOnly.filter((s) => s.category !== "vitamin");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-semibold text-2xl">Supplements</h1>
        <button onClick={() => setShowForm((v) => !v)} className="font-mono text-xs text-ember">
          {showForm ? "cancel" : "+ add"}
        </button>
      </div>

      {showForm && (
        <div className="bg-charcoal border border-iron rounded-card p-4 mb-6">
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vitamin D3"
            className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          />

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">
            Why you're taking it (optional)
          </label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. sleep quality, immune support"
            className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Dose</label>
              <input
                type="number"
                inputMode="decimal"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
              >
                {["mg", "g", "IU", "mcg", "ml"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Time of day</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full mb-4 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
          >
            <option value="morning">morning</option>
            <option value="evening">evening</option>
          </select>

          <button
            onClick={addSupplement}
            disabled={!name.trim() || !dose || saving}
            className="w-full bg-ember text-graphite font-semibold rounded-card py-2.5 text-sm disabled:opacity-40"
          >
            {saving ? "Adding..." : "Start tracking"}
          </button>
        </div>
      )}

      {vitamins.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
            Vitamins
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <AnimatePresence initial={false}>
              {vitamins.map((s) => {
                const status = statusOf(s);
                const daysActive = Math.floor(
                  (Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)
                );
                const expanded = expandedId === s.id;
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="bg-charcoal border border-iron rounded-card p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-volt/15 text-volt font-display font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {initials(s.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="font-mono text-xs text-bone-dim mt-0.5">
                          {s.dose}
                          {s.unit} · {s.timeOfDay ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${badgeStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>

                    {s.purpose && (
                      <p className="text-xs text-bone-dim mb-3 italic">"{s.purpose}"</p>
                    )}

                    {status !== "stopped" && (
                      <button
                        onClick={() => logAdherence(s.id, !s.takenToday)}
                        className={`w-full mb-3 rounded-card py-2 text-xs font-mono uppercase tracking-wide border transition-colors ${
                          s.takenToday ? "bg-volt/15 border-volt text-volt" : "border-iron text-bone-dim"
                        }`}
                      >
                        {s.takenToday ? "taken today" : "mark taken today"}
                      </button>
                    )}

                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="font-display font-bold text-2xl text-moss">
                        {status === "stopped" ? "—" : daysActive}
                      </span>
                      <span className="font-mono text-[10px] text-bone-dim uppercase">
                        {status === "stopped" ? "stopped" : "days tracked"}
                      </span>
                    </div>

                    {status !== "stopped" && (
                      <button
                        onClick={() => setExpandedId(expanded ? null : s.id)}
                        className="font-mono text-[10px] text-bone-dim uppercase tracking-wide"
                      >
                        {expanded ? "close" : "manage"}
                      </button>
                    )}

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-4 mt-3 pt-3 border-t border-iron">
                            <button
                              onClick={() => setDoseChangeId(doseChangeId === s.id ? null : s.id)}
                              className="font-mono text-[10px] text-bone-dim uppercase tracking-wide"
                            >
                              change dose
                            </button>
                            <button
                              onClick={() => stopSupplement(s.id)}
                              className="font-mono text-[10px] text-bone-dim uppercase tracking-wide"
                            >
                              stop
                            </button>
                          </div>
                          {doseChangeId === s.id && (
                            <div className="flex gap-2 mt-3">
                              <input
                                type="number"
                                inputMode="decimal"
                                value={newDose}
                                onChange={(e) => setNewDose(e.target.value)}
                                placeholder={`new dose (${s.unit})`}
                                className="flex-1 bg-graphite border border-iron rounded-card px-3 py-2 text-sm focus:outline-none focus:border-ember"
                              />
                              <button
                                onClick={() => submitDoseChange(s.id)}
                                className="bg-ember text-graphite font-semibold rounded-card px-4 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">
            Other supplements
          </p>
          <div className="bg-charcoal border border-iron rounded-card overflow-hidden mb-2">
            {others.map((s) => {
              const status = statusOf(s);
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b border-iron last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="font-mono text-xs text-bone-dim mt-0.5">
                      {s.dose}
                      {s.unit} · {s.timeOfDay ?? "—"}
                      {s.purpose ? ` · ${s.purpose}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full ${badgeStyles[status]}`}>
                      {status}
                    </span>
                    {status !== "stopped" && (
                      <button onClick={() => stopSupplement(s.id)} className="font-mono text-[10px] text-bone-dim uppercase">
                        stop
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {currentOnly.length === 0 && !showForm && (
        <p className="text-bone-dim text-sm">
          Nothing tracked yet — add a vitamin or supplement above to start building its timeline.
        </p>
      )}
    </div>
  );
}
