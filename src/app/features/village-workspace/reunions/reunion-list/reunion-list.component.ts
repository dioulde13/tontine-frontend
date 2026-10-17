import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Reunion } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification';
import { ReunionService } from '../../../../core/services/reunion';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DateRangeFilter } from '../../../../shared/components/date-range-filter/date-range-filter.component';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../../shared/components/icon/icon.component';
import { Pagination } from '../../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton.component';
import { dansPeriode } from '../../../../shared/utils/date-range';
import { formatDateTime } from '../../../../shared/utils/format';
import { ReunionFormDialog } from './reunion-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-reunion-list',
  imports: [RouterLink, Icon, Skeleton, EmptyState, ErrorState, Pagination, ReunionFormDialog, ConfirmDialog, DateRangeFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reunion-list.component.html',
})
export class ReunionList {
  private readonly reunionService = inject(ReunionService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly reunions = signal<Reunion[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly dialogOpen = signal(false);
  readonly aSupprimer = signal<Reunion | null>(null);
  readonly deleting = signal(false);
  readonly page = signal(1);
  readonly dateDebut = signal<string | null>(null);
  readonly dateFin = signal<string | null>(null);

  readonly reunionsTriees = computed(() =>
    [...this.reunions()].sort((a, b) => b.dateHeure.localeCompare(a.dateHeure)),
  );

  readonly filtered = computed(() => {
    const debut = this.dateDebut();
    const fin = this.dateFin();
    const all = this.reunionsTriees();
    return debut || fin ? all.filter((r) => dansPeriode(r.dateHeure, debut, fin)) : all;
  });

  readonly filtresActifs = computed(() => !!this.dateDebut() || !!this.dateFin());

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  dateTime(iso: string): string {
    return formatDateTime(iso);
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
    this.dateDebut.set(null);
    this.dateFin.set(null);
    this.page.set(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const reunions = await firstValueFrom(this.reunionService.findByVillage(this.villageIdNumber()));
      this.reunions.set(reunions);
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

  async confirmerSuppression(reunion: Reunion): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.reunionService.delete(this.villageIdNumber(), reunion.id));
      this.notifications.success('Réunion supprimée avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
