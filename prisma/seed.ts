import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Optional: seed an email/password account too, if you want one in
  // addition to (or instead of) Google sign-in. Set these in .env first —
  // if left as-is, this step is skipped.
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { name: email.split("@")[0], email, passwordHash },
    });
    console.log(`Seeded email/password login: ${email} / ${password} (change this after first login — there's no in-app password change yet, so re-run this script with a new SEED_USER_PASSWORD to update it)`);
  } else {
    console.log("SEED_USER_EMAIL/SEED_USER_PASSWORD not set — skipping password login, Google sign-in still works fine on its own.");
  }

  // Shared starter exercise taxonomy (userId: null = visible to everyone,
  // editable by no one — only custom exercises are personal).

  const existing = await prisma.exercise.count({ where: { userId: null } });
  if (existing > 0) {
    console.log(`Shared exercises already seeded (${existing} found) — skipping.`);
    return;
  }

  const benchPress = await prisma.exercise.create({
    data: {
      name: "Bench press",
      bodyPart: "chest",
      muscleGroup: "mid chest",
      movementPattern: "horizontal press",
      equipment: "barbell",
    },
  });

  const overheadPress = await prisma.exercise.create({
    data: {
      name: "Overhead press",
      bodyPart: "shoulders",
      muscleGroup: "front delts",
      movementPattern: "vertical press",
      equipment: "barbell",
    },
  });

  await prisma.exercise.createMany({
    data: [
      // chest family
      { name: "Incline dumbbell press", bodyPart: "chest", muscleGroup: "upper chest", movementPattern: "horizontal press", equipment: "dumbbell", variationOfId: benchPress.id },
      { name: "Decline barbell press", bodyPart: "chest", muscleGroup: "lower chest", movementPattern: "horizontal press", equipment: "barbell", variationOfId: benchPress.id },
      { name: "Cable fly", bodyPart: "chest", muscleGroup: "mid chest", movementPattern: "fly", equipment: "cable" },
      { name: "Weighted dip", bodyPart: "chest", muscleGroup: "lower chest", movementPattern: "press", equipment: "bodyweight" },
      // back
      { name: "Deadlift", bodyPart: "back", muscleGroup: "posterior chain", movementPattern: "hinge", equipment: "barbell" },
      { name: "Lat pulldown", bodyPart: "back", muscleGroup: "lats", movementPattern: "vertical pull", equipment: "cable" },
      { name: "Barbell row", bodyPart: "back", muscleGroup: "mid back", movementPattern: "horizontal pull", equipment: "barbell" },
      { name: "Pull-up", bodyPart: "back", muscleGroup: "lats", movementPattern: "vertical pull", equipment: "bodyweight" },
      // legs
      { name: "Barbell squat", bodyPart: "legs", muscleGroup: "quads", movementPattern: "squat", equipment: "barbell" },
      { name: "Romanian deadlift", bodyPart: "legs", muscleGroup: "hamstrings", movementPattern: "hinge", equipment: "barbell" },
      { name: "Leg press", bodyPart: "legs", muscleGroup: "quads", movementPattern: "squat", equipment: "machine" },
      { name: "Calf raise", bodyPart: "legs", muscleGroup: "calves", movementPattern: "press", equipment: "machine" },
      // shoulders family
      { name: "Dumbbell shoulder press", bodyPart: "shoulders", muscleGroup: "front delts", movementPattern: "vertical press", equipment: "dumbbell", variationOfId: overheadPress.id },
      { name: "Lateral raise", bodyPart: "shoulders", muscleGroup: "side delts", movementPattern: "raise", equipment: "dumbbell" },
      { name: "Face pull", bodyPart: "shoulders", muscleGroup: "rear delts", movementPattern: "horizontal pull", equipment: "cable" },
      // arms
      { name: "Barbell curl", bodyPart: "arms", muscleGroup: "biceps", movementPattern: "curl", equipment: "barbell" },
      { name: "Triceps pushdown", bodyPart: "arms", muscleGroup: "triceps", movementPattern: "extension", equipment: "cable" },
      { name: "Hammer curl", bodyPart: "arms", muscleGroup: "biceps", movementPattern: "curl", equipment: "dumbbell" },
      // core
      { name: "Hanging leg raise", bodyPart: "core", muscleGroup: "abs", movementPattern: "flexion", equipment: "bodyweight" },
      { name: "Cable crunch", bodyPart: "core", muscleGroup: "abs", movementPattern: "flexion", equipment: "cable" },
      { name: "Plank", bodyPart: "core", muscleGroup: "abs", movementPattern: "hold", equipment: "bodyweight" },
    ],
  });

  console.log("Seeded shared exercise taxonomy: chest, back, legs, shoulders, arms, core.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
