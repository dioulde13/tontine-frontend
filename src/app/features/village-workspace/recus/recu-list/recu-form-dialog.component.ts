import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NUMERO_MOIS_LABEL, Paiement, Recu, utilisateurNomComplet } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification';
import { PaiementService } from '../../../../core/services/paiement';
import { RecuService } from '../../../../core/services/recu';
import { Modal } from '../../../../shared/components/modal/modal.component';
import { formatMontant } from '../../../../shared/utils/format';

@Component({
  selector: 'app-recu-form-dialog',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recu-form-dialog.component.html',
  styleUrl: './recu-form-dialog.component.css',
})
export class RecuFormDialog implements OnInit {
  private readonly paiementService = inject(PaiementService);
  private readonly recuService = inject(RecuService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly saved = output<Recu>();
  readonly closed = output<void>();

  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly submitted = signal(false);

  /** Paiements sans reçu existant : seuls ceux-là peuvent être quittancés. */
  readonly paiementsDisponibles = signal<Paiement[]>([]);
  readonly selectionnes = signal<Set<number>>(new Set());

  readonly membreSelectionneId = computed<number | null>(() => {
    const ids = this.selectionnes();
    if (ids.size === 0) {
      return null;
    }
    const premier = this.paiementsDisponibles().find((p) => ids.has(p.id));
    return premier?.utilisateur.id ?? null;
  });

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const [paiements, recus] = await Promise.all([
        firstValueFrom(this.paiementService.findByVillage(this.villageId())),
        firstValueFrom(this.recuService.findByVillage(this.villageId())),
      ]);
      const idsAvecRecu = new Set(recus.flatMap((r) => r.paiements.map((p) => p.id)));
      this.paiementsDisponibles.set(paiements.filter((p) => !idsAvecRecu.has(p.id)));
    } finally {
      this.loading.set(false);
    }
  }

  libellePaiement(p: Paiement): string {
    return `${utilisateurNomComplet(p.utilisateur)} — ${NUMERO_MOIS_LABEL[p.mois]} ${p.annee} — ${formatMontant(p.montant)}`;
  }

  estSelectionnable(p: Paiement): boolean {
    const membreId = this.membreSelectionneId();
    return membreId === null || membreId === p.utilisateur.id;
  }

  estSelectionne(p: Paiement): boolean {
    return this.selectionnes().has(p.id);
  }

  toggle(p: Paiement): void {
    const next = new Set(this.selectionnes());
    next.has(p.id) ? next.delete(p.id) : next.add(p.id);
    this.selectionnes.set(next);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    const paiementIds = [...this.selectionnes()];
    if (paiementIds.length === 0) {
      return;
    }
    this.saving.set(true);
    try {
      const result = await firstValueFrom(this.recuService.create(this.villageId(), { paiementIds }));
      this.notifications.success('Reçu généré avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
