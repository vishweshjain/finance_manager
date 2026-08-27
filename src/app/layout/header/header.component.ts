import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, ClickOutsideDirective],
  template: `
    <header class="topbar">
      <button class="hamburger" (click)="menuToggle.emit()" aria-label="Menu">☰</button>

      <form class="search" (submit)="onSearch()">
        <span class="search-icon">🔍</span>
        <input
          type="search"
          placeholder="Search transactions…"
          [(ngModel)]="query"
          (input)="onSearchInput()"
          aria-label="Search"
        />
      </form>

      <div class="topbar-actions">
        <button class="icon-btn" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Light mode' : 'Dark mode'">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>

        <div class="user-menu" appClickOutside [clickOutsideEnabled]="menuOpen()" (appClickOutside)="menuOpen.set(false)">
          <button class="user-trigger" (click)="menuOpen.set(!menuOpen())">
            <span class="avatar" [style.background]="user?.avatarColor">{{ initials() }}</span>
            <span class="user-name">{{ user?.name }}</span>
            <span class="caret">▾</span>
          </button>

          @if (menuOpen()) {
            <div class="dropdown">
              <div class="dropdown-head">
                <strong>{{ user?.name }}</strong>
                <small>{{ user?.email }}</small>
              </div>
              <a class="dropdown-item" routerLink="/profile" (click)="menuOpen.set(false)">👤 Profile</a>
              <a class="dropdown-item" routerLink="/settings" (click)="menuOpen.set(false)">⚙️ Settings</a>
              <div class="dropdown-sep"></div>
              <button class="dropdown-item danger" (click)="logout()">⏻ Logout</button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        height: 68px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 24px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 30;
      }
      .hamburger {
        display: none;
        font-size: 20px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        width: 40px;
        height: 40px;
        border-radius: 10px;
        color: var(--text);
      }
      .search {
        position: relative;
        flex: 1;
        max-width: 460px;
      }
      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        opacity: 0.7;
      }
      .search input {
        width: 100%;
        height: 42px;
        padding: 0 14px 0 38px;
        border-radius: 11px;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text);
      }
      .search input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-soft);
      }
      .topbar-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
      .icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        font-size: 16px;
      }
      .icon-btn:hover { background: var(--bg-alt); }

      .user-menu { position: relative; }
      .user-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 10px 5px 5px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--surface-2);
      }
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #fff;
        font-weight: 700;
        font-size: 13px;
      }
      .user-name { font-size: 13.5px; font-weight: 600; color: var(--text); }
      .caret { font-size: 10px; color: var(--text-faint); }

      .dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 10px);
        width: 220px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: var(--shadow-lg);
        padding: 8px;
        z-index: 50;
      }
      .dropdown-head {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px 10px 12px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 6px;
      }
      .dropdown-head small { color: var(--text-faint); font-size: 12px; }
      .dropdown-item {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 9px;
        font-size: 13.5px;
        color: var(--text);
        background: none;
        text-align: left;
      }
      .dropdown-item:hover { background: var(--bg-alt); }
      .dropdown-item.danger { color: var(--danger); }
      .dropdown-sep { height: 1px; background: var(--border); margin: 6px 0; }

      @media (max-width: 992px) {
        .hamburger { display: grid; place-items: center; }
        .user-name { display: none; }
        .caret { display: none; }
      }
      @media (max-width: 576px) {
        .topbar { padding: 0 14px; gap: 10px; }
        .search { max-width: none; }
      }
    `,
  ],
})
export class HeaderComponent {
  @Input() set searchQuery(q: string) {
    this.query = q ?? '';
  }
  @Output() menuToggle = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  query = '';

  get user() {
    return this.auth.currentUser();
  }

  initials(): string {
    const name = this.user?.name ?? '';
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onSearchInput(): void {
    this.search.emit(this.query);
  }

  onSearch(): void {
    this.search.emit(this.query);
    this.router.navigate(['/transactions'], { queryParams: { q: this.query || null } });
  }

  logout(): void {
    this.auth.logout();
    this.menuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}
