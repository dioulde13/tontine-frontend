import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon, IconName } from '../../shared/components/icon/icon.component';

export interface NavItem {
  label: string;
  icon: IconName;
  route: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class Sidebar {
  readonly sections = input.required<NavSection[]>();
  readonly title = input<string>('Cotisation');
  readonly spaceLabel = input<string>('Gestion des tontines');
  /** Quand fourni, affiche un petit lien de retour au-dessus du titre (ex: "← Mes villages"). */
  readonly backLink = input<string | null>(null);
  readonly backLabel = input<string>('Retour');
  readonly collapsed = input<boolean>(false);
  readonly mobileOpen = input<boolean>(false);
  readonly closeMobile = output<void>();
  readonly toggleCollapse = output<void>();
}
