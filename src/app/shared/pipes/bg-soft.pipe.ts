import { Pipe, PipeTransform } from '@angular/core';

/** Converts a #rrggbb colour to an 8-digit hex with low alpha (for soft backgrounds). */
@Pipe({ name: 'bgSoft' })
export class BgSoftPipe implements PipeTransform {
  transform(color: string | null | undefined, alpha = '22'): string {
    if (!color) return 'transparent';
    return `${color}${alpha}`;
  }
}
