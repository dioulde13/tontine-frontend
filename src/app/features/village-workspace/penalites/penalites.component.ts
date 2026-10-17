import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NUMERO_MOIS_LABEL, Penalite, TYPE_PENALITE_LABEL, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { PenaliteService } from '../../../core/services/penalite';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DateRangeFilter } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { dansPeriode } from '../../../shared/utils/date-range';
import { formatDate, formatMontant } from '../../../shared/utils/format';
import { PenaliteFormDialog } from './penalite-form-dialog.component';

const PAGE_SIZE = 10;
type FiltreStatut = 'TOUS' | 'PAYEE' | 'NON_PAYEE';

@Component({
  selector: 'app-penalites',
  imports: [Icon, Badge, Skeleton, EmptyState, ErrorState, Pagination, PenaliteFormDialog, ConfirmDialog, DateRangeFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './penalites.component.html',
})
export class Penalites {
  private readonly penaliteService = inject(PenaliteService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly penalites = signal<Penalite[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly filtreStatut = signal<FiltreStatut>('TOUS');
  readonly dateDebut = signal<string | null>(null);
  readonly dateFin = signal<string | null>(null);
  readonly page = signal(1);
  readonly dialogOpen = signal(false);
  readonly aSupprimer = signal<Penalite | null>(null);
  readonly deleting = signal(false);
  readonly payerEnCours = signal<number | null>(null);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const statut = this.filtreStatut();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    let all = [...this.penalites()].sort((a, b) => b.date.localeCompare(a.date));
    if (term) {
      all = all.filter((p) => this.nomComplet(p).toLowerCase().includes(term));
    }
    if (statut !== 'TOUS') {
      all = all.filter((p) => p.statut === statut);
    }
    if (debut || fin) {
      all = all.filter((p) => dansPeriode(p.date, debut, fin));
    }
    return all;
  });

  readonly filtresActifs = computed(
    () => !!this.search() || this.filtreStatut() !== 'TOUS' || !!this.dateDebut() || !!this.dateFin(),
  );

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  nomComplet(p: Penalite): string {
    return utilisateurNomComplet(p.utilisateur);
  }

  typeLabel(p: Penalite): string {
    return TYPE_PENALITE_LABEL[p.type];
  }

  periode(p: Penalite): string {
    if (p.periodeMois === null || p.periodeAnnee === null) {
      return '—';
    }
    return `${NUMERO_MOIS_LABEL[p.periodeMois]} ${p.periodeAnnee}`;
  }

  statutVariant(p: Penalite): BadgeVariant {
    return p.statut === 'PAYEE' ? 'success' : 'warning';
  }

  montant(value: number): string {
    return formatMontant(value);
  }

  date(iso: string): string {
    return formatDate(iso);
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

  onDateDebut(value: string | null): void {
    this.dateDebut.set(value);
    this.page.set(1);
  }

  onDateFin(value: string | null): void {
    this.dateFin.set(value);
    this.page.set(1);
  }

  resetFiltres(): void {
    this.search.set('');
    this.filtreStatut.set('TOUS');
    this.dateDebut.set(null);
    this.dateFin.set(null);
    this.page.set(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const penalites = await firstValueFrom(this.penaliteService.findByVillage(this.villageIdNumber()));
      this.penalites.set(penalites);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  onSaved(): void {
    this.dialogOpen.set(false);
    this.load();
  }

  async payer(p: Penalite): Promise<void> {
    this.payerEnCours.set(p.id);
    try {
      await firstValueFrom(this.penaliteService.payer(this.villageIdNumber(), p.id));
      this.notifications.success('Pénalité marquée comme payée.');
      this.load();
    } finally {
      this.payerEnCours.set(null);
    }
  }

  async confirmerSuppression(p: Penalite): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.penaliteService.delete(this.villageIdNumber(), p.id));
      this.notifications.success('Pénalité supprimée avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
