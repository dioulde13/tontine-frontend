import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AdminDashboard as AdminDashboardData } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { StatCard } from '../../../shared/components/stat-card/stat-card.component';
import { formatMontant } from '../../../shared/utils/format';

@Component({
  selector: 'app-admin-dashboard',
  imports: [StatCard, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly stats = signal<AdminDashboardData | null>(null);

  ngOnInit(): void {
    this.load();
  }

  montant(value: number): string {
    return formatMontant(value);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const stats = await firstValueFrom(this.dashboardService.getAdminDashboard());
      this.stats.set(stats);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
