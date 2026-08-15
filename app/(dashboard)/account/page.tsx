"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import FadeIn from "@/components/ui/FadeIn";

type Account = { name: string; email: string; apiToken: string | null; timezone: string };

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  const [metricType, setMetricType] = useState("resting_hr");
  const [metricValue, setMetricValue] = useState("");
  const [loggingMetric, setLoggingMetric] = useState(false);
  const [metricSaved, setMetricSaved] = useState(false);

  function load() {
    fetch("/api/account")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data?.name) {
          // stale session (e.g. after a database reset) or genuinely no
          // account data — either way, fix it by getting a fresh session
          setSessionError(true);
          return;
        }
        setAccount(data);
        setName(data.name);
      })
      .catch(() => setSessionError(true));
  }

  useEffect(() => {
    load();
  }, []);

  if (sessionError) {
    return (
      <div>
        <h1 className="font-display font-semibold text-2xl mb-4">Account</h1>
        <div className="bg-charcoal border border-iron rounded-card p-5">
          <p className="text-sm text-bone-dim mb-4">
            Your session looks out of date — this usually happens after the database has been reset.
            Log out and back in to fix it.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-ember text-graphite font-semibold rounded-card px-4 py-2.5 text-sm"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  async function saveName() {
    setSaving(true);
    try {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function generateToken() {
    setGenerating(true);
    try {
      await fetch("/api/account/regenerate-token", { method: "POST" });
      load();
      setTokenVisible(true);
    } finally {
      setGenerating(false);
    }
  }

  async function logMetricManually() {
    if (!metricValue) return;
    setLoggingMetric(true);
    try {
      await fetch("/api/health-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: [{ date: new Date().toISOString(), metricType, value: Number(metricValue) }],
        }),
      });
      setMetricValue("");
      setMetricSaved(true);
      setTimeout(() => setMetricSaved(false), 2000);
    } finally {
      setLoggingMetric(false);
    }
  }

  if (!account) return <p className="text-bone-dim text-sm">Loading...</p>;

  const webhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/health-metrics` : "/api/health-metrics";

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-6">Account</h1>

      <FadeIn>
        <div className="bg-charcoal border border-iron rounded-card p-5 mb-6">
          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Name</label>
          <div className="flex gap-2 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
            />
            <button
              onClick={saveName}
              disabled={saving}
              className="bg-ember text-graphite font-semibold rounded-card px-4 text-sm disabled:opacity-40"
            >
              {saving ? "..." : "Save"}
            </button>
          </div>

          <label className="block font-mono text-[10px] uppercase text-bone-dim mb-1.5">Email</label>
          <p className="text-sm text-bone-dim mb-1">{account.email}</p>
          <p className="font-mono text-[10px] text-bone-dim">
            Signed in with Google — email is managed there, not editable here.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="bg-charcoal border border-iron rounded-card p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-bone-dim mb-2">
            Apple Health sync
          </p>
          <p className="text-sm text-bone-dim mb-4 leading-relaxed">
            There's no native iOS app yet, so the bridge is a personal API token plus an Apple
            Shortcuts automation (or the "Health Auto Export" app) that POSTs your health data here
            on a schedule.
          </p>

          {account.apiToken ? (
            <div className="mb-4">
              <p className="font-mono text-[10px] uppercase text-bone-dim mb-1.5">Your API token</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  type={tokenVisible ? "text" : "password"}
                  value={account.apiToken}
                  className="flex-1 bg-graphite border border-iron rounded-card px-3 py-2.5 text-xs font-mono"
                />
                <button
                  onClick={() => setTokenVisible((v) => !v)}
                  className="font-mono text-[10px] text-bone-dim px-2"
                >
                  {tokenVisible ? "hide" : "show"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-bone-dim mb-4">No token generated yet.</p>
          )}

          <button
            onClick={generateToken}
            disabled={generating}
            className="font-mono text-xs text-ember mb-5"
          >
            {generating ? "generating..." : account.apiToken ? "regenerate token" : "generate token"}
          </button>

          <div className="border-t border-iron pt-4 mb-4">
            <p className="font-mono text-[10px] uppercase text-bone-dim mb-3">
              Easiest option — log a reading by hand
            </p>
            <div className="flex gap-2 mb-2">
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className="flex-1 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm focus:outline-none focus:border-ember"
              >
                <option value="resting_hr">Resting heart rate</option>
                <option value="hrv">HRV</option>
                <option value="vo2max">VO2 max</option>
                <option value="sleep_stage">Sleep hours</option>
              </select>
              <input
                type="number"
                inputMode="decimal"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="value"
                className="w-24 bg-graphite border border-iron rounded-card px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-ember"
              />
            </div>
            <button
              onClick={logMetricManually}
              disabled={!metricValue || loggingMetric}
              className="w-full bg-volt text-graphite font-semibold rounded-card py-2.5 text-sm disabled:opacity-40"
            >
              {loggingMetric ? "Saving..." : metricSaved ? "Saved ✓" : "Log reading"}
            </button>
            <p className="font-mono text-[10px] text-bone-dim mt-2">
              Open the Health app, check today's number, type it in here. Takes 10 seconds and needs
              no setup at all — the token/Shortcuts route below is only worth it if you want this to
              happen automatically every day.
            </p>
          </div>

          <div className="border-t border-iron pt-4">
            <p className="font-mono text-[10px] uppercase text-bone-dim mb-2">Automatic sync (Shortcuts)</p>
            <ol className="text-xs text-bone-dim leading-relaxed list-decimal pl-4 space-y-1.5">
              <li>Shortcuts app → New Shortcut → add "Get Health Sample" for HR, HRV, sleep, or VO2 max</li>
              <li>Add "Get Contents of URL" — set to POST, URL below</li>
              <li>
                Header: <code className="text-ember">Authorization: Bearer &lt;your token&gt;</code>
              </li>
              <li>
                Body (JSON): <code className="text-ember">{"{ \"metrics\": [{ \"date\": \"...\", \"metricType\": \"hrv\", \"value\": 42 }] }"}</code>
              </li>
              <li>Automation tab → run daily, e.g. every morning</li>
            </ol>
            <p className="font-mono text-[10px] text-bone-dim mt-3">
              Endpoint: <span className="text-ember">{webhookUrl}</span>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
