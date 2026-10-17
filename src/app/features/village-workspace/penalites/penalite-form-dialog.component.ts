import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Penalite, StatutPenalite, Utilisateur, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { PenaliteService } from '../../../core/services/penalite';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { AutocompleteSelect } from '../../../shared/components/autocomplete-select/autocomplete-select.component';
import { Modal } from '../../../shared/components/modal/modal.component';

/**
 * Le backend refuse (400) toute création manuelle de type RETARD_PAIEMENT ou ABSENCE_REUNION
 * (déclenchées uniquement automatiquement). Seul le type AUTRE est proposé ici, en cohérence.
 */
@Component({
  selector: 'app-penalite-form-dialog',
  imports: [ReactiveFormsModule, Modal, AutocompleteSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './penalite-form-dialog.component.html',
})
export class PenaliteFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly penaliteService = inject(PenaliteService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly saved = output<Penalite>();
  readonly closed = output<void>();

  readonly saving = signal(false);
  readonly membres = signal<Utilisateur[]>([]);
  readonly membreOptions = computed(() =>
    this.membres().map((m) => ({ value: m.id, label: this.nomComplet(m) })),
  );

  readonly form = this.fb.group({
    utilisateurId: this.fb.control<number | null>(null, [Validators.required]),
    montant: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    date: this.fb.control('', [Validators.required]),
    statut: this.fb.control<StatutPenalite>('NON_PAYEE'),
  });

  ngOnInit(): void {
    firstValueFrom(this.utilisateurService.findMembresDuVillage(this.villageId())).then((membres) =>
      this.membres.set(membres),
    );
  }

  nomComplet(u: Utilisateur): string {
    return utilisateurNomComplet(u);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      const result = await firstValueFrom(
        this.penaliteService.create(this.villageId(), {
          utilisateurId: values.utilisateurId!,
          type: 'AUTRE',
          montant: values.montant!,
          date: values.date,
          statut: values.statut,
        }),
      );
      this.notifications.success('Pénalité créée avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
