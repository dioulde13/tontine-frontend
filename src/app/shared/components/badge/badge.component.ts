import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
})
export class Badge {
  readonly text = input.required<string>();
  readonly variant = input<BadgeVariant>('neutral');
}
