import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';

/** Focuses the host element when the bound expression becomes truthy. */
@Directive({
  selector: '[appAutofocus]',
})
export class AutofocusDirective implements OnChanges {
  @Input() appAutofocus: boolean | '' | null = true;

  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnChanges(changes: SimpleChanges): void {
    const val = changes['appAutofocus'].currentValue;
    const enabled = val === '' || val === true || val === null;
    if (enabled) {
      setTimeout(() => this.el.nativeElement.focus(), 50);
    }
  }
}
