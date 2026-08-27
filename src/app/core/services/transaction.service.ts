import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { seedTransactions } from './seed';
import { uid } from '../utils/id.util';
import { monthKeyFromISO } from '../utils/date.util';

export type TxSortKey = 'date' | 'amount' | 'title';
export type SortDir = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly storage = inject(StorageService);

  private readonly _transactions = signal<Transaction[]>(
    this.storage.getArray<Transaction>(STORAGE_KEYS.transactions)
  );

  readonly transactions = this._transactions.asReadonly();
  readonly transactions$: Observable<Transaction[]> = toObservable(this._transactions);

  constructor() {
    if (this._transactions().length === 0) {
      this._transactions.set(seedTransactions());
      this.persist();
    }
  }

  /** Total income across all transactions. */
  readonly totalIncome = computed(() =>
    this.sumOf((t) => t.type === 'income')
  );
  /** Total expenses across all transactions. */
  readonly totalExpense = computed(() =>
    this.sumOf((t) => t.type === 'expense')
  );
  /** Net balance (income - expense). */
  readonly balance = computed(
    () => this.totalIncome() - this.totalExpense()
  );

  getById(id: string): Transaction | undefined {
    return this._transactions().find((t) => t.id === id);
  }

  add(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const txn: Transaction = {
      ...data,
      id: uid('txn'),
      createdAt: new Date().toISOString(),
    };
    this._transactions.update((list) => [txn, ...list]);
    this.persist();
    return txn;
  }

  update(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>): void {
    this._transactions.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    this.persist();
  }

  remove(id: string): void {
    this._transactions.update((list) => list.filter((t) => t.id !== id));
    this.persist();
  }

  /** Income for a given YYYY-MM month. */
  incomeForMonth(monthKey: string): number {
    return this.forMonth(monthKey, 'income');
  }
  expenseForMonth(monthKey: string): number {
    return this.forMonth(monthKey, 'expense');
  }

  private forMonth(monthKey: string, type: Transaction['type']): number {
    return this._transactions()
      .filter((t) => monthKeyFromISO(t.date) === monthKey && t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private sumOf(pred: (t: Transaction) => boolean): number {
    return this._transactions()
      .filter(pred)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.transactions, this._transactions());
  }
}
