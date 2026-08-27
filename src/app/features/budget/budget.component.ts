import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SHARED } from '../../shared/shared';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { NotificationService } from '../../core/services/notification.service';
import { Budget } from '../../core/models/budget';
import { CurrencyService } from '../../core/services/currency.service';
import { currentMonthKey, monthKeyFromISO, monthLabel } from '../../core/utils/date.util';

interface BudgetView extends Budget {
  spent: number;
  remaining: number;
  percent: number;
  status: 'ok' | 'warn' | 'over';
  categoryName: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-budget',
  imports: [SHARED, ReactiveFormsModule],
  template: `
    <app-page-header title="Budgets" subtitle="Set limits and stay on top of your spending">
      <button pageActions class="btn btn-primary" (click)="openAdd()">＋ Set Budget</button>
    </app-page-header>

    <div class="month-bar">
      <label>Month</label>
      <select class="control" [value]="selectedMonth()" (change)="setMonth($event)">
        @for (m of monthOptions(); track m) {
          <option [value]="m">{{ m | monthName }}</option>
        }
      </select>
    </div>

    @if (loading()) {
      <app-loading-spinner />
    } @else if (view().length === 0) {
      <app-empty-state
        icon="🧾"
        title="No budgets for this month"
        message="Create a budget to start tracking your spending limits."
        actionLabel="Set Budget"
        (action)="openAdd()"
      />
    } @else {
      <div class="budget-grid">
        @for (b of view(); track b.id) {
          <div class="budget-card" [class.over]="b.status === 'over'">
            <div class="b-head">
              <span class="b-icon" [style.background]="b.color + '1f'">{{ b.icon }}</span>
              <div class="b-title">
                <strong>{{ b.categoryName }}</strong>
                @if (b.status === 'over') { <span class="tag over">Over</span> }
                @else if (b.status === 'warn') { <span class="tag warn">Near limit</span> }
              </div>
              <div class="b-actions">
                <button class="btn-icon" (click)="openEdit(b)" title="Edit">✏️</button>
                <button class="btn-icon" (click)="askDelete(b)" title="Delete">🗑️</button>
              </div>
            </div>

            <div class="b-amounts">
              <span class="spent">{{ b.spent | money }}</span>
              <span class="limit">of {{ b.limit | money }}</span>
            </div>

            <app-progress-bar [spent]="b.spent" [limit]="b.limit" [showLabel]="false" />

            <div class="b-foot">
              @if (b.remaining >= 0) {
                <span class="rem ok">{{ b.remaining | money }} left</span>
              } @else {
                <span class="rem bad">{{ (b.remaining * -1) | money }} over</span>
              }
              <span class="pct">{{ b.percent }}%</span>
            </div>
          </div>
        }
      </div>
    }

    <!-- Modal -->
    <app-modal [open]="modalOpen()" [hasFooter]="true" title="{{ editing() ? 'Edit Budget' : 'Set Budget' }}" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="submit()" class="b-form">
        <div class="field">
          <label>Scope</label>
          <select class="control" formControlName="categoryId">
            <option value="all">Overall (all expenses)</option>
            @for (c of categories.expenseCategories(); track c.id) {
              <option [value]="c.id">{{ c.icon }} {{ c.name }}</option>
            }
          </select>
        </div>
        <div class="field">
          <label>Monthly limit ({{ currency.code() }})</label>
          <input class="control" type="number" step="0.01" min="0" formControlName="limit" placeholder="0.00" />
          @if (fieldInvalid('limit')) { <span class="error">Enter a valid limit.</span> }
        </div>
        <p class="hint">This budget applies to <b>{{ selectedMonth() | monthName }}</b>.</p>
      </form>
      <div modalFooter>
        <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
        <button class="btn btn-primary" (click)="submit()">{{ editing() ? 'Save' : 'Create' }}</button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="Delete budget"
      message="Remove this budget limit? This won't affect your transactions."
      confirmText="Delete"
      (confirm)="confirmDelete()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
  styles: [
    `
      .month-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
      .month-bar label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
      .month-bar .control { width: auto; }

      .budget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .budget-card {
        padding: 18px; border-radius: 16px;
        background: var(--surface); border: 1px solid var(--border);
        display: flex; flex-direction: column; gap: 12px;
      }
      .budget-card.over { border-color: var(--danger); }
      .b-head { display: flex; align-items: center; gap: 12px; }
      .b-icon { width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center; font-size: 20px; flex: none; }
      .b-title { flex: 1; display: flex; align-items: center; gap: 8px; }
      .b-title strong { font-size: 14.5px; }
      .b-actions { display: flex; gap: 6px; }
      .tag { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
      .tag.warn { background: var(--warning-soft); color: var(--warning); }
      .tag.over { background: var(--danger-soft); color: var(--danger); }

      .b-amounts { display: flex; align-items: baseline; gap: 8px; }
      .b-amounts .spent { font-size: 20px; font-weight: 700; }
      .b-amounts .limit { font-size: 13px; color: var(--text-muted); }

      .b-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
      .rem.ok { color: var(--success); font-weight: 600; }
      .rem.bad { color: var(--danger); font-weight: 600; }
      .pct { color: var(--text-muted); font-weight: 600; }

      .b-form { display: grid; gap: 16px; }
      .hint { font-size: 12.5px; color: var(--text-muted); margin: 0; }
    `,
  ],
})
export class BudgetComponent implements OnDestroy {
  readonly budgets = inject(BudgetService);
  readonly categories = inject(CategoryService);
  readonly txn = inject(TransactionService);
  readonly currency = inject(CurrencyService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly selectedMonth = signal(currentMonthKey());
  readonly modalOpen = signal(false);
  readonly editing = signal<Budget | null>(null);
  readonly confirmOpen = signal(false);
  readonly deleteTarget = signal<Budget | null>(null);

  readonly form = this.fb.nonNullable.group({
    categoryId: ['all', [Validators.required]],
    limit: [0, [Validators.required, Validators.min(0.01)]],
  });

  readonly monthOptions = computed(() => {
    const set = new Set(this.txn.transactions().map((t) => monthKeyFromISO(t.date)));
    set.add(currentMonthKey());
    return [...set].sort().reverse();
  });

  readonly view = computed<BudgetView[]>(() => {
    const month = this.selectedMonth();
    return this.budgets.forMonth(month).map((b) => {
      const spent = this.spentFor(b.categoryId, month);
      const percent = b.limit ? Math.round((spent / b.limit) * 100) : 0;
      const cat = b.categoryId === 'all' ? null : this.categories.getById(b.categoryId);
      const status: BudgetView['status'] = percent >= 100 ? 'over' : percent >= 80 ? 'warn' : 'ok';
      return {
        ...b,
        spent,
        remaining: b.limit - spent,
        percent,
        status,
        categoryName: b.categoryId === 'all' ? 'Overall Budget' : cat?.name ?? 'Unknown',
        color: b.categoryId === 'all' ? '#6366f1' : cat?.color ?? '#64748b',
        icon: b.categoryId === 'all' ? '🧮' : cat?.icon ?? '🏷️',
      };
    });
  });

  private timeoutId?: ReturnType<typeof setTimeout>;
  constructor() {
    this.timeoutId = setTimeout(() => this.loading.set(false), 350);
  }

  private spentFor(categoryId: string, month: string): number {
    return this.txn
      .transactions()
      .filter(
        (t) =>
          t.type === 'expense' &&
          monthKeyFromISO(t.date) === month &&
          (categoryId === 'all' || t.categoryId === categoryId)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  setMonth(e: Event): void {
    this.selectedMonth.set((e.target as HTMLSelectElement).value);
  }

  openAdd(): void {
    this.editing.set(null);
    this.form.reset({ categoryId: 'all', limit: 0 });
    this.modalOpen.set(true);
  }
  openEdit(b: Budget): void {
    this.editing.set(b);
    this.form.setValue({ categoryId: b.categoryId, limit: b.limit });
    this.modalOpen.set(true);
  }
  closeModal(): void {
    this.modalOpen.set(false);
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { categoryId, limit } = this.form.getRawValue();
    const month = this.selectedMonth();
    const existing = this.editing()
      ?? this.budgets.forMonth(month).find((b) => b.categoryId === categoryId);

    if (existing) {
      this.budgets.update(existing.id, { categoryId, limit, month });
      this.notify.success('Budget updated');
    } else {
      this.budgets.add({ categoryId, limit, month });
      this.notify.success('Budget created');
    }
    this.modalOpen.set(false);
  }
  askDelete(b: Budget): void {
    this.deleteTarget.set(b);
    this.confirmOpen.set(true);
  }
  confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.budgets.remove(target.id);
      this.notify.success('Budget deleted');
    }
    this.confirmOpen.set(false);
  }
  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
  ngOnDestroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
