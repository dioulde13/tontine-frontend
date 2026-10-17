import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth';
import { LayoutShellBase } from '../../layout/layout-shell-base';
import { Footer } from '../../layout/footer/footer.component';
import { Navbar } from '../../layout/navbar/navbar.component';
import { NavSection, Sidebar } from '../../layout/sidebar/sidebar.component';
import { EmptyState } from '../../shared/components/empty-state/empty-state.component';
import { IconName } from '../../shared/components/icon/icon.component';
import { ToastContainer } from '../../shared/components/toast-container/toast-container.component';

interface Tab {
  label: string;
  icon: IconName;
  route: string;
}

const TABS: Tab[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
  { label: 'Membres', icon: 'users', route: 'membres' },
  { label: 'Configuration', icon: 'sliders', route: 'configuration' },
  { label: 'Réunions', icon: 'calendar', route: 'reunions' },
  { label: 'Paiements', icon: 'wallet', route: 'paiements' },
  { label: 'Pénalités', icon: 'alert-triangle', route: 'penalites' },
  { label: 'Reçus', icon: 'receipt', route: 'recus' },
];

/**
 * Layout autonome (au même titre qu'AdminLayout/PresidentLayout) : monté directement à la racine
 * des routes /admin/villages/:id et /president/villages/:id (voir app.routes.ts), jamais imbriqué
 * dans un autre layout — garantit la même sidebar sombre + le même tiroir mobile partout, sans
 * jamais superposer deux barres de navigation.
 */
@Component({
  selector: 'app-village-workspace',
  imports: [RouterOutlet, Sidebar, Navbar, Footer, ToastContainer, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './village-workspace.component.html',
  styleUrl: './village-workspace.component.css',
})
export class VillageWorkspace extends LayoutShellBase {
  private readonly auth = inject(AuthService);

  readonly villageId = input<string>('');
  /** Fournis par les données de route (admin vs président) : voir app.routes.ts. */
  readonly backLink = input<string>('/president/villages');
  readonly backLabel = input<string>('Mes villages');
  readonly profilLink = input<string>('/president/profil');

  readonly villageIdNumber = computed(() => Number(this.villageId()));
  readonly estAutorise = computed(() => this.auth.estPresidentDuVillage(this.villageIdNumber()));
  readonly village = computed(() =>
    this.auth.currentUser()?.villagesGeres.find((v) => v.id === this.villageIdNumber()),
  );

  readonly sections = computed<NavSection[]>(() => [{ items: TABS }]);
}
