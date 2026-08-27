import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1 class="form-title">Welcome back</h1>
    <p class="form-sub">Sign in to your FinanceManager account.</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" class="control" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
        @if (showError('email')) {
          <span class="error">Enter a valid email address.</span>
        }
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" class="control" type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
        @if (showError('password')) {
          <span class="error">Password is required.</span>
        }
      </div>

      @if (error()) {
        <div class="form-alert">{{ error() }}</div>
      }

      <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
        {{ loading() ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <button class="btn btn-ghost btn-block mt-12" type="button" (click)="fillDemo()">
      Use demo credentials
    </button>

    <p class="switch">
      Don't have an account? <a routerLink="/auth/register">Create one</a>
    </p>
  `,
  styles: [
    `
      .form-title { font-size: 26px; margin-bottom: 6px; }
      .form-sub { color: var(--text-muted); margin-bottom: 22px; }
      .auth-form { display: grid; gap: 16px; }
      .btn-block { width: 100%; }
      .form-alert {
        background: var(--danger-soft);
        color: var(--danger);
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 500;
      }
      .switch { margin-top: 18px; text-align: center; color: var(--text-muted); font-size: 13.5px; }
      .switch a { color: var(--primary); font-weight: 600; }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  showError(field: 'email' | 'password'): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  fillDemo(): void {
    this.form.setValue({ email: 'demo@finance.app', password: 'demo1234' });
    this.form.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email, password);

    if (result.ok) {
      this.notify.success('Signed in successfully');
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set(result.error ?? 'Login failed');
      this.loading.set(false);
    }
  }
}
