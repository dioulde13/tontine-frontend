import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NUMERO_MOIS_LABEL, Paiement, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { PaiementService } from '../../../core/services/paiement';
import { RecuService } from '../../../core/services/recu';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DateRangeFilter } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { dansPeriode } from '../../../shared/utils/date-range';
import { formatDate, formatMontant } from '../../../shared/utils/format';
import { PaiementFormDialog } from './paiement-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-paiements',
  imports: [Icon, Skeleton, EmptyState, ErrorState, Pagination, PaiementFormDialog, ConfirmDialog, DateRangeFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paiements.component.html',
})
export class Paiements {
  private readonly paiementService = inject(PaiementService);
  private readonly recuService = inject(RecuService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly paiements = signal<Paiement[]>([]);
  readonly paiementIdsAvecRecu = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly dateDebut = signal<string | null>(null);
  readonly dateFin = signal<string | null>(null);
  readonly page = signal(1);
  readonly dialogOpen = signal(false);
  readonly aSupprimer = signal<Paiement | null>(null);
  readonly deleting = signal(false);
  readonly selectionnes = signal<Set<number>>(new Set());
  readonly generationGroupeeEnCours = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    let all = [...this.paiements()].sort((a, b) => b.datePaiement.localeCompare(a.datePaiement));
    if (term) {
      all = all.filter((p) => this.nomComplet(p).toLowerCase().includes(term));
    }
    if (debut || fin) {
      all = all.filter((p) => dansPeriode(p.datePaiement, debut, fin));
    }
    return all;
  });

  readonly filtresActifs = computed(() => !!this.search() || !!this.dateDebut() || !!this.dateFin());

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  /** Un reçu quittance toujours un seul membre : une fois une sélection démarrée, on ne peut
   *  cocher que d'autres paiements du même membre. */
  readonly membreSelectionneId = computed<number | null>(() => {
    const ids = this.selectionnes();
    if (ids.size === 0) {
      return null;
    }
    const premier = this.paiements().find((p) => ids.has(p.id));
    return premier?.utilisateur.id ?? null;
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  nomComplet(p: Paiement): string {
    return utilisateurNomComplet(p.utilisateur);
  }

  periode(p: Paiement): string {
    return `${NUMERO_MOIS_LABEL[p.mois]} ${p.annee}`;
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
    this.selectionnes.set(new Set());
    try {
      const [paiements, recus] = await Promise.all([
        firstValueFrom(this.paiementService.findByVillage(this.villageIdNumber())),
        firstValueFrom(this.recuService.findByVillage(this.villageIdNumber())),
      ]);
      this.paiements.set(paiements);
      this.paiementIdsAvecRecu.set(new Set(recus.flatMap((r) => r.paiements.map((p) => p.id))));
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

  dejaQuittance(p: Paiement): boolean {
    return this.paiementIdsAvecRecu().has(p.id);
  }

  estSelectionnable(p: Paiement): boolean {
    if (this.dejaQuittance(p)) {
      return false;
    }
    const membreId = this.membreSelectionneId();
    return membreId === null || membreId === p.utilisateur.id;
  }

  estSelectionne(p: Paiement): boolean {
    return this.selectionnes().has(p.id);
  }

  toggleSelection(p: Paiement): void {
    const next = new Set(this.selectionnes());
    next.has(p.id) ? next.delete(p.id) : next.add(p.id);
    this.selectionnes.set(next);
  }

  async genererRecu(p: Paiement): Promise<void> {
    await this.creerRecu([p.id]);
  }

  async genererRecuGroupe(): Promise<void> {
    await this.creerRecu([...this.selectionnes()]);
  }

  private async creerRecu(paiementIds: number[]): Promise<void> {
    this.generationGroupeeEnCours.set(true);
    try {
      const recu = await firstValueFrom(this.recuService.create(this.villageIdNumber(), { paiementIds }));
      this.notifications.success('Reçu généré avec succès.');
      await this.router.navigate(['../recus', recu.id], { relativeTo: this.route });
    } catch {
      /* le toast d'erreur global a déjà informé l'utilisateur (ex: reçu déjà existant) */
    } finally {
      this.generationGroupeeEnCours.set(false);
    }
  }

  async confirmerSuppression(p: Paiement): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.paiementService.delete(this.villageIdNumber(), p.id));
      this.notifications.success('Paiement supprimé avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
