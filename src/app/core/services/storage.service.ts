import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Thin wrapper around localStorage so the rest of the app never touches
 * the Web Storage API directly. This makes it trivial to swap the
 * persistence layer (e.g. for a real REST backend) later.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / serialization errors */
    }
  }

  /**
   * Reads a JSON array from storage. Returns an empty array when there is no
   * saved data, when storage is unavailable, or when the stored value is not a
   * valid array (e.g. corrupted / wrong-shape data).
   */
  getArray<T>(key: string): T[] {
    const value = this.get<T[]>(key, []);
    return Array.isArray(value) ? value : [];
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }
}

export const STORAGE_KEYS = {
  users: 'fm.users',
  session: 'fm.session',
  categories: 'fm.categories',
  transactions: 'fm.transactions',
  budgets: 'fm.budgets',
  theme: 'fm.theme',
  settings: 'fm.settings',
} as const;
