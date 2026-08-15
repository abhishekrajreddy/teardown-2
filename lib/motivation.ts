export function motivationalLine(sessionsThisWeek: number, sessionsLastWeek: number, hasEverLogged: boolean): string {
  if (!hasEverLogged) return "Every teardown starts with one session.";
  if (sessionsThisWeek === 0 && sessionsLastWeek > 0) {
    return "Nothing logged yet this week — the ratchet only turns when you turn it.";
  }
  if (sessionsThisWeek > sessionsLastWeek) {
    return "Up from last week. The line's still moving your way.";
  }
  if (sessionsThisWeek === sessionsLastWeek && sessionsThisWeek > 0) {
    return "Same pace as last week — steady still counts as forward.";
  }
  return "Back on it counts more than never missing.";
}
