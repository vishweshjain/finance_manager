import { Pipe, PipeTransform, inject } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';

@Pipe({ name: 'categoryName', pure: false })
export class CategoryNamePipe implements PipeTransform {
  private readonly categories = inject(CategoryService);

  transform(id: string | null | undefined): string {
    if (!id) return 'Uncategorized';
    return this.categories.getById(id)?.name ?? 'Uncategorized';
  }
}

@Pipe({ name: 'categoryIcon', pure: false })
export class CategoryIconPipe implements PipeTransform {
  private readonly categories = inject(CategoryService);

  transform(id: string | null | undefined): string {
    if (!id) return '🏷️';
    return this.categories.getById(id)?.icon ?? '🏷️';
  }
}

@Pipe({ name: 'categoryColor', pure: false })
export class CategoryColorPipe implements PipeTransform {
  private readonly categories = inject(CategoryService);

  transform(id: string | null | undefined): string {
    if (!id) return '#64748b';
    return this.categories.getById(id)?.color ?? '#64748b';
  }
}
