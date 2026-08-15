"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sparkles, Smile, Zap } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

type Checkin = {
  sleepHours: number | null;
  sleepQuality: number | null;
  mood: number | null;
  energy: number | null;
} | null;

const SCALE = [1, 2, 3, 4, 5];

function ScaleRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Moon;
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-mono text-[10px] uppercase tracking-wide text-bone-dim mb-2 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </p>
      <div className="flex gap-2">
        {SCALE.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-card font-mono text-sm border ${
              value === n ? "border-moss bg-moss/10 text-moss" : "border-iron text-bone-dim"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DailyCheckinCard() {
  const router = useRouter();
  const [checkin, setCheckin] = useState<Checkin>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  function load() {
    fetch("/api/checkins?days=1")
      .then((r) => r.json())
      .then((data) => {
        setCheckin(data.today);
        const filled =
          data.today &&
          (data.today.sleepHours != null ||
            data.today.sleepQuality != null ||
            data.today.mood != null ||
            data.today.energy != null);
        setHasCheckedIn(!!filled);
        if (data.today) {
          setSleepHours(data.today.sleepHours != null ? String(data.today.sleepHours) : "");
          setSleepQuality(data.today.sleepQuality);
          setMood(data.today.mood);
          setEnergy(data.today.energy);
        }
        setLoaded(true);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setSaving(true);
    try {
      await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours: sleepHours ? Number(sleepHours) : undefined,
          sleepQuality: sleepQuality ?? undefined,
          mood: mood ?? undefined,
          energy: energy ?? undefined,
        }),
      });
      setEditing(false);
      load();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  if (hasCheckedIn && !editing) {
    return (
      <FadeIn delay={0.06}>
        <div id="daily-checkin" className="bg-charcoal border border-iron rounded-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs uppercase tracking-widest text-bone-dim">
              Daily check-in
            </p>
            <button onClick={() => setEditing(true)} className="font-mono text-[10px] text-ember">
              edit
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {checkin?.sleepHours != null && (
              <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border border-iron text-bone-dim">
                <Moon size={13} className="text-volt" /> {checkin.sleepHours}h
              </span>
            )}
            {checkin?.sleepQuality != null && (
              <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border border-iron text-bone-dim">
                <Sparkles size={13} className="text-volt" /> {checkin.sleepQuality}/5
              </span>
            )}
            {checkin?.mood != null && (
              <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border border-iron text-bone-dim">
                <Smile size={13} className="text-moss" /> {checkin.mood}/5
              </span>
            )}
            {checkin?.energy != null && (
              <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border border-iron text-bone-dim">
                <Zap size={13} className="text-ember" /> {checkin.energy}/5
              </span>
            )}
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={0.06}>
      <div id="daily-checkin" className="bg-charcoal border border-iron rounded-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim">
            Daily check-in
          </p>
          {editing && (
            <button onClick={() => setEditing(false)} className="font-mono text-[10px] text-bone-dim">
              cancel
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-bone-dim mb-2 flex items-center gap-1.5">
            <Moon size={12} /> Sleep hours
          </p>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="e.g. 7.5"
            className="w-full bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-ember"
          />
        </div>

        <ScaleRow icon={Sparkles} label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} />
        <ScaleRow icon={Smile} label="Mood" value={mood} onChange={setMood} />
        <ScaleRow icon={Zap} label="Energy" value={energy} onChange={setEnergy} />

        <button
          onClick={submit}
          disabled={saving || (!sleepHours && !sleepQuality && !mood && !energy)}
          className="w-full bg-ember text-graphite font-semibold rounded-card py-2.5 text-sm mt-2 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Check in"}
        </button>
      </div>
    </FadeIn>
  );
}
