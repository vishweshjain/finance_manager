import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an ISO yyyy-mm-dd string as e.g. "12 Aug 2026".
 * Parses the date as local (not UTC) to avoid off-by-one shifts.
 */
@Pipe({ name: 'shortDate' })
export class ShortDatePipe implements PipeTransform {
  transform(value: string | null | undefined, withYear = true): string {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    const date = new Date(y, m - 1, d);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return withYear ? `${d} ${month} ${y}` : `${d} ${month}`;
  }
}
