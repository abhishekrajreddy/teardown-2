// One definition of "today" used everywhere a daily record is keyed by
// date (supplement adherence, daily check-ins). Pinned to UTC calendar
// components specifically — using local getFullYear()/getMonth()/getDate()
// would silently disagree with itself depending on whether the code is
// running on a UTC-configured server (Vercel) or a locally-timezoned dev
// machine, which is exactly what caused the "mark taken" bug: the POST
// that saved the log and the GET that checked for it were computing two
// different days.
export function todayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
