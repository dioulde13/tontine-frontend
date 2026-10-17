import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Icon, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyState {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
