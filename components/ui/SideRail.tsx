"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, Dumbbell, Activity, Pill, BookOpen, FlaskConical, UserCircle } from "lucide-react";

const ITEMS = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/log", label: "Log", icon: Dumbbell },
  { href: "/timeline", label: "Timeline", icon: Activity },
  { href: "/supplements", label: "Supplements", icon: Pill },
  { href: "/formulary", label: "Formulary", icon: BookOpen },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function SideRail() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex w-56 flex-col py-6 px-4 bg-charcoal border-r border-iron">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <img src="/logo-mark.svg" alt="Teardown" className="w-7 h-7" />
        <span className="font-display font-semibold text-base">Teardown</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                active ? "bg-iron text-ember font-medium" : "text-bone-dim"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {session?.user?.name && (
        <div className="flex items-center gap-2.5 px-3 py-2 border-t border-iron pt-4">
          <div className="w-7 h-7 rounded-full bg-ember/15 text-ember font-mono text-xs flex items-center justify-center flex-shrink-0">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-bone-dim truncate">{session.user.name}</span>
        </div>
      )}
    </aside>
  );
}
