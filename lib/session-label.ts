type SessionForLabel = {
  routine?: { name: string } | null;
  sets: { exercise: { bodyPart: string } }[];
};

export function sessionLabel(session: SessionForLabel): string {
  if (session.routine?.name) return session.routine.name;

  const bodyParts = Array.from(new Set(session.sets.map((s) => s.exercise.bodyPart)));
  if (bodyParts.length === 0) return "Session";
  if (bodyParts.length <= 2) {
    return bodyParts.map(capitalize).join(" + ");
  }
  return `${bodyParts.slice(0, 2).map(capitalize).join(" + ")} +${bodyParts.length - 2}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
