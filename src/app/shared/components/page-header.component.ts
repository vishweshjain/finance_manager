import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="page-head">
      <div class="page-head-text">
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) { <p class="page-sub">{{ subtitle }}</p> }
      </div>
      <div class="page-head-actions">
        <ng-content select="[pageActions]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 22px;
      }
      .page-sub { margin: 6px 0 0; color: var(--text-muted); font-size: 13.5px; }
      .page-head-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
