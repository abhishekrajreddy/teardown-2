# Teardown — Product Requirements Document
*A personal training, supplement, and wellbeing tracker built on one idea: compare yourself to yesterday, not to a plan.*

Theme: Graphite/charcoal base, warm ember accent, muted moss green for positive trends only.
See `teardown-mockup.html` for the full visual direction (palette, type, web + mobile screens).

---

## 1. Problem Statement

Existing tools force a tradeoff:
- **Gym loggers** (Strong, Hevy) give clean data but zero insight across other parts of life.
- **Auto-programming apps** (Mesostrength, Fitbod, Alpha Progression) decide your next weight for you — great for people who want to be coached, wrong for someone who wants to run their own training and just needs a mirror, not a coach.
- **Symptom/mood trackers** (Bearable, Reflect) correlate lifestyle factors with wellbeing but have no real strength-training depth.
- **Supplement trackers** (Staqc, SuppCo) log intake and biomarkers well but live in total isolation from training and mood data.

Nobody joins **training + supplements + sleep/mind state** into one place with the explicit goal of answering: *"Am I better than I was last week, and what's actually driving that?"*

## 2. Vision & Design Principles

1. **Input-first, not plan-first.** The app never tells you what workout to do. It makes logging what you *did* fast, then reflects patterns back.
2. **Compare to yourself, not to a standard.** No leaderboards, no "average user" benchmarks. Every chart is "you vs. your own baseline."
3. **No streak punishment.** Missing a day is a data point, not a failure state. Reinforce return-after-break, not just unbroken streaks.
4. **Two taps deep.** If logging takes longer than a set of the exercise you just did, adherence dies. Every core log action must be completable in under 10 seconds.
5. **The insight is the product.** Charts and correlations are not a "premium" bolt-on — they're the reason this exists instead of a notes app.
6. **Track what changes a decision, not what's easy to measure.** Pain and sweat were deliberately cut from scope — RIR already captures effort, and symptom-level tracking pulls the product toward a medical-tracker feel that isn't the goal.

## 3. Target User (v1)

You. One user, building for personal use first, with an eye toward Este/NovaLux-style productization later if it proves out (same pattern as Formulary/Recovr). Context that shapes design decisions:
- Actively rebuilding physical capacity — reflexes and muscle activation, not just strength numbers — after quitting smoking.
- Wants to *understand* their own body's response to training/supplements/sleep, not follow someone else's program.
- Already tracks technical/data-driven work professionally — comfortable with structured data, wants the same rigor applied to their own body.

## 4. Core Feature Set (MVP)

### 4.1 Workout Logging
- Log: exercise, sets × reps × weight, RIR (0–4, "reps in reserve"), optional free-text note.
- Auto-suggests last logged weight/reps for that exercise as a starting point (solves "what did I lift last time" without prescribing anything).
- **Exercise taxonomy** (see data model) — exercises are tagged by body part, movement pattern, and equipment, and variations link back to a parent exercise (e.g. incline dumbbell press → bench press family). This is what lets "how's my bench trending" answer across all its variations, not just one exact name match.
- Session view: group all sets from one gym visit; one `overall_feel` rating (1–5) per session — that's the only session-level subjective field, deliberately kept to one number.
- **Optional routines**: a self-authored checklist (e.g. "Push day" → bench, incline DB press, dips, triceps pushdown) you can optionally attach to a session and tap through. This is a checklist, not a program — it never suggests weight or reps, only remembers your own exercise order so you're not relying on memory for what a session usually includes.

### 4.2 Supplement Logging
- Log: supplement/vitamin name, dose, unit, time of day, start date.
- Once started, stays "active" silently every day until you log a stop date — no daily re-confirmation required.
- **Dose changes are new entries**, not edits — going from 3g to 5g creatine creates a new logged event with its own start marker, so the timeline can show "dose increased" as a distinct point, not just "still taking it."
- Optional per-supplement daily "taken today" toggle, only for supplements where strict adherence matters to you (e.g. creatine) — opt-in, not default-on for everything.
- Timeline shows every supplement as a horizontal band with start/stop/dose-change markers.

### 4.3 Daily Check-In (Mind/Sleep/Body)
- Sleep hours + subjective sleep quality (1–5).
- Mood (1–5 or emoji scale).
- Energy (1–5).
- Optional: stress, motivation — added only if you find you want them.
- Target: under 15 seconds to complete.

### 4.4 Insight Layer (the differentiator)
- **Per-exercise-family trend chart**: weight/volume/est. 1RM over time, rolled up by `variation_of` so related variations count toward one trend.
- **Timeline overlay**: supplement bands + dose-change markers rendered on the same timeline as strength trend, mood, energy, sleep.
- **Auto-surfaced correlations**: lightweight statistical pass (Pearson correlation or before/after averages) run periodically against your own logs — e.g. "your average bench volume was 12% higher in weeks you slept 7+ hours."
- **Custom experiments**: pick one variable, commit to a window (7–14 days), get an automatic before/after comparison.
- **"Better than yesterday" home view**: a calm daily summary comparing today/this week to your own recent average — no leaderboard, no pass-fail streak.

### 4.5 Wearable Integration — Apple Watch first
- **Phase 1 (MVP):** manual entry only, no wearable dependency.
- **Phase 2:** Apple Health / HealthKit read-only integration for workout heart rate + active calories, sleep stages/duration, HRV + resting heart rate, VO2 max estimate.
- **Phase 3:** Garmin and Whoop via their respective APIs, using the same source-agnostic `health_metrics` table designed in from day one.
- Constraint to design around: HealthKit data lives on-device with per-data-type permission the user can revoke any time, and there's no continuous background stream — integration is a periodic sync, not real-time.

## 5. Data Model

```
users
  id, name, timezone

-- ── Exercise taxonomy ──────────────────────────────
exercises
  id, name, body_part, muscle_group, movement_pattern,
  equipment, variation_of (nullable → exercises.id), is_custom

-- ── Workouts ───────────────────────────────────────
routines
  id, user_id, name                     -- e.g. "Push day"

routine_exercises
  id, routine_id, exercise_id, order

workout_sessions
  id, user_id, date, routine_id (nullable),
  overall_feel (1–5), notes

workout_sets
  id, session_id, exercise_id, set_number,
  weight, reps, rir, notes

-- ── Supplements ────────────────────────────────────
supplements
  id, user_id, name, dose, unit, time_of_day,
  start_date, end_date (nullable),
  supersedes (nullable → supplements.id)   -- links a dose change to the prior entry

supplement_logs                            -- only if tracking daily adherence
  id, supplement_id, date, taken (bool)

-- ── Daily state ────────────────────────────────────
daily_checkins
  id, user_id, date, sleep_hours, sleep_quality,
  mood, energy, stress (nullable), notes

-- ── Wearables (source-agnostic) ────────────────────
health_metrics
  id, user_id, date, metric_type (hr, hrv, sleep_stage, vo2max, spo2, resting_hr),
  value, source (manual | apple_health | garmin | whoop)

-- ── Insight layer ──────────────────────────────────
experiments
  id, user_id, variable_description, start_date, end_date,
  baseline_summary, result_summary
```

### Prisma schema (Postgres)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  timezone  String   @default("Europe/London")
  createdAt DateTime @default(now())

  sessions     WorkoutSession[]
  supplements  Supplement[]
  checkins     DailyCheckin[]
  metrics      HealthMetric[]
  experiments  Experiment[]
  routines     Routine[]
}

model Exercise {
  id              String     @id @default(cuid())
  name            String
  bodyPart        String     // "chest", "back", "legs"...
  muscleGroup     String?    // "upper chest", "quads"...
  movementPattern String?    // "horizontal press", "hinge"...
  equipment       String?    // "barbell", "dumbbell", "cable", "bodyweight"
  isCustom        Boolean    @default(false)

  variationOfId String?
  variationOf   Exercise?  @relation("ExerciseFamily", fields: [variationOfId], references: [id])
  variations    Exercise[] @relation("ExerciseFamily")

  sets            WorkoutSet[]
  routineEntries  RoutineExercise[]
}

model Routine {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
  name   String

  exercises RoutineExercise[]
  sessions  WorkoutSession[]
}

model RoutineExercise {
  id         String   @id @default(cuid())
  routineId  String
  routine    Routine  @relation(fields: [routineId], references: [id])
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  order      Int
}

model WorkoutSession {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  date        DateTime
  routineId   String?
  routine     Routine?  @relation(fields: [routineId], references: [id])
  overallFeel Int?      // 1–5
  notes       String?

  sets WorkoutSet[]
}

model WorkoutSet {
  id        String         @id @default(cuid())
  sessionId String
  session   WorkoutSession @relation(fields: [sessionId], references: [id])
  exerciseId String
  exercise  Exercise       @relation(fields: [exerciseId], references: [id])
  setNumber Int
  weight    Float
  reps      Int
  rir       Int?           // 0–4
  notes     String?
}

model Supplement {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  name        String
  dose        Float
  unit        String     // "g", "mg", "IU"
  timeOfDay   String?    // "morning", "evening"
  startDate   DateTime
  endDate     DateTime?
  supersedesId String?
  supersedes   Supplement? @relation("DoseHistory", fields: [supersedesId], references: [id])
  supersededBy Supplement[] @relation("DoseHistory")

  logs SupplementLog[]
}

model SupplementLog {
  id           String     @id @default(cuid())
  supplementId String
  supplement   Supplement @relation(fields: [supplementId], references: [id])
  date         DateTime
  taken        Boolean
}

model DailyCheckin {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  date         DateTime
  sleepHours   Float?
  sleepQuality Int?     // 1–5
  mood         Int?     // 1–5
  energy       Int?     // 1–5
  stress       Int?     // 1–5, optional
  notes        String?

  @@unique([userId, date])
}

model HealthMetric {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  date       DateTime
  metricType String   // "hr", "hrv", "sleep_stage", "vo2max", "spo2", "resting_hr"
  value      Float
  source     String   // "manual" | "apple_health" | "garmin" | "whoop"
}

model Experiment {
  id                 String    @id @default(cuid())
  userId             String
  user               User      @relation(fields: [userId], references: [id])
  variableDescription String
  startDate          DateTime
  endDate            DateTime?
  baselineSummary    Json?
  resultSummary      Json?
}
```

## 6. MVP Screens

1. **Today** — daily check-in prompt + quick-add workout/supplement buttons + one-line "vs your average" summary.
2. **Log Workout** — optional routine checklist → exercise picker (last performance pre-filled) → sets/reps/weight/RIR entry → one `overall_feel` rating at session close.
3. **Supplements** — active/watching/stopped list with start dates and dose-change history.
4. **Timeline** — the core insight screen: strength trend + supplement bands + mood/sleep line, scrollable by date range.
5. **Exercise Detail** — single exercise-family history and trend chart (rolled up across variations).
6. **Experiments** — active/past experiments with before/after summaries.

## 7. Tech Stack

Given your existing stack familiarity (React, Node/Express, MongoDB from Paprwork; React + Supabase from HydroLife; Next.js 14 + Prisma from Recovr):

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React | SSR, easy Vercel deploy, matches Recovr stack |
| Styling | Tailwind CSS, custom tokens from the mockup (graphite/ember/moss palette) | Fast to build, keeps the brand consistent |
| Backend | Next.js API routes / Route Handlers | No separate server needed for a single-user MVP |
| Database | PostgreSQL via Prisma | Relational fit for the joins across sessions/sets/health metrics; Mongo would fight this schema |
| Hosting DB | Supabase or Neon | Both give a free Postgres tier plus easy connection pooling for serverless |
| Charts | Recharts | Handles trend lines + overlays; matches Formulary/HydroLife prior use |
| Auth | Single-user MVP: skip auth entirely, or NextAuth with one hardcoded account if you want it deployed somewhere reachable | No need to build multi-user auth for a personal tool |
| Wearable sync (Phase 2) | Thin native wrapper or Apple Shortcuts export as the lowest-effort bridge | HealthKit requires an iOS component regardless — Shortcuts avoids building a full native app just to get data out |
| Correlation logic | Plain SQL aggregate queries + a small stats utility (Pearson correlation, before/after averages) | No ML needed at this scale |
| Deployment | Vercel | Matches your existing Paprwork/Recovr deployment pattern |

### Suggested project structure

```
teardown/
  app/
    (dashboard)/
      today/page.tsx
      log/page.tsx
      timeline/page.tsx
      supplements/page.tsx
      experiments/page.tsx
    api/
      sessions/route.ts
      exercises/route.ts
      supplements/route.ts
      checkins/route.ts
      health-metrics/route.ts
      experiments/route.ts
  lib/
    prisma.ts
    stats/
      correlation.ts        -- Pearson correlation, before/after comparison helpers
      trends.ts              -- per-exercise-family rollups
  prisma/
    schema.prisma
  components/
    charts/
    ui/                       -- tokens from the mockup
```

## 8. Explicit Non-Goals (v1)

- No auto-generated workout plans or next-weight prescriptions.
- No social features, leaderboards, or multi-user comparison.
- No real-time wearable streaming.
- No punitive streak mechanics.
- No pain/symptom tracking or sweat/effort proxies — RIR and `overall_feel` cover this deliberately.

## 9. Success Criteria

- You log a session and a check-in without friction, consistently, for 4+ weeks.
- At least one real insight surfaces that changes a decision (e.g., adjusting a supplement, a sleep target, or confirming a training change is working).
- The timeline view answers "is this actually working for me" faster than your memory or a notes app would.

## 10. Roadmap

- **v0 (2–3 weeks):** manual logging (workouts, supplements, daily check-in), exercise taxonomy, basic per-exercise-family trend chart. No integrations.
- **v0.5:** routines (optional checklist), timeline overlay view, simple correlation pass.
- **v1:** custom experiments feature.
- **v1.5:** Apple Health read integration (sleep, HR, HRV, VO2 max).
- **v2:** Garmin/Whoop integration via source-agnostic health_metrics table.
- **v2+ (optional):** if it proves valuable for you, consider the same design-partner productization path used for the Pabau attribution concept — but only after it's genuinely useful standalone.
