import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ROLE_MEMBRE, Utilisateur, Village, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { AdminMembreFormDialog } from './membre-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-membres',
  imports: [Icon, Skeleton, EmptyState, ErrorState, Pagination, AdminMembreFormDialog, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membres.component.html',
})
export class AdminMembres implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly PAGE_SIZE = PAGE_SIZE;

  readonly membres = signal<Utilisateur[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly villageFilter = signal<number | null>(null);
  readonly page = signal(1);

  readonly dialogMembre = signal<Utilisateur | 'new' | null>(null);
  readonly aSupprimer = signal<Utilisateur | null>(null);
  readonly deleting = signal(false);

  /** Villages réellement représentés parmi les membres chargés (pas de liste inventée). */
  readonly villagesDisponibles = computed<Village[]>(() => {
    const parId = new Map<number, Village>();
    for (const m of this.membres()) {
      if (m.village) {
        parId.set(m.village.id, m.village);
      }
    }
    return [...parId.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  });

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const villageId = this.villageFilter();
    let all = this.membres();
    if (term) {
      all = all.filter(
        (m) => this.nomComplet(m).toLowerCase().includes(term) || m.telephone.toLowerCase().includes(term),
      );
    }
    if (villageId !== null) {
      all = all.filter((m) => m.village?.id === villageId);
    }
    return all;
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const utilisateurs = await firstValueFrom(this.utilisateurService.findAll());
      this.membres.set(utilisateurs.filter((u) => u.roles.some((r) => r.nom === ROLE_MEMBRE)));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  nomComplet(u: Utilisateur): string {
    return utilisateurNomComplet(u);
  }

  onSearch(event: Event | null): void {
    const value = event ? (event.target as HTMLInputElement).value : '';
    this.search.set(value);
    this.page.set(1);
  }

  onVillageFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.villageFilter.set(value ? Number(value) : null);
    this.page.set(1);
  }

  resetFiltres(): void {
    this.search.set('');
    this.villageFilter.set(null);
    this.page.set(1);
  }

  onSaved(): void {
    this.dialogMembre.set(null);
    this.load();
  }

  async confirmerSuppression(m: Utilisateur): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.utilisateurService.delete(m.id));
      this.notifications.success('Membre supprimé avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
