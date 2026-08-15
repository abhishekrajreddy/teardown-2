"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-bone-dim"
      aria-label="Sign out"
    >
      <LogOut size={14} strokeWidth={1.75} />
      Sign out
    </button>
  );
}
