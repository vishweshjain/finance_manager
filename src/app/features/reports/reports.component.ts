import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { SHARED } from '../../shared/shared';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { CurrencyService } from '../../core/services/currency.service';
import {
  currentMonthKey,
  lastMonths,
  monthKeyFromISO,
  monthLabel,
} from '../../core/utils/date.util';

type Period = 'month' | '6m' | 'year' | 'all';

@Component({
  selector: 'app-reports',
  imports: [SHARED],
  template: `
    <app-page-header title="Reports" subtitle="Analyze trends and understand your spending">
      <div pageActions class="seg">
        @for (p of periods; track p.value) {
          <button type="button" class="seg-btn" [class.active]="period() === p.value" (click)="period.set(p.value)">
            {{ p.label }}
          </button>
        }
      </div>
    </app-page-header>

    <div class="stats-grid">
      <app-stat-card label="Income" icon="📈" accent="success" [value]="currency.format(totalIncome())" />
      <app-stat-card label="Expenses" icon="🧾" accent="danger" [value]="currency.format(totalExpense())" />
      <app-stat-card label="Net Cash Flow" icon="💧" accent="primary" [value]="currency.format(net())" />
      <app-stat-card label="Savings Rate" icon="🐖" accent="warning" [value]="savingsRate() + '%'" />
    </div>

    <div class="charts">
      <div class="card">
        <div class="card-head"><h3>Cash Flow</h3><span class="card-tag">{{ periodLabel() }}</span></div>
        @if (incomeSeries().length === 0) {
          <app-empty-state icon="📭" title="No data for this period" />
        } @else {
          <app-chart type="line" [height]="300" [labels]="monthLabels()" [datasets]="cashFlowDatasets()" [options]="lineOptions" />
        }
      </div>

      <div class="card">
        <div class="card-head"><h3>Spending by Category</h3></div>
        @if (categoryExpense().length === 0) {
          <app-empty-state icon="🍃" title="No expenses to show" />
        } @else {
          <app-chart type="doughnut" [height]="300" [labels]="categoryLabels()" [datasets]="categoryDatasets()" [options]="doughnutOptions" />
        }
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Income vs Expenses</h3></div>
      @if (incomeSeries().length === 0) {
        <app-empty-state icon="📭" title="No data for this period" />
      } @else {
        <app-chart type="bar" [height]="280" [labels]="monthLabels()" [datasets]="barDatasets()" [options]="barOptions" />
      }
    </div>
  `,
  styles: [
    `
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
      .charts { display: grid; grid-template-columns: 1.3fr 1fr; gap: 18px; margin-top: 18px; }
      .card { padding: 18px 20px; }
      .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .card-head h3 { font-size: 16px; }
      .card-tag { font-size: 12px; color: var(--text-muted); background: var(--surface-2); padding: 4px 10px; border-radius: 999px; }
      .seg { display: inline-flex; gap: 4px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 4px; }
      .seg-btn { height: 34px; padding: 0 12px; border-radius: 8px; border: none; background: none; color: var(--text-muted); font-weight: 600; font-size: 12.5px; }
      .seg-btn.active { background: var(--primary); color: #fff; }
      @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .charts { grid-template-columns: 1fr; } }
      @media (max-width: 560px) { .stats-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ReportsComponent implements OnDestroy {
  readonly txn = inject(TransactionService);
  readonly categories = inject(CategoryService);
  readonly currency = inject(CurrencyService);

  readonly period = signal<Period>('6m');
  readonly periods: { value: Period; label: string }[] = [
    { value: 'month', label: 'This month' },
    { value: '6m', label: '6 months' },
    { value: 'year', label: 'This year' },
    { value: 'all', label: 'All time' },
  ];

  private timeoutId?: ReturnType<typeof setTimeout>;

  readonly periodMonths = computed(() => {
    const p = this.period();
    if (p === 'all') {
      const set = new Set(this.txn.transactions().map((t) => monthKeyFromISO(t.date)));
      return [...set].sort();
    }
    if (p === 'year') {
      const y = new Date().getFullYear();
      return Array.from({ length: 12 }, (_, i) => `${y}-${`${i + 1}`.padStart(2, '0')}`);
    }
    if (p === 'month') return [currentMonthKey()];
    return lastMonths(6);
  });

  readonly filtered = computed(() =>
    this.txn.transactions().filter((t) =>
      this.periodMonths().includes(monthKeyFromISO(t.date))
    )
  );

  readonly monthLabels = computed(() => this.periodMonths().map(monthLabel));

  readonly totalIncome = computed(() =>
    this.filtered().filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );
  readonly totalExpense = computed(() =>
    this.filtered().filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  );
  readonly net = computed(() => this.totalIncome() - this.totalExpense());
  readonly savingsRate = computed(() => {
    const inc = this.totalIncome();
    return inc > 0 ? Math.round((this.net() / inc) * 100) : 0;
  });

  readonly incomeSeries = computed(() =>
    this.periodMonths().map(
      (m) =>
        this.filtered()
          .filter((t) => t.type === 'income' && monthKeyFromISO(t.date) === m)
          .reduce((s, t) => s + t.amount, 0)
    )
  );
  readonly expenseSeries = computed(() =>
    this.periodMonths().map(
      (m) =>
        this.filtered()
          .filter((t) => t.type === 'expense' && monthKeyFromISO(t.date) === m)
          .reduce((s, t) => s + t.amount, 0)
    )
  );

  readonly categoryExpense = computed(() => {
    const map = new Map<string, number>();
    for (const t of this.filtered()) {
      if (t.type === 'expense') map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return this.categories
      .categories()
      .filter((c) => map.has(c.id))
      .map((c) => ({ name: c.name, color: c.color, total: map.get(c.id)! }))
      .sort((a, b) => b.total - a.total);
  });
  readonly categoryLabels = computed(() => this.categoryExpense().map((c) => c.name));

  readonly cashFlowDatasets = computed(() => [
    {
      label: 'Income',
      data: this.incomeSeries(),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: 'Expense',
      data: this.expenseSeries(),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ]);

  readonly barDatasets = computed(() => [
    { label: 'Income', data: this.incomeSeries(), backgroundColor: '#10b981', borderRadius: 8, maxBarThickness: 28 },
    { label: 'Expense', data: this.expenseSeries(), backgroundColor: '#ef4444', borderRadius: 8, maxBarThickness: 28 },
  ]);

  readonly categoryDatasets = computed(() => [
    {
      data: this.categoryExpense().map((c) => c.total),
      backgroundColor: this.categoryExpense().map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ]);

  readonly lineOptions = {
    plugins: { legend: { display: true } },
    scales: { x: { beginAtZero: false }, y: { beginAtZero: true } },
  };
  readonly barOptions = {
    plugins: { legend: { display: true } },
    scales: { x: {}, y: { beginAtZero: true } },
  };
  readonly doughnutOptions = { cutout: '62%', plugins: { legend: { position: 'bottom' as const } } };

  readonly periodLabel = computed(() => {
    const p = this.period();
    if (p === 'month') return 'This month';
    if (p === 'year') return 'This year';
    if (p === 'all') return 'All time';
    return 'Last 6 months';
  });

  constructor() {
    this.timeoutId = setTimeout(() => {}, 0);
  }
  ngOnDestroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
