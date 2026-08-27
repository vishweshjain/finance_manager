import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1 class="form-title">Create your account</h1>
    <p class="form-sub">Start managing your finances in minutes.</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
      <div class="field">
        <label for="name">Full name</label>
        <input id="name" class="control" type="text" formControlName="name" placeholder="Jane Doe" />
        @if (showError('name')) { <span class="error">Name is required.</span> }
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" class="control" type="email" formControlName="email" placeholder="you@example.com" />
        @if (showError('email')) { <span class="error">Enter a valid email address.</span> }
      </div>

      <div class="field">
        <label for="currency">Preferred currency</label>
        <select id="currency" class="control" formControlName="currency">
          @for (c of currencies; track c.code) {
            <option [value]="c.code">{{ c.code }} — {{ c.label }}</option>
          }
        </select>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" class="control" type="password" formControlName="password" placeholder="At least 6 characters" />
        @if (showError('password')) { <span class="error">Password must be at least 6 characters.</span> }
      </div>

      <div class="field">
        <label for="confirm">Confirm password</label>
        <input id="confirm" class="control" type="password" formControlName="confirm" placeholder="Repeat password" />
        @if (form.errors?.['mismatch'] && form.get('confirm')?.touched) {
          <span class="error">Passwords do not match.</span>
        }
      </div>

      @if (error()) { <div class="form-alert">{{ error() }}</div> }

      <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
        {{ loading() ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <p class="switch">
      Already have an account? <a routerLink="/auth/login">Sign in</a>
    </p>
  `,
  styles: [
    `
      .form-title { font-size: 26px; margin-bottom: 6px; }
      .form-sub { color: var(--text-muted); margin-bottom: 22px; }
      .auth-form { display: grid; gap: 16px; }
      .btn-block { width: 100%; }
      .form-alert {
        background: var(--danger-soft); color: var(--danger);
        padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500;
      }
      .switch { margin-top: 18px; text-align: center; color: var(--text-muted); font-size: 13.5px; }
      .switch a { color: var(--primary); font-weight: 600; }
    `,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly currencies = [
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'GBP', label: 'British Pound' },
    { code: 'INR', label: 'Indian Rupee' },
    { code: 'JPY', label: 'Japanese Yen' },
    { code: 'AUD', label: 'Australian Dollar' },
    { code: 'CAD', label: 'Canadian Dollar' },
  ];

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      currency: ['USD', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: [this.matchValidator] }
  );

  private matchValidator(group: { errors: ValidationErrors | null } & { get: (k: string) => any }): ValidationErrors | null {
    return group.get('password')?.value === group.get('confirm')?.value
      ? null
      : { mismatch: true };
  }

  showError(field: 'name' | 'email' | 'password'): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const { name, email, password, currency } = this.form.getRawValue();
    const result = this.auth.register({ name, email, password, currency });

    if (result.ok) {
      this.notify.success('Account created — welcome!');
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set(result.error ?? 'Registration failed');
      this.loading.set(false);
    }
  }
}
