"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

const DRAFT_KEY = "teardown-log-draft";

export default function ResumeWorkoutBanner() {
  const [draft, setDraft] = useState<{ sets: number; startedAt: string | null } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.loggedSets?.length) {
        setDraft({ sets: parsed.loggedSets.length, startedAt: parsed.sessionStartedAt });
      }
    } catch {}
  }, []);

  if (!draft) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        href="/log"
        className="flex items-center gap-3 bg-ember/10 border border-ember/40 rounded-card px-5 py-3.5 mb-6"
      >
        <Dumbbell size={16} className="text-ember" />
        <div className="flex-1">
          <p className="text-sm font-medium text-ember">Workout in progress</p>
          <p className="font-mono text-[10px] text-bone-dim">
            {draft.sets} set{draft.sets === 1 ? "" : "s"} logged
            {draft.startedAt
              ? ` · started ${new Date(draft.startedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </p>
        </div>
        <span className="font-mono text-xs text-ember">resume →</span>
      </Link>
    </motion.div>
  );
}
