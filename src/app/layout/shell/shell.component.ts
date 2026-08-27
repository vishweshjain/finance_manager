import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <app-sidebar [open]="sidebarOpen()" (navigated)="closeSidebar()" />

    <div class="shell-main">
      <app-header
        [searchQuery]="query()"
        (menuToggle)="toggleSidebar()"
      />
      <main class="shell-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .shell-main {
        margin-left: 256px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .shell-content {
        flex: 1;
        padding: 28px;
        max-width: 1500px;
        width: 100%;
        margin: 0 auto;
      }
      @media (max-width: 992px) {
        .shell-main { margin-left: 0; }
        .shell-content { padding: 18px 14px; }
      }
    `,
  ],
})
export class ShellComponent {
  private readonly route = inject(ActivatedRoute);

  readonly sidebarOpen = signal(false);
  readonly query = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')),
    { initialValue: '' }
  );

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
