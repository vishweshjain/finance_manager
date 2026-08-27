/** Today's date as yyyy-mm-dd */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Current month key in YYYY-MM */
export function currentMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
}

/** Returns the YYYY-MM key for a given ISO date string. */
export function monthKeyFromISO(iso: string): string {
  return iso.slice(0, 7);
}

/** Human friendly month label e.g. "Aug 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Build a list of the last `count` month keys, oldest first. */
export function lastMonths(count: number, from = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    keys.push(currentMonthKey(d));
  }
  return keys;
}
