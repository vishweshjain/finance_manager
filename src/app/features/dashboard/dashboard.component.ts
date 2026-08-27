import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { SHARED } from '../../shared/shared';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { CurrencyService } from '../../core/services/currency.service';
import { NotificationService } from '../../core/services/notification.service';
import { RouterLink } from '@angular/router';
import {
  currentMonthKey,
  lastMonths,
  monthKeyFromISO,
  monthLabel,
} from '../../core/utils/date.util';
import { CHART_COLORS } from '../../core/utils/chart.util';

@Component({
  selector: 'app-dashboard',
  imports: [SHARED, RouterLink],
  template: `
    <app-page-header title="Dashboard" subtitle="Your financial snapshot at a glance" />

    <div class="stats-grid">
      <app-stat-card
        label="Total Balance"
        icon="💰"
        accent="primary"
        [value]="currency.format(txn.balance())"
        [loading]="loading()"
      />
      <app-stat-card
        label="Income"
        icon="📈"
        accent="success"
        [value]="currency.format(txn.totalIncome())"
        [loading]="loading()"
      />
      <app-stat-card
        label="Expenses"
        icon="🧾"
        accent="danger"
        [value]="currency.format(txn.totalExpense())"
        [loading]="loading()"
      />
      <app-stat-card
        label="Savings"
        icon="🐖"
        accent="warning"
        [value]="currency.format(txn.balance())"
        [loading]="loading()"
      />
    </div>

    <div class="charts">
      <div class="card chart-card">
        <div class="card-head">
          <h3>Income vs Expense</h3>
          <span class="card-tag">Last 6 months</span>
        </div>
        @if (loading()) {
          <app-loading-spinner />
        } @else {
          <app-chart
            type="bar"
            [height]="300"
            [labels]="monthLabels()"
            [datasets]="incomeExpenseDatasets()"
            [options]="barOptions"
          />
        }
      </div>

      <div class="card chart-card">
        <div class="card-head">
          <h3>Expenses by Category</h3>
          <span class="card-tag">{{ currentMonthLabel() }}</span>
        </div>
        @if (loading()) {
          <app-loading-spinner />
        } @else if (categoryData().length === 0) {
          <app-empty-state icon="🍃" title="No expenses this month" />
        } @else {
          <app-chart
            type="doughnut"
            [height]="300"
            [labels]="categoryLabels()"
            [datasets]="categoryDatasets()"
            [options]="doughnutOptions"
          />
        }
      </div>
    </div>

    <div class="card recent">
      <div class="card-head">
        <h3>Recent Transactions</h3>
        <a class="link" routerLink="/transactions">View all →</a>
      </div>
      @if (loading()) {
        <app-loading-spinner />
      } @else if (recent().length === 0) {
        <app-empty-state icon="💸" title="No transactions yet" />
      } @else {
        <ul class="recent-list">
          @for (t of recent(); track t.id) {
            <li class="recent-item">
              <span class="r-icon" [style.background]="color(t.categoryId) + '22'">
                {{ t.categoryId | categoryIcon }}
              </span>
              <div class="r-main">
                <span class="r-title">{{ t.title }}</span>
                <span class="r-sub">{{ t.categoryId | categoryName }} · {{ t.date | shortDate }}</span>
              </div>
              <span class="r-amount" [class.income]="t.type === 'income'" [class.expense]="t.type === 'expense'">
                {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | money }}
              </span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }
      .charts {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 18px;
        margin-top: 18px;
      }
      .chart-card { padding: 18px 20px; }
      .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .card-head h3 { font-size: 16px; }
      .card-tag {
        font-size: 12px;
        color: var(--text-muted);
        background: var(--surface-2);
        padding: 4px 10px;
        border-radius: 999px;
      }
      .recent { margin-top: 18px; }
      .link { color: var(--primary); font-size: 13px; font-weight: 600; }
      .recent-list { display: grid; gap: 4px; }
      .recent-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 8px;
        border-radius: 10px;
      }
      .recent-item:hover { background: var(--surface-2); }
      .r-icon {
        width: 40px; height: 40px; border-radius: 11px;
        display: grid; place-items: center; font-size: 18px; flex: none;
      }
      .r-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }
      .r-title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .r-sub { font-size: 12.5px; color: var(--text-muted); }
      .r-amount { font-weight: 700; font-size: 14px; white-space: nowrap; }
      .r-amount.income { color: var(--success); }
      .r-amount.expense { color: var(--danger); }

      @media (max-width: 1100px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .charts { grid-template-columns: 1fr; }
      }
      @media (max-width: 560px) {
        .stats-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class DashboardComponent implements OnDestroy {
  readonly txn = inject(TransactionService);
  readonly categories = inject(CategoryService);
  readonly currency = inject(CurrencyService);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(true);

  private readonly months = lastMonths(6);
  readonly monthLabels = signal(this.months.map(monthLabel));
  readonly currentMonthLabel = signal(monthLabel(currentMonthKey()));

  readonly incomeExpenseDatasets = computed(() => [
    {
      label: 'Income',
      data: this.months.map((m) => this.txn.incomeForMonth(m)),
      backgroundColor: '#10b981',
      borderRadius: 8,
      maxBarThickness: 26,
    },
    {
      label: 'Expense',
      data: this.months.map((m) => this.txn.expenseForMonth(m)),
      backgroundColor: '#ef4444',
      borderRadius: 8,
      maxBarThickness: 26,
    },
  ]);

  readonly categoryLabels = computed(() =>
    this.categoryData().map((c) => c.name)
  );
  readonly categoryDatasets = computed(() => [
    {
      data: this.categoryData().map((c) => c.total),
      backgroundColor: this.categoryData().map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ]);

  readonly recent = computed(() => this.txn.transactions().slice(0, 6));

  readonly barOptions = {
    plugins: { legend: { display: true } },
    scales: { x: { stacked: false }, y: { beginAtZero: true } },
  };

  readonly doughnutOptions = {
    cutout: '62%',
    plugins: { legend: { position: 'bottom' as const } },
  };

  private readonly sub: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    // Simulate a brief data load so loading states are visible.
    this.timeoutId = setTimeout(() => this.loading.set(false), 450);
    this.sub = this.notify.stream$.subscribe();
  }

  readonly categoryData = computed(() => {
    const month = currentMonthKey();
    const map = new Map<string, number>();
    for (const t of this.txn.transactions()) {
      if (t.type === 'expense' && monthKeyFromISO(t.date) === month) {
        map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
      }
    }
    return this.categories
      .categories()
      .filter((c) => map.has(c.id))
      .map((c) => ({ name: c.name, color: c.color, total: map.get(c.id)! }));
  });

  color(id: string): string {
    return this.categories.getById(id)?.color ?? '#64748b';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
