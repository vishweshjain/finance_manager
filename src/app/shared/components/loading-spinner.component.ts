import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-wrap" [class.overlay]="overlay">
      <span class="spinner" [style.width.px]="size" [style.height.px]="size"></span>
      @if (label) { <span class="spinner-label">{{ label }}</span> }
    </div>
  `,
  styles: [
    `
      .spinner-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 32px;
        color: var(--text-muted);
      }
      .spinner-wrap.overlay {
        position: absolute;
        inset: 0;
        background: var(--surface);
        z-index: 5;
        border-radius: inherit;
      }
      .spinner {
        display: inline-block;
        border: 3px solid var(--border-strong);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      .spinner-label { font-size: 13px; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size = 28;
  @Input() label = '';
  @Input() overlay = false;
}
