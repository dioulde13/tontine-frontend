import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Presence, Reunion, Utilisateur, utilisateurNomComplet } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification';
import { PresenceService } from '../../../../core/services/presence';
import { ReunionService } from '../../../../core/services/reunion';
import { UtilisateurService } from '../../../../core/services/utilisateur';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../../shared/components/icon/icon.component';
import { Pagination } from '../../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton.component';
import { formatDateTime } from '../../../../shared/utils/format';

interface LignePresence {
  membre: Utilisateur;
  presence: Presence | null;
}

type FiltreStatut = 'TOUS' | 'PRESENT' | 'ABSENT' | 'NON_MARQUE';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-reunion-presences',
  imports: [RouterLink, Icon, Badge, EmptyState, ErrorState, Skeleton, Pagination, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reunion-presences.component.html',
  styleUrl: './reunion-presences.component.css',
})
export class ReunionPresences {
  private readonly presenceService = inject(PresenceService);
  private readonly reunionService = inject(ReunionService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input<string>('');
  readonly reunionId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));
  readonly reunionIdNumber = computed(() => Number(this.reunionId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly reunion = signal<Reunion | null>(null);
  readonly presents = signal<Presence[]>([]);
  readonly absents = signal<Presence[]>([]);
  readonly membres = signal<Utilisateur[]>([]);

  readonly search = signal('');
  readonly filtreStatut = signal<FiltreStatut>('TOUS');
  readonly page = signal(1);

  /** En attente de confirmation : le membre et le statut qu'on s'apprête à lui attribuer. */
  readonly aConfirmer = signal<{ membre: Utilisateur; present: boolean } | null>(null);
  readonly confirmation = signal(false);

  private readonly presenceParMembreId = computed(() => {
    const map = new Map<number, Presence>();
    for (const p of [...this.presents(), ...this.absents()]) {
      map.set(p.utilisateur.id, p);
    }
    return map;
  });

  readonly nonMarquesCount = computed(
    () => this.membres().length - this.presents().length - this.absents().length,
  );

  private readonly lignes = computed<LignePresence[]>(() =>
    this.membres().map((membre) => ({ membre, presence: this.presenceParMembreId().get(membre.id) ?? null })),
  );

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const statut = this.filtreStatut();
    let all = this.lignes();
    if (term) {
      all = all.filter((l) => this.nomComplet(l.membre).toLowerCase().includes(term));
    }
    if (statut === 'PRESENT') {
      all = all.filter((l) => l.presence?.present === true);
    } else if (statut === 'ABSENT') {
      all = all.filter((l) => l.presence?.present === false);
    } else if (statut === 'NON_MARQUE') {
      all = all.filter((l) => l.presence === null);
    }
    return all;
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  private readonly loadOnParamsChange = effect(() => {
    this.villageIdNumber();
    this.reunionIdNumber();
    this.load();
  });

  nomComplet(u: Utilisateur): string {
    return utilisateurNomComplet(u);
  }

  dateTime(iso: string): string {
    return formatDateTime(iso);
  }

  statutLabel(ligne: LignePresence): string {
    if (ligne.presence === null) {
      return 'Non marqué';
    }
    return ligne.presence.present ? 'Présent' : 'Absent';
  }

  statutVariant(ligne: LignePresence): BadgeVariant {
    if (ligne.presence === null) {
      return 'neutral';
    }
    return ligne.presence.present ? 'success' : 'danger';
  }

  onSearch(event: Event | null): void {
    const value = event ? (event.target as HTMLInputElement).value : '';
    this.search.set(value);
    this.page.set(1);
  }

  onFiltreStatut(event: Event): void {
    this.filtreStatut.set((event.target as HTMLSelectElement).value as FiltreStatut);
    this.page.set(1);
  }

  resetFiltres(): void {
    this.search.set('');
    this.filtreStatut.set('TOUS');
    this.page.set(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const villageId = this.villageIdNumber();
      const reunionId = this.reunionIdNumber();
      const [reunions, membres, presents, absents] = await Promise.all([
        firstValueFrom(this.reunionService.findByVillage(villageId)),
        firstValueFrom(this.utilisateurService.findMembresDuVillage(villageId)),
        firstValueFrom(this.presenceService.findPresents(villageId, reunionId)),
        firstValueFrom(this.presenceService.findAbsents(villageId, reunionId)),
      ]);
      this.reunion.set(reunions.find((r) => r.id === reunionId) ?? null);
      this.membres.set(membres);
      this.presents.set(presents);
      this.absents.set(absents);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  demanderConfirmation(membre: Utilisateur, present: boolean): void {
    this.aConfirmer.set({ membre, present });
  }

  annulerConfirmation(): void {
    this.aConfirmer.set(null);
  }

  confirmTitle(): string {
    const cible = this.aConfirmer();
    return cible?.present ? 'Marquer présent' : 'Marquer absent';
  }

  confirmMessage(): string {
    const cible = this.aConfirmer();
    if (!cible) {
      return '';
    }
    const statut = cible.present ? 'présent' : 'absent';
    return `Êtes-vous sûr que ${this.nomComplet(cible.membre)} est ${statut} à cette réunion ?`;
  }

  async confirmer(): Promise<void> {
    const cible = this.aConfirmer();
    if (!cible) {
      return;
    }
    this.confirmation.set(true);
    try {
      const villageId = this.villageIdNumber();
      const reunionId = this.reunionIdNumber();
      const existante = this.presenceParMembreId().get(cible.membre.id) ?? null;
      // Une seule Presence par membre et par réunion côté backend (contrainte unique) : pour changer
      // un statut déjà enregistré, on doit d'abord retirer l'ancien avant d'enregistrer le nouveau.
      if (existante) {
        await firstValueFrom(this.presenceService.delete(villageId, reunionId, existante.id));
      }
      await firstValueFrom(
        this.presenceService.create(villageId, reunionId, { utilisateurId: cible.membre.id, present: cible.present }),
      );
      this.notifications.success('Présence enregistrée avec succès.');
      this.aConfirmer.set(null);
      await this.load();
    } finally {
      this.confirmation.set(false);
    }
  }
}
