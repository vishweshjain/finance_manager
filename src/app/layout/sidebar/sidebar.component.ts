import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  group: 'main' | 'manage' | 'account';
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="open">
      <div class="brand">
        <span class="brand-mark">₿</span>
        <span class="brand-name">Finance<span>Manager</span></span>
      </div>

      <nav class="nav">
        <p class="nav-group">Overview</p>
        @for (item of mainItems; track item.route) {
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" (click)="navigated.emit()">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }

        <p class="nav-group">Manage</p>
        @for (item of manageItems; track item.route) {
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" (click)="navigated.emit()">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }

        <p class="nav-group">Account</p>
        @for (item of accountItems; track item.route) {
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" (click)="navigated.emit()">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-foot">
        <button class="theme-toggle" (click)="theme.toggle()" aria-label="Toggle theme">
          <span>{{ theme.isDark() ? '☀️' : '🌙' }}</span>
          <span>{{ theme.isDark() ? 'Light mode' : 'Dark mode' }}</span>
        </button>
      </div>
    </aside>
    @if (open) {
      <div class="scrim" (click)="navigated.emit()"></div>
    }
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 256px;
        height: 100vh;
        background: var(--sidebar-bg);
        color: var(--sidebar-text);
        display: flex;
        flex-direction: column;
        padding: 20px 14px;
        z-index: 40;
        transition: transform 0.25s ease;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 10px 18px;
      }
      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        background: var(--sidebar-active);
        color: #fff;
        font-size: 20px;
        font-weight: 700;
      }
      .brand-name { font-weight: 700; font-size: 16px; color: #fff; }
      .brand-name span { color: #9aa3bb; font-weight: 600; }

      .nav { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
      .nav-group {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--sidebar-text-muted);
        margin: 16px 10px 6px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        color: var(--sidebar-text);
        font-weight: 500;
        font-size: 14px;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .nav-item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
      .nav-item.active {
        background: var(--sidebar-active);
        color: #fff;
      }
      .nav-icon { font-size: 17px; width: 22px; text-align: center; }

      .sidebar-foot { padding: 10px; }
      .theme-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        color: var(--sidebar-text);
        font-size: 13px;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.05);
      }
      .theme-toggle:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

      .scrim {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 35;
      }

      @media (max-width: 992px) {
        .sidebar { transform: translateX(-100%); box-shadow: var(--shadow-lg); }
        .sidebar.open { transform: translateX(0); }
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() open = false;
  @Output() navigated = new EventEmitter<void>();

  readonly theme = inject(ThemeService);

  readonly mainItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard', group: 'main' },
    { label: 'Transactions', icon: '💸', route: '/transactions', group: 'main' },
    { label: 'Budgets', icon: '🧾', route: '/budgets', group: 'main' },
    { label: 'Reports', icon: '📈', route: '/reports', group: 'main' },
  ];
  readonly manageItems: NavItem[] = [
    { label: 'Categories', icon: '🏷️', route: '/categories', group: 'manage' },
  ];
  readonly accountItems: NavItem[] = [
    { label: 'Profile', icon: '👤', route: '/profile', group: 'account' },
    { label: 'Settings', icon: '⚙️', route: '/settings', group: 'account' },
  ];
}
