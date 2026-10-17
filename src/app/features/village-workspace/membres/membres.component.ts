import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Utilisateur, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { MembreFormDialog } from './membre-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-membres',
  imports: [Icon, Skeleton, EmptyState, ErrorState, Pagination, MembreFormDialog, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membres.component.html',
})
export class Membres {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly membres = signal<Utilisateur[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly page = signal(1);

  readonly dialogMembre = signal<Utilisateur | 'new' | null>(null);
  readonly aSupprimer = signal<Utilisateur | null>(null);
  readonly deleting = signal(false);

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const all = this.membres();
    if (!term) {
      return all;
    }
    return all.filter(
      (m) => this.nomComplet(m).toLowerCase().includes(term) || m.telephone.toLowerCase().includes(term),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const membres = await firstValueFrom(this.utilisateurService.findMembresDuVillage(this.villageIdNumber()));
      this.membres.set(membres);
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

  onSaved(): void {
    this.dialogMembre.set(null);
    this.load();
  }

  async confirmerSuppression(membre: Utilisateur): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.utilisateurService.delete(membre.id));
      this.notifications.success('Membre supprimé avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
