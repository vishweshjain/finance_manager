import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of notifications.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.type">
          <span class="toast-icon">
            @switch (t.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ! }
              @default { i }
            }
          </span>
          <div class="toast-body">
            @if (t.title) { <strong>{{ t.title }}</strong> }
            <span>{{ t.message }}</span>
          </div>
          <button class="toast-close" (click)="notifications.dismiss(t.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: min(360px, calc(100vw - 36px));
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
        animation: toast-in 0.22s ease;
      }
      .toast-icon {
        flex: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 13px;
        color: #fff;
      }
      .toast-success .toast-icon { background: var(--success); }
      .toast-error .toast-icon { background: var(--danger); }
      .toast-warning .toast-icon { background: var(--warning); }
      .toast-info .toast-icon { background: var(--info); }
      .toast-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 13px;
        color: var(--text);
      }
      .toast-body strong { font-weight: 600; }
      .toast-close {
        border: none;
        background: none;
        color: var(--text-faint);
        font-size: 18px;
        line-height: 1;
      }
      @keyframes toast-in {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @media (max-width: 576px) {
        .toast-stack {
          top: auto;
          bottom: 14px;
          right: 10px;
          left: 10px;
          width: auto;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly notifications = inject(NotificationService);
}
