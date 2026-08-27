import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Reusable Chart.js wrapper. Parent components pass the chart data and the
 * component takes care of creating, updating and destroying the Chart
 * instance, as well as theming the grid/axis colours to match light/dark mode.
 */
@Component({
  selector: 'app-chart',
  template: `<div class="chart-host" [class.fixed]="height">
      <canvas #canvas></canvas>
    </div>`,
  styles: [
    `
      .chart-host {
        position: relative;
        width: 100%;
      }
      .chart-host.fixed {
        height: var(--chart-height, 300px);
      }
    `,
  ],
})
export class ChartWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: ChartType = 'bar';
  @Input() labels: string[] = [];
  @Input() datasets: ChartConfiguration['data']['datasets'] = [];
  @Input() options: ChartConfiguration['options'] = {};
  @Input() height = 300;

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly theme = inject(ThemeService);
  private chart?: Chart;
  private readonly ready = signal(false);

  constructor() {
    // Re-render when the theme flips so axis/grid colours update.
    effect(() => {
      this.theme.mode$();
      if (this.ready()) this.render();
    });
  }

  ngAfterViewInit(): void {
    this.ready.set(true);
    this.render();
  }

  ngOnChanges(): void {
    if (this.ready()) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvasRef?.nativeElement) return;
    this.chart?.destroy();

    const dark = this.theme.isDark();
    const grid = getComputedStyle(document.documentElement)
      .getPropertyValue('--chart-grid')
      .trim();
    const tick = dark ? '#9aa3bb' : '#5b6478';

    const base: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: tick, usePointStyle: true, boxWidth: 8, padding: 16 },
        },
        tooltip: {
          backgroundColor: dark ? '#1b2236' : '#ffffff',
          titleColor: dark ? '#eef1f8' : '#141a2e',
          bodyColor: dark ? '#c7cde0' : '#5b6478',
          borderColor: dark ? '#283047' : '#e6e9f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
        },
      },
      scales: {
        x: {
          grid: { color: grid },
          ticks: { color: tick },
        },
        y: {
          grid: { color: grid },
          ticks: { color: tick },
          beginAtZero: true,
        },
      },
    };

    // Merge parent options over the themed base.
    const merged = this.deepMerge(base, this.options);

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.type,
      data: { labels: this.labels, datasets: this.datasets },
      options: merged,
    });
  }

  private deepMerge<T>(a: T, b: T): T {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return (b ?? a) as T;
    }
    const out: any = Array.isArray(a) ? [...(a as any)] : { ...a };
    for (const key of Object.keys(b as any)) {
      out[key] = this.deepMerge((a as any)[key], (b as any)[key]);
    }
    return out;
  }
}
