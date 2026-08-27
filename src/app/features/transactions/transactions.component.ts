import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { SHARED } from '../../shared/shared';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaction, TxType } from '../../core/models/transaction';
import { todayISO } from '../../core/utils/date.util';

type TypeFilter = 'all' | TxType;
type SortKey = 'date' | 'amount' | 'title';

@Component({
  selector: 'app-transactions',
  imports: [SHARED, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnDestroy {
  readonly txn = inject(TransactionService);
  readonly categories = inject(CategoryService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // ---- Filter / sort / pagination state (signals) ----
  readonly searchTerm = signal('');
  readonly typeFilter = signal<TypeFilter>('all');
  readonly categoryFilter = signal<string>('all');
  readonly monthFilter = signal<string>('all');
  readonly sortKey = signal<SortKey>('date');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly page = signal(1);
  readonly pageSize = signal(8);
  readonly loading = signal(true);

  // ---- Modal / dialog state ----
  readonly modalOpen = signal(false);
  readonly editing = signal<Transaction | null>(null);
  readonly confirmOpen = signal(false);
  readonly deleteTarget = signal<Transaction | null>(null);
  readonly selectedType = signal<TxType>('expense');

  // RxJS stream for debounced search input
  private readonly searchSubject = new Subject<string>();
  private readonly sub: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TxType, [Validators.required]],
    categoryId: ['', [Validators.required]],
    date: [todayISO(), [Validators.required]],
    note: ['' as string],
  });

  constructor() {
    this.timeoutId = setTimeout(() => this.loading.set(false), 400);
    this.sub = this.searchSubject
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((value) => this.searchTerm.set(value));

    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) this.searchTerm.set(q);

    this.sub.add(
      this.form.controls.type.valueChanges.subscribe((type) => {
        this.selectedType.set(type);
        this.form.controls.categoryId.setValue('');
      })
    );
  }

  // ---- Derived, reactive data ----
  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.typeFilter();
    const cat = this.categoryFilter();
    const month = this.monthFilter();
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;

    return [...this.txn.transactions()]
      .filter((t) => {
        if (type !== 'all' && t.type !== type) return false;
        if (cat !== 'all' && t.categoryId !== cat) return false;
        if (month !== 'all' && !t.date.startsWith(month)) return false;
        if (term && !`${t.title} ${t.note ?? ''}`.toLowerCase().includes(term))
          return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (key === 'amount') cmp = a.amount - b.amount;
        else if (key === 'title') cmp = a.title.localeCompare(b.title);
        else cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        return cmp * dir;
      });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))
  );

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  readonly categoryOptions = computed(() =>
    this.categories.categories().filter((c) => c.type === this.selectedType())
  );

  readonly monthOptions = computed(() => {
    const set = new Set(this.txn.transactions().map((t) => t.date.slice(0, 7)));
    return [...set].sort().reverse();
  });

  // ---- UI handlers ----
  onSearchInput(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }
  setType(e: Event): void {
    this.typeFilter.set((e.target as HTMLSelectElement).value as TypeFilter);
    this.page.set(1);
  }
  setCategory(e: Event): void {
    this.categoryFilter.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  setMonth(e: Event): void {
    this.monthFilter.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
  }
  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }
  changePage(delta: number): void {
    const next = this.page() + delta;
    if (next >= 1 && next <= this.totalPages()) this.page.set(next);
  }
  changePageSize(e: Event): void {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.page.set(1);
  }
  resetFilters(): void {
    this.searchTerm.set('');
    this.typeFilter.set('all');
    this.categoryFilter.set('all');
    this.monthFilter.set('all');
    this.page.set(1);
  }

  // ---- CRUD ----
  openAdd(): void {
    this.editing.set(null);
    this.selectedType.set('expense');
    this.form.reset({
      title: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      date: todayISO(),
      note: '',
    });
    this.form.controls.categoryId.setValue('');
    this.modalOpen.set(true);
  }
  openEdit(t: Transaction): void {
    this.editing.set(t);
    this.selectedType.set(t.type);
    this.form.setValue({
      title: t.title,
      amount: t.amount,
      type: t.type,
      categoryId: t.categoryId,
      date: t.date,
      note: t.note ?? '',
    });
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
    const data = this.form.getRawValue();
    const editing = this.editing();
    if (editing) {
      this.txn.update(editing.id, data);
      this.notify.success('Transaction updated');
    } else {
      this.txn.add(data);
      this.notify.success('Transaction added');
    }
    this.modalOpen.set(false);
    this.page.set(1);
  }
  askDelete(t: Transaction): void {
    this.deleteTarget.set(t);
    this.confirmOpen.set(true);
  }
  confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.txn.remove(target.id);
      this.notify.success('Transaction deleted');
    }
    this.confirmOpen.set(false);
  }
  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
