import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'dashboard' | 'village' | 'buildings' | 'users' | 'user' | 'user-plus'
  | 'wallet' | 'alert-triangle' | 'receipt' | 'calendar' | 'calendar-check'
  | 'clipboard-check' | 'sliders' | 'shield' | 'log-in' | 'log-out'
  | 'search' | 'filter' | 'plus' | 'pencil' | 'trash' | 'check' | 'check-circle'
  | 'x' | 'x-circle' | 'chevron-down' | 'chevron-right' | 'chevron-left'
  | 'menu' | 'bell' | 'eye' | 'eye-off' | 'download' | 'printer' | 'arrow-left'
  | 'more-vertical' | 'inbox' | 'alert-circle' | 'refresh-cw' | 'lock' | 'mail' | 'phone'
  | 'file-text' | 'list' | 'chevrons-left' | 'chevrons-right';

/** Jeu d'icônes inline (style trait, 24x24, cohérent sur toute l'application — jamais d'emoji). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(18);
  readonly strokeWidth = input<number>(1.8);
}
