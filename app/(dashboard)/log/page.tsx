"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";
import { iconForExercise } from "@/lib/exercise-icons";
import { estimateOneRepMax } from "@/lib/one-rep-max";

type Exercise = { id: string; name: string; bodyPart: string; equipment: string | null; setCount: number; userId: string | null };
type RoutineExercise = { exercise: Exercise };
type Routine = { id: string; name: string; exercises: RoutineExercise[] };
type LastPerformance = { weight: number; reps: number; rir: number | null; date: string } | null;
type SetType = "normal" | "warmup" | "failure" | "dropset";
type LoggedSet = {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
  setType: SetType;
  notes: string;
};

const BODY_PARTS = ["chest", "back", "legs", "shoulders", "arms", "core", "other"];
const EQUIPMENT_TYPES = ["barbell", "dumbbell", "cable", "machine", "bodyweight"];
const DRAFT_KEY = "teardown-log-draft";

const SET_TYPES: { value: SetType; label: string; letter: string; color: string }[] = [
  { value: "normal", label: "Normal", letter: "1", color: "border-iron text-bone-dim" },
  { value: "warmup", label: "Warmup", letter: "W", color: "border-ember text-ember bg-ember/10" },
  { value: "failure", label: "Failure", letter: "F", color: "border-volt text-volt bg-volt/10" },
  { value: "dropset", label: "Drop set", letter: "D", color: "border-moss text-moss bg-moss/10" },
];

export default function LogWorkoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [lastPerformance, setLastPerformance] = useState<LastPerformance>(null);
  const [best, setBest] = useState<{ maxWeight: number; best1RM: number } | null>(null);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("2");
  const [setType, setSetType] = useState<SetType>("normal");
  const [setNotes, setSetNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [prToast, setPrToast] = useState<string | null>(null);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineId, setRoutineId] = useState("");
  const [showNewRoutine, setShowNewRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineExerciseIds, setNewRoutineExerciseIds] = useState<string[]>([]);
  const [creatingRoutine, setCreatingRoutine] = useState(false);

  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBodyPart, setNewBodyPart] = useState("chest");
  const [newVariationOf, setNewVariationOf] = useState("");
  const [creating, setCreating] = useState(false);

  const [showManage, setShowManage] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [manageError, setManageError] = useState("");

  function loadExercises() {
    fetch("/api/exercises").then((r) => r.json()).then((data) => setExercises(Array.isArray(data) ? data : []));
  }
  function loadRoutines() {
    fetch("/api/routines").then((r) => r.json()).then((data) => setRoutines(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadExercises();
    loadRoutines();
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.loggedSets?.length) {
          setLoggedSets(draft.loggedSets);
          setSessionStartedAt(draft.sessionStartedAt ? new Date(draft.sessionStartedAt) : null);
          setRoutineId(draft.routineId ?? "");
        }
      } catch {}
    }
    setDraftRestored(true);
  }, []);

  useEffect(() => {
    if (!draftRestored) return;
    if (loggedSets.length === 0) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ loggedSets, sessionStartedAt, routineId }));
  }, [loggedSets, sessionStartedAt, routineId, draftRestored]);

  // live elapsed-time counter
  useEffect(() => {
    if (!sessionStartedAt) return;
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartedAt.getTime()) / 1000));
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, [sessionStartedAt]);

  useEffect(() => {
    if (!exerciseId) {
      setLastPerformance(null);
      setBest(null);
      return;
    }
    fetch(`/api/exercises/${exerciseId}/last`).then((r) => r.json()).then((data) => {
      setLastPerformance(data);
      if (data) {
        setWeight(String(data.weight));
        setReps(String(data.reps));
        setRir(data.rir != null ? String(data.rir) : "2");
      }
    });
    fetch(`/api/exercises/${exerciseId}/best`).then((r) => r.json()).then(setBest);
  }, [exerciseId]);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  function startRestTimer(seconds: number) {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestSecondsLeft(seconds);
    restIntervalRef.current = setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s === null || s <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          return null;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function createExercise() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), bodyPart: newBodyPart, variationOfId: newVariationOf || undefined }),
      });
      const created = await res.json();
      loadExercises();
      setExerciseId(created.id);
      setShowNewExercise(false);
      setNewName("");
      setNewVariationOf("");
    } finally {
      setCreating(false);
    }
  }

  async function renameExercise(id: string) {
    if (!renameValue.trim()) return;
    await fetch(`/api/exercises/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    setRenamingId(null);
    loadExercises();
  }

  async function deleteExercise(id: string) {
    setManageError("");
    const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      setManageError(body.error);
      return;
    }
    if (exerciseId === id) setExerciseId("");
    loadExercises();
  }

  function toggleRoutineExercise(id: string) {
    setNewRoutineExerciseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function createRoutine() {
    if (!newRoutineName.trim() || newRoutineExerciseIds.length === 0) return;
    setCreatingRoutine(true);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoutineName.trim(), exerciseIds: newRoutineExerciseIds }),
      });
      const created = await res.json();
      loadRoutines();
      setRoutineId(created.id);
      setShowNewRoutine(false);
      setNewRoutineName("");
      setNewRoutineExerciseIds([]);
    } finally {
      setCreatingRoutine(false);
    }
  }

  function addSet() {
    if (!exerciseId || !weight || !reps) return;
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    if (!sessionStartedAt) setSessionStartedAt(new Date());

    const w = Number(weight);
    const r = Number(reps);

    if (setType !== "warmup" && best) {
      const thisOneRM = estimateOneRepMax(w, r);
      if (w > best.maxWeight) {
        setPrToast(`New PR — heaviest weight on ${exercise.name}: ${w}kg`);
        setBest((b) => (b ? { ...b, maxWeight: w } : b));
      } else if (thisOneRM > best.best1RM) {
        setPrToast(`New PR — best est. 1RM on ${exercise.name}: ${thisOneRM}kg`);
        setBest((b) => (b ? { ...b, best1RM: thisOneRM } : b));
      }
    }

    const alreadyLogged = loggedSets.filter((s) => s.exerciseId === exerciseId).length;
    setLoggedSets((prev) => [
      ...prev,
      { exerciseId, exerciseName: exercise.name, setNumber: alreadyLogged + 1, weight: w, reps: r, rir: rir === "" ? null : Number(rir), setType, notes: setNotes.trim() },
    ]);

    startRestTimer(setType === "warmup" ? 45 : 90);
    setSetType("normal");
    setSetNotes("");
    setShowNotes(false);
  }

  function removeSet(index: number) {
    setLoggedSets((prev) => prev.filter((_, i) => i !== index));
  }

  async function finishSession() {
    if (!loggedSets.length) return;
    setSaving(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: routineId || undefined,
          date: (sessionStartedAt ?? new Date()).toISOString(),
          sets: loggedSets.map(({ exerciseId, setNumber, weight, reps, rir, setType, notes }) => ({ exerciseId, setNumber, weight, reps, rir, setType, notes: notes || undefined })),
        }),
      });
      localStorage.removeItem(DRAFT_KEY);
      router.push("/today");
    } finally {
      setSaving(false);
    }
  }

  const selectedRoutine = routines.find((r) => r.id === routineId);
  const selectedExercise = exercises.find((e) => e.id === exerciseId);
  const SelectedIcon = selectedExercise ? iconForExercise(selectedExercise.equipment) : null;

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesEquipment = !equipmentFilter || e.equipment === equipmentFilter;
    return matchesSearch && matchesEquipment;
  });

  const totalVolume = loggedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div>
      <AnimatePresence>
        {prToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onAnimationComplete={() => setTimeout(() => setPrToast(null), 2200)}
            className="fixed top-4 left-4 right-4 z-50 bg-ember text-graphite font-semibold text-sm rounded-card px-4 py-3 text-center shadow-lg"
          >
            🏆 {prToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-semibold text-2xl">Log workout</h1>
        {restSecondsLeft !== null && (
          <button
            onClick={() => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); setRestSecondsLeft(null); }}
            className="font-mono text-xs bg-charcoal border border-iron rounded-full px-3 py-1.5 text-ember"
          >
            rest {Math.floor(restSecondsLeft / 60)}:{String(restSecondsLeft % 60).padStart(2, "0")}
          </button>
        )}
      </div>

      {/* live stats — matches the always-visible duration/volume/sets header pattern */}
      {sessionStartedAt && (
        <div className="grid grid-cols-3 gap-2.5 mb-6 bg-charcoal border border-iron rounded-card p-4">
          <div className="text-center">
            <p className="font-mono text-[9px] uppercase text-bone-dim mb-1">Duration</p>
            <p className="font-display font-bold text-lg text-volt">{mins}:{String(secs).padStart(2, "0")}</p>
          </div>
          <div className="text-center border-x border-iron">
            <p className="font-mono text-[9px] uppercase text-bone-dim mb-1">Volume</p>
            <p className="font-display font-bold text-lg text-moss">{Math.round(totalVolume).toLocaleString()}kg</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[9px] uppercase text-bone-dim mb-1">Sets</p>
            <p className="font-display font-bold text-lg text-ember">{loggedSets.length}</p>
          </div>
        </div>
      )}

      <label className="block font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">Routine (optional)</label>
      <select value={routineId} onChange={(e) => setRoutineId(e.target.value)} className="w-full mb-2 bg-charcoal border border-iron rounded-card px-4 py-3.5 text-base focus:outline-none focus:border-ember">
        <option value="">No routine — log freely</option>
        {routines.map((r) => (<option key={r.id} value={r.id}>{r.name} ({r.exercises.length} exercises)</option>))}
      </select>

      <button onClick={() => setShowNewRoutine((v) => !v)} className="font-mono text-xs text-ember mb-4">
        {showNewRoutine ? "cancel" : "+ create a workout"}
      </button>

      {showNewRoutine && (
        <div className="bg-charcoal border border-iron rounded-card p-4 mb-5">
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Workout name</label>
          <input value={newRoutineName} onChange={(e) => setNewRoutineName(e.target.value)} placeholder="e.g. Push day" className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember" />
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-2">Pick the exercises that make up this workout</label>
          <div className="flex flex-col gap-2 mb-4 max-h-56 overflow-y-auto">
            {exercises.map((ex) => (
              <label key={ex.id} className="flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={newRoutineExerciseIds.includes(ex.id)} onChange={() => toggleRoutineExercise(ex.id)} className="accent-ember" />
                {ex.name} <span className="text-bone-dim font-mono text-xs">({ex.bodyPart})</span>
              </label>
            ))}
          </div>
          <button onClick={createRoutine} disabled={!newRoutineName.trim() || newRoutineExerciseIds.length === 0 || creatingRoutine} className="w-full bg-ember text-graphite font-semibold rounded-card py-2.5 text-sm disabled:opacity-40">
            {creatingRoutine ? "Creating..." : "Create workout"}
          </button>
        </div>
      )}

      {selectedRoutine && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedRoutine.exercises.map(({ exercise }) => {
            const Icon = iconForExercise(exercise.equipment);
            return (
              <button key={exercise.id} onClick={() => setExerciseId(exercise.id)} className={`font-mono text-xs px-3 py-2 rounded-full border flex items-center gap-1.5 ${exerciseId === exercise.id ? "border-ember text-ember bg-ember/10" : "border-iron text-bone-dim"}`}>
                <Icon size={12} /> {exercise.name}
              </button>
            );
          })}
        </div>
      )}

      <label className="block font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">Exercise</label>

      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-dim pointer-events-none" />
        <input
          value={exerciseSearch}
          onChange={(e) => setExerciseSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-charcoal border border-iron rounded-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-ember"
        />
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        <button onClick={() => setEquipmentFilter("")} className={`font-mono text-[10px] px-2.5 py-1.5 rounded-full border whitespace-nowrap ${!equipmentFilter ? "border-ember text-ember bg-ember/10" : "border-iron text-bone-dim"}`}>All</button>
        {EQUIPMENT_TYPES.map((eq) => (
          <button key={eq} onClick={() => setEquipmentFilter(eq)} className={`font-mono text-[10px] px-2.5 py-1.5 rounded-full border whitespace-nowrap ${equipmentFilter === eq ? "border-ember text-ember bg-ember/10" : "border-iron text-bone-dim"}`}>{eq}</button>
        ))}
      </div>

      <div className="relative mb-2">
        {SelectedIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
            <SelectedIcon size={16} />
          </span>
        )}
        <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} className={`w-full bg-charcoal border border-iron rounded-card py-3.5 text-base focus:outline-none focus:border-ember ${SelectedIcon ? "pl-10 pr-4" : "px-4"}`}>
          <option value="">Select an exercise ({filteredExercises.length})</option>
          {filteredExercises.map((ex) => (<option key={ex.id} value={ex.id}>{ex.name} — {ex.bodyPart}</option>))}
        </select>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setShowNewExercise((v) => !v)} className="font-mono text-xs text-ember">{showNewExercise ? "cancel" : "+ create new exercise"}</button>
        <button onClick={() => setShowManage((v) => !v)} className="font-mono text-xs text-bone-dim">{showManage ? "close" : "manage exercises"}</button>
        {exerciseId && (
          <Link href={`/exercises/${exerciseId}`} className="font-mono text-xs text-bone-dim ml-auto">
            history →
          </Link>
        )}
      </div>

      {showManage && (
        <div className="bg-charcoal border border-iron rounded-card p-4 mb-5 max-h-72 overflow-y-auto">
          {manageError && <p className="font-mono text-[10px] text-ember mb-3">{manageError}</p>}
          {exercises.map((ex) => (
            <div key={ex.id} className="flex items-center gap-2 py-2 border-b border-iron last:border-b-0">
              {renamingId === ex.id ? (
                <>
                  <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="flex-1 bg-graphite border border-iron rounded-card px-2 py-1.5 text-sm focus:outline-none focus:border-ember" />
                  <button onClick={() => renameExercise(ex.id)} className="font-mono text-[10px] text-moss">save</button>
                  <button onClick={() => setRenamingId(null)} className="font-mono text-[10px] text-bone-dim">cancel</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{ex.name} <span className="text-bone-dim font-mono text-xs">({ex.bodyPart})</span>{!ex.userId && <span className="text-bone-dim font-mono text-[9px] ml-1">shared</span>}</span>
                  {ex.userId === session?.user?.id ? (
                    <>
                      <button onClick={() => { setRenamingId(ex.id); setRenameValue(ex.name); }} className="font-mono text-[10px] text-bone-dim">rename</button>
                      <button onClick={() => deleteExercise(ex.id)} disabled={ex.setCount > 0} title={ex.setCount > 0 ? `Has ${ex.setCount} logged set(s) — rename instead` : "Delete"} className="font-mono text-[10px] text-bone-dim disabled:opacity-30">delete</button>
                    </>
                  ) : (
                    <span className="font-mono text-[10px] text-bone-dim opacity-40">shared default</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showNewExercise && (
        <div className="bg-charcoal border border-iron rounded-card p-4 mb-5">
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Exercise name</label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Cable lateral raise" className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember" />
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Body part</label>
          <select value={newBodyPart} onChange={(e) => setNewBodyPart(e.target.value)} className="w-full mb-3 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember">
            {BODY_PARTS.map((bp) => (<option key={bp} value={bp}>{bp}</option>))}
          </select>
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Part of an existing exercise family? (optional)</label>
          <select value={newVariationOf} onChange={(e) => setNewVariationOf(e.target.value)} className="w-full mb-4 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember">
            <option value="">No — standalone exercise</option>
            {exercises.map((ex) => (<option key={ex.id} value={ex.id}>Variation of {ex.name}</option>))}
          </select>
          <button onClick={createExercise} disabled={!newName.trim() || creating} className="w-full bg-ember text-graphite font-semibold rounded-card py-2.5 text-sm disabled:opacity-40">
            {creating ? "Creating..." : "Create exercise"}
          </button>
        </div>
      )}

      {lastPerformance && (
        <p className="font-mono text-xs text-bone-dim mb-2">
          Last time: {lastPerformance.weight}kg × {lastPerformance.reps}{lastPerformance.rir != null ? ` · RIR ${lastPerformance.rir}` : ""} on {new Date(lastPerformance.date).toLocaleDateString("en-GB")}
        </p>
      )}
      {best && best.maxWeight > 0 && (
        <p className="font-mono text-xs text-moss mb-5">PR: {best.maxWeight}kg heaviest · {best.best1RM}kg est. 1RM</p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Weight (kg)</label>
          <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-charcoal border border-iron rounded-card px-3 py-3.5 text-lg font-mono text-center focus:outline-none focus:border-ember" />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Reps</label>
          <input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-charcoal border border-iron rounded-card px-3 py-3.5 text-lg font-mono text-center focus:outline-none focus:border-ember" />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">RIR</label>
          <input type="number" inputMode="numeric" min={0} max={4} value={rir} onChange={(e) => setRir(e.target.value)} className="w-full bg-charcoal border border-iron rounded-card px-3 py-3.5 text-lg font-mono text-center focus:outline-none focus:border-ember" />
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase text-bone-dim mb-2">Set type</p>
      <div className="flex gap-2 mb-4">
        {SET_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setSetType(t.value)}
            className={`flex-1 py-2.5 rounded-card font-mono text-xs border flex flex-col items-center gap-0.5 ${setType === t.value ? t.color : "border-iron text-bone-dim"}`}
          >
            <span className="font-bold">{t.letter}</span>
            {t.label}
          </button>
        ))}
      </div>

      <button onClick={() => setShowNotes((v) => !v)} className="font-mono text-xs text-bone-dim mb-4">
        {showNotes ? "− hide note" : "+ add a note to this set"}
      </button>
      {showNotes && (
        <textarea
          value={setNotes}
          onChange={(e) => setSetNotes(e.target.value)}
          placeholder="e.g. felt easy, elbow pain on last rep..."
          rows={2}
          className="w-full mb-4 bg-charcoal border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
        />
      )}

      <p className="font-mono text-[10px] text-bone-dim mb-6 leading-relaxed">
        RIR = "reps in reserve" — how many more reps you reckon you had left in the tank. 0 = went to failure, 2 = could've done 2 more, 4 = easy, lots left.
      </p>

      <motion.button whileTap={{ scale: 0.94 }} onClick={addSet} disabled={!exerciseId || !weight || !reps} className="w-full bg-ember text-graphite font-semibold rounded-card py-3.5 mb-8 disabled:opacity-40">
        + Add set
      </motion.button>

      {loggedSets.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-3">This session</p>
          <div className="bg-charcoal border border-iron rounded-card overflow-hidden mb-8">
            <AnimatePresence initial={false}>
              {loggedSets.map((s, i) => {
                const typeInfo = SET_TYPES.find((t) => t.value === s.setType)!;
                return (
                  <motion.div key={`${s.exerciseId}-${s.setNumber}-${i}`} initial={{ opacity: 0, scale: 0.9, height: 0 }} animate={{ opacity: 1, scale: 1, height: "auto" }} exit={{ opacity: 0, scale: 0.9, height: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex items-center justify-between px-5 py-3.5 border-b border-iron last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">
                        {s.setType !== "normal" && <span className="font-mono text-[9px] mr-2 px-1.5 py-0.5 rounded bg-iron text-bone-dim">{typeInfo.letter}</span>}
                        {s.exerciseName}
                      </p>
                      <p className="font-mono text-xs text-bone-dim mt-0.5">set {s.setNumber} · {s.weight}kg × {s.reps}{s.rir != null ? ` · RIR ${s.rir}` : ""}</p>
                      {s.notes && <p className="text-xs text-bone-dim mt-1 italic">"{s.notes}"</p>}
                    </div>
                    <button onClick={() => removeSet(i)} className="font-mono text-xs text-bone-dim">remove</button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={finishSession} disabled={saving} className="w-full bg-moss text-graphite font-semibold rounded-card py-3.5 disabled:opacity-50">
            {saving ? "Saving..." : "Finish session"}
          </motion.button>
        </>
      )}
    </div>
  );
}
