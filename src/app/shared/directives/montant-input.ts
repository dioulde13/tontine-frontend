import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Affiche un <input type="text"> de montant avec des espaces comme séparateurs de milliers
 * ("100 000") pendant la saisie, tout en gardant un nombre simple (100000) côté FormControl —
 * le GNF n'a pas de sous-unité utilisée en pratique, donc on ne gère que des entiers.
 */
@Directive({
  selector: 'input[appMontant]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MontantInput),
      multi: true,
    },
  ],
  host: {
    inputmode: 'numeric',
    autocomplete: 'off',
    '(blur)': 'onTouched()',
  },
})
export class MontantInput implements ControlValueAccessor {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  private onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    const digits = rawValue.replace(/\D/g, '');
    const numero = digits === '' ? null : Number(digits);
    this.el.nativeElement.value = this.formatter(digits);
    this.onChange(numero);
  }

  writeValue(value: number | null): void {
    this.el.nativeElement.value = value === null || value === undefined ? '' : this.formatter(String(value));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.el.nativeElement.disabled = disabled;
  }

  private formatter(digits: string): string {
    if (digits === '') {
      return '';
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(digits));
  }
}
