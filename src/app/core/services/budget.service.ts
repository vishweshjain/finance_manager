import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { seedBudgets } from './seed';
import { uid } from '../utils/id.util';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly storage = inject(StorageService);

  private readonly _budgets = signal<Budget[]>(
    this.storage.getArray<Budget>(STORAGE_KEYS.budgets)
  );

  readonly budgets = this._budgets.asReadonly();
  readonly budgets$: Observable<Budget[]> = toObservable(this._budgets);

  constructor() {
    if (this._budgets().length === 0) {
      this._budgets.set(seedBudgets());
      this.persist();
    }
  }

  /** Budgets that target a specific month. */
  forMonth(monthKey: string): Budget[] {
    return this._budgets().filter((b) => b.month === monthKey);
  }

  /** The overall ("all") monthly budget for a month, if any. */
  overallForMonth(monthKey: string): Budget | undefined {
    return this._budgets().find(
      (b) => b.month === monthKey && b.categoryId === 'all'
    );
  }

  getById(id: string): Budget | undefined {
    return this._budgets().find((b) => b.id === id);
  }

  add(data: Omit<Budget, 'id'>): void {
    const budget: Budget = { ...data, id: uid('bg') };
    this._budgets.update((list) => [...list, budget]);
    this.persist();
  }

  update(id: string, data: Partial<Omit<Budget, 'id'>>): void {
    this._budgets.update((list) =>
      list.map((b) => (b.id === id ? { ...b, ...data } : b))
    );
    this.persist();
  }

  remove(id: string): void {
    this._budgets.update((list) => list.filter((b) => b.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.budgets, this._budgets());
  }
}
