const APP_TIMEZONE = process.env.APP_TIMEZONE ?? 'Africa/Porto-Novo';

/** Today's calendar date (YYYY-MM-DD) in the application's timezone. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** 'YYYY-MM-DD' to a Date at UTC midnight, the form Prisma expects for @db.Date columns. */
export function toDateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** A Date read from a @db.Date column to 'YYYY-MM-DD'. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
