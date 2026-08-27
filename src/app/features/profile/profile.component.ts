import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SHARED } from '../../shared/shared';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TransactionService } from '../../core/services/transaction.service';

const AVATAR_COLORS = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];

@Component({
  selector: 'app-profile',
  imports: [SHARED, ReactiveFormsModule],
  template: `
    <app-page-header title="Profile" subtitle="Manage your personal information" />

    @if (user(); as u) {
      <div class="profile-grid">
        <div class="card profile-card">
          <span class="avatar-lg" [style.background]="u.avatarColor">{{ initials() }}</span>
          <h3>{{ u.name }}</h3>
          <p class="muted">{{ u.email }}</p>
          <div class="meta">
            <div><strong>{{ txn.transactions().length }}</strong><span>Transactions</span></div>
            <div><strong>{{ u.currency }}</strong><span>Currency</span></div>
            <div><strong>{{ memberSince() }}</strong><span>Member since</span></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-h">Edit details</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="profile-form">
            <div class="field">
              <label>Full name</label>
              <input class="control" formControlName="name" />
              @if (fieldInvalid('name')) { <span class="error">Name is required.</span> }
            </div>

            <div class="field">
              <label>Email</label>
              <input class="control" [value]="u.email" disabled />
            </div>

            <div class="field">
              <label>Preferred currency</label>
              <select class="control" formControlName="currency">
                @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>

            <div class="field">
              <label>Avatar color</label>
              <div class="color-grid">
                @for (col of colors; track col) {
                  <button type="button" class="color-opt" [class.active]="form.value.avatarColor === col" [style.background]="col" (click)="form.controls.avatarColor.setValue(col)"></button>
                }
              </div>
            </div>

            <button class="btn btn-primary" type="submit">Save changes</button>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 18px; }
      .profile-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
      .avatar-lg { width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 34px; font-weight: 700; margin-bottom: 8px; }
      .profile-card h3 { font-size: 18px; }
      .muted { color: var(--text-muted); margin: 0; }
      .meta { display: flex; gap: 18px; margin-top: 18px; }
      .meta div { display: flex; flex-direction: column; }
      .meta strong { font-size: 18px; }
      .meta span { font-size: 12px; color: var(--text-muted); }
      .card-h { margin-bottom: 16px; font-size: 16px; }
      .profile-form { display: grid; gap: 16px; max-width: 480px; }
      .color-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; }
      .color-opt { height: 30px; border-radius: 8px; border: 2px solid transparent; }
      .color-opt.active { border-color: var(--text); transform: scale(1.08); }
      @media (max-width: 820px) { .profile-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  readonly txn = inject(TransactionService);
  private readonly fb = inject(FormBuilder);

  readonly colors = AVATAR_COLORS;
  readonly currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  readonly user = this.auth.currentUser;
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    currency: ['USD', [Validators.required]],
    avatarColor: ['#4f46e5', [Validators.required]],
  });

  constructor() {
    const u = this.user();
    if (u) {
      this.form.setValue({ name: u.name, currency: u.currency, avatarColor: u.avatarColor });
    }
  }

  initials(): string {
    const name = this.user()?.name ?? '';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
  memberSince(): string {
    const iso = this.user()?.createdAt;
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.updateProfile(this.form.getRawValue());
    this.notify.success('Profile updated');
  }
}
