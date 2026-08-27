import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly currency = inject(CurrencyService);

  transform(value: number | null | undefined, withSign = false): string {
    if (value == null || isNaN(value)) return this.currency.format(0);
    return this.currency.format(value, withSign);
  }
}
