import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <div class="empty-icon">{{ icon }}</div>
      <h4>{{ title }}</h4>
      @if (message) { <p>{{ message }}</p> }
      @if (actionLabel) {
        <button class="btn btn-primary" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
        padding: 48px 20px;
        color: var(--text-muted);
      }
      .empty-icon { font-size: 40px; opacity: 0.9; }
      .empty h4 { font-size: 16px; color: var(--text); margin: 4px 0 0; }
      .empty p { margin: 0; max-width: 360px; }
      .empty button { margin-top: 12px; }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = '🗂️';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
