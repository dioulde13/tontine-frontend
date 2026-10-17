import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NUMERO_MOIS_LABEL, PresidentDashboard } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { StatCard } from '../../../shared/components/stat-card/stat-card.component';
import { formatDateTime, formatMontant } from '../../../shared/utils/format';

@Component({
  selector: 'app-village-dashboard',
  imports: [RouterLink, StatCard, Icon, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './village-dashboard.component.html',
  styleUrl: './village-dashboard.component.css',
})
export class VillageDashboard {
  private readonly dashboardService = inject(DashboardService);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly stats = signal<PresidentDashboard | null>(null);

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  montant(value: number | null): string {
    return formatMontant(value);
  }

  dateTime(iso: string): string {
    return formatDateTime(iso);
  }

  periodeCourante(s: PresidentDashboard): string {
    return `${NUMERO_MOIS_LABEL[s.moisCourant]} ${s.anneeCourante}`;
  }

  tauxArrondi(s: PresidentDashboard): string {
    return Math.round(s.tauxPresence) + ' %';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const stats = await firstValueFrom(this.dashboardService.getPresidentDashboard(this.villageIdNumber()));
      this.stats.set(stats);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
