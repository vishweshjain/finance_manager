import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalComponent],
  template: `
    <app-modal
      [open]="open"
      [title]="title"
      [hasFooter]="true"
      (closed)="cancel.emit()"
    >
      <p class="confirm-msg">{{ message }}</p>
      <div modalFooter>
        <button class="btn btn-ghost" (click)="cancel.emit()">{{ cancelText }}</button>
        <button class="btn" [class]="confirmClass" (click)="confirm.emit()">
          {{ confirmText }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [
    `
      .confirm-msg {
        color: var(--text-muted);
        margin: 0;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() confirmVariant: 'danger' | 'primary' = 'danger';
  @Input() cancelText = 'Cancel';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get confirmClass(): string {
    return this.confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary';
  }
}
