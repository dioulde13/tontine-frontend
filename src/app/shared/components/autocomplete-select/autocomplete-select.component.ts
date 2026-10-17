import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Icon } from '../icon/icon.component';

export interface AutocompleteOption {
  value: number;
  label: string;
}

/**
 * Remplace un <select> natif par un champ texte filtrant une liste déroulante — utile dès que la
 * liste d'options est longue (ex: membres d'un village). Implémente ControlValueAccessor : s'utilise
 * comme un <select> avec formControlName, aucun changement côté form group des appelants.
 */
@Component({
  selector: 'app-autocomplete-select',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './autocomplete-select.component.html',
  styleUrl: './autocomplete-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteSelect),
      multi: true,
    },
  ],
})
export class AutocompleteSelect implements ControlValueAccessor {
  readonly options = input<AutocompleteOption[]>([]);
  readonly placeholder = input('Rechercher…');
  readonly emptyLabel = input('Aucun résultat');
  readonly inputId = input<string | null>(null);

  readonly searchTerm = signal('');
  readonly open = signal(false);
  readonly highlightedIndex = signal(0);
  readonly disabled = signal(false);
  readonly selectedValue = signal<number | null>(null);

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const options = this.options();
    return term ? options.filter((o) => o.label.toLowerCase().includes(term)) : options;
  });

  // Reflète la sélection dans le champ texte tant que l'utilisateur n'est pas en train de taper
  // (ex: options chargées après writeValue(), ou sélection changée depuis l'extérieur du composant).
  private readonly syncDisplayedLabel = effect(() => {
    const value = this.selectedValue();
    const options = this.options();
    if (!this.open()) {
      const match = options.find((o) => o.value === value);
      this.searchTerm.set(match ? match.label : '');
    }
  });

  writeValue(value: number | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFocus(): void {
    this.open.set(true);
    this.highlightedIndex.set(0);
  }

  onInput(value: string): void {
    this.searchTerm.set(value);
    this.open.set(true);
    this.highlightedIndex.set(0);
    if (this.selectedValue() !== null) {
      // L'utilisateur retape après avoir déjà choisi : la sélection précédente n'est plus valide
      // tant qu'il n'en reconfirme pas une (évite de soumettre un membre qui ne correspond plus au texte affiché).
      this.selectedValue.set(null);
      this.onChange(null);
    }
  }

  select(option: AutocompleteOption): void {
    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.searchTerm.set(option.label);
    this.open.set(false);
  }

  onBlur(): void {
    this.open.set(false);
    this.onTouched();
    const match = this.options().find((o) => o.value === this.selectedValue());
    this.searchTerm.set(match ? match.label : '');
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
        this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        break;
      case 'Enter': {
        if (!this.open()) {
          return;
        }
        event.preventDefault();
        const item = items[this.highlightedIndex()];
        if (item) {
          this.select(item);
        }
        break;
      }
      case 'Escape':
        this.open.set(false);
        break;
    }
  }
}
