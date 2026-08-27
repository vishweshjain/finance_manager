import { Pipe, PipeTransform } from '@angular/core';

/** Formats a YYYY-MM key as e.g. "Aug 2026". */
@Pipe({ name: 'monthName' })
export class MonthNamePipe implements PipeTransform {
  transform(key: string | null | undefined): string {
    if (!key) return '';
    const [y, m] = key.split('-').map(Number);
    if (!y || !m) return key;
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
}
