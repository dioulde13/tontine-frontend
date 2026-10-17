import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutside {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly appClickOutside = output<void>();

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }
}
