import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /** RxJS stream — every toast that is pushed (handy for side-effects). */
  readonly stream$ = new Subject<Toast>();

  success(message: string, title = 'Success'): void {
    this.push({ type: 'success', title, message });
  }

  error(message: string, title = 'Something went wrong'): void {
    this.push({ type: 'error', title, message });
  }

  info(message: string, title = 'Heads up'): void {
    this.push({ type: 'info', title, message });
  }

  warning(message: string, title = 'Warning'): void {
    this.push({ type: 'warning', title, message });
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(t: Omit<Toast, 'id'>): void {
    const toast: Toast = { ...t, id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this._toasts.update((list) => [...list, toast]);
    this.stream$.next(toast);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }
}
