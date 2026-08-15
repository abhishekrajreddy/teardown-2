# Teardown

*Compare yourself to yesterday, not to a plan.*

A mobile-first personal training, supplement, and wellbeing tracker. Log a workout, a vitamin, or a daily check-in in seconds — Teardown never tells you what to lift or when. It just makes logging fast, then reflects real patterns back: strength trends, supplement adherence, correlations, and experiments.

Full product spec: `Teardown_PRD.md`. Visual direction: `teardown-mockup.html`.

## Screenshots

<!-- Add your own screenshots to /screenshots using the filenames below — see screenshots/README.md. -->

| Today | Log workout |
|---|---|
| ![Today screen](screenshots/today.png) | ![Log workout screen](screenshots/log.png) |

| Supplements | Formulary |
|---|---|
| ![Supplements screen](screenshots/supplements.png) | ![Formulary screen](screenshots/formulary.png) |

| Timeline |
|---|
| ![Timeline screen](screenshots/timeline.png) |

## Login

Both **email/password** and **Google sign-in** work now — Google shows automatically if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set, and quietly disappears from the login page if they're not, so you're never locked out either way.

## What's inside

- **Log workout** — mobile-first weight/reps/RIR entry, auto-suggests your last performance, optional self-authored "workout" (routine) checklist. A draft persists automatically if you navigate away mid-session (localStorage) — nothing gets lost by accident.
- **Personal records & 1RM** — a set that beats your previous best (heaviest weight or estimated 1RM, Epley formula) triggers an in-the-moment celebration, same as Hevy's PR notifications. Warmup sets are excluded automatically.
- **Rest timer** — starts automatically after each logged set (90s working / 45s warmup), visible at the top of the Log screen.
- **Exercise detail pages** — tap "history" on any exercise for its full chart (1RM or volume, toggleable) and complete set-by-set history, rolled up across variations.
- **Exercise icons** — equipment-based icons (barbell/dumbbell/cable/machine/bodyweight) throughout the Log screen, since real exercise photography/video isn't something this can produce.
- **Exercise taxonomy** — variations roll into one parent trend (e.g. incline press → bench press). Rename or delete your own custom exercises (shared/seeded defaults can't be edited by anyone).
- **Session editing** — fix a set, remove one, rate how the session felt, or delete it entirely, after the fact.
- **Daily check-in** — a fast tap-based sleep/mood/energy log on Today, with its own quick-add button.
- **Supplements** — Formulary-style vitamin cards, dose-change history, opt-in daily "taken today" adherence tracking.
- **Formulary** — a reference dictionary, tap-to-unlock detail view. Separate from your personal tracked data.
- **Experiments** — pick a variable and a metric, run it 7 or 14 days, get an automatic before/after. Now reachable on mobile via the bottom nav's "More" sheet (previously a gap).
- **Timeline** — volume-per-session trend, per-exercise-family rollup (now linked to each exercise's detail page), supplement events, and a 30-day adherence heatmap.
- **Account settings** — edit your display name, and set up Apple Health sync two ways: a 10-second manual entry (type in today's HR/HRV/VO2 max/sleep — no setup required), or full Shortcuts automation for hands-off daily sync.
- **Auth** — email/password and Google sign-in, both isolated per account, 30-day session length.
- **Built-in tutorial** — a short first-run walkthrough, replayable via the Help button.

- **Live workout stats** — duration/volume/sets counter visible while logging, matching Hevy's always-on header.
- **Set types** — Normal/Warmup/Failure/Drop Set (like Hevy's W/F/D badges), replacing the old simple warmup checkbox. Only warmup is excluded from PR/1RM.
- **Exercise search + equipment filter** — the exercise picker now filters as you type, plus quick equipment chips.
- **Per-set notes** — optional free-text note on any logged set.
- **Resume-workout banner** — the draft-persistence from before is now visibly surfaced on Today, not just silently recoverable.

- **Readiness ring** — a Whoop-style animated circular gauge on Today, glowing and color-coded (green/amber/rust), computed transparently from your latest check-in (sleep quality + mood + energy averaged) — not a black-box score.
- **Formulary expanded** — now 22 entries (added Vitamin C, Iron, Multivitamin, Ashwagandha, Melatonin, K2, Probiotics, Collagen, Beta-alanine, Caffeine, L-theanine, Calcium, Turmeric, Whey protein, Citrulline malate).

- **Self-healing sessions** — after any database reset, sessions now automatically detect a stale user reference and either repair themselves (Google) or fail with a clear "log out and back in" message instead of crashing pages or silently doing nothing (Credentials).
- **Desktop sidebar redesign** — icon + label rows and a profile footer, inspired directly by Hevy's web sidebar, replacing the icon-only rail.

## Tech stack

Next.js 14 (App Router) · React · Tailwind CSS · Prisma · PostgreSQL · NextAuth · Recharts · Framer Motion · lucide-react

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET (Google is optional)
npm run db:migrate     # name it something like "restore-password-login"
npm run db:seed        # seeds shared exercise taxonomy, plus a password login if SEED_USER_EMAIL/PASSWORD are set
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`.

### Database (Supabase or Neon)

Two connection strings: `DATABASE_URL` (pooled, app runtime) and `DIRECT_URL` (direct, migrations only). Supabase: dashboard → project → **Connect** → **ORM** tab → **Prisma** → copy both.

### Google sign-in (optional)

1. [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → create/select a project
2. OAuth consent screen → External → add your friends' emails as "test users" (skips Google review)
3. Credentials → Create OAuth client ID → Web application
4. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL once deployed)
5. Copy Client ID/Secret into `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and into Vercel's environment variables too

### Apple Health sync (no native app — a Shortcuts bridge instead)

Go to **Account** in the app, generate a personal API token, then set up an iOS Shortcuts automation that POSTs your health data to `/api/health-metrics` with `Authorization: Bearer <token>`. Full step-by-step is on the Account page itself. This is the realistic path without building and shipping an actual iOS app — HealthKit only allows reading data through an on-device component, so something has to run on the phone, and Shortcuts is the lowest-effort version of that.

## Deploying (Vercel)

1. Push to GitHub, import at [vercel.com/new](https://vercel.com/new)
2. Add all env vars in Vercel's project settings (`NEXTAUTH_URL` = your production URL). Google's vars are optional — email/password works without them.
3. Deploy, then `npx prisma migrate deploy` once locally against the production database
4. Add the production callback URL in Google Cloud Console too

## Project structure

```
teardown/
  app/
    (dashboard)/
      today/  log/  timeline/  supplements/  formulary/  experiments/  account/  sessions/[id]/
    api/
      exercises/  sessions/  supplements/  routines/  timeline/  checkins/  experiments/
      health-metrics/  account/  auth/
    login/
    icon.png  apple-icon.png        # Next.js favicon/app-icon convention files
  lib/
    prisma.ts  auth.ts  motivation.ts  session-label.ts  formulary-data.ts  metrics.ts
  components/ui/
    BottomNav  SideRail  SignOutButton  Tutorial  FadeIn  AnimatedNumber  DailyCheckinCard
  public/
    logo-mark.svg / .png            # transparent mark, used inside the UI
  prisma/
    schema.prisma  seed.ts
```

## What's left

- **Exercise videos/photos** — genuinely not feasible to produce here (no video hosting or real photography). Icons are the practical substitute.
- **Set tags beyond warmup** — Hevy has drop-set/superset/failure tags; only "warmup" is implemented so far, since it's the one that actually affects PR calculation.
- Experiments' baseline/result are simple averages — no statistical significance testing, by design (this is a personal tool, not a research study).
- Apple Health is a manual entry or Shortcuts bridge, not automatic background sync — there's no way around this without a native iOS app, since HealthKit has no server-side API.
- Garmin/Whoop integration would follow the same `health_metrics` table (already source-agnostic) once Apple Health is proven out.

Full detail in `Teardown_PRD.md`.
