import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth';
import { MembreDashboard as MembreDashboardData, NUMERO_MOIS_LABEL } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { StatCard } from '../../../shared/components/stat-card/stat-card.component';
import { formatDateTime, formatMontant } from '../../../shared/utils/format';

@Component({
  selector: 'app-membre-dashboard',
  imports: [RouterLink, Icon, StatCard, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membre-dashboard.component.html',
  styleUrl: './membre-dashboard.component.css',
})
export class MembreDashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly prenom = computed(() => this.auth.currentUser()?.prenom ?? '');

  readonly loading = signal(true);
  readonly error = signal(false);
  /** true si le compte n'a pas encore de village assigné (400 UtilisateurSansVillageException). */
  readonly sansVillage = signal(false);
  readonly stats = signal<MembreDashboardData | null>(null);

  ngOnInit(): void {
    this.load();
  }

  montant(value: number | null): string {
    return formatMontant(value);
  }

  dateTime(iso: string): string {
    return formatDateTime(iso);
  }

  periodeCourante(s: MembreDashboardData): string {
    return `${NUMERO_MOIS_LABEL[s.moisCourant]} ${s.anneeCourante}`;
  }

  tauxArrondi(s: MembreDashboardData): string {
    return Math.round(s.tauxPresence) + ' %';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.sansVillage.set(false);
    try {
      const stats = await firstValueFrom(this.dashboardService.getMembreDashboard());
      this.stats.set(stats);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 400) {
        this.sansVillage.set(true);
      } else {
        this.error.set(true);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
