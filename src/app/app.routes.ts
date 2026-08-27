import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './features/auth/auth-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    component: ShellComponent,
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/feature.routes').then((m) => m.FEATURE_ROUTES),
  },

  { path: '**', redirectTo: 'dashboard' },
];
