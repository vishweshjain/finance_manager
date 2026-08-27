import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SHARED } from '../../shared/shared';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category } from '../../core/models/category';
import { TxType } from '../../core/models/transaction';

const ICONS = ['💼','🧑‍💻','📈','🎁','🍔','🚗','🛍️','🧾','🎬','💊','🏠','✈️','📱','🎓','🐶','💡','☕','🏋️','📚','🎵'];
const COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0ea5e9','#14b8a6','#f97316','#6366f1','#22c55e','#a855f7'];

@Component({
  selector: 'app-categories',
  imports: [SHARED, ReactiveFormsModule],
  template: `
    <app-page-header title="Categories" subtitle="Organize how your money moves in and out">
      <button pageActions class="btn btn-primary" (click)="openAdd()">＋ New Category</button>
    </app-page-header>

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="cat-section">
        <h3 class="cat-heading">Income</h3>
        <div class="cat-grid">
          @for (c of incomeCats(); track c.id) {
            <div class="cat-card">
              <span class="cat-emoji" [style.background]="c.color + '1f'">{{ c.icon }}</span>
              <div class="cat-info">
                <span class="cat-name">{{ c.name }}</span>
                <span class="cat-type income">Income</span>
              </div>
              <div class="cat-actions">
                <button class="btn-icon" (click)="openEdit(c)" title="Edit">✏️</button>
                <button class="btn-icon" (click)="askDelete(c)" title="Delete">🗑️</button>
              </div>
            </div>
          }
          @if (incomeCats().length === 0) {
            <div class="cat-empty">No income categories yet.</div>
          }
        </div>
      </div>

      <div class="cat-section">
        <h3 class="cat-heading">Expense</h3>
        <div class="cat-grid">
          @for (c of expenseCats(); track c.id) {
            <div class="cat-card">
              <span class="cat-emoji" [style.background]="c.color + '1f'">{{ c.icon }}</span>
              <div class="cat-info">
                <span class="cat-name">{{ c.name }}</span>
                <span class="cat-type expense">Expense</span>
              </div>
              <div class="cat-actions">
                <button class="btn-icon" (click)="openEdit(c)" title="Edit">✏️</button>
                <button class="btn-icon" (click)="askDelete(c)" title="Delete">🗑️</button>
              </div>
            </div>
          }
          @if (expenseCats().length === 0) {
            <div class="cat-empty">No expense categories yet.</div>
          }
        </div>
      </div>
    }

    <!-- Modal -->
    <app-modal [open]="modalOpen()" [hasFooter]="true" title="{{ editing() ? 'Edit Category' : 'New Category' }}" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="submit()" class="cat-form">
        <div class="field">
          <label>Name</label>
          <input class="control" formControlName="name" placeholder="e.g. Groceries" />
          @if (fieldInvalid('name')) { <span class="error">Name is required.</span> }
        </div>

        <div class="field">
          <label>Type</label>
          <div class="seg">
            <button type="button" class="seg-btn" [class.active]="form.value.type === 'expense'" (click)="setType('expense')">Expense</button>
            <button type="button" class="seg-btn" [class.active]="form.value.type === 'income'" (click)="setType('income')">Income</button>
          </div>
        </div>

        <div class="field">
          <label>Icon</label>
          <div class="icon-grid">
            @for (i of icons; track i) {
              <button type="button" class="icon-opt" [class.active]="form.value.icon === i" (click)="form.controls.icon.setValue(i)">{{ i }}</button>
            }
          </div>
        </div>

        <div class="field">
          <label>Color</label>
          <div class="color-grid">
            @for (col of colors; track col) {
              <button type="button" class="color-opt" [class.active]="form.value.color === col" [style.background]="col" (click)="form.controls.color.setValue(col)"></button>
            }
          </div>
        </div>
      </form>
      <div modalFooter>
        <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
        <button class="btn btn-primary" (click)="submit()">{{ editing() ? 'Save' : 'Create' }}</button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="Delete category"
      message="Deleting this category will keep related transactions but they will appear as 'Uncategorized'. Continue?"
      confirmText="Delete"
      (confirm)="confirmDelete()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
  styles: [
    `
      .cat-section { margin-bottom: 26px; }
      .cat-heading { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px; }
      .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
      .cat-card {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 16px; border-radius: 14px;
        background: var(--surface); border: 1px solid var(--border);
      }
      .cat-emoji { width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; flex: none; }
      .cat-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .cat-name { font-weight: 600; }
      .cat-type { font-size: 12px; font-weight: 600; }
      .cat-type.income { color: var(--success); }
      .cat-type.expense { color: var(--danger); }
      .cat-actions { display: flex; gap: 6px; }
      .cat-empty { color: var(--text-faint); font-size: 13px; padding: 10px 2px; }

      .cat-form { display: grid; gap: 16px; }
      .seg { display: flex; gap: 8px; }
      .seg-btn { flex: 1; height: 42px; border-radius: 10px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); font-weight: 600; }
      .seg-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
      .icon-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
      .icon-opt { height: 38px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); font-size: 18px; }
      .icon-opt.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }
      .color-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px; }
      .color-opt { height: 30px; border-radius: 8px; border: 2px solid transparent; }
      .color-opt.active { border-color: var(--text); transform: scale(1.08); }
    `,
  ],
})
export class CategoriesComponent implements OnDestroy {
  readonly categories = inject(CategoryService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  readonly icons = ICONS;
  readonly colors = COLORS;

  readonly loading = signal(true);
  readonly modalOpen = signal(false);
  readonly editing = signal<Category | null>(null);
  readonly confirmOpen = signal(false);
  readonly deleteTarget = signal<Category | null>(null);

  readonly incomeCats = () =>
    this.categories.categories().filter((c) => c.type === 'income');
  readonly expenseCats = () =>
    this.categories.categories().filter((c) => c.type === 'expense');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['expense' as TxType, [Validators.required]],
    icon: ['🏷️', [Validators.required]],
    color: ['#6366f1', [Validators.required]],
  });

  private timeoutId?: ReturnType<typeof setTimeout>;
  constructor() {
    this.timeoutId = setTimeout(() => this.loading.set(false), 350);
  }

  setType(type: TxType): void {
    this.form.controls.type.setValue(type);
  }
  openAdd(): void {
    this.editing.set(null);
    this.form.reset({ name: '', type: 'expense', icon: '🏷️', color: '#6366f1' });
    this.modalOpen.set(true);
  }
  openEdit(c: Category): void {
    this.editing.set(c);
    this.form.setValue({ name: c.name, type: c.type, icon: c.icon, color: c.color });
    this.modalOpen.set(true);
  }
  closeModal(): void {
    this.modalOpen.set(false);
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.getRawValue();
    const editing = this.editing();
    if (this.categories.exists(data.name, editing?.id)) {
      this.notify.error('A category with this name already exists.');
      return;
    }
    if (editing) {
      this.categories.update(editing.id, data);
      this.notify.success('Category updated');
    } else {
      this.categories.add(data);
      this.notify.success('Category created');
    }
    this.modalOpen.set(false);
  }
  askDelete(c: Category): void {
    this.deleteTarget.set(c);
    this.confirmOpen.set(true);
  }
  confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.categories.remove(target.id);
      this.notify.success('Category deleted');
    }
    this.confirmOpen.set(false);
  }
  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
  ngOnDestroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
