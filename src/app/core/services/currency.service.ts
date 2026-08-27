import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly auth = inject(AuthService);

  readonly code = computed(() => this.auth.currentUser()?.currency ?? 'USD');

  format(amount: number, withSign = false): string {
    const code = this.code();
    const abs = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (withSign) {
      const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';
      return `${sign}${abs}`;
    }
    return amount < 0 ? `-${abs}` : abs;
  }
}
