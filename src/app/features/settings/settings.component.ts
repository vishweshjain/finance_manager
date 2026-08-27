import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SHARED } from '../../shared/shared';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { StorageService, STORAGE_KEYS } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  imports: [SHARED, FormsModule],
  template: `
    <app-page-header title="Settings" subtitle="Personalize your FinanceManager experience" />

    <div class="settings-grid">
      <div class="card">
        <h3 class="card-h">Appearance</h3>
        <div class="setting-row">
          <div>
            <strong>Theme</strong>
            <p class="hint">Choose between light and dark mode.</p>
          </div>
          <div class="seg">
            <button type="button" class="seg-btn" [class.active]="!theme.isDark()" (click)="theme.set('light')">☀️ Light</button>
            <button type="button" class="seg-btn" [class.active]="theme.isDark()" (click)="theme.set('dark')">🌙 Dark</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-h">Preferences</h3>
        <div class="setting-row">
          <div>
            <strong>Default currency</strong>
            <p class="hint">Used to format all amounts across the app.</p>
          </div>
          <select class="control" [value]="currency()" (change)="onCurrency($event)">
            @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
          </select>
        </div>
      </div>

      <div class="card danger-card">
        <h3 class="card-h">Data</h3>
        <div class="setting-row">
          <div>
            <strong>Reset demo data</strong>
            <p class="hint">Clears all local data and restores the sample dataset.</p>
          </div>
          <button class="btn btn-outline" (click)="reset()">Reset</button>
        </div>
        <div class="setting-row">
          <div>
            <strong>Sign out</strong>
            <p class="hint">End your session on this device.</p>
          </div>
          <button class="btn btn-danger" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; align-items: start; }
      .card { padding: 20px; }
      .card-h { font-size: 16px; margin-bottom: 14px; }
      .setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
      .setting-row:last-child { border-bottom: none; }
      .setting-row strong { font-size: 14px; }
      .hint { margin: 4px 0 0; font-size: 12.5px; color: var(--text-muted); }
      .seg { display: inline-flex; gap: 4px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 4px; }
      .seg-btn { height: 36px; padding: 0 14px; border-radius: 8px; border: none; background: none; color: var(--text-muted); font-weight: 600; font-size: 13px; }
      .seg-btn.active { background: var(--primary); color: #fff; }
      .danger-card { border-color: var(--danger-soft); }
    `,
  ],
})
export class SettingsComponent {
  readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
  readonly currency = signal(this.auth.currentUser()?.currency ?? 'USD');

  onCurrency(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.currency.set(value);
    this.auth.updateProfile({ currency: value });
    this.notify.success('Currency updated');
  }

  reset(): void {
    Object.values(STORAGE_KEYS).forEach((k) => this.storage.remove(k));
    this.notify.info('Data reset — reloading…');
    setTimeout(() => location.reload(), 600);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
