import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress">
      <div
        class="progress-fill"
        [class.warn]="status() === 'warn'"
        [class.over]="status() === 'over'"
        [style.width.%]="displayPercent()"
      ></div>
    </div>
    @if (showLabel) {
      <div class="progress-meta">
        <span>{{ percent() }}%</span>
        @if (status() === 'over') { <span class="tag over">Over budget</span> }
        @else if (status() === 'warn') { <span class="tag warn">Near limit</span> }
      </div>
    }
  `,
  styles: [
    `
      .progress {
        height: 8px;
        width: 100%;
        background: var(--bg-alt);
        border-radius: 999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: var(--success);
        transition: width 0.4s ease, background 0.3s ease;
      }
      .progress-fill.warn { background: var(--warning); }
      .progress-fill.over { background: var(--danger); }
      .progress-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 6px;
        font-size: 12px;
        color: var(--text-muted);
      }
      .tag {
        padding: 2px 8px;
        border-radius: 999px;
        font-weight: 600;
      }
      .tag.warn { background: var(--warning-soft); color: var(--warning); }
      .tag.over { background: var(--danger-soft); color: var(--danger); }
    `,
  ],
})
export class ProgressBarComponent {
  /** Spent amount */
  @Input() set spent(v: number) {
    this._spent.set(v);
  }
  /** Budget limit */
  @Input() set limit(v: number) {
    this._limit.set(v);
  }
  @Input() showLabel = true;

  private readonly _spent = signal(0);
  private readonly _limit = signal(0);

  readonly percent = computed(() => {
    const limit = this._limit();
    if (!limit) return 0;
    return Math.round((this._spent() / limit) * 100);
  });

  readonly displayPercent = computed(() => Math.min(this.percent(), 100));

  readonly status = computed<'ok' | 'warn' | 'over'>(() => {
    const p = this.percent();
    if (p >= 100) return 'over';
    if (p >= 80) return 'warn';
    return 'ok';
  });
}
