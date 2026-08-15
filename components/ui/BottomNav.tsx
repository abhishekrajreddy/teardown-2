"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Dumbbell,
  Pill,
  Activity,
  MoreHorizontal,
  BookOpen,
  FlaskConical,
  UserCircle,
  X,
} from "lucide-react";

const TABS = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/log", label: "Log", icon: Dumbbell },
  { href: "/supplements", label: "Supps", icon: Pill },
  { href: "/timeline", label: "Timeline", icon: Activity },
];

const MORE_LINKS = [
  { href: "/formulary", label: "Formulary", icon: BookOpen },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_LINKS.some((l) => pathname?.startsWith(l.href));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-graphite/80 z-30"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-iron rounded-t-2xl z-40 pb-8 pt-3"
            >
              <div className="flex justify-between items-center px-5 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-bone-dim">
                  More
                </span>
                <button onClick={() => setMoreOpen(false)} className="text-bone-dim">
                  <X size={18} />
                </button>
              </div>
              {MORE_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm"
                  >
                    <Icon size={18} strokeWidth={1.75} className="text-ember" />
                    {l.label}
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-iron flex justify-between px-1 pt-2 pb-3 z-20">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-1 font-mono text-[9px] uppercase tracking-wide ${
                active ? "text-ember" : "text-bone-dim"
              }`}
            >
              <Icon size={19} strokeWidth={1.75} />
              {tab.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center gap-1 font-mono text-[9px] uppercase tracking-wide ${
            moreActive ? "text-ember" : "text-bone-dim"
          }`}
        >
          <MoreHorizontal size={19} strokeWidth={1.75} />
          More
        </button>
      </nav>
    </>
  );
}
