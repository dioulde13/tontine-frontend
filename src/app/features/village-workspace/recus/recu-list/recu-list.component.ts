import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Recu, recuMontantTotal, recuPeriodes, utilisateurNomComplet } from '../../../../core/models';
import { RecuService } from '../../../../core/services/recu';
import { DateRangeFilter } from '../../../../shared/components/date-range-filter/date-range-filter.component';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../../shared/components/icon/icon.component';
import { Pagination } from '../../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton.component';
import { dansPeriode } from '../../../../shared/utils/date-range';
import { formatDate, formatMontant } from '../../../../shared/utils/format';
import { RecuFormDialog } from './recu-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-recu-list',
  imports: [RouterLink, Icon, Skeleton, EmptyState, ErrorState, Pagination, RecuFormDialog, DateRangeFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recu-list.component.html',
})
export class RecuList {
  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  private readonly recuService = inject(RecuService);

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly recus = signal<Recu[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly dateDebut = signal<string | null>(null);
  readonly dateFin = signal<string | null>(null);
  readonly page = signal(1);
  readonly dialogOpen = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    let all = [...this.recus()].sort((a, b) => b.dateEmission.localeCompare(a.dateEmission));
    if (term) {
      all = all.filter((r) => r.numero.toLowerCase().includes(term) || this.nomComplet(r).toLowerCase().includes(term));
    }
    if (debut || fin) {
      all = all.filter((r) => dansPeriode(r.dateEmission, debut, fin));
    }
    return all;
  });

  readonly filtresActifs = computed(() => !!this.search() || !!this.dateDebut() || !!this.dateFin());

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  nomComplet(r: Recu): string {
    return utilisateurNomComplet(r.paiements[0].utilisateur);
  }

  periodes(r: Recu): string {
    return recuPeriodes(r);
  }

  montantTotal(r: Recu): number {
    return recuMontantTotal(r);
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
    this.dateDebut.set(null);
    this.dateFin.set(null);
    this.page.set(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const recus = await firstValueFrom(this.recuService.findByVillage(this.villageIdNumber()));
      this.recus.set(recus);
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
}
