import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly tone = input<'primary' | 'success' | 'warning' | 'danger'>('primary');
  readonly hint = input<string | null>(null);
}
