import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Deux <input type="date"> ("du" / "au") pour filtrer un tableau par période — bornes incluses, null = illimité. */
@Component({
  selector: 'app-date-range-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-range-filter.component.html',
})
export class DateRangeFilter {
  readonly from = input<string | null>(null);
  readonly to = input<string | null>(null);
  readonly fromChange = output<string | null>();
  readonly toChange = output<string | null>();

  onFromInput(event: Event): void {
    this.fromChange.emit((event.target as HTMLInputElement).value || null);
  }

  onToInput(event: Event): void {
    this.toChange.emit((event.target as HTMLInputElement).value || null);
  }
}
