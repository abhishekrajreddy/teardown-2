"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

const STEPS = [
  {
    title: "Compare yourself to yesterday",
    body: "Teardown never tells you what to lift or when. Log what you actually did, and it reflects patterns back — sessions, supplements, and how you're trending against your own history.",
  },
  {
    title: "Log workout",
    body: "Pick an exercise, enter weight/reps, and rate RIR (\"reps in reserve\" — how many more you had left; 0 = failure, 4 = easy). Your last performance pre-fills as a starting point, never a rule. A rest timer starts after each set, and a personal record gets flagged the moment you beat one. Tap \"history\" next to any exercise for its full chart and PR history.",
  },
  {
    title: "Daily check-in",
    body: "A quick tap on Today for sleep, mood, and energy. This is what makes the Timeline's patterns meaningful — without it, Teardown only knows what you lifted, not how you felt.",
  },
  {
    title: "Supplements",
    body: "Vitamins get their own cards with dose, purpose, and a day counter. Tap \"mark taken today\" if you want adherence tracked — it's optional, and only supplements you engage with show up on the Timeline's skip heatmap.",
  },
  {
    title: "Experiments",
    body: "Pick one variable — a supplement, a habit — and a metric to test it against. Teardown calculates your baseline automatically, then compares it to the real result after your window ends.",
  },
  {
    title: "Timeline",
    body: "Your training volume over time, rolled up by exercise family, plus supplement events, an adherence heatmap, and daily check-in patterns. This is where things actually surface.",
  },
  {
    title: "Formulary",
    body: "A reference dictionary — tap any vitamin or supplement card to see what it is, why it matters, what it pairs well with, and what to watch for. Separate from your personal tracked data.",
  },
];

export default function Tutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("teardown-tutorial-seen");
    if (!seen) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem("teardown-tutorial-seen", "true");
    setOpen(false);
    setStep(0);
  }

  function openFresh() {
    setStep(0);
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={openFresh}
        aria-label="Replay tutorial"
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-bone-dim"
      >
        <HelpCircle size={14} strokeWidth={1.75} />
        Help
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/80 px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-charcoal border border-iron rounded-card p-6 max-w-sm w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
                  {step + 1} / {STEPS.length}
                </span>
                <button onClick={close} aria-label="Close tutorial" className="text-bone-dim">
                  <X size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-display font-semibold text-xl mb-3">{STEPS[step].title}</h2>
                  <p className="text-sm text-bone-dim leading-relaxed mb-6">{STEPS[step].body}</p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === step ? "bg-ember" : "bg-iron"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="font-mono text-xs text-bone-dim"
                    >
                      back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="bg-ember text-graphite font-semibold rounded-card px-4 py-2 text-xs"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={close}
                      className="bg-moss text-graphite font-semibold rounded-card px-4 py-2 text-xs"
                    >
                      Got it
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
