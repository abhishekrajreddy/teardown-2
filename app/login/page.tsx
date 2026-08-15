"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Zap, HeartPulse, Pill, Trophy, Flame, Activity, Bike } from "lucide-react";

const FLOATERS = [
  { Icon: Dumbbell, top: "12%", left: "10%", size: 34, delay: 0, duration: 7 },
  { Icon: Zap, top: "20%", left: "82%", size: 26, delay: 0.6, duration: 6 },
  { Icon: HeartPulse, top: "68%", left: "8%", size: 30, delay: 1.1, duration: 8 },
  { Icon: Pill, top: "78%", left: "78%", size: 24, delay: 0.3, duration: 6.5 },
  { Icon: Trophy, top: "8%", left: "55%", size: 22, delay: 1.4, duration: 7.5 },
  { Icon: Flame, top: "40%", left: "90%", size: 24, delay: 0.8, duration: 6 },
  { Icon: Activity, top: "85%", left: "45%", size: 26, delay: 0.2, duration: 7 },
  { Icon: Bike, top: "35%", left: "4%", size: 28, delay: 1.6, duration: 8.5 },
];

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((providers) => setGoogleAvailable(!!providers?.google))
      .catch(() => setGoogleAvailable(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Wrong email or password. Try again.");
      return;
    }
    router.push("/today");
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-6 bg-grid overflow-hidden">
      {FLOATERS.map(({ Icon, top, left, size, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-ember/15"
          style={{ top, left }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo-mark.svg" alt="Teardown" className="w-12 h-12 mb-5" />
          <p className="font-mono text-xs uppercase tracking-widest text-ember mb-2">Teardown</p>
          <h1 className="font-display font-semibold text-2xl mb-2">Compare yourself to yesterday</h1>
          <p className="text-sm text-bone-dim">Log a session. See what's actually changing.</p>
        </div>

        {googleAvailable && (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => signIn("google", { callbackUrl: "/today" })}
              className="w-full mb-6 bg-charcoal border border-iron rounded-card py-3.5 text-sm font-medium flex items-center justify-center gap-3"
            >
              <GoogleLogo />
              Continue with Google
            </motion.button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-iron" />
              <span className="font-mono text-[10px] uppercase text-bone-dim">or</span>
              <div className="flex-1 h-px bg-iron" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-5 bg-charcoal border border-iron rounded-card px-4 py-3 text-base focus:outline-none focus:border-ember"
            placeholder="you@example.com"
          />

          <label className="block font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-6 bg-charcoal border border-iron rounded-card px-4 py-3 text-base focus:outline-none focus:border-ember"
            placeholder="••••••••"
          />

          {error && <p className="text-sm text-ember mb-4 font-mono">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-ember text-graphite font-semibold rounded-card py-3 text-base"
          >
            Log in
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
