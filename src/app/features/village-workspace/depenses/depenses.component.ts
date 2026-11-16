import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Depense } from '../../../core/models';
import { DepenseService } from '../../../core/services/depense';
import { NotificationService } from '../../../core/services/notification';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DateRangeFilter } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { dansPeriode, debutMoisCourant, finMoisCourant } from '../../../shared/utils/date-range';
import { formatDate, formatMontant } from '../../../shared/utils/format';
import { DepenseFormDialog } from './depense-form-dialog.component';
import { TypesDepensesDialog } from './types-depenses-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-depenses',
  imports: [
    RouterLink,
    Icon,
    Skeleton,
    EmptyState,
    ErrorState,
    Pagination,
    DepenseFormDialog,
    TypesDepensesDialog,
    ConfirmDialog,
    DateRangeFilter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depenses.component.html',
})
export class Depenses {
  private readonly depenseService = inject(DepenseService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly depenses = signal<Depense[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly dateDebut = signal<string | null>(debutMoisCourant());
  readonly dateFin = signal<string | null>(finMoisCourant());
  readonly page = signal(1);
  readonly dialogOpen = signal(false);
  readonly typesDialogOpen = signal(false);
  readonly aSupprimer = signal<Depense | null>(null);
  readonly deleting = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    let all = [...this.depenses()].sort((a, b) => b.date.localeCompare(a.date));
    if (term) {
      all = all.filter(
        (d) =>
          d.type.libelle.toLowerCase().includes(term) ||
          d.numeroRecu.toLowerCase().includes(term) ||
          (d.motif ?? '').toLowerCase().includes(term),
      );
    }
    if (debut || fin) {
      all = all.filter((d) => dansPeriode(d.date, debut, fin));
    }
    return all;
  });

  readonly filtresActifs = computed(
    () => !!this.search() || this.dateDebut() !== debutMoisCourant() || this.dateFin() !== finMoisCourant(),
  );

  readonly totalDepenses = computed(() => this.filtered().reduce((total, d) => total + d.montant, 0));

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

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
    this.dateDebut.set(debutMoisCourant());
    this.dateFin.set(finMoisCourant());
    this.page.set(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const depenses = await firstValueFrom(this.depenseService.findByVillage(this.villageIdNumber()));
      this.depenses.set(depenses);
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

  /** Déclenché depuis le formulaire de dépense quand aucun type n'est encore configuré. */
  ouvrirGestionTypes(): void {
    this.dialogOpen.set(false);
    this.typesDialogOpen.set(true);
  }

  async confirmerSuppression(d: Depense): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.depenseService.delete(this.villageIdNumber(), d.id));
      this.notifications.success('Dépense supprimée avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
