// Greek date and money formatting, done by hand so it behaves the same on
// every Android device regardless of its Intl support.

const DAYS_SHORT = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];
const DAYS_LONG = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
const MONTHS_SHORT = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
const MONTHS_GENITIVE = [
  'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
  'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου',
];

/** Midnight (local time) of the given date. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole days from today until the date (0 = today, negative = overdue). */
export function daysUntil(iso: string, today: Date = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  return Math.round((due.getTime() - startOfDay(today).getTime()) / 86_400_000);
}

/** "2026-11-05" → "Πέμ 5 Νοε" */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAYS_SHORT[date.getDay()]} ${d} ${MONTHS_SHORT[m - 1]}`;
}

/** Today → "Σάββατο 31 Οκτωβρίου" */
export function longToday(today: Date = new Date()): string {
  return `${DAYS_LONG[today.getDay()]} ${today.getDate()} ${MONTHS_GENITIVE[today.getMonth()]}`;
}

/** "σε 2 ημέρες", "αύριο", "σήμερα", "πριν από 3 ημέρες" */
export function relativeDays(days: number): string {
  if (days === 0) return 'σήμερα';
  if (days === 1) return 'αύριο';
  if (days === -1) return 'χθες';
  if (days < 0) return `πριν από ${-days} ημέρες`;
  return `σε ${days} ημέρες`;
}

/** 1234.5 → "€1.234,50" */
export function euro(amount: number): string {
  const [int, dec] = Math.abs(amount).toFixed(2).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}€${withDots},${dec}`;
}

/** Date → "YYYY-MM-DD" (local time). */
export function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
