import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="backdrop" (click)="onBackdrop($event)">
        <div
          class="modal"
          [class.modal-sm]="size === 'sm'"
          [class.modal-lg]="size === 'lg'"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <header class="modal-head">
            <h3>{{ title }}</h3>
            @if (dismissible) {
              <button class="modal-close" (click)="close()" aria-label="Close">×</button>
            }
          </header>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (hasFooter) {
            <footer class="modal-foot">
              <ng-content select="[modalFooter]"></ng-content>
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(11, 15, 28, 0.55);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 16px;
        overflow-y: auto;
        animation: fade 0.18s ease;
      }
      .modal {
        width: 100%;
        max-width: 520px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow-lg);
        animation: pop 0.2s ease;
        margin: auto 0;
      }
      .modal-sm { max-width: 400px; }
      .modal-lg { max-width: 720px; }
      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border);
      }
      .modal-head h3 { font-size: 17px; }
      .modal-close {
        border: none;
        background: none;
        font-size: 22px;
        line-height: 1;
        color: var(--text-faint);
      }
      .modal-body { padding: 20px; }
      .modal-foot {
        padding: 16px 20px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pop {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dismissible = true;
  @Input() hasFooter = false;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && this.dismissible) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onBackdrop(e: MouseEvent): void {
    if (this.dismissible) this.close();
  }
}
