import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { DEFAULT_CATEGORIES } from './seed';
import { uid } from '../utils/id.util';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storage = inject(StorageService);

  private readonly _categories = signal<Category[]>(
    this.storage.getArray<Category>(STORAGE_KEYS.categories)
  );

  readonly categories = this._categories.asReadonly();
  /** RxJS Observable mirror of the categories signal. */
  readonly categories$: Observable<Category[]> = toObservable(this._categories);

  constructor() {
    if (this._categories().length === 0) {
      this._categories.set(DEFAULT_CATEGORIES);
      this.persist();
    }
  }

  readonly incomeCategories = computed(() =>
    this._categories().filter((c) => c.type === 'income')
  );
  readonly expenseCategories = computed(() =>
    this._categories().filter((c) => c.type === 'expense')
  );

  getById(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }

  /** Whether a category with the given name (case-insensitive) already exists. */
  exists(name: string, excludeId?: string): boolean {
    const normalized = name.trim().toLowerCase();
    return this._categories().some(
      (c) => c.id !== excludeId && c.name.trim().toLowerCase() === normalized
    );
  }

  add(data: Omit<Category, 'id'>): void {
    const category: Category = { ...data, id: uid('cat') };
    this._categories.update((list) => [...list, category]);
    this.persist();
  }

  update(id: string, data: Partial<Omit<Category, 'id'>>): void {
    this._categories.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    this.persist();
  }

  remove(id: string): void {
    this._categories.update((list) => list.filter((c) => c.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.categories, this._categories());
  }
}
