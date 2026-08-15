"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formulary, type FormularyEntry } from "@/lib/formulary-data";
import FadeIn from "@/components/ui/FadeIn";
import { X } from "lucide-react";

const categoryColor: Record<string, string> = {
  vitamin: "text-volt bg-volt/15",
  mineral: "text-moss bg-moss/15",
  performance: "text-ember bg-ember/15",
  other: "text-bone-dim bg-iron/40",
};

const ringColor: Record<string, string> = {
  vitamin: "#3E7BFA",
  mineral: "#7C9A79",
  performance: "#E2853D",
  other: "#9A978E",
};

export default function FormularyPage() {
  const [selected, setSelected] = useState<FormularyEntry | null>(null);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-1">Formulary</h1>
      <p className="text-sm text-bone-dim mb-1">
        A reference dictionary — tap a card to unlock its detail. Separate from what you're
        personally tracking.
      </p>
      <p className="font-mono text-[10px] text-bone-dim mb-6">
        General information, not medical advice — check with a doctor before starting anything new.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {formulary.map((entry, i) => (
          <FadeIn key={entry.id} delay={i * 0.04}>
            <motion.button
              onClick={() => setSelected(entry)}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              className="w-full bg-charcoal border border-iron rounded-card p-4 text-left"
            >
              <span
                className={`inline-block font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 ${categoryColor[entry.category]}`}
              >
                {entry.category}
              </span>
              <p className="text-sm font-medium leading-snug">{entry.name}</p>
            </motion.button>
          </FadeIn>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/85 px-6"
          >
            {/* unlock burst ring */}
            <motion.div
              key={selected.id + "-ring"}
              initial={{ opacity: 0.7, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-24 h-24 rounded-full pointer-events-none"
              style={{ border: `2px solid ${ringColor[selected.category]}` }}
            />

            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.4, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-charcoal border border-iron rounded-card p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full ${categoryColor[selected.category]}`}
                >
                  {selected.category}
                </span>
                <button onClick={() => setSelected(null)} aria-label="Close" className="text-bone-dim">
                  <X size={16} />
                </button>
              </div>

              <h2 className="font-display font-semibold text-xl mb-4">{selected.name}</h2>

              <p className="font-mono text-[10px] uppercase tracking-wide text-bone-dim mb-1.5">
                What is it
              </p>
              <p className="text-sm text-bone-dim leading-relaxed mb-4">{selected.whatIsIt}</p>

              <p className="font-mono text-[10px] uppercase tracking-wide text-bone-dim mb-1.5">
                Why it matters
              </p>
              <p className="text-sm text-bone-dim leading-relaxed mb-4">{selected.whyItMatters}</p>

              <p className="font-mono text-[10px] uppercase tracking-wide text-moss mb-1.5">
                Pairs well with
              </p>
              <ul className="mb-4">
                {selected.pairsWith.map((p, idx) => (
                  <li key={idx} className="text-xs text-bone-dim leading-relaxed mb-1">
                    · {p}
                  </li>
                ))}
              </ul>

              <p className="font-mono text-[10px] uppercase tracking-wide text-ember mb-1.5">
                Take care with
              </p>
              <ul>
                {selected.takeCareWith.map((t, idx) => (
                  <li key={idx} className="text-xs text-bone-dim leading-relaxed mb-1">
                    · {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
