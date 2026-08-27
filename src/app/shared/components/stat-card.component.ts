import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatAccent = 'primary' | 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  template: `
    <div class="stat" [class]="'accent-' + accent">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-content">
        <span class="stat-label">{{ label }}</span>
        @if (loading) {
          <div class="skeleton skeleton-value"></div>
        } @else {
          <span class="stat-value">{{ value }}</span>
        }
        @if (trend !== null && trend !== undefined && !loading) {
          <span class="stat-trend" [class.up]="trend >= 0" [class.down]="trend < 0">
            {{ trend >= 0 ? '▲' : '▼' }} {{ abs(trend) }}%
            @if (trendLabel) { <small>{{ trendLabel }}</small> }
          </span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .stat {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-radius: 18px;
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .stat-icon {
        flex: none;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-size: 24px;
        background: var(--accent-soft);
        color: var(--accent);
      }
      .stat-content { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
      .stat-value { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
      .stat-trend { font-size: 12px; font-weight: 600; }
      .stat-trend.up { color: var(--success); }
      .stat-trend.down { color: var(--danger); }
      .stat-trend small { color: var(--text-faint); font-weight: 500; margin-left: 4px; }

      .accent-primary { --accent: var(--primary); --accent-soft: var(--primary-soft); }
      .accent-success { --accent: var(--success); --accent-soft: var(--success-soft); }
      .accent-danger { --accent: var(--danger); --accent-soft: var(--danger-soft); }
      .accent-warning { --accent: var(--warning); --accent-soft: var(--warning-soft); }
      .accent-info { --accent: var(--info); --accent-soft: var(--info-soft); }

      .skeleton {
        background: linear-gradient(90deg, var(--bg-alt), var(--border), var(--bg-alt));
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
        border-radius: 6px;
      }
      .skeleton-value { height: 26px; width: 120px; margin-top: 2px; }
      @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    `,
  ],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = '💰';
  @Input() accent: StatAccent = 'primary';
  @Input() trend: number | null = null;
  @Input() trendLabel = '';
  @Input() loading = false;

  abs(n: number): number {
    return Math.abs(n);
  }
}
