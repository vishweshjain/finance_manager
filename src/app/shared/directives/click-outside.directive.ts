import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';

/** Emits when a click occurs outside the host element. */
@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<void>();

  private readonly el = inject(ElementRef<HTMLElement>);

  @Input() set clickOutsideEnabled(enabled: boolean) {
    if (enabled) {
      setTimeout(() => document.addEventListener('click', this.onDocClick, true));
    } else {
      document.removeEventListener('click', this.onDocClick, true);
    }
  }

  private onDocClick = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (this.el.nativeElement && !this.el.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  };
}
