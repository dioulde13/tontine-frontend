import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ROLE_PRESIDENT, Utilisateur, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { PresidentFormDialog } from './president-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-presidents',
  imports: [Icon, Skeleton, EmptyState, ErrorState, Pagination, PresidentFormDialog, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './presidents.component.html',
})
export class Presidents implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly ROLE_PRESIDENT = ROLE_PRESIDENT;
  readonly PAGE_SIZE = PAGE_SIZE;

  readonly presidents = signal<Utilisateur[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly page = signal(1);

  readonly dialogPresident = signal<Utilisateur | 'new' | null>(null);
  readonly aSupprimer = signal<Utilisateur | null>(null);
  readonly deleting = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const all = this.presidents();
    if (!term) {
      return all;
    }
    return all.filter(
      (p) => this.nomComplet(p).toLowerCase().includes(term) || p.telephone.toLowerCase().includes(term),
    );
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
      this.presidents.set(utilisateurs.filter((u) => u.roles.some((r) => r.nom === ROLE_PRESIDENT)));
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
    this.dialogPresident.set(null);
    this.load();
  }

  async confirmerSuppression(p: Utilisateur): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.utilisateurService.delete(p.id));
      this.notifications.success('Président supprimé avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
