import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  MembreCotisations as MembreCotisationsData,
  NUMERO_MOIS_LABEL,
  Paiement,
  Penalite,
  TYPE_PENALITE_LABEL,
} from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { StatCard } from '../../../shared/components/stat-card/stat-card.component';
import { formatDate, formatMontant } from '../../../shared/utils/format';

const ANNEE_COURANTE = new Date().getFullYear();

@Component({
  selector: 'app-membre-cotisations',
  imports: [Icon, StatCard, Badge, Skeleton, EmptyState, ErrorState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membre-cotisations.component.html',
  styleUrl: './membre-cotisations.component.css',
})
export class MembreCotisations implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly error = signal(false);
  /** true si le compte n'a pas encore de village assigné (400 UtilisateurSansVillageException). */
  readonly sansVillage = signal(false);
  readonly data = signal<MembreCotisationsData | null>(null);
  readonly annee = signal(ANNEE_COURANTE);

  /** Années proposées dans le filtre : celles ayant un paiement ou une pénalité, + l'année courante. */
  readonly anneesDisponibles = computed(() => {
    const d = this.data();
    const annees = new Set<number>([ANNEE_COURANTE, this.annee()]);
    if (d) {
      for (const p of d.paiements) {
        annees.add(p.annee);
      }
      for (const p of d.penalites) {
        annees.add(Number(p.date.slice(0, 4)));
      }
    }
    return Array.from(annees).sort((a, b) => b - a);
  });

  /** Historique filtré sur l'année sélectionnée, pour que toute la page parle de la même période. */
  readonly paiementsAnnee = computed<Paiement[]>(() => {
    const annee = this.annee();
    return this.data()?.paiements.filter((p) => p.annee === annee) ?? [];
  });

  readonly penalitesAnnee = computed<Penalite[]>(() => {
    const annee = this.annee();
    return this.data()?.penalites.filter((p) => Number(p.date.slice(0, 4)) === annee) ?? [];
  });

  readonly montantTotalPayeAnnee = computed(() =>
    this.paiementsAnnee().reduce((somme, p) => somme + p.montant, 0),
  );

  readonly montantTotalPenalitesNonPayeesAnnee = computed(() =>
    this.penalitesAnnee()
      .filter((p) => p.statut === 'NON_PAYEE')
      .reduce((somme, p) => somme + p.montant, 0),
  );

  ngOnInit(): void {
    this.load();
  }

  montant(value: number | null): string {
    return formatMontant(value);
  }

  date(iso: string): string {
    return formatDate(iso);
  }

  periodeLabel(mois: number, annee: number): string {
    return `${NUMERO_MOIS_LABEL[mois]} ${annee}`;
  }

  typeLabel(p: Penalite): string {
    return TYPE_PENALITE_LABEL[p.type];
  }

  /** Explique le motif de la pénalité, avec la période concernée quand elle est connue. */
  motif(p: Penalite): string {
    if (p.type === 'RETARD_PAIEMENT' && p.periodeMois !== null && p.periodeAnnee !== null) {
      return `Paiement de ${this.periodeLabel(p.periodeMois, p.periodeAnnee)} réglé en retard`;
    }
    if (p.type === 'ABSENCE_REUNION') {
      return 'Absence à une réunion';
    }
    return 'Pénalité manuelle';
  }

  statutVariant(p: Penalite): BadgeVariant {
    return p.statut === 'PAYEE' ? 'success' : 'warning';
  }

  onAnnee(event: Event): void {
    this.annee.set(Number((event.target as HTMLSelectElement).value));
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.sansVillage.set(false);
    try {
      const data = await firstValueFrom(this.dashboardService.getMembreCotisations(this.annee()));
      this.data.set(data);
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
