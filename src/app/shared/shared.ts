import { ChartWrapperComponent } from './components/chart-wrapper.component';
import { ToastContainerComponent } from './components/toast-container.component';
import { ModalComponent } from './components/modal.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { StatCardComponent } from './components/stat-card.component';
import { EmptyStateComponent } from './components/empty-state.component';
import { LoadingSpinnerComponent } from './components/loading-spinner.component';
import { PageHeaderComponent } from './components/page-header.component';
import { ProgressBarComponent } from './components/progress-bar.component';

import { MoneyPipe } from './pipes/money.pipe';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { MonthNamePipe } from './pipes/month-name.pipe';
import { CategoryNamePipe, CategoryIconPipe, CategoryColorPipe } from './pipes/category.pipe';
import { BgSoftPipe } from './pipes/bg-soft.pipe';

import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AutofocusDirective } from './directives/autofocus.directive';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Reusable building blocks shared across all features. */
export const SHARED = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,

  ChartWrapperComponent,
  ToastContainerComponent,
  ModalComponent,
  ConfirmDialogComponent,
  StatCardComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  ProgressBarComponent,

  MoneyPipe,
  ShortDatePipe,
  MonthNamePipe,
  CategoryNamePipe,
  CategoryIconPipe,
  CategoryColorPipe,
  BgSoftPipe,

  ClickOutsideDirective,
  AutofocusDirective,
];
