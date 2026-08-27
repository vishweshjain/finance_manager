import { Injectable, effect, inject, signal } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly mode = signal<ThemeMode>(
    this.storage.get<ThemeMode>(STORAGE_KEYS.theme, 'light')
  );

  readonly mode$ = this.mode.asReadonly();
  readonly isDark = () => this.mode() === 'dark';

  constructor() {
    // Apply the theme to <html data-theme="..."> whenever it changes.
    effect(() => {
      const current = this.mode();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', current);
      }
      this.storage.set(STORAGE_KEYS.theme, current);
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }
}
